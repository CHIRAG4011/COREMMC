import { create } from 'zustand';
import { viewTypeToUrl } from '@/lib/routing';

export type ViewType =
  | 'home'
  | 'category'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
  | 'dashboard-profile'
  | 'dashboard-settings'
  | 'dashboard-orders'
  | 'dashboard-notifications'
  | 'admin'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-categories'
  | 'admin-products'
  | 'admin-payments'
  | 'admin-announcements'
  | 'admin-offers'
  | 'admin-settings'
  | 'admin-activity'
  | 'admin-orders'
  | 'admin-notifications'
  | 'status'
  | 'contact'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'refund'
  | '404';

interface AppState {
  currentView: ViewType;
  categorySlug: string | null;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  authToast: boolean;
  unreadCount: number;
  /** Timestamp until which the navbar badge should be suppressed (avoids race with server polling) */
  suppressBadgeUntil: number;
  /** When true, admin sees the user panel as an unauthenticated visitor */
  viewingAsUser: boolean;
  setViewingAsUser: (v: boolean) => void;
  setUnreadCount: (count: number) => void;
  suppressBadge: (durationMs?: number) => void;
  paymentView: {
    amount: number;
    orderId: string;
    items: Array<{ name: string; price: number; quantity: number; categoryName: string }>;
    cartItems?: Array<{
      planId: string;
      name: string;
      categoryName: string;
      categoryId: string;
      price: number;
      originalPrice: number | null;
      currency: string;
      quantity: number;
      selectedDuration: string;
    }>;
    discountCode?: string | null;
    discountAmount?: number;
  } | null;
  navigate: (view: ViewType, categorySlug?: string) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  showAuthToast: () => void;
  showPaymentView: (data: { amount: number; orderId: string; items: Array<{ name: string; price: number; quantity: number; categoryName: string }>; cartItems?: Array<{ planId: string; name: string; categoryName: string; categoryId: string; price: number; originalPrice: number | null; currency: string; quantity: number; selectedDuration: string }>; discountCode?: string | null; discountAmount?: number }) => void;
  closePaymentView: () => void;
}

export const ADMIN_HASH_MAP: Record<string, ViewType> = {
  '#/admin': 'admin',
  '#/admin-users': 'admin-users',
  '#/admin-roles': 'admin-roles',
  '#/admin-categories': 'admin-categories',
  '#/admin-products': 'admin-products',
  '#/admin-payments': 'admin-payments',
  '#/admin-announcements': 'admin-announcements',
  '#/admin-offers': 'admin-offers',
  '#/admin-settings': 'admin-settings',
  '#/admin-activity': 'admin-activity',
  '#/admin-orders': 'admin-orders',
  '#/admin-notifications': 'admin-notifications',
};

const ADMIN_VIEW_TO_HASH: Record<string, string> = Object.fromEntries(
  Object.entries(ADMIN_HASH_MAP).map(([hash, view]) => [view, hash])
);

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'home',
  categorySlug: null,
  searchOpen: false,
  mobileMenuOpen: false,
  authToast: false,
  unreadCount: 0,
  suppressBadgeUntil: 0,
  viewingAsUser: false,
  paymentView: null,
  navigate: (view, categorySlug) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Sync hash for admin views
    if (ADMIN_VIEW_TO_HASH[view]) {
      window.location.hash = ADMIN_VIEW_TO_HASH[view];
      // When navigating TO admin, stop viewing-as-user
      set({ viewingAsUser: false });
    } else if (window.location.hash && window.location.hash in ADMIN_HASH_MAP) {
      window.location.hash = '';
    }
    // Push browser URL (non-admin views)
    if (!ADMIN_VIEW_TO_HASH[view]) {
      const url = viewTypeToUrl(view, categorySlug);
      window.history.pushState({ view, categorySlug }, '', url);
    }
    set({ currentView: view, categorySlug: categorySlug || null, mobileMenuOpen: false });
  },
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  showAuthToast: () => {
    set({ authToast: true });
    setTimeout(() => set({ authToast: false }), 3000);
  },
  showPaymentView: (data) => set({ paymentView: data }),
  closePaymentView: () => set({ paymentView: null }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  suppressBadge: (durationMs = 15000) => set({ suppressBadgeUntil: Date.now() + durationMs }),
  setViewingAsUser: (v) => set({ viewingAsUser: v }),
}));