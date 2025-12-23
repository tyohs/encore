/**
 * 譜面（チャート）データ定義
 * 各楽器ごとに異なる譜面を持つ
 */

import { InstrumentType } from '@/types';

export type NoteType = 'tap' | 'hold' | 'special';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type Judgment = 'perfect' | 'great' | 'good' | 'miss';

export interface NoteData {
  time: number;
  type: NoteType;
  duration?: number;
  lane?: number;
}

export interface InstrumentChart {
  songId: string;
  instrument: InstrumentType;
  difficulty: Difficulty;
  notes: NoteData[];
}

export const JUDGMENT_WINDOWS = {
  perfect: 100,
  great: 180,
  good: 300,
};

export const JUDGMENT_MULTIPLIERS: Record<Judgment, number> = {
  perfect: 2.0,
  great: 1.5,
  good: 1.0,
  miss: 0,
};

export function getComboMultiplier(combo: number): number {
  if (combo >= 100) return 3.0;
  if (combo >= 50) return 2.0;
  if (combo >= 30) return 1.5;
  if (combo >= 10) return 1.2;
  return 1.0;
}

export const BASE_POINTS: Record<NoteType, number> = {
  tap: 30,
  hold: 50,
  special: 100,
};

// ============================================
// 「仰げば尊し」の譜面データ
// BPM: 72, 1拍 = 833ms
// 曲の長さ: 約3分18秒 = 198秒 = 198000ms
// ============================================

const BEAT = 833;
const SONG_DURATION = 198000; // 3分18秒

function generateChart(
  instrument: InstrumentType,
  density: number
): NoteData[] {
  const notes: NoteData[] = [];
  const interval = BEAT / density;
  let noteIndex = 0;
  
  // 2秒後から曲終了5秒前まで
  const startTime = 2000;
  const endTime = SONG_DURATION - 5000;

  for (let time = startTime; time < endTime; time += interval) {
    // 16ノートごとにスペシャル
    const type: NoteType = noteIndex % 16 === 0 ? 'special' : 'tap';
    const lane = instrument === 'drums' ? (noteIndex % 4) : undefined;
    
    notes.push({ time: Math.round(time), type, lane });
    noteIndex++;
  }

  return notes;
}

// ドラム - 1拍に1ノート
const drumsEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'drums',
  difficulty: 'easy',
  notes: generateChart('drums', 1),
};

// ギター - 2拍に1ノート
const guitarEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'guitar',
  difficulty: 'easy',
  notes: generateChart('guitar', 0.5),
};

// キーボード - 4拍に1ノート
const keyboardEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'keyboard',
  difficulty: 'easy',
  notes: generateChart('keyboard', 0.25),
};

// ベース - 2拍に1ノート
const bassEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'bass',
  difficulty: 'easy',
  notes: generateChart('bass', 0.5),
};

export const CHARTS: InstrumentChart[] = [
  drumsEasy,
  guitarEasy,
  keyboardEasy,
  bassEasy,
];

export function getChart(
  songId: string, 
  instrument: InstrumentType, 
  difficulty: Difficulty
): InstrumentChart | undefined {
  return CHARTS.find(
    chart => chart.songId === songId && 
             chart.instrument === instrument && 
             chart.difficulty === difficulty
  );
}

export function getChartsForSong(songId: string): InstrumentChart[] {
  return CHARTS.filter(chart => chart.songId === songId);
}
