'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstrumentType, INSTRUMENT_INFO } from '@/types';
import { 
  NoteData, 
  InstrumentChart, 
  Judgment, 
  JUDGMENT_WINDOWS, 
  JUDGMENT_MULTIPLIERS,
  BASE_POINTS,
  getComboMultiplier,
} from '@/data/charts';

interface NoteState extends NoteData {
  id: number;
  hit: boolean;
  judgment?: Judgment;
}

interface BandGameProps {
  chart: InstrumentChart;
  instrument: InstrumentType;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onScoreUpdate: (score: number, combo: number) => void;
  onGameEnd?: () => void;
}

export default function BandGame({ 
  chart, 
  instrument, 
  audioRef,
  onScoreUpdate,
  onGameEnd 
}: BandGameProps) {
  const [notes, setNotes] = useState<NoteState[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<Judgment | null>(null);
  const [showMissEffect, setShowMissEffect] = useState(false);
  const [hitEffect, setHitEffect] = useState<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const info = INSTRUMENT_INFO[instrument];

  // 初期化
  useEffect(() => {
    const initialNotes: NoteState[] = chart.notes.map((note, index) => ({
      ...note,
      id: index,
      hit: false,
    }));
    setNotes(initialNotes);
    setScore(0);
    setCombo(0);
  }, [chart]);

  // ゲームループ
  useEffect(() => {
    const gameLoop = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime * 1000;
        setCurrentTime(time);

        if (audioRef.current.ended) {
          onGameEnd?.();
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioRef, onGameEnd]);

  // ミスしたノートを自動判定
  useEffect(() => {
    setNotes(prevNotes => {
      let missCount = 0;
      const updated = prevNotes.map(note => {
        if (!note.hit && note.time + JUDGMENT_WINDOWS.good < currentTime) {
          missCount++;
          return { ...note, hit: true, judgment: 'miss' as Judgment };
        }
        return note;
      });

      if (missCount > 0) {
        setCombo(0);
        setShowMissEffect(true);
        setTimeout(() => setShowMissEffect(false), 200);
      }

      return updated;
    });
  }, [currentTime]);

  // スコア更新を親に通知
  useEffect(() => {
    onScoreUpdate(score, combo);
  }, [score, combo, onScoreUpdate]);

  // ノートを叩いた時の処理
  const handleTap = useCallback((lane?: number) => {
    const targetNote = notes
      .filter(n => !n.hit)
      .filter(n => instrument !== 'drums' || n.lane === lane || lane === undefined)
      .reduce<NoteState | null>((closest, note) => {
        const diff = Math.abs(note.time - currentTime);
        if (diff > JUDGMENT_WINDOWS.good) return closest;
        if (!closest) return note;
        return diff < Math.abs(closest.time - currentTime) ? note : closest;
      }, null);

    if (!targetNote) return;

    const diff = Math.abs(targetNote.time - currentTime);
    let judgment: Judgment;

    if (diff <= JUDGMENT_WINDOWS.perfect) {
      judgment = 'perfect';
    } else if (diff <= JUDGMENT_WINDOWS.great) {
      judgment = 'great';
    } else {
      judgment = 'good';
    }

    const basePoints = BASE_POINTS[targetNote.type];
    const multiplier = JUDGMENT_MULTIPLIERS[judgment];
    const newCombo = combo + 1;
    const comboMultiplier = getComboMultiplier(newCombo);
    const points = Math.floor(basePoints * multiplier * comboMultiplier);

    setNotes(prev => prev.map(n => 
      n.id === targetNote.id ? { ...n, hit: true, judgment } : n
    ));
    setScore(prev => prev + points);
    setCombo(newCombo);
    setLastJudgment(judgment);
    setHitEffect({ x: Math.random() * 100, y: Math.random() * 100 });
    setTimeout(() => {
      setLastJudgment(null);
      setHitEffect(null);
    }, 300);
  }, [notes, currentTime, combo, instrument]);

  const APPROACH_TIME = 2500;

  // 楽器別のUI
  const renderInstrumentUI = () => {
    switch (instrument) {
      case 'drums':
        return <DrumUI onTap={handleTap} info={info} combo={combo} />;
      case 'keyboard':
        return <KeyboardUI onTap={handleTap} info={info} combo={combo} />;
      case 'guitar':
      case 'bass':
        return <GuitarUI onTap={handleTap} info={info} instrument={instrument} combo={combo} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Background animation */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${info.color}40 0%, transparent 50%)`,
        }}
      />

      {/* Miss effect */}
      <AnimatePresence>
        {showMissEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/40 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Hit particles */}
      <AnimatePresence>
        {hitEffect && (
          <motion.div
            key={Date.now()}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none z-40"
            style={{
              left: `${hitEffect.x}%`,
              top: `${hitEffect.y}%`,
              width: 50,
              height: 50,
              background: `radial-gradient(circle, ${info.color} 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Header - super colorful */}
      <div 
        className="p-4 z-10"
        style={{ background: `linear-gradient(180deg, ${info.color}30 0%, transparent 100%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-4xl p-3 rounded-2xl"
              style={{ 
                backgroundColor: `${info.color}40`,
                boxShadow: `0 0 20px ${info.color}60`,
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {info.emoji}
            </motion.span>
            <div>
              <span className="text-white font-bold text-lg">{info.label}</span>
              <div className="text-white/60 text-sm">BPM 72</div>
            </div>
          </div>
          
          {/* Combo display */}
          <div className="text-center">
            <div className="text-white/60 text-xs">COMBO</div>
            <motion.div 
              key={combo}
              initial={{ scale: 1.5, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              className="text-4xl font-black"
              style={{ 
                color: combo >= 30 ? '#FFD700' : combo >= 10 ? info.color : 'white',
                textShadow: combo >= 10 ? `0 0 20px ${info.color}` : 'none',
              }}
            >
              {combo}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Score - big and flashy */}
      <div className="text-center py-3 relative z-10">
        <motion.div 
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-5xl font-black"
          style={{ 
            background: `linear-gradient(135deg, ${info.color}, #FFD700, ${info.color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 30px ${info.color}60`,
          }}
        >
          {score.toLocaleString()}
        </motion.div>
        <span className="text-white/40 text-sm">SCORE</span>
      </div>

      {/* Note lane area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Notes */}
        {notes.map(note => {
          if (note.hit) return null;
          
          const timeUntilHit = note.time - currentTime;
          if (timeUntilHit > APPROACH_TIME || timeUntilHit < -200) return null;

          const progress = 1 - (timeUntilHit / APPROACH_TIME);
          const y = progress * 60;
          const x = instrument === 'drums' ? (note.lane || 0) * 25 + 12.5 : 50;
          const size = note.type === 'special' ? 70 : 55;

          return (
            <motion.div
              key={note.id}
              className="absolute rounded-full flex items-center justify-center font-bold shadow-2xl"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
                background: note.type === 'special' 
                  ? `linear-gradient(135deg, #FFD700, #FF6B9D, #4ECDC4)`
                  : `linear-gradient(135deg, ${info.color}, ${info.color}CC)`,
                boxShadow: `0 0 30px ${note.type === 'special' ? '#FFD700' : info.color}80`,
                border: `3px solid white`,
              }}
              animate={note.type === 'special' ? {
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              } : {
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              <span className="text-white text-xl">
                {note.type === 'special' ? '💫' : '●'}
              </span>
            </motion.div>
          );
        })}

        {/* Judgment line */}
        <div 
          className="absolute left-4 right-4 h-24 rounded-3xl flex items-center justify-center"
          style={{ 
            top: '60%',
            background: `linear-gradient(180deg, ${info.color}40 0%, ${info.color}20 100%)`,
            border: `4px solid ${info.color}`,
            boxShadow: `0 0 40px ${info.color}60, inset 0 0 40px ${info.color}20`,
          }}
        >
          <AnimatePresence>
            {lastJudgment && (
              <motion.div
                key={Date.now()}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -30, scale: 1.5 }}
                className="font-black text-4xl"
                style={{
                  color: lastJudgment === 'perfect' ? '#FFD700' :
                         lastJudgment === 'great' ? '#FF6B9D' : '#4ECDC4',
                  textShadow: `0 0 20px currentColor`,
                }}
              >
                {lastJudgment === 'perfect' ? '✨ PERFECT! ✨' :
                 lastJudgment === 'great' ? '🔥 GREAT!' :
                 'GOOD!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instrument-specific UI */}
      <div className="relative z-10">
        {renderInstrumentUI()}
      </div>
    </div>
  );
}

// ドラムUI - 4つのパッド
function DrumUI({ onTap, info, combo }: { onTap: (lane?: number) => void; info: typeof INSTRUMENT_INFO['drums']; combo: number }) {
  const pads = [
    { color: '#FF6B6B', label: 'ハイハット', emoji: '🥁' },
    { color: '#4ECDC4', label: 'スネア', emoji: '🪘' },
    { color: '#FFE66D', label: 'タム', emoji: '🥁' },
    { color: '#A78BFA', label: 'キック', emoji: '🦶' },
  ];

  return (
    <div className="p-4 bg-black/50">
      <div className="grid grid-cols-4 gap-2">
        {pads.map((pad, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9, y: 5 }}
            onClick={() => onTap(index)}
            className="aspect-square rounded-2xl flex flex-col items-center justify-center font-bold shadow-lg"
            style={{
              background: `linear-gradient(180deg, ${pad.color} 0%, ${pad.color}80 100%)`,
              boxShadow: `0 8px 0 ${pad.color}60, 0 0 20px ${pad.color}40`,
            }}
          >
            <span className="text-3xl">{pad.emoji}</span>
            <span className="text-xs text-white/80 mt-1">{pad.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// キーボードUI - ピアノ鍵盤風
function KeyboardUI({ onTap, info, combo }: { onTap: (lane?: number) => void; info: typeof INSTRUMENT_INFO['keyboard']; combo: number }) {
  const keys = ['ド', 'レ', 'ミ', 'ファ', 'ソ'];

  return (
    <div className="p-4 bg-black/50">
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95, y: 5 }}
            onClick={() => onTap(index)}
            className="flex-1 h-28 rounded-b-xl flex items-end justify-center pb-3 font-bold text-lg"
            style={{
              background: 'linear-gradient(180deg, #f0f0f0 0%, #d0d0d0 100%)',
              boxShadow: `0 8px 0 #a0a0a0, 0 12px 20px rgba(0,0,0,0.3)`,
              color: '#333',
            }}
          >
            {key}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ギター/ベースUI - ストラム風
function GuitarUI({ onTap, info, instrument, combo }: { onTap: (lane?: number) => void; info: typeof INSTRUMENT_INFO['guitar']; instrument: InstrumentType; combo: number }) {
  const strings = instrument === 'bass' ? 4 : 6;

  return (
    <div className="p-4 bg-black/50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onTap()}
        className="w-full py-8 rounded-2xl flex flex-col items-center justify-center font-bold"
        style={{
          background: `linear-gradient(180deg, ${info.color} 0%, ${info.color}80 100%)`,
          boxShadow: `0 8px 0 ${info.color}60, 0 0 30px ${info.color}40`,
        }}
      >
        {/* Strings visualization */}
        <div className="w-full px-8 mb-3">
          {Array.from({ length: strings }).map((_, i) => (
            <motion.div
              key={i}
              className="h-0.5 bg-white/60 my-1.5 rounded-full"
              animate={{ scaleX: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>
        <span className="text-3xl">{info.emoji}</span>
        <span className="text-white text-xl mt-2">タップでストラム！</span>
      </motion.button>
    </div>
  );
}
