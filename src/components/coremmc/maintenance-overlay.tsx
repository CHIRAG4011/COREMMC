'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wrench, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useAppStore } from '@/store/use-app-store';

export function MaintenanceOverlay() {
  const { userProfile } = useAuth();
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState(false);

  const checkMaintenance = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/maintenance');
      if (!res.ok) {
        setChecked(true);
        return;
      }
      const data = await res.json();
      // STRICT boolean check — only true when explicitly enabled
      if (data.maintenanceMode === true) {
        setActive(true);
        setMessage(
          data.maintenanceMessage ||
          'We are currently performing maintenance. Please check back later.'
        );
      } else {
        // Explicitly clear when maintenance is OFF so auto-refresh works
        setActive(false);
      }
    } catch {
      // Network error — don't block the site
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    checkMaintenance();

    // Re-check every 30 seconds so admin changes take effect quickly
    const interval = setInterval(checkMaintenance, 30_000);
    return () => clearInterval(interval);
  }, [checkMaintenance]);

  const currentView = useAppStore((s) => s.currentView);

  // Admin/owner users bypass maintenance — use role from profile
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';
  // Never show maintenance overlay on ANY admin view
  const isAdminView = currentView.startsWith('admin');

  // Don't render ANYTHING until we've checked (prevents flash)
  // Don't render if maintenance is off
  // Don't render for admin users
  // Don't render on admin panel pages at all
  if (!checked || !active || isAdmin || isAdminView) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)' }}
    >
      {/* Subtle animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-500/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 max-w-[100vw] bg-orange-500/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-6">
        {/* Main card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Under Maintenance
          </h1>

          <p className="text-amber-400/70 text-sm font-medium mb-4 tracking-wide uppercase">
            We&rsquo;ll be back soon
          </p>

          {/* Message */}
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Retry button */}
          <button
            onClick={() => {
              setActive(false);
              checkMaintenance();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/80 hover:bg-white/[0.1] hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </button>

          {/* Estimated time info */}
          <div className="mt-6 flex items-center justify-center gap-2 text-white/25 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Auto-refreshes every 30 seconds</span>
          </div>
        </div>

        {/* Branding */}
        <p className="mt-8 text-center text-xs text-white/15 font-medium tracking-wider">
          CoreMMC
        </p>
      </div>
    </div>
  );
}