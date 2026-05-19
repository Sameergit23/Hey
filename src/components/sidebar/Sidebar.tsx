'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, ActiveTab } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';
import { MessageCircle, Phone, Users, Compass, Settings, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { Tooltip } from './Tooltip';

const NAV_ITEMS: { id: ActiveTab; icon: React.ElementType; label: string }[] = [
  { id: 'chats',    icon: MessageCircle, label: 'Chats'    },
  { id: 'calls',    icon: Phone,         label: 'Calls'    },
  { id: 'contacts', icon: Users,         label: 'Contacts' },
  { id: 'explore',  icon: Compass,       label: 'Explore'  },
  { id: 'settings', icon: Settings,      label: 'Settings' },
];

export default memo(function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();
  const { toggleTheme, resolvedTheme } = useThemeStore();
  const { chats } = useChatStore();
  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <aside
      className="flex flex-col w-[68px] h-full bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border py-3 items-center z-20 shrink-0"
      aria-label="Main navigation"
    >
      {/* Hey Logo */}
      <div className="mb-5 mt-1">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-9 h-9 rounded-[14px] flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#6C63FF,#A855F7)' }}
        >
          <span className="text-white font-bold text-[17px] font-display leading-none">H</span>
        </motion.div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Primary">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'chats' && totalUnread > 0;

          return (
            <Tooltip key={id} content={label} side="right">
              <motion.button
                onClick={() => setActiveTab(id)}
                whileTap={{ scale: 0.9 }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative w-11 h-11 flex items-center justify-center rounded-2xl transition-colors duration-150',
                  isActive
                    ? 'text-primary'
                    : 'text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/8'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-[19px] h-[19px] relative z-10" />
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 glow-badge z-20"
                  >
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </motion.span>
                )}
              </motion.button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <Tooltip content={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'} side="right">
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-11 h-11 flex items-center justify-center rounded-2xl text-light-muted dark:text-dark-muted hover:text-primary hover:bg-primary/10 transition-colors mb-1"
        >
          <AnimatedThemeIcon theme={resolvedTheme} />
        </motion.button>
      </Tooltip>
    </aside>
  );
});

function AnimatedThemeIcon({ theme }: { theme: string }) {
  return (
    <motion.div
      key={theme}
      initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      {theme === 'dark' ? <Sun className="w-[19px] h-[19px]" /> : <Moon className="w-[19px] h-[19px]" />}
    </motion.div>
  );
}


