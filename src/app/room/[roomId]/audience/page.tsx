'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import ExcitementGauge from '@/components/ExcitementGauge';
import PenLight from '@/components/PenLight';
import CallButton, { CALL_PRESETS } from '@/components/CallButton';
import { FansaButton } from '@/components/FansaButton';
import { FansaType } from '@/types';

export default function AudiencePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const { room, currentUser, addScore, sendFansaRequest, updateExcitement } = useGameStore();
  const [score, setScore] = useState(0);

  // 盛り上がりの自動増加（デモ用）
  useEffect(() => {
    const interval = setInterval(() => {
      updateExcitement(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [updateExcitement]);

  // 60秒後に自動でゲーム終了（デモ用）
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/room/${roomId}/result`);
    }, 60000);
    return () => clearTimeout(timer);
  }, [router, roomId]);

  const handleSwing = (intensity: number) => {
    const points = Math.floor(intensity / 10);
    addScore(points);
    setScore(prev => prev + points);
  };

  const handleCall = (callType: string) => {
    addScore(50);
    setScore(prev => prev + 50);
    updateExcitement(5);
  };

  const handleFansaRequest = (type: FansaType) => {
    sendFansaRequest(type);
    updateExcitement(10);
  };

  const excitement = room?.excitementGauge || 0;

  return (
    <main className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-white/60 text-xs">ROOM</span>
          <span className="text-white font-bold ml-2">{roomId}</span>
        </div>
        <div className="text-right">
          <span className="text-white/60 text-xs">SCORE</span>
          <motion.span 
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-white font-bold text-xl ml-2"
          >
            {score.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Excitement Gauge */}
      <div className="mb-6">
        <ExcitementGauge value={excitement} />
      </div>

      {/* PenLight */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <PenLight onSwing={handleSwing} />
      </div>

      {/* Call Buttons */}
      <div className="mb-6">
        <h3 className="text-white font-bold mb-3">📢 コール</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {CALL_PRESETS.map((call) => (
            <CallButton
              key={call.text}
              text={call.text}
              emoji={call.emoji}
              onCall={() => handleCall(call.text)}
              isActive={true}
            />
          ))}
        </div>
      </div>

      {/* Fansa Buttons */}
      <div className="mb-4">
        <h3 className="text-white font-bold mb-3">💕 ファンサお願い</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {(['heart', 'wave', 'peace'] as FansaType[]).map((type) => (
            <FansaButton
              key={type}
              type={type}
              onRequest={handleFansaRequest}
              disabled={false}
              canRequest={true}
              currentScore={score}
              requiredScore={0}
            />
          ))}
        </div>
      </div>

      {/* End button */}
      <button
        onClick={() => router.push(`/room/${roomId}/result`)}
        className="text-white/60 text-sm text-center py-2"
      >
        ゲームを終了する
      </button>
    </main>
  );
}
