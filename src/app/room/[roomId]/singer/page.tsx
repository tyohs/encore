'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import ExcitementGauge from '@/components/ExcitementGauge';
import LyricsDisplay from '@/components/LyricsDisplay';
import { FansaRequestDisplay } from '@/components/FansaButton';
import { FANSA_INFO, FansaType } from '@/types';
import { SONGS } from '@/data/songs';

// デモ用のファンサリクエストシーケンス
const MOCK_FANSA_SEQUENCE: { type: FansaType; fromName: string; delay: number }[] = [
  { type: 'wave', fromName: 'ヒカル', delay: 8000 },
  { type: 'peace', fromName: 'ミク', delay: 18000 },
  { type: 'heart', fromName: 'タクヤ', delay: 30000 },
];

interface FansaRequestState {
  type: FansaType;
  fromName: string;
  completed: boolean;
  id: string;
}

type GamePhase = 'ready' | 'countdown' | 'playing';

export default function SingerPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const { room, updateExcitement, endGame: endGameStore } = useGameStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [fansaRequests, setFansaRequests] = useState<FansaRequestState[]>([]);
  const [audienceCount] = useState(3 + Math.floor(Math.random() * 3));
  const [completedCount, setCompletedCount] = useState(0);

  // 仰げば尊しを使用
  const song = SONGS[0];

  const handleStart = async () => {
    setPhase('countdown');
    
    // カウントダウン
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setPhase('playing');
    
    // 音楽再生開始
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // ゲームループ（歌詞同期用）
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase]);

  // ファンサリクエストのシミュレーション
  useEffect(() => {
    if (phase !== 'playing') return;

    const timers = MOCK_FANSA_SEQUENCE.map(({ type, fromName, delay }, index) => {
      return setTimeout(() => {
        setFansaRequests((prev) => [
          ...prev,
          { type, fromName, completed: false, id: `req-${index}` },
        ]);
        updateExcitement(10);
      }, delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, updateExcitement]);

  // 盛り上がりの自動増加
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      updateExcitement(2);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [phase, updateExcitement]);

  const handleCompleteFansa = (id: string) => {
    setFansaRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, completed: true } : req))
    );
    setCompletedCount((prev) => prev + 1);
    updateExcitement(5);
  };

  const handleFinish = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    endGameStore();
    router.push(`/room/${roomId}/result`);
  };

  const handleBack = () => {
    router.push(`/room/${roomId}`);
  };

  const excitement = room?.excitementGauge || 0;
  const pendingRequests = fansaRequests.filter((r) => !r.completed);

  // Ready Phase
  if (phase === 'ready') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-8xl block mb-4">{song.coverEmoji}</span>
          <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
          <p className="text-white/60 mb-8">{song.artist}</p>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="btn-primary px-8 py-4 text-xl"
          >
            🎤 歌い始める
          </motion.button>
          
          <button
            onClick={handleBack}
            className="block text-white/40 text-sm mt-4 mx-auto"
          >
            ← 戻る
          </button>
        </motion.div>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} src={song.audioUrl} preload="auto" />
      </main>
    );
  }

  // Countdown Phase
  if (phase === 'countdown') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          className="text-center"
        >
          <motion.span
            className="text-9xl font-bold gradient-text"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            {countdown}
          </motion.span>
          <p className="text-white/60 text-xl mt-4">歌う準備はいい？</p>
        </motion.div>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} src={song.audioUrl} preload="auto" />
      </main>
    );
  }

  // Playing Phase
  return (
    <main className="min-h-screen flex flex-col p-4">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        preload="auto"
        onEnded={handleFinish}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-white/60 text-xs">ROOM</span>
          <span className="text-white font-bold ml-2">{roomId}</span>
        </div>
        <button
          onClick={handleFinish}
          className="text-white/60 text-sm px-3 py-1 rounded-full bg-white/10"
        >
          終了する
        </button>
      </div>

      {/* Excitement Gauge */}
      <div className="mb-4">
        <ExcitementGauge value={excitement} />
      </div>

      {/* Song Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <span className="text-3xl mr-2">{song.coverEmoji}</span>
        <span className="text-white font-bold text-xl">{song.title}</span>
      </motion.div>

      {/* Lyrics Display */}
      <div className="mb-6">
        <LyricsDisplay 
          lyrics={song.lyrics} 
          currentTime={currentTime}
        />
      </div>

      {/* Audience Status */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-white font-bold mb-3">🔦 観客の様子</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: audienceCount }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -5, 0],
                rotate: [-10, 10, -10],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                delay: i * 0.1,
              }}
              className="text-2xl"
            >
              🔦
            </motion.span>
          ))}
        </div>
        <p className="text-center text-white/60 text-sm">
          {audienceCount}人が盛り上がっています！
        </p>
      </div>

      {/* Fansa Requests */}
      <div className="flex-1">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          💕 ファンサーリクエスト
          {pendingRequests.length > 0 && (
            <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </h3>

        <AnimatePresence>
          {fansaRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/40 py-4"
            >
              <p>リクエストを待っています...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {fansaRequests.slice(-3).map((request) => (
                <FansaRequestDisplay
                  key={request.id}
                  type={request.type}
                  fromName={request.fromName}
                  completed={request.completed}
                  onComplete={() => handleCompleteFansa(request.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="glass-card p-4 mt-4">
        <div className="flex justify-around text-center">
          <div>
            <span className="text-2xl font-bold text-white">{completedCount}</span>
            <p className="text-white/60 text-xs">ファンサ達成</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-white">{fansaRequests.length}</span>
            <p className="text-white/60 text-xs">リクエスト</p>
          </div>
        </div>
      </div>
    </main>
  );
}
