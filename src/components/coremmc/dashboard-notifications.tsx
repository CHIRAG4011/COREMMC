'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, Bell, RefreshCw, Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useAppStore } from '@/store/use-app-store';
import { useAuth } from '@/components/coremmc/auth-provider';

const TYPES = [
  { value: 'info', icon: Info, color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', dotColor: 'bg-blue-400' },
  { value: 'success', icon: CheckCircle, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dotColor: 'bg-emerald-400' },
  { value: 'warning', icon: AlertTriangle, color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', dotColor: 'bg-amber-400' },
  { value: 'error', icon: XCircle, color: 'bg-red-500/15 text-red-400 border-red-500/25', dotColor: 'bg-red-400' },
] as const;

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: string;
  read?: boolean;
  createdAt: number;
}

function getTypeConfig(type: string) {
  return TYPES.find((t) => t.value === type) || TYPES[0];
}

function formatTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UserNotifications() {
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const suppressBadge = useAppStore((s) => s.suppressBadge);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markedReadIds, setMarkedReadIds] = useState<Set<string>>(new Set());

  // ── Fetch notifications via API ──────────────────────────────────
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/user?userId=${user.uid}&limit=20&offset=0`);
      const data = await res.json();
      const serverNotifs: Notification[] = (data.notifications || []).map((n: Notification) => ({
        ...n,
        read: n.read || markedReadIds.has(n.id),
      }));
      setNotifications(serverNotifs);
    } catch {
      // silent
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [user, markedReadIds]);

  // Initial load + polling every 15 seconds
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    pollRef.current = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const handleMarkAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      setMarkedReadIds((prev) => new Set(prev).add(notifId));
      await fetch('/api/notifications/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, notificationId: notifId }),
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      // Sync unread count to navbar
      const updatedUnread = notifications.filter((n) => !n.read && n.id !== notifId).length;
      setUnreadCount(updatedUnread);
      if (updatedUnread === 0) suppressBadge();
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setMarkingAllRead(true);
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) {
        toast.info('All notifications are already read');
        setMarkingAllRead(false);
        return;
      }

      await fetch('/api/notifications/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      }).catch(() => {});

      const newMarked = new Set(markedReadIds);
      unreadIds.forEach((id) => newMarked.add(id));
      setMarkedReadIds(newMarked);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      suppressBadge();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Notifications</h1>
          <p className="text-white/50 mt-0.5 sm:mt-1 text-sm md:text-base">
            Stay updated with the latest from CoreMMC
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 gap-2"
            >
              {markingAllRead ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-white/15" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No notifications</h2>
          <p className="text-sm text-white/50 max-w-sm">
            You&apos;re all caught up! We&apos;ll notify you about updates, maintenance, and more.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1">
          {notifications.map((n, i) => {
            const cfg = getTypeConfig(n.type);
            const Icon = cfg.icon;
            const isRead = n.read || markedReadIds.has(n.id);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isRead ? 0.6 : 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-colors ${
                  isRead
                    ? 'bg-white/[0.01] border-white/[0.03]'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className={`text-xs sm:text-sm font-semibold text-white truncate ${isRead ? 'opacity-70' : ''}`}>{n.title}</p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0 rounded-full capitalize shrink-0 ${cfg.color}`}
                    >
                      {n.type}
                    </Badge>
                  </div>
                  {n.message && (
                    <p className={`text-xs sm:text-sm text-white/60 leading-relaxed ${isRead ? 'opacity-50' : ''}`}>{n.message}</p>
                  )}
                  <p className="text-[10px] sm:text-xs text-white/50 mt-1 sm:mt-1.5">{formatTime(n.createdAt)}</p>
                </div>
                {!isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}