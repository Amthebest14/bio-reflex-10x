import { useEffect, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';

export const SummaryScreen = () => {
  const { roundData, resetGame, gameMode, foulCount } = useGameStore();

  const stats = useMemo(() => {
    const validRounds = roundData.filter(r => !r.isFoul);
    const validCount = validRounds.length || 1; 

    const avgRx = validRounds.reduce((acc, r) => acc + r.reactionTime, 0) / validCount;
    const bestRx = validRounds.length > 0 ? Math.min(...validRounds.map(r => r.reactionTime)) : 0;
    
    const isBio = gameMode === 'bio';
    let avgFocus = 0;
    let neuroScore = 0;

    if (isBio) {
      avgFocus = roundData.reduce((acc, r) => acc + r.focusScore, 0) / (roundData.length || 1);
      // Penalize neuroscore for fouls
      const penalty = foulCount * 50;
      neuroScore = Math.max(0, ((1000 - avgRx) * avgFocus) - penalty);
    }

    return {
      gameMode,
      averageReactionTime: Math.round(avgRx),
      bestReactionTime: Math.round(bestRx),
      totalFouls: foulCount,
      ...(isBio && { 
        averageFocusScore: Math.round(avgFocus),
        totalNeuroScore: Math.round(neuroScore) 
      }),
      rawRounds: roundData
    };
  }, [roundData, gameMode, foulCount]);

  useEffect(() => {
    console.log("=== BIO-REFLEX PROTOCOL PAYLOAD ===");
    console.log(JSON.stringify(stats, null, 2));
  }, [stats]);

  const isBio = gameMode === 'bio';

  return (
    <div className="summary-screen">
      <h2 className="summary-title">Final Summary</h2>
      
      <div className="summary-stats">
        <div className="stat-row">
          <span className="stat-label">Avg Reaction</span>
          <span className="stat-value text-blue">{stats.averageReactionTime} ms</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Best Reaction</span>
          <span className="stat-value text-green">{stats.bestReactionTime} ms</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Total Fouls</span>
          <span className={`stat-value ${foulCount > 0 ? 'text-red' : 'text-green'}`}>{foulCount}</span>
        </div>
        
        {isBio && (
          <>
            <div className="stat-row">
              <span className="stat-label">Avg Focus Score</span>
              <span className="stat-value text-purple">{stats.averageFocusScore}</span>
            </div>
            <div className="stat-row total-row">
              <span className="stat-label-bold">Total Neuro-Score</span>
              <span className="stat-value-large text-yellow">{stats.totalNeuroScore?.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      <button onClick={resetGame} className="btn-primary mt-6">
        Play Again
      </button>
    </div>
  );
};
