'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace(ROUTES.CHATS);
      } else {
        router.replace(ROUTES.ONBOARDING);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '-10%', left: '-10%' }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-accent/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ bottom: '-10%', right: '-10%' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.3)',
                '0 0 60px rgba(255,255,255,0.6)',
                '0 0 20px rgba(255,255,255,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-4xl flex items-center justify-center border border-white/30"
          >
            <span className="text-white font-bold text-6xl font-display">H</span>
          </motion.div>

          {/* Pulse rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-4xl border-2 border-white/30"
              animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            />
          ))}
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white font-display tracking-tight">Hey</h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/70 mt-2 text-base"
          >
            Messages that feel alive ✨
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full">
          <motion.path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="rgba(255,255,255,0.1)"
            animate={{ d: [
              'M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z',
              'M0,80 C360,0 1080,120 1440,40 L1440,120 L0,120 Z',
              'M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z',
            ]}}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M0,80 C480,20 960,140 1440,80 L1440,120 L0,120 Z"
            fill="rgba(255,255,255,0.07)"
            animate={{ d: [
              'M0,80 C480,20 960,140 1440,80 L1440,120 L0,120 Z',
              'M0,40 C480,140 960,20 1440,100 L1440,120 L0,120 Z',
              'M0,80 C480,20 960,140 1440,80 L1440,120 L0,120 Z',
            ]}}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </svg>
      </div>
    </div>
  );
}
