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

// コール定義
interface CallItem {
  id: string;
  text: string;
  emoji: string;
  requiredScore: number;
  cost: number;  // 使用するとスコアがこれだけ減る（0なら無料）
}

const CALLS: CallItem[] = [
  { id: 'yeah', text: 'イェーイ！', emoji: '🎉', requiredScore: 500, cost: 0 },
  { id: 'fuu', text: 'フゥー！', emoji: '🔥', requiredScore: 1500, cost: 0 },
  { id: 'saikou', text: 'サイコー！', emoji: '⭐', requiredScore: 3000, cost: 0 },
  { id: 'encore', text: 'アンコール！', emoji: '👏', requiredScore: 5000, cost: 0 },
];

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
  const [activeCall, setActiveCall] = useState<CallItem | null>(null);
  const [usedCalls, setUsedCalls] = useState<Set<string>>(new Set());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const info = INSTRUMENT_INFO[instrument];

  useEffect(() => {
    const initialNotes: NoteState[] = chart.notes.map((note, index) => ({
      ...note,
      id: index,
      hit: false,
    }));
    setNotes(initialNotes);
    setScore(0);
    setCombo(0);
    setUsedCalls(new Set());
  }, [chart]);

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

  useEffect(() => {
    onScoreUpdate(score, combo);
  }, [score, combo, onScoreUpdate]);

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
    setTimeout(() => setLastJudgment(null), 300);
  }, [notes, currentTime, combo, instrument]);

  // コールを使用
  const handleCall = useCallback((call: CallItem) => {
    if (score < call.requiredScore) return;
    if (usedCalls.has(call.id)) return; // 各コールは1回のみ使用可能
    
    setActiveCall(call);
    setUsedCalls(prev => new Set([...prev, call.id]));
    setScore(prev => Math.max(0, prev - call.cost));
    
    setTimeout(() => setActiveCall(null), 1500);
  }, [score, usedCalls]);

  const APPROACH_TIME = 2500;

  // 利用可能なコール
  const availableCalls = CALLS.filter(call => 
    score >= call.requiredScore && !usedCalls.has(call.id)
  );

  const renderInstrumentUI = () => {
    switch (instrument) {
      case 'drums':
        return <DrumUI onTap={handleTap} />;
      case 'keyboard':
        return <KeyboardUI onTap={handleTap} />;
      case 'guitar':
      case 'bass':
        return <GuitarUI onTap={handleTap} instrument={instrument} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-orbs">
      {/* Miss effect */}
      <AnimatePresence>
        {showMissEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/20 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Active Call Display */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -50 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center">
              <motion.span 
                className="text-7xl block mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {activeCall.emoji}
              </motion.span>
              <motion.span 
                className="text-4xl font-bold text-white block"
                style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }}
              >
                {activeCall.text}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 relative z-10">
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${info.color}20` }}
            >
              {info.emoji}
            </div>
            <div>
              <span className="text-white font-semibold">{info.label}</span>
              <div className="text-white/40 text-xs">BPM 72</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-white/40 text-xs uppercase tracking-wider">Combo</div>
            <motion.div 
              key={combo}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-white"
            >
              {combo}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="text-center py-2 relative z-10">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Score</div>
        <motion.div 
          key={score}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold gradient-text"
        >
          {score.toLocaleString()}
        </motion.div>
      </div>

      {/* Call Buttons */}
      <div className="px-4 py-2 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CALLS.map(call => {
            const isAvailable = score >= call.requiredScore && !usedCalls.has(call.id);
            const isUsed = usedCalls.has(call.id);
            const progress = Math.min(1, score / call.requiredScore);
            
            return (
              <motion.button
                key={call.id}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
                onClick={() => handleCall(call)}
                disabled={!isAvailable}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-xl flex items-center gap-2 
                  transition-all relative overflow-hidden
                  ${isUsed 
                    ? 'opacity-30 bg-white/5' 
                    : isAvailable 
                      ? 'bg-white/15 border border-white/30' 
                      : 'bg-white/5 border border-white/10'
                  }
                `}
              >
                {/* Progress bar background */}
                {!isUsed && !isAvailable && (
                  <div 
                    className="absolute inset-0 bg-white/10"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}
                <span className="relative">{call.emoji}</span>
                <span className={`relative text-sm ${isAvailable ? 'text-white' : 'text-white/40'}`}>
                  {isUsed ? '済' : isAvailable ? call.text : `${call.requiredScore}`}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Note lane */}
      <div className="flex-1 relative overflow-hidden mx-4">
        <div className="glass-card h-full relative overflow-hidden">
          {/* Notes */}
          {notes.map(note => {
            if (note.hit) return null;
            
            const timeUntilHit = note.time - currentTime;
            if (timeUntilHit > APPROACH_TIME || timeUntilHit < -200) return null;

            const progress = 1 - (timeUntilHit / APPROACH_TIME);
            const y = progress * 65;
            const x = instrument === 'drums' ? (note.lane || 0) * 25 + 12.5 : 50;
            const size = note.type === 'special' ? 60 : 48;

            return (
              <motion.div
                key={note.id}
                className="absolute rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  transform: 'translate(-50%, -50%)',
                  background: note.type === 'special' 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))'
                    : `${info.color}CC`,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `0 4px 20px ${info.color}40`,
                }}
                animate={note.type === 'special' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <span className="text-white text-lg">
                  {note.type === 'special' ? '✦' : '●'}
                </span>
              </motion.div>
            );
          })}

          {/* Judgment line */}
          <div 
            className="absolute left-4 right-4 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md"
            style={{ 
              top: '65%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <AnimatePresence>
              {lastJudgment && (
                <motion.div
                  key={Date.now()}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="font-bold text-2xl"
                  style={{
                    color: lastJudgment === 'perfect' ? '#a855f7' :
                           lastJudgment === 'great' ? '#3b82f6' : '#22c55e',
                  }}
                >
                  {lastJudgment === 'perfect' ? 'PERFECT' :
                   lastJudgment === 'great' ? 'GREAT' : 'GOOD'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Instrument UI */}
      <div className="p-4 relative z-10">
        {renderInstrumentUI()}
      </div>
    </div>
  );
}

function DrumUI({ onTap }: { onTap: (lane?: number) => void }) {
  const pads = [
    { label: 'HH', color: 'rgba(168, 85, 247, 0.3)' },
    { label: 'SN', color: 'rgba(59, 130, 246, 0.3)' },
    { label: 'TM', color: 'rgba(236, 72, 153, 0.3)' },
    { label: 'KK', color: 'rgba(34, 197, 94, 0.3)' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {pads.map((pad, index) => (
        <motion.button
          key={index}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTap(index)}
          className="aspect-square rounded-2xl flex items-center justify-center font-semibold text-white backdrop-blur-md"
          style={{
            background: pad.color,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {pad.label}
        </motion.button>
      ))}
    </div>
  );
}

function KeyboardUI({ onTap }: { onTap: (lane?: number) => void }) {
  const keys = ['C', 'D', 'E', 'F', 'G'];

  return (
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <motion.button
          key={index}
          whileTap={{ scale: 0.98, y: 4 }}
          onClick={() => onTap(index)}
          className="flex-1 h-24 rounded-b-xl flex items-end justify-center pb-3 font-semibold text-gray-700"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%)',
            boxShadow: '0 4px 0 #9ca3af',
          }}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

function GuitarUI({ onTap, instrument }: { onTap: (lane?: number) => void; instrument: InstrumentType }) {
  const info = INSTRUMENT_INFO[instrument];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onTap()}
      className="w-full py-10 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md"
      style={{
        background: `${info.color}20`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <span className="text-4xl mb-2">{info.emoji}</span>
      <span className="text-white/60 text-sm">タップで演奏</span>
    </motion.button>
  );
}
