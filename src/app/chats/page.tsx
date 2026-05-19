'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatList from '@/components/sidebar/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import RightPanel from '@/components/chat/RightPanel';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import CallsView from '@/features/calls/CallsView';
import ContactsView from '@/features/contacts/ContactsView';
import ExploreView from '@/features/explore/ExploreView';
import SettingsView from '@/features/settings/SettingsView';
import { AnimatePresence, motion } from 'framer-motion';
import MobileNav from '@/components/navigation/MobileNav';
import ActiveCallOverlay from '@/features/calls/ActiveCallOverlay';
import { useCallStore } from '@/store/callStore';

export default function ChatsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { activeTab } = useUIStore();
  const { activeCall } = useCallStore();
  const { activeChat } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) router.replace(ROUTES.LOGIN);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <div className="flex flex-1 min-w-0 h-full">
            {/* Desktop: always show both panels */}
            <div className="hidden md:flex flex-1 min-w-0 h-full">
              <ChatList />
              <ChatWindow />
              <RightPanel />
            </div>

            {/* Mobile: show ChatWindow when chat active, else show ChatList */}
            <div className="flex md:hidden flex-1 min-w-0 h-full">
              {activeChat ? <ChatWindow /> : <ChatList />}
            </div>
          </div>
        );
      case 'calls':     return <CallsView />;
      case 'contacts':  return <ContactsView />;
      case 'explore':   return <ExploreView />;
      case 'settings':  return <SettingsView />;
      default:          return null;
    }
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-light-bg dark:bg-dark-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-w-0 h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-1 min-w-0 h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav — only when no active chat on chats tab */}
      {!(activeTab === 'chats' && activeChat) && <MobileNav />}

      {/* Active call overlay */}
      <AnimatePresence>{activeCall && <ActiveCallOverlay />}</AnimatePresence>
    </div>
  );
}
