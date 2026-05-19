'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/buttons/Button';
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { fadeInUp } from '@/animations/fade';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone, countryCode, verifyOtp, sendOtp, isLoading } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(false);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const full = newOtp.join('');
      if (full.length === OTP_LENGTH) {
        handleVerify(full);
      }
    }
  }, [otp]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...paste.split(''), ...Array(OTP_LENGTH - paste.length).fill('')];
    setOtp(newOtp);
    const nextEmpty = paste.length < OTP_LENGTH ? paste.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
    if (paste.length === OTP_LENGTH) handleVerify(paste);
  };

  const handleVerify = async (code?: string) => {
    const full = code || otp.join('');
    if (full.length !== OTP_LENGTH) return;
    const ok = await verifyOtp(full);
    if (ok) {
      setSuccess(true);
      setTimeout(() => router.replace(ROUTES.CHATS), 1200);
    } else {
      setError(true);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError(false);
    await sendOtp();
    inputRefs.current[0]?.focus();
  };

  const allFilled = otp.every(Boolean);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-brand px-6 pt-16 pb-20 relative overflow-hidden">
        <motion.div
          className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <button
          onClick={() => router.back()}
          className="relative z-10 flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-display">Verify number</h1>
          <p className="text-white/70 mt-1">
            We sent a code to <span className="text-white font-medium">{countryCode} {phone}</span>
          </p>
        </div>
      </div>

      {/* Card */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mx-4 -mt-8 bg-white dark:bg-dark-surface rounded-4xl shadow-premium p-6 z-10"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 20px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
                transition={{ duration: 1, repeat: 2 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Verified! 🎉</h2>
                <p className="text-light-muted dark:text-dark-muted text-sm mt-1">Taking you in...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-6">
              <div>
                <p className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
                  Enter the 6-digit code
                </p>

                {/* OTP boxes */}
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      animate={error ? {
                        x: [-5, 5, -5, 5, 0],
                        borderColor: ['#EF4444', '#EF4444', '#EF4444', '#EF4444', '#E5E7EB'],
                      } : {}}
                      transition={{ duration: 0.3 }}
                      className={`otp-box ${error ? 'border-red-500' : otp[i] ? 'border-primary bg-primary/5' : ''}`}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs text-center mt-3"
                    >
                      Invalid code. Please try again. (Hint: use any 6 digits)
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={() => handleVerify()}
                loading={isLoading}
                size="lg"
                className="w-full"
                disabled={!allFilled || isLoading}
              >
                Verify & Continue
              </Button>

              {/* Resend */}
              <div className="text-center">
                {canResend ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleResend}
                    className="flex items-center gap-2 mx-auto text-primary text-sm font-medium hover:underline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend code
                  </motion.button>
                ) : (
                  <p className="text-sm text-light-muted dark:text-dark-muted">
                    Resend in <span className="text-primary font-bold tabular-nums">{timer}s</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Security note */}
      <p className="text-xs text-center text-light-muted dark:text-dark-muted mt-6 px-8">
        🔒 Your code expires in 5 minutes. Never share it with anyone.
      </p>
    </div>
  );
}
