'use client';

import { create } from 'zustand';
import { 
  NoteData, 
  InstrumentChart,
  Judgment, 
  Difficulty,
} from '@/data/charts';
import { Song } from '@/data/songs';

interface NoteState extends NoteData {
  id: number;
  hit: boolean;
  judgment?: Judgment;
}

interface RhythmGameState {
  // ゲーム状態
  isPlaying: boolean;
  currentTime: number;
  
  // 楽曲情報
  currentSong: Song | null;
  currentChart: InstrumentChart | null;
  difficulty: Difficulty;
  
  // ノート
  notes: NoteState[];
  
  // スコア
  score: number;
  combo: number;
  maxCombo: number;
  judgments: Record<Judgment, number>;
  
  // アクション
  setChart: (song: Song, chart: InstrumentChart) => void;
  startGame: () => void;
  endGame: () => void;
  updateTime: (time: number) => void;
}

export const useRhythmGameStore = create<RhythmGameState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  currentSong: null,
  currentChart: null,
  difficulty: 'easy',
  notes: [],
  score: 0,
  combo: 0,
  maxCombo: 0,
  judgments: { perfect: 0, great: 0, good: 0, miss: 0 },

  setChart: (song, chart) => {
    const notes: NoteState[] = chart.notes.map((note, index) => ({
      ...note,
      id: index,
      hit: false,
    }));
    
    set({
      currentSong: song,
      currentChart: chart,
      difficulty: chart.difficulty,
      notes,
      score: 0,
      combo: 0,
      maxCombo: 0,
      judgments: { perfect: 0, great: 0, good: 0, miss: 0 },
    });
  },

  startGame: () => {
    set({ isPlaying: true, currentTime: 0 });
  },

  endGame: () => {
    set({ isPlaying: false });
  },

  updateTime: (time) => {
    set({ currentTime: time });
  },
}));
