'use client';

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, ADMIN_HASH_MAP } from '@/store/use-app-store';
import { urlToViewType } from '@/lib/routing';
import { AuthProvider } from '@/components/coremmc/auth-provider';
// Lazy-loaded non-critical overlays (deferred after first paint)
const MaintenanceOverlay = lazy(() => import('@/components/coremmc/maintenance-overlay').then(m => ({ default: m.MaintenanceOverlay })));
const AuthToast = lazy(() => import('@/components/coremmc/auth-toast').then(m => ({ default: m.AuthToast })));
const CartDrawer = lazy(() => import('@/components/coremmc/cart-drawer').then(m => ({ default: m.CartDrawer })));
const QrPaymentOverlay = lazy(() => import('@/components/coremmc/qr-payment-view').then(m => ({ default: m.QrPaymentOverlay })));
const CartToast = lazy(() => import('@/components/coremmc/cart-toast').then(m => ({ default: m.CartToast })));
const FlyToCart = lazy(() => import('@/components/coremmc/fly-to-cart').then(m => ({ default: m.FlyToCart })));

import { Navbar } from '@/components/coremmc/navbar';
import { AnnouncementBanner } from '@/components/coremmc/announcement-banner';

import { Footer } from '@/components/coremmc/footer';
import { SearchModal } from '@/components/coremmc/search-modal';
import { HeroSection } from '@/components/coremmc/hero-section';
import { PromoBanner } from '@/components/coremmc/promo-banner';

// Lazy load below-fold home sections for code splitting
const StatsSection = lazy(() => import('@/components/coremmc/stats-section').then(m => ({ default: m.StatsSection })));
const CategoriesSection = lazy(() => import('@/components/coremmc/categories-section').then(m => ({ default: m.CategoriesSection })));
const PopularPlansSection = lazy(() => import('@/components/coremmc/popular-plans-section').then(m => ({ default: m.PopularPlansSection })));
const InfrastructureSection = lazy(() => import('@/components/coremmc/infrastructure-section').then(m => ({ default: m.InfrastructureSection })));
const GlobalNetworkSection = lazy(() => import('@/components/coremmc/global-network-section').then(m => ({ default: m.GlobalNetworkSection })));
const PanelPreviewSection = lazy(() => import('@/components/coremmc/panel-preview-section').then(m => ({ default: m.PanelPreviewSection })));
const TestimonialsSection = lazy(() => import('@/components/coremmc/testimonials-section').then(m => ({ default: m.TestimonialsSection })));
const FaqSection = lazy(() => import('@/components/coremmc/faq-section').then(m => ({ default: m.FaqSection })));

// Lazy load auth views
const LoginView = lazy(() => import('@/components/coremmc/login-view'));
const RegisterView = lazy(() => import('@/components/coremmc/register-view'));
const ForgotPasswordView = lazy(() => import('@/components/coremmc/forgot-password-view'));
const VerifyEmailView = lazy(() => import('@/components/coremmc/verify-email-view'));

// Lazy load other views
const CategoryView = lazy(() => import('@/components/coremmc/category-view').then(m => ({ default: m.CategoryView })));
const ContactView = lazy(() => import('@/components/coremmc/contact-view').then(m => ({ default: m.ContactView })));
const AboutView = lazy(() => import('@/components/coremmc/about-view').then(m => ({ default: m.AboutView })));

const TermsView = lazy(() => import('@/components/coremmc/terms-view').then(m => ({ default: m.TermsView })));
const PrivacyView = lazy(() => import('@/components/coremmc/privacy-view').then(m => ({ default: m.PrivacyView })));
const RefundView = lazy(() => import('@/components/coremmc/refund-view').then(m => ({ default: m.RefundView })));
const NotFoundView = lazy(() => import('@/components/coremmc/not-found-view').then(m => ({ default: m.NotFoundView })));
const StatusView = lazy(() => import('@/components/coremmc/server-status-view').then(m => ({ default: m.StatusView })));

// Lazy load dashboard views
const DashboardLayout = lazy(() => import('@/components/coremmc/dashboard-layout').then(m => ({ default: m.DashboardLayout })));
const DashboardProfile = lazy(() => import('@/components/coremmc/dashboard-profile').then(m => ({ default: m.DashboardProfile })));
const DashboardSettings = lazy(() => import('@/components/coremmc/dashboard-settings').then(m => ({ default: m.DashboardSettings })));
const DashboardOrders = lazy(() => import('@/components/coremmc/dashboard-orders'));
const DashboardNotifications = lazy(() => import('@/components/coremmc/dashboard-notifications'));

// Lazy load admin views
const AdminLayout = lazy(() => import('@/components/coremmc/admin-layout'));
const AdminDashboard = lazy(() => import('@/components/coremmc/admin-dashboard'));
const AdminUsers = lazy(() => import('@/components/coremmc/admin-users'));
const AdminRoles = lazy(() => import('@/components/coremmc/admin-roles'));
const AdminCategories = lazy(() => import('@/components/coremmc/admin-categories'));
const AdminProducts = lazy(() => import('@/components/coremmc/admin-products'));
const AdminPayments = lazy(() => import('@/components/coremmc/admin-payments'));
const AdminAnnouncements = lazy(() => import('@/components/coremmc/admin-announcements'));
const AdminOffers = lazy(() => import('@/components/coremmc/admin-offers'));
const AdminSettings = lazy(() => import('@/components/coremmc/admin-settings'));
const AdminActivity = lazy(() => import('@/components/coremmc/admin-activity'));
const AdminOrders = lazy(() => import('@/components/coremmc/admin-orders'));
const AdminNotifications = lazy(() => import('@/components/coremmc/admin-notifications'));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" aria-hidden="true">
      <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function SectionFallback() {
  return <div className="h-24" aria-hidden="true" />;
}

function AppContent() {
  const { currentView, categorySlug } = useAppStore();
  const isDashboardView = currentView.startsWith('dashboard');
  const isAdminView = currentView.startsWith('admin');
  const isAuthView = ['login', 'register', 'forgot-password', 'verify-email'].includes(currentView);

  // ── Dynamic document title ───────────────────────────────────────
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'CoreMMC — Premium Hosting | Minecraft, VPS, Domains, Discord Bots',
      category: categorySlug
        ? `${(categorySlug || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — CoreMMC`
        : 'Hosting — CoreMMC',
      status: 'Service Status — CoreMMC',
      contact: 'Contact Us — CoreMMC',
      terms: 'Terms of Service — CoreMMC',
      privacy: 'Privacy Policy — CoreMMC',
      refund: 'Refund Policy — CoreMMC',
      login: 'Sign In — CoreMMC',
      register: 'Create Account — CoreMMC',
      'forgot-password': 'Reset Password — CoreMMC',
      'verify-email': 'Verify Email — CoreMMC',
      'dashboard-profile': 'My Profile — CoreMMC',
      'dashboard-settings': 'Settings — CoreMMC',
      'dashboard-orders': 'My Orders — CoreMMC',
      'dashboard-notifications': 'Notifications — CoreMMC',
    };
    document.title = titles[currentView] || 'CoreMMC — Premium Hosting';
  }, [currentView, categorySlug]);

  // ── Initialize view from URL on first mount ───────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && ADMIN_HASH_MAP[hash]) {
      useAppStore.setState({ currentView: ADMIN_HASH_MAP[hash] });
      return;
    }
    const result = urlToViewType(window.location.pathname);
    if (result) {
      useAppStore.setState({ currentView: result.view, categorySlug: result.categorySlug });
    }
  }, []);

  // ── Sync hash → Zustand for admin views ──────────────────────────────
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash && ADMIN_HASH_MAP[hash]) {
        const targetView = ADMIN_HASH_MAP[hash];
        const store = useAppStore.getState();
        if (store.currentView !== targetView) {
          useAppStore.setState({ currentView: targetView });
        }
      }
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // ── Handle browser back/forward (popstate) ──────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash && ADMIN_HASH_MAP[hash]) {
        useAppStore.setState({ currentView: ADMIN_HASH_MAP[hash] });
        return;
      }
      const result = urlToViewType(window.location.pathname);
      if (result) {
        useAppStore.setState({ currentView: result.view, categorySlug: result.categorySlug });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'dashboard-profile': return <DashboardProfile />;
      case 'dashboard-settings': return <DashboardSettings />;
      case 'dashboard-orders': return <DashboardOrders />;
      case 'dashboard-notifications': return <DashboardNotifications />;
      default: return <DashboardProfile />;
    }
  };

  const renderAdminContent = () => {
    switch (currentView) {
      case 'admin': return <AdminDashboard />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-roles': return <AdminRoles />;
      case 'admin-categories': return <AdminCategories />;
      case 'admin-products': return <AdminProducts />;
      case 'admin-payments': return <AdminPayments />;
      case 'admin-announcements': return <AdminAnnouncements />;
      case 'admin-offers': return <AdminOffers />;
      case 'admin-settings': return <AdminSettings />;
      case 'admin-activity': return <AdminActivity />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-notifications': return <AdminNotifications />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <>
      {!isAuthView && !isDashboardView && !isAdminView && <Navbar />}
      {!isAuthView && !isDashboardView && !isAdminView && <SearchModal />}

      {/* ── Announcement Popup (shown once on site open) ──── */}
      {!isAuthView && !isDashboardView && !isAdminView && <AnnouncementBanner />}

      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentView === 'home' && (
          <>
            <HeroSection />
            <PromoBanner />
            <Suspense fallback={<SectionFallback />}><StatsSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><CategoriesSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><PopularPlansSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><InfrastructureSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><GlobalNetworkSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><PanelPreviewSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><TestimonialsSection /></Suspense>
            <Suspense fallback={<SectionFallback />}><FaqSection /></Suspense>
          </>
        )}

        {currentView === 'category' && <Suspense fallback={<LazyFallback />}><CategoryView /></Suspense>}

        {currentView === 'login' && <Suspense fallback={<LazyFallback />}><LoginView /></Suspense>}
        {currentView === 'register' && <Suspense fallback={<LazyFallback />}><RegisterView /></Suspense>}
        {currentView === 'forgot-password' && <Suspense fallback={<LazyFallback />}><ForgotPasswordView /></Suspense>}
        {currentView === 'verify-email' && <Suspense fallback={<LazyFallback />}><VerifyEmailView /></Suspense>}

        {isDashboardView && (
          <Suspense fallback={<LazyFallback />}>
            <DashboardLayout>
              {renderDashboardContent()}
            </DashboardLayout>
          </Suspense>
        )}

        {isAdminView && (
          <Suspense fallback={<LazyFallback />}>
            <AdminLayout>
              {renderAdminContent()}
            </AdminLayout>
          </Suspense>
        )}

        {currentView === 'status' && <Suspense fallback={<LazyFallback />}><StatusView /></Suspense>}
        {currentView === 'contact' && <Suspense fallback={<LazyFallback />}><ContactView /></Suspense>}
        {currentView === 'about' && <Suspense fallback={<LazyFallback />}><AboutView /></Suspense>}
        {currentView === 'terms' && <Suspense fallback={<LazyFallback />}><TermsView /></Suspense>}
        {currentView === 'privacy' && <Suspense fallback={<LazyFallback />}><PrivacyView /></Suspense>}
        {currentView === 'refund' && <Suspense fallback={<LazyFallback />}><RefundView /></Suspense>}
        {currentView === '404' && <Suspense fallback={<LazyFallback />}><NotFoundView /></Suspense>}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAuthView && !isDashboardView && !isAdminView && <Footer />}
    </>
  );
}

function DeferredOverlays() {
  const [mounted, setMounted] = useState(false);
  // Use requestAnimationFrame to avoid the synchronous setState-in-effect lint rule
  // while still deferring overlay rendering until after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <MaintenanceOverlay />
      <AuthToast />
      <CartToast />
      <FlyToCart />
      <CartDrawer />
      <QrPaymentOverlay />
    </Suspense>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <DeferredOverlays />
      <AppContent />
    </AuthProvider>
  );
}