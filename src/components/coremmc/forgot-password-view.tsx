'use client';

import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordView() {
  const navigate = useAppStore((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim(), {
        url: typeof window !== 'undefined' ? window.location.origin : 'https://coremmc.cloud',
      });
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      if (message.includes('user-not-found')) {
        setError('No account found with this email');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setError('Failed to send reset email. Please check your email address or contact support on Discord.');
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="glass p-6 md:p-8">
          {/* Back link */}
          <button
            onClick={() => navigate('login')}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>

          {!sent ? (
            <>
              {/* Heading */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
                  <Mail className="h-7 w-7 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
                <p className="text-sm text-white/50">
                  Enter your email and we&apos;ll send you a reset link
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Check your spam/junk folder if you don&apos;t see the email
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm text-white/70">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg"
                    disabled={loading}
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-sm text-white/50 mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="text-white/70 font-medium">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <Button
                onClick={() => navigate('login')}
                variant="outline"
                className="h-10 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-lg"
              >
                Back to Sign In
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}