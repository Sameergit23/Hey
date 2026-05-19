'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rows?: number;
  variant?: 'text' | 'circle' | 'rect' | 'chat-card';
}

const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={cn(
        'rounded-xl',
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'dark:from-dark-surface-2 dark:via-dark-surface dark:to-dark-surface-2',
        'bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function ChatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl">
      <Skeleton className="w-11 h-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ isSent = false }: { isSent?: boolean }) {
  return (
    <div className={cn('flex gap-2 px-4', isSent && 'flex-row-reverse')}>
      {!isSent && <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />}
      <div className="space-y-1">
        <Skeleton className={cn('h-10 rounded-2xl', isSent ? 'w-48' : 'w-56')} />
        <Skeleton className={cn('h-3 w-16', isSent && 'ml-auto')} />
      </div>
    </div>
  );
}

export function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <ChatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
