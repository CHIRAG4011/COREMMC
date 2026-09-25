'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ── Get initials ─────────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Format date ──────────────────────────────────────────────────────────
function formatDate(date: unknown): string {
  if (!date) return '—';
  let ts: number;
  if (typeof date === 'number') {
    ts = date;
  } else if (typeof date === 'string') {
    ts = new Date(date).getTime();
  } else if (typeof date === 'object' && date !== null && 'seconds' in date) {
    ts = (date as { seconds: number }).seconds * 1000;
  } else {
    return '—';
  }
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Role badge color ─────────────────────────────────────────────────────
function getRoleStyle(role: string) {
  switch (role?.toLowerCase()) {
    case 'owner':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    case 'admin':
      return 'bg-red-500/15 text-red-400 border-red-500/25';
    default:
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25';
  }
}

// ── Dashboard Profile ────────────────────────────────────────────────────
export function DashboardProfile() {
  const { user, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const email = userProfile?.email || user?.email || '';
  const initials = getInitials(displayName || 'U');
  const role = userProfile?.role || 'User';
  const memberSince = userProfile?.createdAt;

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, displayName: displayName.trim() }),
      });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="glass p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
        {/* Avatar section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xl sm:text-2xl font-bold">
            {initials}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white truncate">{displayName || 'User'}</h2>
            <p className="text-sm text-white/50 truncate">{email}</p>
            <Badge className={`w-fit mt-1 ${getRoleStyle(role)}`}>
              {role}
            </Badge>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70" htmlFor="display-name">
              Display Name
            </label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11 focus-visible:ring-[#6366f1]/50 focus-visible:border-[#6366f1]/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-white/[0.03] border-white/[0.06] text-white/50 h-11 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70" htmlFor="member-since">
              Member Since
            </label>
            <Input
              id="member-since"
              value={formatDate(memberSince)}
              disabled
              className="bg-white/[0.03] border-white/[0.06] text-white/50 h-11 cursor-not-allowed"
            />
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Save button */}
        <div className="flex justify-end sm:justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || displayName === (userProfile?.displayName || user?.displayName || '')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardProfile;