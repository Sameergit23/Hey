'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/avatars/Avatar';
import {
  User, Shield, Bell, Palette, Smartphone, Ban,
  ChevronRight, LogOut, Sun, Moon, Monitor,
  Lock, Eye, EyeOff, Check, Sparkles, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { MOOD_OPTIONS, CHAT_THEMES } from '@/constants/mockData';

type SettingsPage = 'main' | 'profile' | 'privacy' | 'notifications' | 'appearance' | 'devices' | 'blocked' | 'ai';

export default function SettingsView() {
  const [page, setPage] = useState<SettingsPage>('main');
  const { user, logout } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const { addToast } = useUIStore();

  const handleLogout = () => {
    logout();
    addToast({ type: 'info', title: 'Signed out', message: 'See you again! 👋', duration: 3000 });
  };

  const renderPage = () => {
    switch (page) {
      case 'profile': return <ProfileSettings onBack={() => setPage('main')} />;
      case 'privacy': return <PrivacySettings onBack={() => setPage('main')} />;
      case 'notifications': return <NotificationSettings onBack={() => setPage('main')} />;
      case 'appearance': return <AppearanceSettings onBack={() => setPage('main')} theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />;
      case 'ai': return <AISettings onBack={() => setPage('main')} />;
      default: return null;
    }
  };

  if (page !== 'main') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          className="flex flex-col flex-1 h-full bg-light-bg dark:bg-dark-bg overflow-hidden"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    );
  }

  const settingsItems = [
    { id: 'profile' as SettingsPage, icon: User, label: 'Profile', desc: 'Name, photo, about', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' },
    { id: 'privacy' as SettingsPage, icon: Shield, label: 'Privacy', desc: 'Last seen, read receipts', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { id: 'notifications' as SettingsPage, icon: Bell, label: 'Notifications', desc: 'Messages, calls, sounds', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
    { id: 'appearance' as SettingsPage, icon: Palette, label: 'Appearance', desc: 'Theme, font, colors', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
    { id: 'devices' as SettingsPage, icon: Smartphone, label: 'Devices', desc: 'Linked devices', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { id: 'blocked' as SettingsPage, icon: Ban, label: 'Blocked', desc: 'Manage blocked users', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
    { id: 'ai' as SettingsPage, icon: Sparkles, label: 'Hey AI', desc: 'Smart replies, AI summaries', color: 'bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 text-violet-600' },
  ];

  return (
    <div className="flex flex-col flex-1 h-full bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text font-display">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Profile card */}
        {user && (
          <motion.div
            whileHover={{ y: -1 }}
            onClick={() => setPage('profile')}
            className="bg-white dark:bg-dark-surface rounded-3xl p-4 shadow-card-light dark:shadow-card-dark cursor-pointer border border-transparent hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <Avatar user={user} size="lg" showMood glowing isOnline />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-light-text dark:text-dark-text">{user.name}</p>
                <p className="text-sm text-primary font-medium">{user.mood ? `${user.mood.emoji} ${user.mood.text}` : user.about}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">{user.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-light-muted dark:text-dark-muted" />
            </div>
          </motion.div>
        )}

        {/* Settings items */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-card-light dark:shadow-card-dark overflow-hidden">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {settingsItems.map((item, i) => (
              <motion.button
                key={item.id}
                variants={staggerItem}
                onClick={() => setPage(item.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors text-left',
                  i < settingsItems.length - 1 && 'border-b border-light-border dark:border-dark-border'
                )}
                whileHover={{ x: 2 }}
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-light-text dark:text-dark-text">{item.label}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-light-muted dark:text-dark-muted" />
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* App info */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl p-4 shadow-card-light dark:shadow-card-dark text-center space-y-1">
          <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <p className="font-semibold text-light-text dark:text-dark-text">Hey</p>
          <p className="text-xs text-light-muted dark:text-dark-muted">Version 1.0.0 · Made with ❤️</p>
        </div>

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </motion.button>
      </div>
    </div>
  );
}

// ======= Sub-pages =======
function SettingsSubPage({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="p-2 rounded-xl hover:bg-primary/10 text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </motion.button>
        <h2 className="font-bold text-light-text dark:text-dark-text">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </div>
  );
}

function ProfileSettings({ onBack }: { onBack: () => void }) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');

  return (
    <SettingsSubPage title="Profile" onBack={onBack}>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar user={user!} size="xl" showMood />
          <button className="text-sm text-primary font-medium hover:underline">Change photo</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1 block">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1 block">About</label>
            <textarea value={about} onChange={e => setAbout(e.target.value)} className="input-field resize-none" rows={3} />
          </div>
        </div>
        <button onClick={() => addToast({ type: 'success', title: 'Profile updated!' })}
          className="btn-primary w-full">Save changes</button>

        <div>
          <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wide">Mood Status</p>
          <div className="grid grid-cols-2 gap-2">
            {MOOD_OPTIONS.map(mood => (
              <motion.button key={mood.type + mood.text} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 p-3 bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border hover:border-primary/50 transition-colors text-left">
                <span>{mood.emoji}</span>
                <span className="text-sm text-light-text dark:text-dark-text">{mood.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSubPage>
  );
}

function PrivacySettings({ onBack }: { onBack: () => void }) {
  const [readReceipts, setReadReceipts] = useState(true);
  return (
    <SettingsSubPage title="Privacy" onBack={onBack}>
      <div className="space-y-4">
        {[
          { label: 'Last Seen', desc: 'Who can see your last seen', value: 'Everyone' },
          { label: 'Profile Photo', desc: 'Who can see your photo', value: 'Contacts' },
          { label: 'About', desc: 'Who can see your about', value: 'Everyone' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-2xl">
            <div>
              <p className="text-sm font-medium text-light-text dark:text-dark-text">{item.label}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">{item.desc}</p>
            </div>
            <span className="text-sm text-primary font-medium">{item.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-2xl">
          <div>
            <p className="text-sm font-medium text-light-text dark:text-dark-text">Read Receipts</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Show when you've read messages</p>
          </div>
          <motion.button
            onClick={() => setReadReceipts(!readReceipts)}
            animate={{ backgroundColor: readReceipts ? '#6C63FF' : '#E5E7EB' }}
            className="w-12 h-6 rounded-full relative"
          >
            <motion.div
              animate={{ x: readReceipts ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </motion.button>
        </div>
      </div>
    </SettingsSubPage>
  );
}

function NotificationSettings({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState({ messages: true, calls: true, mentions: true, sounds: true });
  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <SettingsSubPage title="Notifications" onBack={onBack}>
      <div className="space-y-2">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-2xl">
            <p className="text-sm font-medium text-light-text dark:text-dark-text capitalize">{key}</p>
            <motion.button
              onClick={() => toggle(key as keyof typeof settings)}
              animate={{ backgroundColor: value ? '#6C63FF' : '#E5E7EB' }}
              className="w-12 h-6 rounded-full relative"
            >
              <motion.div animate={{ x: value ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
            </motion.button>
          </div>
        ))}
      </div>
    </SettingsSubPage>
  );
}

function AppearanceSettings({ onBack, theme, setTheme, resolvedTheme }: {
  onBack: () => void;
  theme: string;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  resolvedTheme: string;
}) {
  const themeOptions = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Monitor, label: 'System' },
    { id: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  return (
    <SettingsSubPage title="Appearance" onBack={onBack}>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => (
              <motion.button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  theme === opt.id ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border'
                )}
              >
                <opt.icon className={cn('w-5 h-5', theme === opt.id ? 'text-primary' : 'text-light-muted dark:text-dark-muted')} />
                <span className={cn('text-xs font-medium', theme === opt.id ? 'text-primary' : 'text-light-muted dark:text-dark-muted')}>
                  {opt.label}
                </span>
                {theme === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3">Chat Themes</p>
          <div className="grid grid-cols-3 gap-3">
            {CHAT_THEMES.map(t => (
              <motion.button key={t.type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl shadow-sm" style={{ background: t.preview }} />
                <span className="text-xs text-light-muted dark:text-dark-muted">{t.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSubPage>
  );
}

function AISettings({ onBack }: { onBack: () => void }) {
  return (
    <SettingsSubPage title="Hey AI" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-gradient-brand rounded-3xl p-6 text-white relative overflow-hidden">
          <motion.div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
          <Sparkles className="w-8 h-8 mb-3 relative z-10" />
          <h3 className="text-xl font-bold font-display relative z-10">Hey AI</h3>
          <p className="text-white/70 text-sm mt-1 relative z-10">Your AI messaging assistant — coming soon ✨</p>
        </div>

        {[
          { icon: Zap, label: 'Smart Replies', desc: 'AI suggests relevant replies', badge: 'Soon' },
          { icon: Sparkles, label: 'AI Summaries', desc: 'Summarize long conversations', badge: 'Soon' },
          { icon: User, label: 'AI Stickers', desc: 'Generate custom stickers', badge: 'Soon' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 p-4 bg-white dark:bg-dark-surface rounded-2xl opacity-70">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">{item.label}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">{item.desc}</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{item.badge}</span>
          </div>
        ))}
      </div>
    </SettingsSubPage>
  );
}
