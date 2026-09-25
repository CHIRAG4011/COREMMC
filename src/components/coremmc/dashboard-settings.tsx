'use client';

import { useState } from 'react';
import {
  Shield,
  Trash2,
  Loader2,
  KeyRound,
  MonitorSmartphone,
  ExternalLink,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/coremmc/auth-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'sonner';

// ── Dashboard Settings ───────────────────────────────────────────────────
export function DashboardSettings() {
  const { user, userProfile } = useAuth();

  // Password reset
  const [sendingReset, setSendingReset] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email, {
        url: typeof window !== 'undefined' ? window.location.origin : 'https://coremmc.cloud',
      });
      toast.success('Password reset email sent! Check your inbox (and spam folder).');
    } catch {
      toast.error('Failed to send reset email. Please try again or contact support on Discord.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* ── Security ───────────────────────────────────────────────── */}
      <div className="glass p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 shrink-0">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">Security</h2>
            <p className="text-xs text-white/50">Manage your account security</p>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Change Password */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-white/40 shrink-0" />
            <div>
              <span className="text-sm font-medium text-white/90">Change Password</span>
              <p className="text-xs text-white/50">We&apos;ll send a password reset link to your email</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={sendingReset}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 shrink-0 h-9"
          >
            {sendingReset ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Sessions info */}
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="h-4 w-4 text-white/40 shrink-0" />
          <div>
            <span className="text-sm font-medium text-white/90">Active Sessions</span>
            <p className="text-xs text-white/50">
              Your session is managed securely. For security, log out when using shared devices.
            </p>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Delete Account */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Trash2 className="h-4 w-4 text-red-400/60 shrink-0" />
            <div>
              <span className="text-sm font-medium text-white/90">Delete Account</span>
              <p className="text-xs text-white/50">Permanently delete your account and all data</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-red-500/25 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#12121a] border-white/[0.08]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  This action cannot be undone. All your data, services, and activity will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/[0.06] p-4 my-2">
                <ExternalLink className="h-4 w-4 text-indigo-400 shrink-0" />
                <p className="text-sm text-white/70">
                  To delete your account, please contact us on Discord.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    toast.info('Please contact us on Discord to delete your account.');
                  }}
                >
                  Contact Support
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardSettings;