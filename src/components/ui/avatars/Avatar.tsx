'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from '@/types/user.types';
import Image from 'next/image';

interface AvatarProps {
  user?: Partial<User>;
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnline?: boolean;
  isOnline?: boolean;
  showMood?: boolean;
  onClick?: () => void;
  className?: string;
  glowing?: boolean;
}

const sizes = {
  xs: { container: 'w-7 h-7', text: 'text-xs', ring: 'w-2.5 h-2.5 border', mood: 'text-xs' },
  sm: { container: 'w-9 h-9', text: 'text-sm', ring: 'w-3 h-3 border-2', mood: 'text-xs' },
  md: { container: 'w-11 h-11', text: 'text-sm', ring: 'w-3.5 h-3.5 border-2', mood: 'text-xs' },
  lg: { container: 'w-14 h-14', text: 'text-base', ring: 'w-4 h-4 border-2', mood: 'text-sm' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', ring: 'w-5 h-5 border-2', mood: 'text-base' },
  '2xl': { container: 'w-28 h-28', text: 'text-4xl', ring: 'w-6 h-6 border-2', mood: 'text-xl' },
};

export default function Avatar({
  user,
  src,
  name,
  size = 'md',
  showOnline = false,
  isOnline,
  showMood = false,
  onClick,
  className,
  glowing = false,
}: AvatarProps) {
  const avatarSrc = src || user?.avatar;
  const displayName = name || user?.name || 'User';
  const online = isOnline ?? user?.isOnline;
  const mood = user?.mood;
  const s = sizes[size];

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-indigo-500 to-blue-500',
  ];

  const gradientIndex = displayName.charCodeAt(0) % gradients.length;

  return (
    <div
      className={cn('relative shrink-0', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div
        className={cn(
          s.container,
          'rounded-full overflow-hidden shrink-0',
          glowing && online && 'ring-2 ring-online/50 ring-offset-1 ring-offset-white dark:ring-offset-dark-surface online-ring-animated',
        )}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName}
            width={112}
            height={112}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center font-semibold text-white bg-gradient-to-br select-none',
            gradients[gradientIndex],
            s.text
          )}>
            {initials}
          </div>
        )}
      </div>

      {showOnline && (
        <div className={cn(
          s.ring,
          'absolute -bottom-0.5 -right-0.5 rounded-full',
          online ? 'bg-online' : 'bg-gray-400',
          'border-white dark:border-dark-surface',
        )} />
      )}

      {showMood && mood && (
        <div className={cn(
          'absolute -top-1 -right-1 bg-white dark:bg-dark-surface rounded-full p-0.5 shadow-sm',
          s.mood
        )}>
          {mood.emoji}
        </div>
      )}
    </div>
  );
}
