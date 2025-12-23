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
    <main className="min-h-screen flex flex-col items-center p-6 bg-orbs">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Room Code */}
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">ルームコード</p>
          <h1 className="text-4xl font-bold text-white tracking-widest">{roomId}</h1>
        </div>

        {/* Participants */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-6"
        >
          <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">参加者</h2>
          <div className="space-y-2">
            {mockParticipants.map((p, i) => (
              <div 
                key={p.id || i}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <span className="text-white text-sm">
                  {p.name} {p.isHost && <span className="text-amber-400">👑</span>}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mode Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-6"
        >
          <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">モード選択</h2>
          
          {/* Band Mode */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode('band')}
            className={`w-full p-5 rounded-xl text-left transition-all mb-3 backdrop-blur-md ${
              selectedMode === 'band'
                ? 'bg-white/15 border border-white/30'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎸</div>
              <div className="flex-1">
                <span className="text-white font-semibold block">即席バンド</span>
                <p className="text-white/50 text-sm">楽器を選んで演奏</p>
              </div>
              <div className="text-xl opacity-50">🥁🎹</div>
            </div>
          </motion.button>

          {/* Other modes */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('singer')}
              className={`p-4 rounded-xl text-center transition-all backdrop-blur-md ${
                selectedMode === 'singer'
                  ? 'bg-white/15 border border-white/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl block mb-2">🎤</span>
              <span className="text-white text-sm font-medium">シンガー</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('audience')}
              className={`p-4 rounded-xl text-center transition-all backdrop-blur-md ${
                selectedMode === 'audience'
                  ? 'bg-white/15 border border-white/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl block mb-2">🔦</span>
              <span className="text-white text-sm font-medium">応援</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={!selectedMode}
          className="btn-primary w-full disabled:opacity-40"
        >
          {selectedMode ? '開始する' : 'モードを選択してください'}
        </motion.button>

        {/* Hint */}
        <p className="text-center text-white/30 text-xs mt-6">
          ルームコードを共有して友達を招待
        </p>
      </motion.div>
    </main>
  );
}
