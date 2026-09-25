'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function LoginView() {
  const navigate = useAppStore((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      navigate('dashboard-profile');
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
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/coremmc-icon.png"
                alt="CoreMMC"
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-white/50">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm text-white/70">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pr-10"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  disabled={loading}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm text-white/50 cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => navigate('forgot-password')}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </button>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-white/50">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}