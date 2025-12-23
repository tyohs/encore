'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import confetti from 'canvas-confetti';

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const { room, currentUser } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(false);

  const excitement = room?.excitementGauge || Math.floor(Math.random() * 30 + 70);
  const score = currentUser?.score || Math.floor(Math.random() * 5000 + 1000);
  const fansaCount = room?.fansaRequests?.filter((r) => r.completed).length || Math.floor(Math.random() * 5 + 1);

  // Calculate stars based on excitement
  const getStars = () => {
    if (excitement >= 90) return 5;
    if (excitement >= 70) return 4;
    if (excitement >= 50) return 3;
    if (excitement >= 30) return 2;
    return 1;
  };

  const stars = getStars();

  // Trigger confetti on mount
  useEffect(() => {
    setShowConfetti(true);
    
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handlePlayAgain = () => {
    router.push(`/room/${roomId}`);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-center mb-8"
      >
        {excitement >= 100 ? (
          <>
            <span className="text-6xl block mb-4">🎉</span>
            <h1 className="text-4xl font-bold gradient-text">ENCORE達成！</h1>
          </>
        ) : (
          <>
            <span className="text-6xl block mb-4">✨</span>
            <h1 className="text-4xl font-bold text-white">お疲れ様！</h1>
          </>
        )}
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-8"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`text-4xl ${i < stars ? '' : 'opacity-30'}`}
          >
            ⭐
          </motion.span>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 w-full max-w-sm mb-8"
      >
        <div className="space-y-4">
          {/* Excitement */}
          <div className="flex justify-between items-center">
            <span className="text-white/60">盛り上がり度</span>
            <span className="text-2xl font-bold text-white">{Math.floor(excitement)}%</span>
          </div>

          {/* Score */}
          <div className="flex justify-between items-center">
            <span className="text-white/60">スコア</span>
            <span className="text-2xl font-bold text-yellow-400">
              {score.toLocaleString()} pt
            </span>
          </div>

          {/* Fansa Count */}
          <div className="flex justify-between items-center">
            <span className="text-white/60">ファンサ達成</span>
            <span className="text-2xl font-bold text-pink-400">{fansaCount}回</span>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-white/60 text-center mb-8 max-w-xs"
      >
        {excitement >= 80 
          ? '最高のライブだった！みんなの一体感がすごかった！'
          : excitement >= 50
          ? 'いい感じに盛り上がったね！次はもっと行けるはず！'
          : 'もっとペンライトを振って盛り上げよう！'
        }
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button onClick={handlePlayAgain} className="btn-primary text-center">
          🎤 もう一曲！
        </button>
        <button onClick={handleGoHome} className="btn-secondary text-center">
          🏠 ホームに戻る
        </button>
      </motion.div>

      {/* Share hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-white/40 text-sm mt-8 text-center"
      >
        スクリーンショットを撮って友達にシェアしよう！
      </motion.p>
    </main>
  );
}
