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
    duration: 198, // 3分18秒
    difficulty: { easy: true, normal: true, hard: false },
    genre: '唱歌',
    coverEmoji: '🎓',
    lyrics: [
      { time: 0, text: '♪ ♪ ♪', duration: 4 },
      { time: 4, text: '仰げば 尊し', duration: 8 },
      { time: 12, text: '我が師の恩', duration: 8 },
      { time: 20, text: '教えの庭にも', duration: 8 },
      { time: 28, text: 'はや幾年', duration: 8 },
      { time: 36, text: '思えば いと疾し', duration: 8 },
      { time: 44, text: 'この年月', duration: 8 },
      { time: 52, text: '今こそ 別れめ', duration: 8 },
      { time: 60, text: 'いざさらば', duration: 8 },
      { time: 68, text: '♪ ♪ ♪', duration: 8 },
      { time: 76, text: '互いに睦みし', duration: 8 },
      { time: 84, text: '日頃の恩', duration: 8 },
      { time: 92, text: '別るる後にも', duration: 8 },
      { time: 100, text: 'やよ忘るな', duration: 8 },
      { time: 108, text: '♪ ♪ ♪', duration: 8 },
      { time: 116, text: '身を立て 名をあげ', duration: 8 },
      { time: 124, text: 'やよ励めよ', duration: 8 },
      { time: 132, text: '今こそ 別れめ', duration: 8 },
      { time: 140, text: 'いざさらば', duration: 8 },
      { time: 148, text: '♪ ♪ ♪', duration: 8 },
      { time: 156, text: '朝夕馴れにし', duration: 8 },
      { time: 164, text: '学びの窓', duration: 8 },
      { time: 172, text: '蛍の灯火', duration: 8 },
      { time: 180, text: '積む白雪', duration: 8 },
      { time: 188, text: '🎓 ありがとう', duration: 10 },
    ],
  },
];

export function getSongById(id: string): Song | undefined {
  return SONGS.find(song => song.id === id);
}
