'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { COUNTRIES } from '@/constants/mockData';
import Button from '@/components/ui/buttons/Button';
import { ChevronDown, Phone, ArrowRight } from 'lucide-react';
import { fadeInUp } from '@/animations/fade';
import { AnimatePresence } from 'framer-motion';

export default function LoginScreen() {
  const { phone, countryCode, countryFlag, setPhone, setCountry, sendOtp, isLoading } = useAuthStore();
  const [showCountry, setShowCountry] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)
  );

  const handleSend = async () => {
    if (!phone.trim()) return;
    await sendOtp();
    router.push(ROUTES.OTP);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative overflow-hidden">
      {/* Brand header */}
      <div className="bg-gradient-brand px-6 pt-16 pb-20 relative overflow-hidden">
        <motion.div
          className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-8 bottom-0 w-40 h-40 bg-white/5 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-display">Welcome back</h1>
          <p className="text-white/70 mt-1">Sign in with your mobile number</p>
        </div>
      </div>

      {/* Form card */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mx-4 -mt-8 bg-white dark:bg-dark-surface rounded-4xl shadow-premium p-6 z-10"
      >
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-6">Enter your number</h2>

        <div className="flex gap-2 mb-4">
          {/* Country code picker */}
          <div className="relative">
            <motion.button
              onClick={() => setShowCountry(!showCountry)}
              className="flex items-center gap-1.5 px-3 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl font-medium text-light-text dark:text-dark-text hover:border-primary/50 transition-colors whitespace-nowrap"
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl">{countryFlag}</span>
              <span className="text-sm">{countryCode}</span>
              <ChevronDown className={`w-4 h-4 text-light-muted dark:text-dark-muted transition-transform ${showCountry ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showCountry && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-light-border dark:border-dark-border z-50 overflow-hidden"
                >
                  <div className="p-2 border-b border-light-border dark:border-dark-border">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-field text-sm py-2"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filtered.map((country) => (
                      <motion.button
                        key={country.code}
                        onClick={() => { setCountry(country.dialCode, country.flag); setShowCountry(false); setSearch(''); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-primary/5 transition-colors text-left"
                        whileHover={{ x: 2 }}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-sm text-light-text dark:text-dark-text flex-1">{country.name}</span>
                        <span className="text-sm text-light-muted dark:text-dark-muted">{country.dialCode}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phone input */}
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field pl-10 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
        </div>

        <p className="text-xs text-light-muted dark:text-dark-muted mb-5 leading-relaxed">
          We'll send you a verification code. Message and data rates may apply.
        </p>

        <Button
          onClick={handleSend}
          loading={isLoading}
          size="lg"
          className="w-full"
          disabled={!phone.trim()}
        >
          Send OTP <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
          <span className="text-xs text-light-muted dark:text-dark-muted">or</span>
          <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
        </div>

        <button
          onClick={() => router.push(ROUTES.SIGNUP)}
          className="w-full text-center text-sm text-primary hover:underline font-medium"
        >
          New to Hey? Create an account
        </button>
      </motion.div>

      {/* Terms */}
      <p className="text-xs text-center text-light-muted dark:text-dark-muted mt-6 px-8">
        By continuing, you agree to our <span className="text-primary">Terms</span> and <span className="text-primary">Privacy Policy</span>
      </p>
    </div>
  );
}
