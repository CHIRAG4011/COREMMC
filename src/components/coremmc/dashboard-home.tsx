'use client';

import { useEffect, useState } from 'react';
import {
  Server,
  IndianRupee,
  ShieldCheck,
  ShoppingBag,
  User,
  Headphones,
  Sparkles,
  LogIn,
  LogOut,
  ShoppingCart,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────
interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: unknown;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: unknown;
}

// ── Relative time helper ─────────────────────────────────────────────────
function relativeTime(date: unknown): string {
  if (!date) return '';
  let ts: number;
  if (typeof date === 'number') {
    ts = date;
  } else if (typeof date === 'string') {
    ts = new Date(date).getTime();
  } else if (typeof date === 'object' && date !== null && 'seconds' in date) {
    ts = (date as { seconds: number; nanoseconds?: number }).seconds * 1000;
  } else {
    return '';
  }

  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// ── Activity icon map ────────────────────────────────────────────────────
function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return LogIn;
  if (lower.includes('logout')) return LogOut;
  if (lower.includes('purchase') || lower.includes('payment')) return ShoppingCart;
  if (lower.includes('update') || lower.includes('edit')) return Edit;
  return Activity;
}

const Activity = Sparkles;

// ── Stat Card ────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className="glass p-5 flex items-center gap-4"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/50">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Dashboard Home ───────────────────────────────────────────────────────
export function DashboardHome() {
  const { user, userProfile } = useAuth();
  const navigate = useAppStore();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeServices, setActiveServices] = useState(0);

  const displayName = userProfile?.displayName || user?.displayName || 'User';
  const hasPayments = userProfile?.payment === true;

  // Fetch recent activity logs
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchActivity() {
      try {
        const res = await fetch(`/api/activity-logs/user?userId=${user.uid}&limit=5`);
        const data = await res.json();
        if (cancelled) return;
        setActivities(data.logs || []);
      } catch {
        // Silently handle
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    }

    fetchActivity();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch payments for stats
  useEffect(() => {
    if (!user || !hasPayments) return;
    let cancelled = false;

    async function fetchPayments() {
      try {
        const res = await fetch(`/api/payments?userId=${user.uid}`);
        const data = await res.json();
        if (cancelled) return;
        const payments = data.payments || [];
        setTotalSpent(payments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0));
        setActiveServices(payments.filter((p: Payment) => p.status === 'active').length);
      } catch {
        // Silently handle
      }
    }

    fetchPayments();
    return () => { cancelled = true; };
  }, [user, hasPayments]);

  // Quick actions
  const quickActions = [
    { label: 'Browse Services', icon: ShoppingBag, view: 'home' as const, color: '#6366f1' },
    { label: 'View Profile', icon: User, view: 'dashboard-profile' as const, color: '#10b981' },
    { label: 'Contact Support', icon: Headphones, view: 'contact' as const, color: '#f59e0b' },
    { label: 'View Plans', icon: Server, view: 'home' as const, color: '#06b6d4' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome Banner ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome back, <span className="gradient-text">{displayName}</span>!
        </h1>
        <p className="text-white/50 mt-1 text-sm md:text-base">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </motion.div>

      {/* ── No Payments Banner ──────────────────────────────────────── */}
      {!hasPayments && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 md:p-6"
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Get Started with CoreMMC
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Buy your favourite service and experience premium gaming hosting.
              </p>
            </div>
            <Button
              onClick={() => navigate('home')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0"
            >
              Browse Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {/* Decorative gradient */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        </motion.div>
      )}

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Server}
          label="Active Services"
          value={activeServices}
          color="#6366f1"
          delay={0.05}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          color="#10b981"
          delay={0.1}
        />
        <StatCard
          icon={ShieldCheck}
          label="Account Status"
          value='Active'
          color="#10b981"
          delay={0.15}
        />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                onClick={() => navigate(action.view)}
                className="glass glass-hover flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-medium text-white/80">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Activity</h2>
        {activityLoading ? (
          <div className="glass p-6 flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/5" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="glass p-10 flex flex-col items-center justify-center text-center">
            <Activity className="h-10 w-10 text-white/15 mb-3" />
            <p className="text-white/50 text-sm">No recent activity</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass divide-y divide-white/[0.06] overflow-hidden"
          >
            {activities.map((log, i) => {
              const Icon = getActivityIcon(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-4 w-4 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">
                      {log.description || log.action}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {relativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;