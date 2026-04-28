import { useGameStore } from '../store/useGameStore';

export const HUD = () => {
  const { currentRound, lastReactionTime, gameMode, focusScore, stressLevel, baselineStress } = useGameStore();

  const isBio = gameMode === 'bio';
  const statusText = isBio ? 'Bio-Active' : 'Standard';
  
  // Calculate stress percentage relative to baseline (simplified logic)
  const stressRatio = baselineStress > 0 ? (stressLevel / baselineStress) * 50 : 50;
  const stressPercent = Math.min(100, Math.max(0, stressRatio));
  
  return (
    <div className="hud-container">
      <div className="hud-stats">
        <div className="hud-item">
          <span className="hud-label">Round</span>
          <span className="hud-value">{currentRound} <span className="text-muted">/ 10</span></span>
        </div>
        
        <div className="hud-item">
          <span className="hud-label">Last Reaction</span>
          <span className="hud-value">{lastReactionTime !== null ? `${Math.round(lastReactionTime)} ms` : '--'}</span>
        </div>
        
        <div className="hud-item">
          <span className="hud-label">Status</span>
          <span className={`hud-value ${isBio ? 'text-green' : 'text-blue'}`}>{statusText}</span>
        </div>
      </div>

      {isBio && (
        <div className="hud-gauges">
          <div className="gauge">
            <div className="gauge-header">
              <span className="gauge-label">Focus</span>
              <span className="gauge-val">{Math.round(focusScore)}%</span>
            </div>
            <div className="gauge-bar-bg">
              <div className="gauge-bar-fill bg-purple" style={{ width: `${focusScore}%` }}></div>
            </div>
          </div>
          
          <div className="gauge">
            <div className="gauge-header">
              <span className="gauge-label">Stress</span>
              <span className="gauge-val">{Math.round(stressPercent)}%</span>
            </div>
            <div className="gauge-bar-bg">
              <div className="gauge-bar-fill bg-red" style={{ width: `${stressPercent}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
