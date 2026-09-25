'use client';

import { type ReactNode } from 'react';
import {
  User,
  Settings,
  ShoppingCart,
  Headphones,
  LogOut,
  MoreHorizontal,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
import { useAppStore, type ViewType } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ── Nav items config ─────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view: ViewType;
}

const navItems: NavItem[] = [
  { label: 'Profile', icon: User, view: 'dashboard-profile' },
  { label: 'Settings', icon: Settings, view: 'dashboard-settings' },
  { label: 'My Orders', icon: ShoppingCart, view: 'dashboard-orders' },
  { label: 'Notifications', icon: Bell, view: 'dashboard-notifications' },
  { label: 'Support', icon: Headphones, view: 'contact' },
];

// Mobile bottom tab items (first 4 + More)
const mobileTabItems = navItems.slice(0, 4);
const mobileMoreItems = navItems.slice(4);

// ── Get initials from display name ───────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Sidebar Nav Item ─────────────────────────────────────────────────────
function SidebarNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50',
        isActive
          ? 'bg-white/5 text-indigo-400 border-l-2 border-indigo-400'
          : 'text-white/60 hover:bg-white/5 hover:text-white/90 border-l-2 border-transparent'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </button>
  );
}

// ── Mobile Bottom Tab ────────────────────────────────────────────────────
function MobileTab({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50',
        isActive ? 'text-indigo-400' : 'text-white/50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate max-w-full">{item.label}</span>
    </button>
  );
}

// ── Main Dashboard Layout ────────────────────────────────────────────────
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, logoutFromDashboard } = useAuth();
  const { currentView, navigate } = useAppStore();

  const displayName = userProfile?.displayName || user?.displayName || 'User';
  const email = userProfile?.email || user?.email || '';
  const initials = getInitials(displayName);

  const isDashboardView = (view: ViewType) =>
    view === 'dashboard-profile' ||
    view === 'dashboard-settings' ||
    view === 'dashboard-orders' ||
    view === 'dashboard-notifications';

  // Determine active view (defaults to dashboard for all dashboard- views)
  const activeView = isDashboardView(currentView) ? currentView : 'dashboard-profile';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-30 hidden lg:flex lg:w-[260px] xl:w-[280px] lg:flex-col lg:shrink-0',
          'h-screen bg-[#12121a] border-r border-white/[0.06]',
          'overflow-y-auto'
        )}
        aria-label="Dashboard sidebar"
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold">
            {initials}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate">
              {displayName}
            </span>
            <span className="text-xs text-white/50 truncate">{email}</span>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => navigate('home')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg mx-2 mt-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
            'text-white/60 hover:bg-white/5 hover:text-white/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50'
          )}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Home
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.view}
              item={item}
              isActive={activeView === item.view}
              onClick={() => navigate(item.view)}
            />
          ))}
        </nav>

        {/* Bottom: separator + logout */}
        <div className="px-2 pb-3 shrink-0">
          <Separator className="mb-2 bg-white/[0.06]" />
          <button
            onClick={logoutFromDashboard}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]',
              'text-red-400 hover:bg-red-500/10 hover:text-red-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50'
            )}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="dashboard-main flex-1 min-h-screen w-full">
        <div className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* ── Mobile Bottom Tabs ───────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
          'flex items-stretch',
          'bg-[#12121a]/95 backdrop-blur-xl',
          'border-t border-white/[0.06]'
        )}
        aria-label="Mobile dashboard navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Safe area spacer for iOS home indicator */}
        <div className="sr-only" aria-hidden="true" />
        {mobileTabItems.map((item) => (
          <MobileTab
            key={item.view}
            item={item}
            isActive={activeView === item.view}
            onClick={() => navigate(item.view)}
          />
        ))}

        {/* More button → Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50',
                'text-white/50'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className={cn(
              'rounded-t-2xl bg-[#12121a]/95 backdrop-blur-xl',
              'border-t border-white/[0.06]',
              'p-0',
              'max-h-[70vh] overflow-y-auto'
            )}
          >
            <SheetHeader className="px-5 pt-5 pb-3">
              <SheetTitle className="text-base font-semibold text-white">
                More Options
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-0.5 px-3 pb-8">
              {mobileMoreItems.map((item) => (
                <SidebarNavItem
                  key={item.view}
                  item={item}
                  isActive={activeView === item.view}
                  onClick={() => navigate(item.view)}
                />
              ))}
              <Separator className="my-2 bg-white/[0.06]" />
              <button
                onClick={logoutFromDashboard}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]',
                  'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                )}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export default DashboardLayout;