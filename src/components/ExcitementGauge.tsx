'use client';

import { motion } from 'framer-motion';

interface ExcitementGaugeProps {
  value: number; // 0-100
  showLabel?: boolean;
}

export default function ExcitementGauge({ value, showLabel = true }: ExcitementGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Color changes based on excitement level
  const getGaugeColor = () => {
    if (clampedValue >= 80) return 'from-yellow-400 via-orange-500 to-red-500';
    if (clampedValue >= 50) return 'from-green-400 via-yellow-400 to-orange-400';
    return 'from-blue-400 via-cyan-400 to-green-400';
  };

  const getEmoji = () => {
    if (clampedValue >= 90) return '🔥🔥🔥';
    if (clampedValue >= 70) return '🔥🔥';
    if (clampedValue >= 50) return '🔥';
    if (clampedValue >= 30) return '✨';
    return '💫';
  };

  return (
    <div className="w-full max-w-md">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold text-sm">盛り上がり</span>
          <span className="text-white text-lg">{getEmoji()}</span>
        </div>
      )}
      
      {/* Gauge container */}
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-white/20">
        {/* Gauge fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getGaugeColor()}`}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ type: 'spring', damping: 15 }}
        />
        
        {/* Shimmer effect when high */}
        {clampedValue >= 70 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold drop-shadow-lg">
            {Math.floor(clampedValue)}%
          </span>
        </div>
      </div>

      {/* MAX achieved celebration */}
      {clampedValue >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-2"
        >
          <span className="text-yellow-400 font-bold text-lg animate-pulse">
            🎉 ENCORE達成！ 🎉
          </span>
        </motion.div>
      )}
    </div>
  );
}
