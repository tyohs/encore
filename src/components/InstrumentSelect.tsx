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
    <div 
      className="min-h-screen p-4 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#FF6B9D', '#FFE66D', '#4ECDC4', '#A78BFA'][i % 4],
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        {onBack && (
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white text-lg"
          >
            ← 戻る
          </button>
        )}
        <motion.h1 
          className="text-3xl font-black text-center flex-1"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D, #FFE66D, #4ECDC4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🎸 パートを選ぼう！
        </motion.h1>
        <div className="w-16" />
      </div>

      {/* Instruments Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {instruments.map((instrument, index) => {
          const info = INSTRUMENT_INFO[instrument];
          const isTaken = takenInstruments.includes(instrument);
          const isSelected = selected === instrument;

          return (
            <motion.button
              key={instrument}
              initial={{ opacity: 0, y: 30, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isTaken && setSelected(instrument)}
              disabled={isTaken}
              className="relative p-6 rounded-3xl text-center transition-all overflow-hidden"
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${info.color}60 0%, ${info.color}40 100%)`
                  : 'rgba(255,255,255,0.1)',
                border: `4px solid ${isSelected ? info.color : 'rgba(255,255,255,0.2)'}`,
                boxShadow: isSelected 
                  ? `0 0 40px ${info.color}60, inset 0 0 40px ${info.color}20`
                  : 'none',
                opacity: isTaken ? 0.4 : 1,
              }}
            >
              {/* Animated background */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0"
                  style={{ 
                    background: `radial-gradient(circle, ${info.color}40 0%, transparent 70%)` 
                  }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}

              <motion.span 
                className="text-6xl block mb-3 relative"
                animate={isSelected ? { 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {info.emoji}
              </motion.span>
              
              <span 
                className="text-2xl font-black block relative"
                style={{ color: isSelected ? info.color : 'white' }}
              >
                {info.label}
              </span>
              
              {/* Difficulty stars */}
              <div className="mt-3 flex justify-center gap-1 relative">
                {[1, 2, 3].map(star => (
                  <motion.span 
                    key={star}
                    className={star <= info.difficulty ? '' : 'opacity-30'}
                    style={{ color: '#FFD700', fontSize: '1.2rem' }}
                    animate={star <= info.difficulty ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.6, delay: star * 0.1 }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm mt-2 relative">
                {instrument === 'drums' && 'リズムをキープ！'}
                {instrument === 'guitar' && 'メロディを奏でよう'}
                {instrument === 'keyboard' && '初心者におすすめ'}
                {instrument === 'bass' && '低音で支える'}
              </p>

              {isTaken && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl">
                  <span className="text-white/80 font-bold">使用中</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected info */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl mb-6 text-center relative z-10"
          style={{
            background: `linear-gradient(135deg, ${INSTRUMENT_INFO[selected].color}40 0%, ${INSTRUMENT_INFO[selected].color}20 100%)`,
            border: `2px solid ${INSTRUMENT_INFO[selected].color}`,
          }}
        >
          <p className="text-white text-lg">
            <motion.span 
              className="text-3xl font-black"
              style={{ color: INSTRUMENT_INFO[selected].color }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {INSTRUMENT_INFO[selected].emoji} {INSTRUMENT_INFO[selected].label}
            </motion.span>
            <span className="text-white/60 ml-2">で演奏する！</span>
          </p>
        </motion.div>
      )}

      {/* Confirm Button */}
      <div className="mt-auto relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full py-5 rounded-2xl font-black text-xl disabled:opacity-40"
          style={{
            background: selected 
              ? `linear-gradient(135deg, ${INSTRUMENT_INFO[selected].color}, #FFD700)`
              : 'rgba(255,255,255,0.2)',
            boxShadow: selected
              ? `0 8px 0 ${INSTRUMENT_INFO[selected].color}80, 0 0 30px ${INSTRUMENT_INFO[selected].color}40`
              : 'none',
            color: 'white',
          }}
        >
          {selected 
            ? `🎵 ${INSTRUMENT_INFO[selected].label}でスタート！` 
            : 'パートを選んでください'}
        </motion.button>
      </div>
    </div>
  );
}
