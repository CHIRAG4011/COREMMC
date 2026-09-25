'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: string;
  emailVerified: boolean;
  payment: boolean;
  isActive: boolean;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt: unknown;
  notificationPreferences: {
    email: boolean;
    service: boolean;
    marketing: boolean;
  };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  logout: () => Promise<void>;
  logoutFromDashboard: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  userProfile: null,
  logout: async () => {},
  logoutFromDashboard: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const res = await fetch(`/api/users/get?uid=${firebaseUser.uid}`);
          if (res.ok) {
            const { user: profile } = await res.json();
            setUserProfile(profile);

            // Log login activity (fire-and-forget)
            try {
              fetch('/api/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: firebaseUser.uid,
                  userName: profile.displayName || firebaseUser.displayName || '',
                  userEmail: firebaseUser.email || '',
                  action: 'login',
                  resource: 'auth',
                  details: 'User logged in',
                }),
              }).catch(() => {});
            } catch {}
          } else {
            // User doesn't exist in SQLite yet, create them
            await fetch('/api/users/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
              }),
            }).catch(() => {});
            // Try fetching again after creation
            const retry = await fetch(`/api/users/get?uid=${firebaseUser.uid}`);
            if (retry.ok) {
              const { user: profile } = await retry.json();
              setUserProfile(profile);
            }
          }
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Log logout activity (fire-and-forget)
      try {
        fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid || '',
            userName: userProfile?.displayName || user?.displayName || '',
            userEmail: user?.email || '',
            action: 'logout',
            resource: 'auth',
            details: 'User logged out',
          }),
        }).catch(() => {});
      } catch {}

      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
      navigate('home');
    } catch (err) {
      toast.error('Failed to log out. Please try again.');
    }
  }, [navigate, user, userProfile]);

  const logoutFromDashboard = useCallback(async () => {
    try {
      // Log logout activity (fire-and-forget)
      try {
        fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid || '',
            userName: userProfile?.displayName || user?.displayName || '',
            userEmail: user?.email || '',
            action: 'logout',
            resource: 'auth',
            details: 'User logged out from dashboard',
          }),
        }).catch(() => {});
      } catch {}

      // Always sign out from Firebase
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
      navigate('home');
    } catch (err) {
      toast.error('Failed to log out. Please try again.');
    }
  }, [navigate, user, userProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, logout, logoutFromDashboard }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}