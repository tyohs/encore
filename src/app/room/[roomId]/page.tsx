'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useRoomStore, Player } from '@/store/roomStore';
import ReservationList from '@/components/room/ReservationList';
import SongBookingModal from '@/components/room/SongBookingModal';
import { SONGS } from '@/data/songs';

export default function RoomLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { 
    initRoom, 
    players, 
    playerId,
    queue, 
    currentReservation, 
    gamePhase,
    startGame,
    broadcastGameUpdate
  } = useRoomStore();
  
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Player['role'] | null>(null);

  // Initialize room connection on mount
  useEffect(() => {
    const name = localStorage.getItem('minKaraName') || 'Guest-' + Math.floor(Math.random() * 1000);
    initRoom(roomId, name, 'audience');
  }, [roomId, initRoom]);

  // Auto-start countdown when there's a reservation and not playing
  useEffect(() => {
    if (queue.length > 0 && !currentReservation && gamePhase === 'song-select') {
      // Start countdown
      setCountdown(10);
      setRoleModalOpen(true);
    } else if (queue.length === 0) {
      setCountdown(null);
      setRoleModalOpen(false);
    }
  }, [queue.length, currentReservation, gamePhase]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Auto-start game
          handleAutoStart();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleAutoStart = useCallback(async () => {
    if (queue.length === 0) return;
    
    // Close modal
    setRoleModalOpen(false);
    setCountdown(null);
    
    // Start the game
    await startGame();
    
    // Navigate based on role
    const myRole = selectedRole || 'audience';
    router.push(`/room/${roomId}/${myRole}`);
  }, [queue, startGame, selectedRole, roomId, router]);

  const handleRoleSelect = (role: Player['role']) => {
    setSelectedRole(role);
    setRoleModalOpen(false);
    setCountdown(null);
    
    // Navigate to role page
    router.push(`/room/${roomId}/${role}`);
  };

  // Find current song details if playing
  const currentSong = currentReservation 
    ? SONGS.find(s => s.id === currentReservation.song_id) 
    : null;

  // Find next song in queue
  const nextSong = queue.length > 0 
    ? SONGS.find(s => s.id === queue[0].song_id) 
    : null;

  return (
    <main className="min-h-screen flex flex-col p-6 bg-orbs pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">ROOM</p>
          <h1 className="text-2xl font-bold text-white tracking-widest">{roomId}</h1>
        </div>
        
        {/* Participants indicator - clickable */}
        <button 
          onClick={() => setShowParticipants(!showParticipants)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white/60 text-xs">{players.length} Online</span>
          <span className="text-white/40">▾</span>
        </button>
      </motion.div>

      {/* Participants Dropdown */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 mb-6"
          >
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">
              👥 参加者一覧
            </h3>
            <div className="space-y-2">
              {players.map(player => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between bg-white/5 p-2 rounded-lg"
                >
                  <span className="text-white text-sm">
                    {player.name} {player.id === playerId && '(あなた)'}
                  </span>
                  <span className="text-white/40 text-xs px-2 py-1 bg-white/5 rounded">
                    {player.role === 'singer' ? '🎤 シンガー' : 
                     player.role === 'band' ? '🎸 バンド' : '🔦 応援'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        {currentReservation && currentSong ? (
          <div className="glass-card p-6 border-l-4 border-indigo-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform translate-x-10 -translate-y-10">
              🎤
            </div>
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-bold mb-3">
                NOW PLAYING
              </span>
              <h2 className="text-3xl font-bold text-white mb-1 leading-tight">
                {currentSong.title}
              </h2>
              <p className="text-white/60 text-lg mb-4">{currentSong.artist}</p>
              
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <span>🎤 Singer:</span>
                <span className="text-white font-medium">{currentReservation.user_name}</span>
              </div>
            </div>
          </div>
        ) : queue.length > 0 && nextSong ? (
          /* Next up card with countdown */
          <div className="glass-card p-6 border-l-4 border-amber-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform translate-x-10 -translate-y-10">
              ⏳
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-bold">
                  NEXT UP
                </span>
                {countdown !== null && (
                  <span className="text-2xl font-bold text-amber-400">
                    {countdown}秒
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                {nextSong.title}
              </h2>
              <p className="text-white/60 mb-4">{nextSong.artist}</p>
              
              <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                <span>🎤 予約者:</span>
                <span className="text-white font-medium">{queue[0].user_name}</span>
              </div>

              <button
                onClick={() => setRoleModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg"
              >
                🎭 役割を選んで参加する
              </button>
            </div>
          </div>
        ) : (
          /* Waiting card with prominent booking button */
          <div className="glass-card p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-xl font-bold text-white mb-2">演奏待機中</h2>
            <p className="text-white/40 text-sm mb-6">
              曲を予約してカラオケを始めよう！
            </p>
            
            {/* Large prominent booking button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBookingModalOpen(true)}
              className="w-full max-w-xs py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🎤</span>
              曲を予約する
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Reservation Queue */}
      <div className="mb-20">
         <ReservationList />
      </div>

      {/* Floating Action Button for Booking (secondary) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setBookingModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-2xl z-40 border border-white/20"
      >
        ➕
      </motion.button>

      {/* Booking Modal */}
      <SongBookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
      />

      {/* Role Selection Modal */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setRoleModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-[#1a1b2e] rounded-3xl z-50 p-6 border border-white/10 max-w-md mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">🎭 役割を選択</h2>
                {countdown !== null && (
                  <p className="text-amber-400 text-sm">
                    {countdown}秒後に自動的に応援として参加します
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect('singer')}
                  className="w-full p-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-xl text-left hover:bg-pink-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎤</span>
                    <div>
                      <p className="text-white font-bold">シンガー</p>
                      <p className="text-white/50 text-xs">歌詞を見ながら歌う</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('band')}
                  className="w-full p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-left hover:bg-indigo-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎸</span>
                    <div>
                      <p className="text-white font-bold">バンド</p>
                      <p className="text-white/50 text-xs">リズムゲームで盛り上げる</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('audience')}
                  className="w-full p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-left hover:bg-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔦</span>
                    <div>
                      <p className="text-white font-bold">応援</p>
                      <p className="text-white/50 text-xs">ペンライトとコールで応援</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
