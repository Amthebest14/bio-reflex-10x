import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { BiometricCamera } from './components/BiometricCamera';
import { GameBox } from './components/GameBox';
import { SummaryScreen } from './components/SummaryScreen';
import { StartScreen } from './components/StartScreen';
import { HUD } from './components/HUD';
import './index.css';

function App() {
  const { gameState, finishCalibration, gameMode } = useGameStore();

  useEffect(() => {
    if (gameState === 'CALIBRATING') {
      const t = setTimeout(() => {
        finishCalibration();
      }, 5000); // 5 second calibration
      return () => clearTimeout(t);
    }
  }, [gameState, finishCalibration]);

  return (
    <div className="app-container">
      {/* HUD only shown during gameplay or summary */}
      {gameState !== 'START_SCREEN' && gameState !== 'CALIBRATING' && (
        <HUD />
      )}

      {/* Only render camera if gameMode is bio */}
      {gameMode === 'bio' && <BiometricCamera />}

      <main className="main-content">
        {gameState === 'START_SCREEN' && (
          <StartScreen />
        )}

        {gameState === 'CALIBRATING' && (
          <div className="calibration-screen">
            <h2 className="title">Connecting Bio-Tracker...</h2>
            <p className="subtitle">Please hold still and face the camera.</p>
            <div className="spinner"></div>
          </div>
        )}

        {(gameState === 'ROUND_START' || gameState === 'WAITING_RED' || gameState === 'GO_GREEN' || gameState === 'PAUSE_PHASE') && (
          <GameBox />
        )}

        {gameState === 'FINAL_SUMMARY' && (
          <SummaryScreen />
        )}
      </main>
    </div>
  );
}

export default App;
