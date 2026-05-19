'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import ToastContainer from '@/components/ui/toasts/ToastContainer';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { initTheme, theme } = useThemeStore();

  // Initialize theme on mount — client only, no hydration mismatch
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Keep in sync with system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => initTheme();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, initTheme]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

