'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { InstrumentType, INSTRUMENT_INFO } from '@/types';
import { SONGS, Song } from '@/data/songs';
import { getChart, Difficulty } from '@/data/charts';
import { useRoomStore } from '@/store/roomStore';
import InstrumentSelect from '@/components/InstrumentSelect';
import BandGame from '@/components/BandGame';

type GamePhase = 'song-select' | 'instrument-select' | 'countdown' | 'playing' | 'finished';

export default function BandPlayPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [phase, setPhase] = useState<GamePhase>('song-select');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [mvUrl, setMvUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const difficulty: Difficulty = 'easy';

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setPhase('instrument-select');
  };

  const handleMvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setMvUrl(url);
    }
  };

  const handleRemoveMv = () => {
    if (mvUrl) {
      URL.revokeObjectURL(mvUrl);
      setMvUrl(null);
    }
  };

  const handleInstrumentSelect = async (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    
    // Initialize room sync with instrument
    useRoomStore.getState().initRoom(roomId, INSTRUMENT_INFO[instrument].label, 'band', instrument);
    
    setPhase('countdown');

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setPhase('playing');
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error('Audio playback failed:', e);
      }
    }
  };

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameEnd = useCallback(() => {
    setPhase('finished');
    setTimeout(() => {
      router.push(`/room/${roomId}/result?score=${score}&instrument=${selectedInstrument}&song=${selectedSong?.title}`);
    }, 2000);
  }, [router, roomId, score, selectedInstrument, selectedSong]);

  const handleBack = () => {
    if (phase === 'instrument-select') {
      setPhase('song-select');
    } else {
      router.push(`/room/${roomId}`);
    }
  };

  const chart = selectedSong && selectedInstrument 
    ? getChart(selectedSong.id, selectedInstrument, difficulty) 
    : null;

  return (
    <main className="h-screen flex flex-col bg-orbs">
      {/* Audio element */}
      {selectedSong && (
        <audio 
          ref={audioRef} 
          src={selectedSong.audioUrl} 
          preload="auto"
          onEnded={handleGameEnd}
        />
      )}

      {/* Hidden file input for MV */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        onChange={handleMvUpload}
        className="hidden"
      />

      {/* Song Selection */}
      {phase === 'song-select' && (
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">曲を選択</h1>
            <p className="text-white/50 text-sm">演奏したい曲を選んでください</p>
          </div>

          {/* MV Upload Section */}
          <div className="mb-6 p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium text-sm">🎬 MV映像（オプション）</h3>
                <p className="text-white/40 text-xs mt-1">
                  {mvUrl ? '映像がセットされています' : 'MP4をアップロードして背景に表示'}
                </p>
              </div>
              {mvUrl ? (
                <div className="flex gap-2">
                  <span className="text-green-400 text-sm">✓ 設定済み</span>
                  <button
                    onClick={handleRemoveMv}
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-purple-600/50 text-white text-sm hover:bg-purple-600/70 transition-colors"
                >
                  アップロード
                </button>
              )}
            </div>
            {mvUrl && (
              <div className="mt-3 rounded-lg overflow-hidden h-20 bg-black/50">
                <video 
                  src={mvUrl} 
                  className="w-full h-full object-cover opacity-60"
                  muted
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {SONGS.map((song, index) => (
              <motion.button
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSongSelect(song)}
                className="w-full p-5 rounded-2xl backdrop-blur-md bg-white/8 border border-white/15 hover:bg-white/15 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{song.coverEmoji}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{song.title}</h3>
                    <p className="text-white/50 text-sm">{song.artist}</p>
                    <div className="flex gap-3 mt-1 text-xs text-white/40">
                      <span>BPM {song.bpm}</span>
                      <span>•</span>
                      <span>{song.genre}</span>
                    </div>
                  </div>
                  <div className="text-white/30 text-2xl">→</div>
                </div>
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => router.push(`/room/${roomId}`)}
            className="mt-auto text-white/40 text-sm text-center py-4"
          >
            ← 戻る
          </button>
        </div>
      )}

      {/* Instrument Selection */}
      {phase === 'instrument-select' && (
        <InstrumentSelect 
          onSelect={handleInstrumentSelect}
          onBack={handleBack}
        />
      )}

      {/* Countdown */}
      {phase === 'countdown' && selectedInstrument && selectedSong && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="mb-4">
              <span className="text-3xl">{selectedSong.coverEmoji}</span>
              <span className="text-white/60 text-sm ml-2">{selectedSong.title}</span>
            </div>
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ backgroundColor: `${INSTRUMENT_INFO[selectedInstrument].color}20` }}
            >
              {INSTRUMENT_INFO[selectedInstrument].emoji}
            </div>
            <motion.span
              className="text-8xl font-bold text-white block"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {countdown}
            </motion.span>
            <p className="text-white/50 mt-4">
              {INSTRUMENT_INFO[selectedInstrument].label}で演奏開始
            </p>
            {mvUrl && (
              <p className="text-purple-400/60 text-sm mt-2">🎬 MV付き</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && selectedInstrument && chart && (
        <BandGame 
          chart={chart}
          instrument={selectedInstrument}
          audioRef={audioRef}
          mvUrl={mvUrl}
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
        />
      )}

      {/* Finished */}
      {phase === 'finished' && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <span className="text-5xl block mb-6">🎉</span>
            <h1 className="text-3xl font-bold text-white mb-4">演奏完了</h1>
            <p className="text-white/60 text-lg mb-2">
              スコア: <span className="font-bold text-white">{score.toLocaleString()}</span>
            </p>
            <p className="text-white/40 text-sm">結果を確認中...</p>
          </motion.div>
        </div>
      )}
    </main>
  );
}
