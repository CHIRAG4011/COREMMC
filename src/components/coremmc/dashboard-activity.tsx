'use client';

import { useEffect, useState, useCallback } from 'react';
import { LogIn,
  LogOut,
  ShoppingCart,
  Edit,
  Activity,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
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

// ── Relative time helper ─────────────────────────────────────────────────
function relativeTime(date: unknown): string {
  if (!date) return '';
  let ts: number;
  if (typeof date === 'number') {
    ts = date;
  } else if (typeof date === 'string') {
    ts = new Date(date).getTime();
  } else if (typeof date === 'object' && date !== null && 'seconds' in date) {
    ts = (date as { seconds: number }).seconds * 1000;
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

function getActivityIconColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return '#10b981';
  if (lower.includes('logout')) return '#f59e0b';
  if (lower.includes('purchase') || lower.includes('payment')) return '#6366f1';
  if (lower.includes('update') || lower.includes('edit')) return '#06b6d4';
  return '#64748b';
}

const PAGE_SIZE = 20;

// ── Dashboard Activity ───────────────────────────────────────────────────
export function DashboardActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch activity logs
  const fetchActivities = useCallback(
    async (append: boolean) => {
      if (!user) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = append ? activities.length : 0;
        const res = await fetch(`/api/activity-logs/user?userId=${user.uid}&limit=${PAGE_SIZE}&offset=${offset}`);
        const data = await res.json();
        const newLogs: ActivityLog[] = data.logs || [];

        if (append) {
          setActivities((prev) => {
            // Avoid duplicates
            const existingIds = new Set(prev.map((a) => a.id));
            const items = newLogs.filter((a) => !existingIds.has(a.id));
            return [...prev, ...items];
          });
        } else {
          setActivities(newLogs);
        }

        setHasMore(newLogs.length === PAGE_SIZE);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, activities.length]
  );

  // Initial fetch
  useEffect(() => {
    fetchActivities(false);
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/[0.06]" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <Skeleton className="absolute -left-8 top-0.5 h-7 w-7 rounded-full bg-white/5 z-10" />
                <div className="flex-1 glass p-4 ml-2 space-y-2">
                  <Skeleton className="h-4 w-40 bg-white/5" />
                  <Skeleton className="h-3 w-28 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <span className="text-sm text-white/50">{activities.length} event{activities.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Empty state */}
      {activities.length === 0 ? (
        <div className="glass p-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
            <Activity className="h-8 w-8 text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No Activity Yet</h2>
          <p className="text-sm text-white/50 max-w-sm">
            Your activity log will appear here once you start using your account.
          </p>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="relative pl-8 md:pl-10">
            {/* Timeline line */}
            <div className="absolute left-3 md:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.06] to-transparent" />

            <div className="flex flex-col gap-3">
              {activities.map((log, i) => {
                const Icon = getActivityIcon(log.action);
                const color = getActivityIconColor(log.action);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.5) }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-8 md:-left-10 top-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 z-10"
                      style={{
                        borderColor: `${color}40`,
                        backgroundColor: '#0a0a0f',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>

                    {/* Content card */}
                    <div className="flex-1 glass p-4 ml-1">
                      <p className="text-sm font-semibold text-white/90">
                        {log.action}
                      </p>
                      {log.description && (
                        <p className="text-xs text-white/50 mt-0.5">
                          {log.description}
                        </p>
                      )}
                      <p className="text-[11px] text-white/50 mt-1.5">
                        {relativeTime(log.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchActivities(true)}
                disabled={loadingMore}
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 min-w-[160px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default DashboardActivity;