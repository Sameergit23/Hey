import { Variants } from 'framer-motion';

export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const floatSlow = {
  y: [0, -6, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const glowPulse = {
  boxShadow: [
    '0 0 10px rgba(108,99,255,0.3)',
    '0 0 25px rgba(108,99,255,0.7)',
    '0 0 10px rgba(108,99,255,0.3)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const heyPingVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  ping: {
    scale: [1, 1.3, 1],
    rotate: [0, -15, 15, -10, 10, 0],
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
      duration: 0.6,
    },
  },
};

export const onboardingFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-15, 0, -15],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const springScale: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};
