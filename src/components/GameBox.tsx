import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const GameBox: React.FC = () => {
  const { 
    gameState, 
    stressLevel, 
    baselineStress, 
    setWaitingRed, 
    setGoGreen, 
    recordFoul, 
    recordReaction, 
    nextRound,
    currentRound 
  } = useGameStore();

  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState === 'ROUND_START') {
      // Small pause before turning red
      const t = setTimeout(() => setWaitingRed(), 1000);
      return () => clearTimeout(t);
    }
    
    if (gameState === 'WAITING_RED') {
      const delay = Math.random() * 3000 + 2000; // 2000 to 5000ms
      timeoutRef.current = setTimeout(() => {
        setGoGreen();
        setStartTime(performance.now());
      }, delay);
      
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [gameState, setWaitingRed, setGoGreen]);

  const handleClick = () => {
    if (gameState === 'WAITING_RED') {
      // FOUL
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      recordFoul();
    } else if (gameState === 'GO_GREEN') {
      // Valid reaction
      const rxTime = performance.now() - startTime;
      recordReaction(rxTime);
    } else if (gameState === 'ROUND_RESULT') {
      nextRound();
    }
  };

  const isJittering = gameState === 'WAITING_RED' && stressLevel > baselineStress;
  
  let boxStateClass = 'state-start';
  let text = `Round ${currentRound}`;
  let subtext = '';

  if (gameState === 'WAITING_RED') {
    boxStateClass = 'state-red';
    text = 'Wait for Green...';
    if (isJittering) subtext = 'Calm down! Stress detected.';
  } else if (gameState === 'GO_GREEN') {
    boxStateClass = 'state-green';
    text = 'CLICK!';
  } else if (gameState === 'ROUND_RESULT') {
    boxStateClass = 'state-result';
    text = 'Round Complete';
    subtext = 'Click to continue';
  }

  return (
    <div 
      onClick={handleClick}
      className={`game-box ${boxStateClass} ${isJittering ? 'jitter' : ''}`}
    >
      <h2 className="box-title">{text}</h2>
      {subtext && <p className="box-subtitle">{subtext}</p>}
    </div>
  );
};
