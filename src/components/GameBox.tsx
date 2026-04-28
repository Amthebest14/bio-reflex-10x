import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const GameBox = () => {
  const { 
    gameState, 
    stressLevel, 
    baselineStress,
    gameMode,
    setWaitingRed, 
    setGoGreen, 
    recordReaction, 
    finishPause,
    lastReactionTime,
    roundData,
    currentRound
  } = useGameStore();

  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState === 'ROUND_START') {
      const t = setTimeout(() => setWaitingRed(), 1000);
      return () => clearTimeout(t);
    }
    
    if (gameState === 'WAITING_RED') {
      const delay = Math.random() * 3000 + 2000; // 2000 to 5000ms
      timeoutRef.current = setTimeout(() => {
        setGoGreen();
        setStartTime(performance.now());
      }, delay) as unknown as number;
      
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    if (gameState === 'PAUSE_PHASE') {
      const t = setTimeout(() => finishPause(), 1500); // 1.5s freeze
      return () => clearTimeout(t);
    }
  }, [gameState, setWaitingRed, setGoGreen, finishPause]);

  const handleClick = () => {
    if (gameState === 'WAITING_RED') {
      // FOUL
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      recordReaction(0, true);
    } else if (gameState === 'GO_GREEN') {
      // Valid reaction
      const rxTime = performance.now() - startTime;
      recordReaction(rxTime, false);
    }
  };

  const isBio = gameMode === 'bio';
  const isJittering = isBio && gameState === 'WAITING_RED' && stressLevel > baselineStress;
  
  let boxStateClass = 'state-start';
  let text = 'Get Ready';
  let subtext = '';

  if (gameState === 'WAITING_RED') {
    boxStateClass = 'state-red';
    text = 'WAIT...';
    if (isJittering) subtext = 'Calm down! Stress detected.';
  } else if (gameState === 'GO_GREEN') {
    boxStateClass = 'state-green';
    text = 'CLICK NOW!';
  } else if (gameState === 'PAUSE_PHASE') {
    boxStateClass = 'state-pause';
    const lastRound = roundData[roundData.length - 1];
    if (lastRound?.isFoul) {
      text = 'FOUL';
      subtext = '+1000ms penalty';
      boxStateClass += ' foul-flash';
    } else {
      text = `+ ${Math.round(lastReactionTime || 0)}ms`;
    }
  } else if (gameState === 'ROUND_START') {
    boxStateClass = 'state-start';
    text = `Round ${currentRound}`;
  }

  return (
    <div 
      onClick={handleClick}
      className={`game-box ${boxStateClass} ${isJittering ? 'jitter' : ''} ${gameState === 'PAUSE_PHASE' ? 'no-pointer' : ''}`}
    >
      <h2 className="box-title">{text}</h2>
      {subtext && <p className="box-subtitle">{subtext}</p>}
    </div>
  );
};
