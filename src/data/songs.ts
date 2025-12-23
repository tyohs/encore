/**
 * 楽曲データ定義
 */

export interface LyricLine {
  time: number;
  text: string;
  duration: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  bpm: number;
  duration: number;
  difficulty: {
    easy: boolean;
    normal: boolean;
    hard: boolean;
  };
  lyrics: LyricLine[];
  coverEmoji: string;
  genre: string;
}

export const SONGS: Song[] = [
  {
    id: 'aogeba_toutoshi',
    title: '仰げば尊し',
    artist: '唱歌',
    audioUrl: '/audio/仰げば尊し.wav',
    bpm: 72,
    duration: 60, // 60秒（デモ用）
    difficulty: { easy: true, normal: true, hard: false },
    genre: '唱歌',
    coverEmoji: '🎓',
    lyrics: [
      { time: 0, text: '♪ ♪ ♪', duration: 2 },
      { time: 2, text: '仰げば 尊し', duration: 4 },
      { time: 6, text: '我が師の恩', duration: 4 },
      { time: 10, text: '教えの庭にも', duration: 4 },
      { time: 14, text: 'はや幾年', duration: 4 },
      { time: 18, text: '思えば いと疾し', duration: 4 },
      { time: 22, text: 'この年月', duration: 4 },
      { time: 26, text: '今こそ 別れめ', duration: 4 },
      { time: 30, text: 'いざさらば', duration: 4 },
      { time: 34, text: '♪ ♪ ♪', duration: 4 },
      { time: 38, text: '互いに睦みし', duration: 4 },
      { time: 42, text: '日頃の恩', duration: 4 },
      { time: 46, text: '別るる後にも', duration: 4 },
      { time: 50, text: 'やよ忘るな', duration: 4 },
      { time: 54, text: '🎓 卒業おめでとう', duration: 6 },
    ],
  },
];

export function getSongById(id: string): Song | undefined {
  return SONGS.find(song => song.id === id);
}
