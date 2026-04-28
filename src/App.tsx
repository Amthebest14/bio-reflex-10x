import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { BiometricCamera } from './components/BiometricCamera';
import { GameBox } from './components/GameBox';
import { SummaryScreen } from './components/SummaryScreen';
import './index.css';

function App() {
  const { gameState, finishCalibration } = useGameStore();

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
      <BiometricCamera />

      <main className="main-content">
        {gameState === 'CALIBRATING' && (
          <div className="calibration-screen">
            <h1 className="title">Bio-Reflex</h1>
            <p className="subtitle">Calibrating biometrics... Please hold still.</p>
            <div className="spinner"></div>
          </div>
        )}

        {(gameState === 'ROUND_START' || gameState === 'WAITING_RED' || gameState === 'GO_GREEN' || gameState === 'ROUND_RESULT') && (
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
