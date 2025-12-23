'use client';

import { motion } from 'framer-motion';
import { FansaType, FANSA_INFO } from '@/types';

interface FansaButtonProps {
  type: FansaType;
  onRequest: (type: FansaType) => void;
  disabled?: boolean;
  canRequest: boolean;
  requiredScore: number;
  currentScore: number;
}

export function FansaButton({
  type,
  onRequest,
  disabled = false,
  canRequest,
  requiredScore,
  currentScore,
}: FansaButtonProps) {
  const info = FANSA_INFO[type];
  const progress = Math.min(100, (currentScore / requiredScore) * 100);
  const isReady = currentScore >= requiredScore;

  return (
    <motion.button
      onClick={() => isReady && canRequest && onRequest(type)}
      disabled={disabled || !isReady || !canRequest}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden rounded-xl p-4 min-w-[100px]
        transition-all duration-300
        ${isReady && canRequest
          ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30'
          : 'bg-gray-700/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Progress fill (when not ready) */}
      {!isReady && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-pink-500/30 to-transparent"
          initial={{ height: '0%' }}
          animate={{ height: `${progress}%` }}
          style={{ originY: 1 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-2xl">{info.emoji}</span>
        <span className={`text-xs font-medium ${isReady ? 'text-white' : 'text-gray-400'}`}>
          {info.label}
        </span>
        {!isReady && (
          <span className="text-[10px] text-gray-500">
            @{requiredScore}pt
          </span>
        )}
      </div>

      {/* Ready indicator */}
      {isReady && canRequest && (
        <motion.div
          className="absolute inset-0 border-2 border-yellow-400 rounded-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.button>
  );
}

interface FansaRequestDisplayProps {
  type: FansaType;
  fromName: string;
  onComplete: () => void;
  completed: boolean;
}

export function FansaRequestDisplay({
  type,
  fromName,
  onComplete,
  completed,
}: FansaRequestDisplayProps) {
  const info = FANSA_INFO[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`
        p-4 rounded-2xl mb-3
        ${completed 
          ? 'bg-green-500/30 border border-green-400' 
          : 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 border border-pink-400'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.emoji}</span>
          <div>
            <p className="text-white font-bold">{info.label}して！</p>
            <p className="text-gray-300 text-sm">from {fromName}</p>
          </div>
        </div>
        
        {completed ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl"
          >
            ✅
          </motion.span>
        ) : (
          <motion.button
            onClick={onComplete}
            whileTap={{ scale: 0.9 }}
            className="px-4 py-2 bg-green-500 rounded-lg text-white font-bold text-sm"
          >
            やった！
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
