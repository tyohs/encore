'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { InstrumentType, INSTRUMENT_INFO } from '@/types';

interface InstrumentSelectProps {
  onSelect: (instrument: InstrumentType) => void;
  takenInstruments?: InstrumentType[];
  onBack?: () => void;
}

export default function InstrumentSelect({ 
  onSelect, 
  takenInstruments = [],
  onBack 
}: InstrumentSelectProps) {
  const [selected, setSelected] = useState<InstrumentType | null>(null);

  const instruments: InstrumentType[] = ['drums', 'guitar', 'keyboard', 'bass'];

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col bg-orbs">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
        )}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white text-center flex-1"
        >
          パートを選択
        </motion.h1>
        <div className="w-16" />
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 text-center mb-8"
      >
        演奏したい楽器を選んでください
      </motion.p>

      {/* Instruments Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {instruments.map((instrument, index) => {
          const info = INSTRUMENT_INFO[instrument];
          const isTaken = takenInstruments.includes(instrument);
          const isSelected = selected === instrument;

          return (
            <motion.button
              key={instrument}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isTaken && setSelected(instrument)}
              disabled={isTaken}
              className={`
                relative p-6 rounded-2xl text-center transition-all duration-300
                backdrop-blur-xl border
                ${isTaken 
                  ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10' 
                  : isSelected
                    ? 'bg-white/15 border-white/30 shadow-lg'
                    : 'bg-white/8 border-white/15 hover:bg-white/12 hover:border-white/20'
                }
              `}
              style={{
                boxShadow: isSelected 
                  ? `0 8px 32px ${info.color}30, inset 0 0 20px ${info.color}10`
                  : undefined,
              }}
            >
              {/* Glow effect */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{ 
                    background: `radial-gradient(circle at center, ${info.color} 0%, transparent 70%)` 
                  }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}

              <span className="text-5xl block mb-4 relative">{info.emoji}</span>
              
              <span className="text-lg font-semibold block text-white relative">
                {info.label}
              </span>
              
              {/* Difficulty indicator */}
              <div className="mt-3 flex justify-center gap-1 relative">
                {[1, 2, 3].map(star => (
                  <span 
                    key={star}
                    className={`text-sm ${star <= info.difficulty ? 'text-amber-400' : 'text-white/20'}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {isTaken && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                  <span className="text-white/60 text-sm">使用中</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 text-center"
        >
          <span className="text-white/60">選択中: </span>
          <span className="text-white font-semibold">
            {INSTRUMENT_INFO[selected].emoji} {INSTRUMENT_INFO[selected].label}
          </span>
        </motion.div>
      )}

      {/* Confirm Button */}
      <div className="mt-auto">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selected}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed text-center"
        >
          {selected ? '演奏を開始' : 'パートを選んでください'}
        </motion.button>
      </div>
    </div>
  );
}
