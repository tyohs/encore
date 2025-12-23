'use client';

import { motion } from 'framer-motion';

interface CallButtonProps {
  text: string;
  emoji?: string;
  onCall: () => void;
  isActive?: boolean;
}

export default function CallButton({ text, emoji = '📢', onCall, isActive = true }: CallButtonProps) {
  return (
    <motion.button
      onClick={onCall}
      disabled={!isActive}
      whileTap={{ scale: 0.9 }}
      animate={isActive ? { 
        boxShadow: ['0 0 0px rgba(255,200,0,0)', '0 0 20px rgba(255,200,0,0.5)', '0 0 0px rgba(255,200,0,0)']
      } : {}}
      transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
      className={`
        px-4 py-3 rounded-xl font-bold text-lg
        transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <span className="mr-1">{emoji}</span>
      {text}
    </motion.button>
  );
}

// Preset call buttons
export const CALL_PRESETS = [
  { text: 'フッフー！', emoji: '🎉' },
  { text: 'かわいい！', emoji: '💕' },
  { text: 'いいね！', emoji: '👍' },
  { text: '最高！', emoji: '✨' },
];
