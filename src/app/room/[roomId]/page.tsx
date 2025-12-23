'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

type GameMode = 'band' | 'audience' | 'singer';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const { room, currentUser, startGame } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  // Mock participants for demo
  const mockParticipants = room?.participants || [
    { id: '1', name: currentUser?.name || 'You', role: 'audience', isHost: currentUser?.isHost },
  ];

  const handleStart = () => {
    startGame();
    if (selectedMode === 'band') {
      router.push(`/room/${roomId}/band`);
    } else if (selectedMode === 'singer') {
      router.push(`/room/${roomId}/singer`);
    } else {
      router.push(`/room/${roomId}/audience`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm mb-1">ルームコード</p>
          <h1 className="text-4xl font-bold text-white tracking-widest">{roomId}</h1>
        </div>

        {/* Participants */}
        <div className="glass-card p-4 mb-6">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            👥 参加者 ({mockParticipants.length})
          </h2>
          <div className="space-y-2">
            {mockParticipants.map((p, i) => (
              <div 
                key={p.id || i}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <span className="text-white">
                  {p.name} {p.isHost && '👑'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="glass-card p-4 mb-6">
          <h2 className="text-white font-bold mb-4">🎮 モードを選択</h2>
          
          {/* Band Mode - メイン */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode('band')}
            className={`w-full p-5 rounded-xl border-2 transition-all mb-3 ${
              selectedMode === 'band'
                ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400'
                : 'bg-white/5 border-white/20 hover:border-white/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎸</span>
              <div className="text-left">
                <span className="text-white font-bold text-lg block">即席バンド</span>
                <p className="text-white/60 text-sm">楽器を選んでバンド演奏！</p>
              </div>
              <span className="ml-auto text-2xl">🥁🎹</span>
            </div>
          </motion.button>

          {/* Other modes */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('singer')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                selectedMode === 'singer'
                  ? 'bg-pink-500/30 border-pink-400'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              <span className="text-3xl block mb-2">🎤</span>
              <span className="text-white font-bold">シンガー</span>
              <p className="text-white/60 text-xs mt-1">歌う人</p>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('audience')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                selectedMode === 'audience'
                  ? 'bg-blue-500/30 border-blue-400'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              <span className="text-3xl block mb-2">🔦</span>
              <span className="text-white font-bold">応援</span>
              <p className="text-white/60 text-xs mt-1">ペンライト振り</p>
            </motion.button>
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={!selectedMode}
          className="btn-primary w-full disabled:opacity-50"
        >
          {selectedMode === 'band' ? '🎸 バンドスタート！' : 
           selectedMode === 'singer' ? '🎤 ライブスタート！' :
           selectedMode === 'audience' ? '🔦 応援スタート！' :
           'モードを選んでください'}
        </motion.button>

        {/* Share hint */}
        <p className="text-center text-white/40 text-sm mt-6">
          ルームコードを友達にシェアしよう！
        </p>
      </motion.div>
    </main>
  );
}
