/**
 * Web Audio API を使った音楽生成・再生システム
 * 
 * 【音楽ファイルの差し替え】
 * Song.audioUrl に音楽ファイルのパスを設定すると、
 * そちらが優先的に再生されます。
 * 
 * audioUrl が null の場合は、自動生成のメロディが再生されます。
 */

// メロディ定義（周波数）
const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,
  'B4': 493.88,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'REST': 0,
};

// 楽曲のメロディデータ
interface MelodyNote {
  note: string;
  duration: number; // ビート数
}

const MELODIES: Record<string, MelodyNote[]> = {
  // きらきら星
  twinkle_star: [
    { note: 'C4', duration: 1 }, { note: 'C4', duration: 1 },
    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
    { note: 'A4', duration: 1 }, { note: 'A4', duration: 1 },
    { note: 'G4', duration: 2 },
    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
    { note: 'D4', duration: 1 }, { note: 'D4', duration: 1 },
    { note: 'C4', duration: 2 },
    // 繰り返し
    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
    { note: 'D4', duration: 2 },
    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
    { note: 'D4', duration: 2 },
  ],
  
  // Happy Birthday
  happy_birthday: [
    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
    { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
    { note: 'C5', duration: 1 }, { note: 'B4', duration: 2 },
    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
    { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
    { note: 'D5', duration: 1 }, { note: 'C5', duration: 2 },
    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
    { note: 'G4', duration: 1 }, { note: 'E5', duration: 1 },
    { note: 'C5', duration: 1 }, { note: 'B4', duration: 1 }, { note: 'A4', duration: 2 },
  ],
  
  // ジングルベル
  jingle_bells: [
    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'E4', duration: 2 },
    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'E4', duration: 2 },
    { note: 'E4', duration: 1 }, { note: 'G4', duration: 1 }, { note: 'C4', duration: 1 }, { note: 'D4', duration: 1 },
    { note: 'E4', duration: 4 },
    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
    { note: 'F4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
    { note: 'E4', duration: 1 }, { note: 'D4', duration: 1 }, { note: 'D4', duration: 1 }, { note: 'E4', duration: 1 },
    { note: 'D4', duration: 2 }, { note: 'G4', duration: 2 },
  ],
};

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private oscillators: OscillatorNode[] = [];
  
  // 現在の再生位置（ミリ秒）
  getCurrentTime(): number {
    if (!this.isPlaying) return this.pauseTime;
    return Date.now() - this.startTime;
  }
  
  // 音楽ファイルまたは生成音源を再生
  async play(songId: string, audioUrl: string | null, bpm: number): Promise<void> {
    this.stop();
    
    if (audioUrl) {
      // 音楽ファイルがある場合はそちらを再生
      await this.playAudioFile(audioUrl);
    } else {
      // 生成音源を再生
      await this.playSynthesized(songId, bpm);
    }
    
    this.isPlaying = true;
    this.startTime = Date.now();
  }
  
  private async playAudioFile(url: string): Promise<void> {
    this.audioElement = new Audio(url);
    this.audioElement.play();
  }
  
  private async playSynthesized(songId: string, bpm: number): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    const melody = MELODIES[songId];
    if (!melody) return;
    
    const beatDuration = 60 / bpm; // 1ビートの長さ（秒）
    let currentTime = this.audioContext.currentTime;
    
    for (const { note, duration } of melody) {
      const freq = NOTE_FREQUENCIES[note];
      const noteDuration = beatDuration * duration;
      
      if (freq > 0) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteDuration * 0.9);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + noteDuration);
        
        this.oscillators.push(oscillator);
      }
      
      currentTime += noteDuration;
    }
  }
  
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.pauseTime = this.getCurrentTime();
    this.isPlaying = false;
  }
  
  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    
    for (const osc of this.oscillators) {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    }
    this.oscillators = [];
    
    this.isPlaying = false;
    this.pauseTime = 0;
    this.startTime = 0;
  }
  
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// シングルトンインスタンス
let audioPlayerInstance: AudioPlayer | null = null;

export function getAudioPlayer(): AudioPlayer {
  if (!audioPlayerInstance) {
    audioPlayerInstance = new AudioPlayer();
  }
  return audioPlayerInstance;
}
