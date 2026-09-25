'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function AdminLoginView() {
  const navigate = useAppStore((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);

      // Always persist admin sessions
      await setPersistence(auth, browserLocalPersistence);

      await signInWithEmailAndPassword(auth, email.trim(), password);

      // Auth state change in auth-provider will update userProfile,
      // and AdminLayout will re-render to show the admin panel.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Invalid email or password');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else if (message.includes('user-not-found')) {
        setError('No account found with this email');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-6 md:p-8">
          {/* Shield icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <ShieldCheck className="h-8 w-8 text-amber-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
            <p className="text-sm text-white/50">
              Sign in with your admin credentials
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm text-white/70">
                Admin Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@coremmc.cloud"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-sm text-white/70">
                  Password
                </Label>
                <div className="flex items-center gap-1.5 text-white/50">
                  <Lock className="h-3 w-3" />
                  <span className="text-[11px]">Secure</span>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-all hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
          </div>

          {/* Back to site */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('home')}
            className="w-full h-10 text-white/50 hover:text-white/70 hover:bg-white/5 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Site
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          CoreMMC Admin Portal &mdash; Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}

export default AdminLoginView;