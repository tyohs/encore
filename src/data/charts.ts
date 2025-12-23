/**
 * 譜面（チャート）データ定義
 * 各楽器ごとに異なる譜面を持つ
 */

import { InstrumentType } from '@/types';

export type NoteType = 'tap' | 'hold' | 'special';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type Judgment = 'perfect' | 'great' | 'good' | 'miss';

export interface NoteData {
  time: number;           // 曲開始からの時間（ミリ秒）
  type: NoteType;
  duration?: number;      // HOLDノートの長さ（ミリ秒）
  lane?: number;          // レーン番号（ドラムなど）
}

export interface InstrumentChart {
  songId: string;
  instrument: InstrumentType;
  difficulty: Difficulty;
  notes: NoteData[];
}

// タイミング判定の閾値（ミリ秒）
export const JUDGMENT_WINDOWS = {
  perfect: 100,
  great: 180,
  good: 300,
};

// 判定ごとのスコア倍率
export const JUDGMENT_MULTIPLIERS: Record<Judgment, number> = {
  perfect: 2.0,
  great: 1.5,
  good: 1.0,
  miss: 0,
};

// コンボボーナス倍率
export function getComboMultiplier(combo: number): number {
  if (combo >= 100) return 3.0;
  if (combo >= 50) return 2.0;
  if (combo >= 30) return 1.5;
  if (combo >= 10) return 1.2;
  return 1.0;
}

// ベースポイント
export const BASE_POINTS: Record<NoteType, number> = {
  tap: 30,
  hold: 50,
  special: 100,
};

// ============================================
// 「仰げば尊し」の譜面データ (BPM: 72)
// 1拍 = 60000 / 72 = 833ms
// 曲の長さ: 約60秒（デモ用に短縮）
// ============================================

const BEAT = 833; // 1拍のミリ秒

// 譜面を自動生成するヘルパー
function generateChart(
  instrument: InstrumentType,
  startTime: number,
  endTime: number,
  density: number // 拍あたりのノート数
): NoteData[] {
  const notes: NoteData[] = [];
  const interval = BEAT / density;
  let noteIndex = 0;

  for (let time = startTime; time < endTime; time += interval) {
    const type: NoteType = noteIndex % 16 === 0 ? 'special' : 'tap';
    const lane = instrument === 'drums' ? (noteIndex % 4) : undefined;
    
    notes.push({ time, type, lane });
    noteIndex++;
  }

  return notes;
}

// ドラム譜面 - リズムをキープ（4レーン）
const drumsEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'drums',
  difficulty: 'easy',
  notes: generateChart('drums', 2000, 55000, 1), // 2秒〜55秒、1拍に1ノート
};

// ギター譜面 - メロディに合わせる
const guitarEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'guitar',
  difficulty: 'easy',
  notes: generateChart('guitar', 2000, 55000, 0.5), // 2拍に1ノート
};

// キーボード譜面 - コードチェンジ（簡単）
const keyboardEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'keyboard',
  difficulty: 'easy',
  notes: generateChart('keyboard', 2000, 55000, 0.25), // 4拍に1ノート
};

// ベース譜面 - ルート音
const bassEasy: InstrumentChart = {
  songId: 'aogeba_toutoshi',
  instrument: 'bass',
  difficulty: 'easy',
  notes: generateChart('bass', 2000, 55000, 0.5), // 2拍に1ノート
};

// 全譜面データ
export const CHARTS: InstrumentChart[] = [
  drumsEasy,
  guitarEasy,
  keyboardEasy,
  bassEasy,
];

// 曲IDと楽器と難易度から譜面を取得
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

// 曲IDから全楽器の譜面を取得
export function getChartsForSong(songId: string): InstrumentChart[] {
  return CHARTS.filter(chart => chart.songId === songId);
}
