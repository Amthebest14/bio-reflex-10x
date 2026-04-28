import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { createManagedRppgSession } from '@elata-biosciences/rppg-web';

export const BiometricCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setBiometrics, startGame } = useGameStore();

  useEffect(() => {
    let active = true;
    let session: any = null;
    let intervalId: any = null;

    const initCamera = async () => {
      try {
        // Explicit Permission Request
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        
        if (videoRef.current && active) {
          // Bind and Play
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          // Delayed SDK Start
          session = await createManagedRppgSession({
             video: videoRef.current,
             maxRetries: 3
          });
          
          await session.start();

          intervalId = setInterval(() => {
            if (!active) return;
            const metrics = session.getMetrics();
            
            // Map metrics to stress and focus
            const stress = (metrics.baseline_delta || 0) * 2 + (metrics.bpm ? metrics.bpm - 60 : 0);
            const focus = (metrics.signal_quality || 0) * 100;
            
            setBiometrics(Math.max(0, stress), Math.min(100, focus));
          }, 250);
        }
      } catch (err) {
        // Error Handling
        console.error("Camera or SDK init failed:", err);
        alert("Camera initialization failed or was denied. Falling back to Guest Mode.");
        startGame('guest');
      }
    };

    initCamera();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      if (session) {
        session.stop();
        session.dispose();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [setBiometrics, startGame]);

  return (
    <video 
      ref={videoRef} 
      playsInline 
      autoPlay 
      muted 
      style={{ display: 'none' }} 
    />
  );
};
