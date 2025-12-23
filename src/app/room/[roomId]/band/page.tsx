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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 仰げば尊しを使用
  const song = SONGS[0];
  const difficulty: Difficulty = 'easy';

  const handleInstrumentSelect = async (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    setPhase('countdown');

    // カウントダウン
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setPhase('playing');
    
    // 音楽再生開始
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
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
    <main className="h-screen flex flex-col bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        preload="auto"
        onEnded={handleGameEnd}
      />

      {/* Instrument Selection Phase */}
      {phase === 'instrument-select' && (
        <InstrumentSelect 
          onSelect={handleInstrumentSelect}
          onBack={handleBack}
        />
      )}

      {/* Countdown Phase */}
      {phase === 'countdown' && selectedInstrument && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-center"
          >
            <div className="mb-4">
              <span 
                className="text-6xl p-4 rounded-2xl inline-block"
                style={{ backgroundColor: `${INSTRUMENT_INFO[selectedInstrument].color}30` }}
              >
                {INSTRUMENT_INFO[selectedInstrument].emoji}
              </span>
            </div>
            <motion.span
              className="text-9xl font-bold"
              style={{ color: INSTRUMENT_INFO[selectedInstrument].color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {countdown}
            </motion.span>
            <p className="text-white/60 text-xl mt-4">
              {INSTRUMENT_INFO[selectedInstrument].label}で演奏開始！
            </p>
          </motion.div>
        </div>
      )}

      {/* Playing Phase */}
      {phase === 'playing' && selectedInstrument && chart && (
        <BandGame 
          chart={chart}
          instrument={selectedInstrument}
          audioRef={audioRef}
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
        />
      )}

      {/* Finished Phase */}
      {phase === 'finished' && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <span className="text-6xl block mb-4">🎉</span>
            <h1 className="text-4xl font-bold gradient-text mb-4">演奏完了！</h1>
            <p className="text-white text-2xl">
              スコア: <span className="font-bold">{score.toLocaleString()}</span>
            </p>
            <p className="text-white/60 mt-2">結果を確認中...</p>
          </motion.div>
        </div>
      )}
    </main>
  );
}
