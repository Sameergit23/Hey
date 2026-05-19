'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  side?: 'right' | 'left' | 'top' | 'bottom';
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, side = 'right', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClass = {
    right:  'left-full ml-2.5 top-1/2 -translate-y-1/2',
    left:   'right-full mr-2.5 top-1/2 -translate-y-1/2',
    top:    'bottom-full mb-2.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2.5 left-1/2 -translate-x-1/2',
  }[side];

  const originClass = {
    right:  'origin-left',
    left:   'origin-right',
    top:    'origin-bottom',
    bottom: 'origin-top',
  }[side];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'px-2.5 py-1.5 rounded-xl text-xs font-medium',
              'bg-gray-900 dark:bg-gray-700 text-white shadow-lg',
              positionClass, originClass, className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
