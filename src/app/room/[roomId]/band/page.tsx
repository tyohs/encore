'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { InstrumentType, INSTRUMENT_INFO } from '@/types';
import { SONGS } from '@/data/songs';
import { getChart, Difficulty } from '@/data/charts';
import InstrumentSelect from '@/components/InstrumentSelect';
import BandGame from '@/components/BandGame';

type GamePhase = 'instrument-select' | 'countdown' | 'playing' | 'finished';

export default function BandPlayPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [phase, setPhase] = useState<GamePhase>('instrument-select');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const song = SONGS[0];
  const difficulty: Difficulty = 'easy';

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

  const handleScoreUpdate = useCallback((newScore: number, newCombo: number) => {
    setScore(newScore);
    setCombo(newCombo);
  }, []);

  const handleGameEnd = useCallback(() => {
    setPhase('finished');
    setTimeout(() => {
      router.push(`/room/${roomId}/result?score=${score}&instrument=${selectedInstrument}`);
    }, 2000);
  }, [router, roomId, score, selectedInstrument]);

  const handleBack = () => {
    router.push(`/room/${roomId}`);
  };

  const chart = selectedInstrument 
    ? getChart(song.id, selectedInstrument, difficulty) 
    : null;

  return (
    <main className="h-screen flex flex-col bg-orbs">
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        preload="auto"
        onEnded={handleGameEnd}
      />

      {/* Instrument Selection */}
      {phase === 'instrument-select' && (
        <InstrumentSelect 
          onSelect={handleInstrumentSelect}
          onBack={handleBack}
        />
      )}

      {/* Countdown */}
      {phase === 'countdown' && selectedInstrument && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
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
