import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { createManagedRppgSession } from '@elata-biosciences/rppg-web';

export const BiometricCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setBiometrics } = useGameStore();

  useEffect(() => {
    let active = true;
    let session: any = null;
    let intervalId: any = null;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          
          // Initialize SDK
          session = await createManagedRppgSession({
             video: videoRef.current,
             maxRetries: 3
          });
          
          await session.start();

          intervalId = setInterval(() => {
            if (!active) return;
            const metrics = session.getMetrics();
            
            // Map metrics to stress and focus
            // higher bpm delta -> higher stress. signal quality -> focus.
            const stress = (metrics.baseline_delta || 0) * 2 + (metrics.bpm ? metrics.bpm - 60 : 0);
            const focus = (metrics.signal_quality || 0) * 100;
            
            setBiometrics(Math.max(0, stress), Math.min(100, focus));
          }, 250);
        }
      } catch (err) {
        console.error("Camera or SDK init failed:", err);
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
  }, [setBiometrics]);

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
