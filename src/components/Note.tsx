'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NoteData, NoteType, Judgment } from '@/data/charts';

interface NoteProps {
  note: NoteData & { id: number; hit: boolean; judgment?: Judgment };
  currentTime: number;
  color?: string;
  onHit?: (judgment: Judgment) => void;
}

// ノートが判定ラインに到達するまでの時間（ミリ秒）
const APPROACH_TIME = 1500;

export function Note({ note, currentTime, color = '#4ECDC4', onHit }: NoteProps) {
  if (note.hit) return null;
  
  const timeUntilHit = note.time - currentTime;
  
  // まだ表示タイミングでない
  if (timeUntilHit > APPROACH_TIME) return null;
  // 既に過ぎた
  if (timeUntilHit < -200) return null;
  
  // 0-1の進行度（1が判定ライン）
  const progress = 1 - (timeUntilHit / APPROACH_TIME);
  
  const getNoteEmoji = () => {
    switch (note.type) {
      case 'tap': return '●';
      case 'hold': return '━';
      case 'special': return '💫';
      default: return '●';
    }
  };
  
  // ノートが上から下に流れてくる
  const y = progress * 70; // 0% -> 70%の位置（判定ラインの位置）
  const size = note.type === 'special' ? 70 : 50;
  
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center shadow-lg text-white font-bold"
      style={{
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 20px ${color}`,
        opacity: Math.min(1, progress + 0.3),
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: note.type === 'special' ? [1, 1.1, 1] : 1,
        opacity: 1,
      }}
      transition={{ 
        duration: 0.2,
        scale: { repeat: Infinity, duration: 0.5 }
      }}
    >
      <span className="text-2xl">{getNoteEmoji()}</span>
    </motion.div>
  );
}

interface JudgmentDisplayProps {
  judgment: Judgment | null;
}

export function JudgmentDisplay({ judgment }: JudgmentDisplayProps) {
  if (!judgment) return null;
  
  const getJudgmentStyle = () => {
    switch (judgment) {
      case 'perfect':
        return 'text-yellow-400 text-4xl';
      case 'great':
        return 'text-orange-400 text-3xl';
      case 'good':
        return 'text-blue-400 text-2xl';
      case 'miss':
        return 'text-gray-500 text-2xl';
    }
  };
  
  const getJudgmentText = () => {
    switch (judgment) {
      case 'perfect': return '✨ PERFECT! ✨';
      case 'great': return '🔥 GREAT!';
      case 'good': return 'GOOD';
      case 'miss': return 'MISS...';
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        key={Date.now()}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.5, y: -20 }}
        className={`font-bold ${getJudgmentStyle()}`}
      >
        {getJudgmentText()}
      </motion.div>
    </AnimatePresence>
  );
}

interface JudgmentLineProps {
  children?: React.ReactNode;
  color?: string;
}

export function JudgmentLine({ children, color = '#4ECDC4' }: JudgmentLineProps) {
  return (
    <div 
      className="absolute left-4 right-4 h-16 border-2 rounded-xl flex items-center justify-center"
      style={{ 
        top: '70%',
        borderColor: color,
        backgroundColor: `${color}20`,
      }}
    >
      {children || (
        <span className="text-white/50 text-sm">ここでタイミングよく！</span>
      )}
    </div>
  );
}
