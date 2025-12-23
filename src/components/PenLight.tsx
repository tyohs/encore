'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PENLIGHT_COLORS } from '@/types';

interface PenLightProps {
  onSwing?: (intensity: number) => void;
}

export default function PenLight({ onSwing }: PenLightProps) {
  const { currentUser, addScore, setPenLightColor } = useGameStore();
  const [intensity, setIntensity] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const controls = useAnimation();
  const lastSwingTime = useRef(0);
  const permissionGranted = useRef(false);

  const color = currentUser?.penLightColor || PENLIGHT_COLORS[0];

  // Request motion permission (required for iOS)
  const requestPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        permissionGranted.current = permission === 'granted';
      } catch (e) {
        console.error('Motion permission denied:', e);
      }
    } else {
      permissionGranted.current = true;
    }
  }, []);

  // Handle device motion
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // Calculate total acceleration magnitude
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const threshold = 15; // Minimum magnitude to count as swing
    const maxMagnitude = 40;

    if (magnitude > threshold) {
      const now = Date.now();
      if (now - lastSwingTime.current > 100) { // Debounce
        const normalizedIntensity = Math.min(100, ((magnitude - threshold) / (maxMagnitude - threshold)) * 100);
        setIntensity(normalizedIntensity);
        
        // Add score based on intensity
        const points = Math.floor(normalizedIntensity / 10);
        if (points > 0) {
          addScore(points);
          onSwing?.(normalizedIntensity);
        }

        lastSwingTime.current = now;

        // Animate the glow
        controls.start({
          scale: [1, 1.1, 1],
          transition: { duration: 0.2 },
        });
      }
    } else {
      setIntensity((prev) => Math.max(0, prev - 5));
    }
  }, [addScore, controls, onSwing]);

  useEffect(() => {
    requestPermission();
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion, requestPermission]);

  // Fallback: touch/click to simulate swing
  const handleTap = () => {
    const fakeIntensity = 50 + Math.random() * 50;
    setIntensity(fakeIntensity);
    addScore(Math.floor(fakeIntensity / 10));
    onSwing?.(fakeIntensity);
    controls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 0.15 },
    });
    setTimeout(() => setIntensity(0), 300);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Color picker toggle */}
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        className="mb-4 px-4 py-2 rounded-full bg-white/20 text-white text-sm"
      >
        🎨 色を変える
      </button>

      {/* Color picker */}
      {showColorPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 flex flex-wrap gap-2 p-3 bg-black/80 rounded-xl z-10"
        >
          {PENLIGHT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setPenLightColor(c);
                setShowColorPicker(false);
              }}
              className="w-8 h-8 rounded-full border-2 border-white/50 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            />
          ))}
        </motion.div>
      )}

      {/* Penlight */}
      <motion.div
        animate={controls}
        onClick={handleTap}
        className="relative w-48 h-72 cursor-pointer select-none"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            backgroundColor: color,
            opacity: 0.3 + (intensity / 100) * 0.7,
          }}
        />

        {/* Light stick */}
        <div
          className="absolute inset-4 rounded-3xl flex items-center justify-center"
          style={{
            background: `linear-gradient(180deg, ${color} 0%, ${color}88 50%, ${color}44 100%)`,
            boxShadow: `0 0 ${20 + intensity}px ${color}, 0 0 ${40 + intensity * 2}px ${color}`,
          }}
        >
          <motion.span
            className="text-6xl"
            animate={{ 
              scale: 1 + (intensity / 200),
              rotate: intensity > 50 ? [-5, 5, -5] : 0,
            }}
            transition={{ duration: 0.1 }}
          >
            🔦
          </motion.span>
        </div>
      </motion.div>

      {/* Instruction */}
      <p className="mt-4 text-white/70 text-sm text-center">
        スマホを振るか、タップしてペンライトを振ろう！
      </p>
    </div>
  );
}
