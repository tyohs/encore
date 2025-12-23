'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SONGS, Song } from '@/data/songs';
import { Difficulty } from '@/data/charts';

interface SongSelectProps {
  onSelect: (songId: string, difficulty: Difficulty) => void;
  onBack?: () => void;
}

export default function SongSelect({ onSelect, onBack }: SongSelectProps) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    // デフォルトで利用可能な最も簡単な難易度を選択
    if (song.difficulty.easy) setSelectedDifficulty('easy');
    else if (song.difficulty.normal) setSelectedDifficulty('normal');
    else setSelectedDifficulty('hard');
  };

  const handleConfirm = () => {
    if (selectedSong) {
      onSelect(selectedSong.id, selectedDifficulty);
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'from-green-400 to-emerald-500';
      case 'normal': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-red-400 to-pink-500';
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white"
          >
            ← 戻る
          </button>
        )}
        <h1 className="text-2xl font-bold text-white">🎵 曲を選ぼう</h1>
        <div className="w-16" />
      </div>

      {/* Song List */}
      <div className="space-y-3 mb-6">
        {SONGS.map((song, index) => (
          <motion.button
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSongClick(song)}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedSong?.id === song.id
                ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-2 border-purple-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{song.coverEmoji}</span>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{song.title}</h3>
                <p className="text-white/60 text-sm">{song.artist}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-white/40">{song.genre}</span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/40">
                    {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {song.difficulty.easy && (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/30 text-green-300">E</span>
                )}
                {song.difficulty.normal && (
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/30 text-yellow-300">N</span>
                )}
                {song.difficulty.hard && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/30 text-red-300">H</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Difficulty Selection */}
      {selectedSong && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6"
        >
          <h2 className="text-white font-bold mb-3">🎯 難易度を選択</h2>
          <div className="flex gap-2">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => {
              const isAvailable = selectedSong.difficulty[diff];
              
              return (
                <button
                  key={diff}
                  onClick={() => isAvailable && setSelectedDifficulty(diff)}
                  disabled={!isAvailable}
                  className={`flex-1 p-3 rounded-xl transition-all ${
                    !isAvailable
                      ? 'bg-gray-700/50 opacity-50 cursor-not-allowed'
                      : selectedDifficulty === diff
                      ? `bg-gradient-to-br ${getDifficultyColor(diff)} shadow-lg`
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span className={`block font-bold ${selectedDifficulty === diff ? 'text-white' : 'text-white/70'}`}>
                    {diff === 'easy' ? 'EASY' : diff === 'normal' ? 'NORMAL' : 'HARD'}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Confirm Button */}
      {selectedSong && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className="btn-primary w-full text-center"
        >
          🎤 「{selectedSong.title}」でスタート！
        </motion.button>
      )}
    </div>
  );
}
