'use client';

import { motion } from 'framer-motion';
import { useUIStore, ActiveTab } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { MessageCircle, Phone, Users, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { id: ActiveTab; icon: React.ElementType; label: string }[] = [
  { id: 'chats',    icon: MessageCircle, label: 'Chats'    },
  { id: 'calls',    icon: Phone,         label: 'Calls'    },
  { id: 'contacts', icon: Users,         label: 'Contacts' },
  { id: 'explore',  icon: Compass,       label: 'Explore'  },
  { id: 'settings', icon: Settings,      label: 'Settings' },
];

export default function MobileNav() {
  const { activeTab, setActiveTab } = useUIStore();
  const { chats } = useChatStore();
  const totalUnread = chats.reduce((a, c) => a + c.unreadCount, 0);

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 safe-area-pb"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const showBadge = id === 'chats' && totalUnread > 0;

          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileTap={{ scale: 0.88 }}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl relative min-w-[52px]',
                'transition-colors duration-150',
                isActive ? 'text-primary' : 'text-light-muted dark:text-dark-muted'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(var(--primary-rgb),0.1)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              <div className="relative z-10">
                <Icon className={cn('w-[21px] h-[21px]', isActive && 'stroke-[2.2px]')} />
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 glow-badge"
                  >
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </motion.span>
                )}
              </div>

              <span className={cn(
                'text-[10px] leading-none font-medium relative z-10',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
