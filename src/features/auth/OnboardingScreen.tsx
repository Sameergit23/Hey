'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { slideRight } from '@/animations/slide';
import { onboardingFloat } from '@/animations/floating';
import Button from '@/components/ui/buttons/Button';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    emoji: '💬',
    gradient: 'from-violet-500 to-purple-600',
    title: 'Messages that\nfeel alive',
    desc: 'Chat with friends in real time. Reactions, replies, voice notes — everything you love, even better.',
  },
  {
    emoji: '📞',
    gradient: 'from-blue-500 to-cyan-500',
    title: 'Crystal clear\ncalls anytime',
    desc: 'HD voice and video calls with friends and family. Switch between modes seamlessly.',
  },
  {
    emoji: '✨',
    gradient: 'from-pink-500 to-rose-500',
    title: 'Express yourself\nyour way',
    desc: 'Moods, themes, Hey pings, reactions — make every conversation uniquely yours.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{ background: `radial-gradient(ellipse at center, ${step === 0 ? '#6C63FF' : step === 1 ? '#3B82F6' : '#EC4899'} 0%, transparent 70%)` }}
      />

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
        {/* Illustration */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <motion.div
              variants={onboardingFloat}
              initial="initial"
              animate="animate"
              className={`w-48 h-48 bg-gradient-to-br ${slide.gradient} rounded-5xl flex items-center justify-center shadow-premium`}
            >
              <span className="text-8xl">{slide.emoji}</span>
            </motion.div>

            {/* Decorative dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-primary/30"
                style={{
                  top: `${20 + (i % 3) * 30}%`,
                  left: i < 3 ? '-15%' : '115%',
                }}
                animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text font-display leading-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-base leading-relaxed">
              {slide.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setStep(i)}
              animate={{ width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.4 }}
              className="h-2 bg-primary rounded-full"
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full">
          {isLast ? (
            <Button
              size="lg"
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full"
            >
              Get started 🚀
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setStep(step + 1)}
              className="w-full"
            >
              Next <ChevronRight className="w-5 h-5" />
            </Button>
          )}
          <button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="text-sm text-light-muted dark:text-dark-muted hover:text-primary transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
