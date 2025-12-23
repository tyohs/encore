import { create } from 'zustand';
import { Room, Participant, FansaRequest, FansaType, PENLIGHT_COLORS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface GameState {
  // Current user
  currentUser: Participant | null;
  
  // Room state
  room: Room | null;
  
  // Game state
  isPlaying: boolean;
  startTime: number | null;
  
  // Actions
  setCurrentUser: (user: Participant) => void;
  createRoom: (hostName: string) => string;
  joinRoom: (roomId: string, userName: string) => void;
  setRole: (role: 'singer' | 'audience') => void;
  startGame: () => void;
  endGame: () => void;
  
  // Score & excitement
  addScore: (points: number) => void;
  updateExcitement: (delta: number) => void;
  
  // Fansa
  sendFansaRequest: (type: FansaType) => void;
  completeFansa: (requestId: string) => void;
  
  // Penlight
  setPenLightColor: (color: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentUser: null,
  room: null,
  isPlaying: false,
  startTime: null,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  createRoom: (hostName) => {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    const hostId = uuidv4();
    const host: Participant = {
      id: hostId,
      name: hostName,
      role: 'singer',
      score: 0,
      isHost: true,
      penLightColor: PENLIGHT_COLORS[0],
    };
    
    const room: Room = {
      id: roomId,
      hostId,
      participants: [host],
      status: 'waiting',
      excitementGauge: 0,
      fansaRequests: [],
    };
    
    set({ room, currentUser: host });
    return roomId;
  },
  
  joinRoom: (roomId, userName) => {
    const userId = uuidv4();
    const user: Participant = {
      id: userId,
      name: userName,
      role: 'audience',
      score: 0,
      isHost: false,
      penLightColor: PENLIGHT_COLORS[Math.floor(Math.random() * PENLIGHT_COLORS.length)],
    };
    
    set((state) => {
      if (!state.room) {
        // In real app, would fetch room from server
        const room: Room = {
          id: roomId,
          hostId: '',
          participants: [user],
          status: 'waiting',
          excitementGauge: 0,
          fansaRequests: [],
        };
        return { room, currentUser: user };
      }
      
      return {
        room: {
          ...state.room,
          participants: [...state.room.participants, user],
        },
        currentUser: user,
      };
    });
  },
  
  setRole: (role) => {
    set((state) => {
      if (!state.currentUser || !state.room) return state;
      
      const updatedUser = { ...state.currentUser, role };
      const participants = state.room.participants.map((p) =>
        p.id === state.currentUser?.id ? updatedUser : p
      );
      
      return {
        currentUser: updatedUser,
        room: { ...state.room, participants },
      };
    });
  },
  
  startGame: () => {
    set((state) => ({
      isPlaying: true,
      startTime: Date.now(),
      room: state.room ? { ...state.room, status: 'playing' } : null,
    }));
  },
  
  endGame: () => {
    set((state) => ({
      isPlaying: false,
      room: state.room ? { ...state.room, status: 'finished' } : null,
    }));
  },
  
  addScore: (points) => {
    set((state) => {
      if (!state.currentUser || !state.room) return state;
      
      const newScore = state.currentUser.score + points;
      const updatedUser = { ...state.currentUser, score: newScore };
      const participants = state.room.participants.map((p) =>
        p.id === state.currentUser?.id ? updatedUser : p
      );
      
      // Also update excitement gauge
      const excitementDelta = points / 10;
      const newExcitement = Math.min(100, state.room.excitementGauge + excitementDelta);
      
      return {
        currentUser: updatedUser,
        room: { 
          ...state.room, 
          participants,
          excitementGauge: newExcitement,
        },
      };
    });
  },
  
  updateExcitement: (delta) => {
    set((state) => {
      if (!state.room) return state;
      const newExcitement = Math.max(0, Math.min(100, state.room.excitementGauge + delta));
      return {
        room: { ...state.room, excitementGauge: newExcitement },
      };
    });
  },
  
  sendFansaRequest: (type) => {
    set((state) => {
      if (!state.currentUser || !state.room) return state;
      
      const request: FansaRequest = {
        id: uuidv4(),
        fromParticipantId: state.currentUser.id,
        type,
        completed: false,
        timestamp: Date.now(),
      };
      
      return {
        room: {
          ...state.room,
          fansaRequests: [...state.room.fansaRequests, request],
        },
      };
    });
  },
  
  completeFansa: (requestId) => {
    set((state) => {
      if (!state.room) return state;
      
      const fansaRequests = state.room.fansaRequests.map((r) =>
        r.id === requestId ? { ...r, completed: true } : r
      );
      
      // Boost excitement when fansa is completed
      const newExcitement = Math.min(100, state.room.excitementGauge + 5);
      
      return {
        room: {
          ...state.room,
          fansaRequests,
          excitementGauge: newExcitement,
        },
      };
    });
  },
  
  setPenLightColor: (color) => {
    set((state) => {
      if (!state.currentUser || !state.room) return state;
      
      const updatedUser = { ...state.currentUser, penLightColor: color };
      const participants = state.room.participants.map((p) =>
        p.id === state.currentUser?.id ? updatedUser : p
      );
      
      return {
        currentUser: updatedUser,
        room: { ...state.room, participants },
      };
    });
  },
}));
