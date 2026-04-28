import { create } from 'zustand';

export type GameState = 'CALIBRATING' | 'ROUND_START' | 'WAITING_RED' | 'GO_GREEN' | 'ROUND_RESULT' | 'FINAL_SUMMARY';

export interface RoundData {
  round: number;
  reactionTime: number; // in ms
  focusScore: number;
}

interface GameStore {
  gameState: GameState;
  currentRound: number;
  roundData: RoundData[];
  
  stressLevel: number;
  focusScore: number;
  baselineStress: number;
  calibrationSamples: number[];
  
  setBiometrics: (stress: number, focus: number) => void;
  startCalibration: () => void;
  finishCalibration: () => void;
  
  startRound: () => void;
  setWaitingRed: () => void;
  setGoGreen: () => void;
  
  recordFoul: () => void;
  recordReaction: (reactionTime: number) => void;
  
  nextRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'CALIBRATING',
  currentRound: 1,
  roundData: [],
  
  stressLevel: 0,
  focusScore: 0,
  baselineStress: 0,
  calibrationSamples: [],
  
  setBiometrics: (stress, focus) => {
    set((state) => {
      const updates: Partial<GameStore> = { stressLevel: stress, focusScore: focus };
      if (state.gameState === 'CALIBRATING') {
        updates.calibrationSamples = [...state.calibrationSamples, stress];
      }
      return updates;
    });
  },
  
  startCalibration: () => {
    set({ gameState: 'CALIBRATING', calibrationSamples: [], currentRound: 1, roundData: [] });
  },
  
  finishCalibration: () => {
    const samples = get().calibrationSamples;
    const baseline = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 50;
    set({ gameState: 'ROUND_START', baselineStress: baseline });
  },
  
  startRound: () => {
    set({ gameState: 'ROUND_START' });
  },
  
  setWaitingRed: () => {
    set({ gameState: 'WAITING_RED' });
  },
  
  setGoGreen: () => {
    if (get().gameState === 'WAITING_RED') {
      set({ gameState: 'GO_GREEN' });
    }
  },
  
  recordFoul: () => {
    set((state) => ({
      gameState: 'ROUND_RESULT',
      roundData: [...state.roundData, { round: state.currentRound, reactionTime: 1000, focusScore: state.focusScore }]
    }));
  },
  
  recordReaction: (reactionTime) => {
    set((state) => ({
      gameState: 'ROUND_RESULT',
      roundData: [...state.roundData, { round: state.currentRound, reactionTime, focusScore: state.focusScore }]
    }));
  },
  
  nextRound: () => {
    set((state) => {
      if (state.currentRound >= 10) {
        return { gameState: 'FINAL_SUMMARY' };
      }
      return { currentRound: state.currentRound + 1, gameState: 'ROUND_START' };
    });
  },
  
  resetGame: () => {
    set({
      gameState: 'CALIBRATING',
      currentRound: 1,
      roundData: [],
      calibrationSamples: []
    });
  }
}));
