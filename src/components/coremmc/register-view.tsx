'use client';

import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function RegisterView() {
  const navigate = useAppStore((s) => s.navigate);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    try {
      setLoading(true);

      await setPersistence(auth, browserLocalPersistence);

      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });

      // Create user in database
      await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: credential.user.uid,
          email: credential.user.email || '',
          displayName: displayName.trim(),
          photoURL: null,
        }),
      });

      // Log registration activity (fire-and-forget)
      try {
        fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: credential.user.uid,
            userName: displayName.trim(),
            userEmail: credential.user.email || '',
            action: 'register',
            resource: 'auth',
            details: 'New account registered',
          }),
        }).catch(() => {});
      } catch {}

      navigate('dashboard-profile');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (message.includes('weak-password')) {
        setError('Password is too weak. Use at least 8 characters with a mix of letters and numbers.');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Registration failed. Please try again.');
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
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-sm text-white/50">Join CoreMMC and start hosting</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-sm text-white/70">
                Display Name
              </Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm text-white/70">
                Email
              </Label>
              <Input
                id="reg-email"
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
              <Label htmlFor="reg-password" className="text-sm text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-confirm" className="text-sm text-white/70">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agree-terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 mt-0.5"
                disabled={loading}
              />
              <Label
                htmlFor="agree-terms"
                className="text-sm text-white/50 cursor-pointer select-none leading-snug"
              >
                I agree to the{' '}
                <span className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Terms of Service
                </span>
              </Label>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In link */}
          <div className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}