/**
 * URL ↔ ViewType bidirectional mapping.
 *
 * Since the entire app lives on a single Next.js route (/),
 * we use the History API to keep the browser URL in sync
 * with the Zustand ViewType state.
 *
 * URL structure:
 *   /                          → home
 *   /contact                   → contact
 *   /terms                     → terms
 *   /privacy                   → privacy
 *   /refund                    → refund
 *   /login                     → login
 *   /register                  → register
 *   /forgot-password           → forgot-password
 *   /verify-email              → verify-email
 *   /minecraft-intel           → category  (slug)
 *   /domain-hosting            → category  (slug)
 *   /dashboard                 → dashboard-profile
 *   /dashboard/settings        → dashboard-settings
 *   /dashboard/orders          → dashboard-orders
 *   /dashboard/notifications   → dashboard-notifications
 *   /admin                     → admin
 *   /admin/users               → admin-users
 *   /admin/roles               → admin-roles
 *   /admin/categories          → admin-categories
 *   /admin/products            → admin-products
 *   /admin/payments            → admin-payments
 *   /admin/announcements       → admin-announcements
 *   /admin/offers              → admin-offers
 *   /admin/settings            → admin-settings
 *   /admin/activity            → admin-activity
 *   /admin/orders              → admin-orders
 *   /admin/notifications       → admin-notifications
 */

import type { ViewType } from '@/store/use-app-store';

// ── Static page routes (no params) ─────────────────────────────────────────

const STATIC_ROUTES: Record<string, ViewType> = {
  '': 'home',
  '/': 'home',
  '/status': 'status',
  '/contact': 'contact',
  '/about': 'about',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/refund': 'refund',
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot-password',
  '/verify-email': 'verify-email',
};

// ── Dashboard routes ───────────────────────────────────────────────────────

const DASHBOARD_ROUTES: Record<string, ViewType> = {
  dashboard: 'dashboard-profile',
  settings: 'dashboard-settings',
  orders: 'dashboard-orders',
  notifications: 'dashboard-notifications',
};

// ── Admin routes ────────────────────────────────────────────────────────────

const ADMIN_ROUTES: Record<string, ViewType> = {
  admin: 'admin',
  users: 'admin-users',
  roles: 'admin-roles',
  categories: 'admin-categories',
  products: 'admin-products',
  payments: 'admin-payments',
  announcements: 'admin-announcements',
  offers: 'admin-offers',
  settings: 'admin-settings',
  activity: 'admin-activity',
  orders: 'admin-orders',
  notifications: 'admin-notifications',
};

/**
 * Build a URL path for a given ViewType + optional categorySlug.
 */
export function viewTypeToUrl(view: ViewType, categorySlug?: string | null): string {
  // Home
  if (view === 'home') return '/';

  // Category
  if (view === 'category') return `/${categorySlug || ''}`;

  // Static pages
  const staticEntry = Object.entries(STATIC_ROUTES).find(([, v]) => v === view);
  if (staticEntry) {
    const key = staticEntry[0];
    if (key === '' || key === '/') return '/';
    return key; // keys already include leading /
  }

  // Dashboard
  if (view.startsWith('dashboard')) {
    const sub = view.replace('dashboard-', '');
    const path = sub === 'profile' ? 'dashboard' : `dashboard/${sub}`;
    return `/${path}`;
  }

  // Admin — use hash routing for admin (stays on #/admin pattern)
  if (view.startsWith('admin')) {
    const sub = view === 'admin' ? '' : view.replace('admin-', '');
    return `#/admin${sub ? `-${sub}` : ''}`;
  }

  // 404 / fallback
  return '/';
}

/**
 * Parse a URL pathname into a ViewType + optional categorySlug.
 * Returns null for admin hash routes (handled separately).
 */
export function urlToViewType(pathname: string): { view: ViewType; categorySlug: string | null } | null {
  // Strip trailing slash
  const path = pathname.replace(/\/+$/, '') || '/';

  // Static routes
  if (STATIC_ROUTES[path]) {
    return { view: STATIC_ROUTES[path], categorySlug: null };
  }

  // Dashboard routes
  if (path.startsWith('/dashboard')) {
    const parts = path.split('/').filter(Boolean); // ['dashboard', 'settings']
    const sub = parts[1] || 'profile';
    const view = DASHBOARD_ROUTES[sub];
    if (view) return { view, categorySlug: null };
    return { view: 'dashboard-profile', categorySlug: null };
  }

  // Admin routes (non-hash) — treat as admin
  if (path.startsWith('/admin')) {
    // We don't handle plain /admin URLs here (admin uses hash)
    // But if someone navigates directly, redirect to home
    return null;
  }

  // Everything else is a category slug
  const slug = path.replace(/^\//, '');
  if (slug) {
    return { view: 'category', categorySlug: slug };
  }

  return { view: 'home', categorySlug: null };
}

/**
 * Known category slugs (used to distinguish category URLs from page URLs).
 * If the slug matches a known category, it's treated as a category.
 * Unknown slugs are also treated as categories (they'll show 404 in CategoryView).
 */
export function isKnownCategorySlug(slug: string): boolean {
  const knownSlugs = [
    'domain-hosting',
    'minecraft-intel', 'minecraft-amd', 'minecraft-ryzen9',
    'proxy-amd', 'proxy-intel',
    'hytale-amd', 'hytale-intel',
    'intel-vps', 'amd-vps',
    'web-hosting',
    'discord-bot-hosting', 'discord-services',
    'paid-works',
  ];
  return knownSlugs.includes(slug);
}