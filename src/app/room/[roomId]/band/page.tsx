'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { InstrumentType, INSTRUMENT_INFO } from '@/types';
import { SONGS, Song } from '@/data/songs';
import { getChart, Difficulty } from '@/data/charts';
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
  const audioRef = useRef<HTMLAudioElement>(null);

  const difficulty: Difficulty = 'easy';

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setPhase('instrument-select');
  };

  const handleInstrumentSelect = async (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
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

      {/* Song Selection */}
      {phase === 'song-select' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">曲を選択</h1>
            <p className="text-white/50 text-sm">演奏したい曲を選んでください</p>
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
          </motion.div>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && selectedInstrument && chart && (
        <BandGame 
          chart={chart}
          instrument={selectedInstrument}
          audioRef={audioRef}
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
