'use client';

import React from 'react';
import { useAuth } from './auth-provider';
import { useAppStore, type ViewType } from '@/store/use-app-store';
import { AdminLoginView } from './admin-login-view';
import {
  LayoutDashboard,
  Users,
  Shield,
  Grid3x3,
  Package,
  CreditCard,
  Megaphone,
  Tag,
  Settings,
  FileText,
  ShoppingCart,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  view: ViewType;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'admin' },
  { label: 'Users', icon: Users, view: 'admin-users' },
  { label: 'Roles', icon: Shield, view: 'admin-roles', ownerOnly: true },
  { label: 'Categories', icon: Grid3x3, view: 'admin-categories' },
  { label: 'Products', icon: Package, view: 'admin-products' },
  { label: 'Orders', icon: ShoppingCart, view: 'admin-orders' },
  { label: 'Payments', icon: CreditCard, view: 'admin-payments' },
  { label: 'Announcements', icon: Megaphone, view: 'admin-announcements' },
  { label: 'Notifications', icon: Bell, view: 'admin-notifications' },
  { label: 'Offers', icon: Tag, view: 'admin-offers' },
  { label: 'Settings', icon: Settings, view: 'admin-settings' },
  { label: 'Activity Logs', icon: FileText, view: 'admin-activity' },
];

function SidebarContent({
  currentView,
  navigate,
  role,
  onNavigate,
}: {
  currentView: ViewType;
  navigate: (v: ViewType) => void;
  role: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/coremmc-icon.png"
            alt="CoreMMC"
            className="h-7 w-7 object-contain rounded logo-icon-animated"
          />
          <span className="text-2xl logo-text-animated">
            CoreMMC
          </span>
        </div>
        <p className="text-sm text-zinc-500">Admin Panel</p>
      </div>
      <Separator className="bg-zinc-800" />
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          if (item.ownerOnly && role !== 'owner') return null;
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => {
                navigate(item.view);
                onNavigate?.();
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <Separator className="bg-zinc-800" />
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          onClick={() => {
            const { setViewingAsUser } = useAppStore.getState();
            setViewingAsUser(true);
            navigate('home');
            onNavigate?.();
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading, logout } = useAuth();
  const { currentView, navigate } = useAppStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  // Not authenticated → show admin login page
  if (!userProfile) {
    return <AdminLoginView />;
  }

  // Authenticated but not admin/owner → access denied
  if (userProfile.role !== 'admin' && userProfile.role !== 'owner') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-zinc-400 text-sm">
            Your account does not have admin privileges. Contact the owner if you believe this is an error.
          </p>
          <Button
            onClick={() => navigate('home')}
            className="mt-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Site
          </Button>
        </div>
      </div>
    );
  }

  const role = userProfile.role;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:block w-[300px] bg-[#12121a] border-r border-zinc-800/50">
        <SidebarContent currentView={currentView} navigate={navigate} role={role} />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#12121a] border-b border-zinc-800/50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-[#12121a] border-zinc-800/50 p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SidebarContent
              currentView={currentView}
              navigate={navigate}
              role={role}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <img src="/coremmc-icon.png" alt="CoreMMC" className="h-5 w-5 object-contain rounded logo-icon-animated" />
          <span className="text-sm logo-text-animated">
            CoreMMC
          </span>
          <span className="text-xs text-zinc-500">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-red-400"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="lg:ml-[300px] min-h-screen">
        <div className="p-4 pt-18 lg:p-6 lg:pt-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}