'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';

interface HeyPingProps {
  chatId: string;
  participantName: string;
}

export default function HeyPing({ chatId: _chatId, participantName }: HeyPingProps) {
  const [isPinging, setIsPinging] = useState(false);
  const { addToast } = useUIStore();

  const handlePing = useCallback(() => {
    if (isPinging) return;
    setIsPinging(true);
    addToast({
      type: 'success',
      title: 'Hey sent! 👋',
      message: `${participantName} got your ping`,
      duration: 2500,
    });
    setTimeout(() => setIsPinging(false), 1500);
  }, [isPinging, participantName, addToast]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.button
        onClick={handlePing}
        whileTap={{ scale: 0.82 }}
        disabled={isPinging}
        aria-label="Send a Hey ping"
        className="p-2 rounded-xl transition-colors relative z-10 text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10 disabled:cursor-not-allowed"
      >
        <motion.span
          animate={isPinging ? {
            rotate: [0, -25, 20, -15, 12, -8, 5, 0],
            scale: [1, 1.4, 1.3, 1.2, 1.1, 1.1, 1.05, 1],
          } : {}}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="text-[18px] inline-block leading-none"
        >
          👋
        </motion.span>
      </motion.button>

      {/* Ping rings — outside button to avoid clip */}
      <AnimatePresence>
        {isPinging && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full border-2 border-primary pointer-events-none"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 3 + i * 0.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

