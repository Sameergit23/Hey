'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { COUNTRIES } from '@/constants/mockData';
import Button from '@/components/ui/buttons/Button';
import { ArrowLeft, User, ChevronDown } from 'lucide-react';
import { fadeInUp } from '@/animations/fade';
import { AnimatePresence } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryFlag, setCountryFlag] = useState('🇮🇳');
  const [showCountry, setShowCountry] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)
  );

  const handleSignup = async () => {
    if (!name.trim() || !phone.trim()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    router.push(ROUTES.OTP);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative overflow-hidden">
      <div className="bg-gradient-brand px-6 pt-16 pb-20 relative overflow-hidden">
        <motion.div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
        <button onClick={() => router.back()}
          className="relative z-10 flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">Create account</h1>
          <p className="text-white/70 mt-1">Join millions on Hey ✨</p>
        </div>
      </div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="mx-4 -mt-8 bg-white dark:bg-dark-surface rounded-4xl shadow-premium p-6 z-10 space-y-4">

        <div>
          <label className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-1.5 block">Your name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
            <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)}
              className="input-field pl-10 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide mb-1.5 block">Phone number</label>
          <div className="flex gap-2">
            <div className="relative">
              <motion.button onClick={() => setShowCountry(!showCountry)}
                className="flex items-center gap-1.5 px-3 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl font-medium text-light-text dark:text-dark-text whitespace-nowrap"
                whileTap={{ scale: 0.97 }}>
                <span className="text-xl">{countryFlag}</span>
                <span className="text-sm">{countryCode}</span>
                <ChevronDown className={`w-4 h-4 text-light-muted dark:text-dark-muted transition-transform ${showCountry ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {showCountry && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-light-border dark:border-dark-border z-50 overflow-hidden">
                    <div className="p-2 border-b border-light-border dark:border-dark-border">
                      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                        className="input-field text-sm py-2" autoFocus />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filtered.map(c => (
                        <button key={c.code} onClick={() => { setCountryCode(c.dialCode); setCountryFlag(c.flag); setShowCountry(false); setSearch(''); }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-primary/5 text-left text-sm text-light-text dark:text-dark-text">
                          <span>{c.flag}</span><span className="flex-1">{c.name}</span><span className="text-light-muted dark:text-dark-muted">{c.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
              className="input-field flex-1 text-sm" />
          </div>
        </div>

        <Button onClick={handleSignup} loading={isLoading} size="lg" className="w-full" disabled={!name.trim() || !phone.trim()}>
          Create account & get OTP
        </Button>

        <p className="text-xs text-center text-light-muted dark:text-dark-muted">
          Already have an account?{' '}
          <button onClick={() => router.push(ROUTES.LOGIN)} className="text-primary font-medium hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
}
