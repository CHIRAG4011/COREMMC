'use client';

import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';

export function useLiveNotifications() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const suppressBadgeUntil = useAppStore((s) => s.suppressBadgeUntil);
  const viewingAsUser = useAppStore((s) => s.viewingAsUser);

  const pollUnread = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications/user?userId=${userId}&unreadOnly=true`);
      if (res.ok) {
        const { unreadCount } = await res.json();
        if (Date.now() > suppressBadgeUntil) {
          setUnreadCount(unreadCount || 0);
        }
      }
    } catch {
      // Silent fail
    }
  }, [setUnreadCount, suppressBadgeUntil]);

  useEffect(() => {
    if (viewingAsUser) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // Poll immediately
        pollUnread(user.uid);
        // Then every 15 seconds
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => pollUnread(user.uid), 15000);
      } else {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setUnreadCount(0);
      }
    });

    return () => {
      unsubscribe();
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [viewingAsUser, pollUnread, setUnreadCount]);
}