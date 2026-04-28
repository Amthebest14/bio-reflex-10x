import { create } from 'zustand';

export type GameMode = 'guest' | 'bio' | null;
export type GameState = 'START_SCREEN' | 'CALIBRATING' | 'ROUND_START' | 'WAITING_RED' | 'GO_GREEN' | 'PAUSE_PHASE' | 'FINAL_SUMMARY';

export interface RoundData {
  round: number;
  reactionTime: number; // in ms
  focusScore: number;
  isFoul: boolean;
}

interface GameStore {
  gameMode: GameMode;
  gameState: GameState;
  currentRound: number;
  roundData: RoundData[];
  
  lastReactionTime: number | null;
  foulCount: number;
  
  stressLevel: number;
  focusScore: number;
  baselineStress: number;
  calibrationSamples: number[];
  
  startGame: (mode: GameMode) => void;
  setBiometrics: (stress: number, focus: number) => void;
  finishCalibration: () => void;
  
  startRound: () => void;
  setWaitingRed: () => void;
  setGoGreen: () => void;
  
  recordReaction: (reactionTime: number, isFoul: boolean) => void;
  
  finishPause: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameMode: null,
  gameState: 'START_SCREEN',
  currentRound: 1,
  roundData: [],
  
  lastReactionTime: null,
  foulCount: 0,
  
  stressLevel: 0,
  focusScore: 0,
  baselineStress: 0,
  calibrationSamples: [],
  
  startGame: (mode) => {
    set({
      gameMode: mode,
      gameState: mode === 'bio' ? 'CALIBRATING' : 'ROUND_START',
      currentRound: 1,
      roundData: [],
      lastReactionTime: null,
      foulCount: 0,
      calibrationSamples: [],
      stressLevel: 0,
      focusScore: 0,
      baselineStress: 0
    });
  },
  
  setBiometrics: (stress, focus) => {
    set((state) => {
      const updates: Partial<GameStore> = { stressLevel: stress, focusScore: focus };
      if (state.gameState === 'CALIBRATING') {
        updates.calibrationSamples = [...state.calibrationSamples, stress];
      }
      return updates;
    });
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
  
  recordReaction: (reactionTime, isFoul) => {
    set((state) => ({
      gameState: 'PAUSE_PHASE',
      lastReactionTime: isFoul ? null : reactionTime,
      foulCount: state.foulCount + (isFoul ? 1 : 0),
      roundData: [
        ...state.roundData, 
        { 
          round: state.currentRound, 
          reactionTime: isFoul ? 1000 : reactionTime, 
          focusScore: state.focusScore,
          isFoul 
        }
      ]
    }));
  },
  
  finishPause: () => {
    set((state) => {
      if (state.currentRound >= 10) {
        return { gameState: 'FINAL_SUMMARY' };
      }
      return { currentRound: state.currentRound + 1, gameState: 'ROUND_START' };
    });
  },
  
  resetGame: () => {
    set({
      gameMode: null,
      gameState: 'START_SCREEN',
      currentRound: 1,
      roundData: [],
      calibrationSamples: [],
      lastReactionTime: null,
      foulCount: 0
    });
  }
}));
