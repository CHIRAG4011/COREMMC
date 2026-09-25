'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sendEmailVerification, reload, type ActionCodeSettings } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { motion } from 'framer-motion';
import { Mail, Loader2, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOLDOWN_SECONDS = 60;
const POLL_INTERVAL_MS = 3000;

export default function VerifyEmailView() {
  const navigate = useAppStore((s) => s.navigate);
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentUser = auth.currentUser;
  const email = currentUser?.email ?? 'your email';

  // Start cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Poll for email verification every 3 seconds
  useEffect(() => {
    if (verified) return;

    pollRef.current = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await reload(auth.currentUser);
          if (auth.currentUser.emailVerified) {
            setVerified(true);
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            // Auto-redirect after a brief moment
            setTimeout(() => {
              navigate('dashboard-profile');
            }, 1500);
          }
        }
      } catch {
        // Silently continue polling
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [verified, navigate]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || !currentUser) return;
    setError('');
    try {
      setResendLoading(true);
      const actionCodeSettings: ActionCodeSettings = {
        url: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://coremmc-hosting-v1.web.app/',
        handleCodeInApp: true,
      };
      await sendEmailVerification(currentUser, actionCodeSettings);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend email';
      if (message.includes('too-many-requests')) {
        setError('Please wait a moment before requesting another email.');
      } else {
        setError('Failed to resend verification email.');
      }
    } finally {
      setResendLoading(false);
    }
  }, [currentUser, cooldown]);

  const handleVerified = useCallback(async () => {
    setError('');
    try {
      setCheckLoading(true);
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          navigate('dashboard-profile');
        } else {
          setError('Email not verified yet. Please check your inbox.');
        }
      }
    } catch {
      setError('Failed to verify. Please try again.');
    } finally {
      setCheckLoading(false);
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 grid-pattern" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-6 md:p-8 text-center">
          {/* Animated Mail Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            className="mx-auto mb-6"
          >
            {verified ? (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
            ) : (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10"
              >
                <Mail className="h-10 w-10 text-indigo-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {verified ? 'Email Verified!' : 'Verify Your Email'}
          </h1>
          <p className="text-sm text-white/50 mb-8 max-w-xs mx-auto">
            {verified
              ? 'Redirecting you to the dashboard...'
              : `We've sent a verification email to ${email}. Please check your inbox.`}
          </p>

          {!verified && (
            <>
              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mb-4"
                >
                  {error}
                </motion.p>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend in {cooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleVerified}
                  disabled={checkLoading}
                  variant="outline"
                  className="w-full h-10 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  {checkLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "I've Verified My Email"
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Back link */}
          <button
            onClick={() => navigate('login')}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}