'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyricLine } from '@/data/songs';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;  // 秒
}

export default function LyricsDisplay({ lyrics, currentTime }: LyricsDisplayProps) {
  // 現在の歌詞を見つける
  const currentLyricIndex = lyrics.findIndex((lyric, index) => {
    const nextLyric = lyrics[index + 1];
    const endTime = nextLyric ? nextLyric.time : lyric.time + lyric.duration;
    return currentTime >= lyric.time && currentTime < endTime;
  });

  const currentLyric = currentLyricIndex >= 0 ? lyrics[currentLyricIndex] : null;
  const nextLyric = currentLyricIndex >= 0 ? lyrics[currentLyricIndex + 1] : lyrics[0];
  const prevLyric = currentLyricIndex > 0 ? lyrics[currentLyricIndex - 1] : null;

  return (
    <div className="glass-card p-6 text-center">
      {/* Previous Lyric */}
      <div className="h-8 mb-2">
        {prevLyric && (
          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.3 }}
            className="text-white/30 text-sm"
          >
            {prevLyric.text}
          </motion.p>
        )}
      </div>

      {/* Current Lyric */}
      <div className="min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentLyric ? (
            <motion.p
              key={currentLyric.time}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="text-3xl font-bold gradient-text"
            >
              ♪ {currentLyric.text}
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-xl text-white/50"
            >
              {nextLyric ? '準備中...' : '♪ ♪ ♪'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Next Lyric (preview) */}
      <div className="h-8 mt-2">
        {nextLyric && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-white/40 text-sm"
          >
            ({nextLyric.text})
          </motion.p>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-4">
        {lyrics.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentLyricIndex
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 scale-125'
                : index < currentLyricIndex
                ? 'bg-white/50'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
