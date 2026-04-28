import { useGameStore } from '../store/useGameStore';

export const StartScreen = () => {
  const { startGame } = useGameStore();

  return (
    <div className="start-screen">
      <h1 className="title">Bio-Reflex</h1>
      <p className="subtitle mb-8">Test your reactions. Manage your stress.</p>

      <div className="button-group">
        <button 
          className="btn-guest"
          onClick={() => startGame('guest')}
        >
          <span className="btn-icon">🎮</span>
          <div className="btn-text">
            <strong>Play Standard (Guest Mode)</strong>
            <small>No camera required</small>
          </div>
        </button>

        <button 
          className="btn-bio"
          onClick={() => startGame('bio')}
        >
          <span className="btn-icon">👁️</span>
          <div className="btn-text">
            <strong>Play with Bio-Tracker</strong>
            <small>Requires camera permissions</small>
          </div>
        </button>
      </div>
    </div>
  );
};
