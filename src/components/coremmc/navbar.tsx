'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLiveNotifications } from '@/hooks/use-live-notifications';
import {
  Search,
  Menu,
  LogIn,
  LayoutDashboard,
  ChevronRight,
  Command,
  ShoppingCart,
  Bell,
  Activity,
  Globe,
  Server,
  Bot,
  Wrench,
  Gamepad2,
  Shield,
  ShieldCheck,
  HardDrive,
  MonitorSpeaker,
  Cpu,
} from 'lucide-react';
import {
  HostingNavIcon,
  VpsNavIcon,
  DomainsNavIcon,
  ServicesNavIcon,
} from '@/components/coremmc/nav-icons';
import { playNavSound } from '@/lib/sounds';
import {
  DomainIcon,
  MinecraftIntelIcon,
  MinecraftAmdIcon,
  ProxyAmdIcon,
  ProxyIntelIcon,
  HytaleAmdIcon,
  HytaleIntelIcon,
  IntelVpsIcon,
  AmdVpsIcon,
  WebHostingIcon,
  DiscordBotIcon,
  DiscordServicesIcon,
  PaidWorksIcon,
} from '@/components/coremmc/category-icons';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

// ── Icon map: slug → custom SVG icon ──────────────────────────────────────
const slugIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'domain-hosting': DomainIcon,
  'minecraft-intel': MinecraftIntelIcon,
  'minecraft-amd': MinecraftAmdIcon,
  'proxy-amd': ProxyAmdIcon,
  'proxy-intel': ProxyIntelIcon,
  'hytale-amd': HytaleAmdIcon,
  'hytale-intel': HytaleIntelIcon,
  'intel-vps': IntelVpsIcon,
  'amd-vps': AmdVpsIcon,
  'web-hosting': WebHostingIcon,
  'discord-bot-hosting': DiscordBotIcon,
  'discord-services': DiscordServicesIcon,
  'paid-works': PaidWorksIcon,
};

// ── Fallback Lucide icon map for Firestore icon names ─────────────────────
const lucideIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Globe, Server, Bot, Wrench, Gamepad2, Shield, ShieldCheck, HardDrive, Cpu,
  'Globe2': Globe, 'Gamepad2': Gamepad2, 'CircuitBoard': Cpu, 'Server': Server,
  'Shield': Shield, 'ShieldCheck': ShieldCheck, 'HardDrive': HardDrive, 'Bot': Bot,
  'Wrench': Wrench, 'Cpu': Cpu, 'MonitorSpeaker': MonitorSpeaker,
};

// ── Nav dropdown item type ───────────────────────────────────────────────
interface NavItem {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

// ── Category grouping logic ──────────────────────────────────────────────
// Maps category slugs to navbar groups
const CATEGORY_GROUPS: Record<string, string[]> = {
  hosting: ['minecraft-intel', 'minecraft-amd', 'proxy-amd', 'proxy-intel', 'hytale-amd', 'hytale-intel'],
  vps: ['intel-vps', 'amd-vps'],
  services: ['discord-bot-hosting', 'discord-services', 'paid-works', 'web-hosting'],
  domains: ['domain-hosting'],
};

function getCategoryGroup(slug: string): string {
  for (const [group, slugs] of Object.entries(CATEGORY_GROUPS)) {
    if (slugs.includes(slug)) return group;
  }
  // Fallback: detect from slug patterns
  if (slug.includes('proxy') || slug.includes('minecraft') || slug.includes('hytale')) return 'hosting';
  if (slug.includes('vps')) return 'vps';
  if (slug.includes('domain')) return 'domains';
  return 'services'; // Default to services for new categories
}

// ── Fallback hardcoded items (used if API fails) ─────────────────────────
const fallbackItems: NavItem[] = [
  { name: 'Minecraft Intel', slug: 'minecraft-intel', icon: 'MinecraftIntelIcon', color: '#22c55e', description: 'Intel-powered servers' },
  { name: 'Minecraft AMD', slug: 'minecraft-amd', icon: 'MinecraftAmdIcon', color: '#f97316', description: 'AMD EPYC/Ryzen servers' },
  { name: 'Proxy AMD (CoreMMCShield)', slug: 'proxy-amd', icon: 'ProxyAmdIcon', color: '#a855f7', description: 'CoreMMCShield AMD proxy' },
  { name: 'Proxy Intel (CoreMMCShield)', slug: 'proxy-intel', icon: 'ProxyIntelIcon', color: '#6366f1', description: 'CoreMMCShield Intel proxy' },
  { name: 'Hytale AMD', slug: 'hytale-amd', icon: 'HytaleAmdIcon', color: '#ef4444', description: 'AMD Hytale hosting' },
  { name: 'Hytale Intel', slug: 'hytale-intel', icon: 'HytaleIntelIcon', color: '#f59e0b', description: 'Budget Hytale servers' },
  { name: 'Intel Xeon VPS', slug: 'intel-vps', icon: 'IntelVpsIcon', color: '#06b6d4', description: 'Enterprise-grade VPS' },
  { name: 'AMD EPYC VPS', slug: 'amd-vps', icon: 'AmdVpsIcon', color: '#14b8a6', description: 'High-performance VPS' },
  { name: 'Domain Hosting', slug: 'domain-hosting', icon: 'DomainIcon', color: '#3b82f6', description: '14 TLDs available' },
  { name: 'Discord Bot Hosting', slug: 'discord-bot-hosting', icon: 'DiscordBotIcon', color: '#8b5cf6', description: '24/7 bot hosting' },
  { name: 'Discord Services', slug: 'discord-services', icon: 'DiscordServicesIcon', color: '#ec4899', description: 'Server & bot services' },
  { name: 'Paid Setup Services', slug: 'paid-works', icon: 'PaidWorksIcon', color: '#64748b', description: 'Professional setups' },
  { name: 'Web Hosting', slug: 'web-hosting', icon: 'WebHostingIcon', color: '#22c55e', description: 'SSD web hosting' },
];

// ── Resolve icon component for a nav item ────────────────────────────────
function resolveIcon(item: NavItem) {
  // 1. Try custom SVG icon by slug
  const customIcon = slugIconMap[item.slug];
  if (customIcon) return customIcon;
  // 2. Try custom SVG icon by name
  const byName: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    DomainIcon, MinecraftIntelIcon, MinecraftAmdIcon, ProxyAmdIcon, ProxyIntelIcon,
    HytaleAmdIcon, HytaleIntelIcon, IntelVpsIcon, AmdVpsIcon, WebHostingIcon,
    DiscordBotIcon, DiscordServicesIcon, PaidWorksIcon,
  };
  if (byName[item.icon]) return byName[item.icon];
  // 3. Try Lucide icon by Firestore icon name
  const lucide = lucideIconMap[item.icon] || lucideIconMap[item.icon.replace(/[^a-zA-Z]/g, '')];
  if (lucide) return lucide;
  // 4. Final fallback
  return DomainIcon;
}

// ── Dropdown content renderer ────────────────────────────────────────────
function DropdownGrid({ items, onSelect, closeMenu, className }: { items: NavItem[]; onSelect: (slug: string) => void; closeMenu?: () => void; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 p-3 min-w-[320px]', className)}>
      {items.map((item) => {
        const IconComponent = resolveIcon(item);
        return (
          <a
            key={item.slug}
            href={`/${item.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(item.slug);
              closeMenu?.();
            }}
            className={cn(
              'flex items-start gap-3 rounded-lg p-3 text-left transition-all duration-200',
              'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]',
              'hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)]',
              'min-h-[44px] min-w-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50'
            )}
          >
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <IconComponent className="h-4 w-4" style={{ color: item.color }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-white">{item.name}</span>
              <span className="text-xs text-white/40">{item.description}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ── Mobile nav section ───────────────────────────────────────────────────
function MobileNavSection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: NavItem[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="py-3">
      <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const IconComponent = resolveIcon(item);
          return (
            <a
              key={item.slug}
              href={`/${item.slug}`}
              onClick={(e) => { e.preventDefault(); onSelect(item.slug); }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                'hover:bg-white/5 min-h-[44px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50'
              )}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <IconComponent className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                {item.name}
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-white/20" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Navbar Component ────────────────────────────────────────────────
export function Navbar() {
  const cartItems = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const [user, setUser] = useState<User | null>(null);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const suppressBadgeUntil = useAppStore((s) => s.suppressBadgeUntil);
  const { navigate, setSearchOpen, setMobileMenuOpen, mobileMenuOpen, viewingAsUser, setViewingAsUser } = useAppStore();

  // ── Dynamic categories state ──────────────────────────────────────────
  const [allNavItems, setAllNavItems] = useState<NavItem[]>(fallbackItems);

  // ── Fetch categories from API ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const items: NavItem[] = data.categories.map((cat: { id: string; name: string; slug: string; icon: string; color: string; shortDescription: string }) => ({
            name: cat.name,
            slug: cat.slug || cat.id,
            icon: cat.icon || 'Globe',
            color: cat.color || '#6366f1',
            description: cat.shortDescription || cat.name,
          }));
          setAllNavItems(items);
        }
      } catch {
        // Keep fallback items on error
      }
    })();
  }, []);

  // ── Group categories for dropdowns ───────────────────────────────────
  const { hostingItems, vpsItems, servicesItems, domainItem } = (() => {
    const hosting: NavItem[] = [];
    const vps: NavItem[] = [];
    const services: NavItem[] = [];
    let domain: NavItem | null = null;

    for (const item of allNavItems) {
      const group = getCategoryGroup(item.slug);
      if (group === 'hosting') hosting.push(item);
      else if (group === 'vps') vps.push(item);
      else if (group === 'domains') domain = item;
      else services.push(item);
    }

    return {
      hostingItems: hosting.length > 0 ? hosting : fallbackItems.slice(0, 6),
      vpsItems: vps.length > 0 ? vps : fallbackItems.slice(6, 8),
      servicesItems: services.length > 0 ? services : fallbackItems.slice(8),
      domainItem: domain || fallbackItems.find(i => i.slug === 'domain-hosting') || fallbackItems[0],
    };
  })();

  // ── Real-time notification listener (Firestore onSnapshot) ─────
  useLiveNotifications();

  // When admin is previewing as user, treat as unauthenticated
  const effectiveUser = viewingAsUser ? null : user;

  // ── Firebase auth listener ───────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // ── Scroll hide/show logic ───────────────────────────────────────────
  const updateNavbarVisibility = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 10) {
      setVisible(true);
    } else if (currentScrollY > lastScrollY.current) {
      setVisible(false);
    } else {
      setVisible(true);
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (!ticking.current) {
        requestAnimationFrame(updateNavbarVisibility);
        ticking.current = true;
      }
    }, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateNavbarVisibility);
    };
  }, [updateNavbarVisibility]);

  // ── Keyboard shortcut for search ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  // ── Fetch notification count (fallback initial fetch) ─────────────
  useEffect(() => {
    if (!user || viewingAsUser) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!cancelled) {
          const unread = (data.notifications || []).filter((n: { read?: boolean }) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user, viewingAsUser, setUnreadCount]);

  const handleCategorySelect = (slug: string) => {
    navigate('category', slug);
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 flex justify-center transition-transform duration-300 ease-in-out',
        visible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <nav
        className={cn(
          'relative mt-2 flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8',
          'bg-[rgba(10,10,15,0.85)] backdrop-blur-[12px]',
          'border border-[rgba(255,255,255,0.06)] rounded-full',
          'glass-noise'
        )}
        style={{ width: '100%', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Logo ──────────────────────────────────────────────────── */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate('home'); }}
          className="flex items-center gap-2 min-h-[44px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50 rounded-md px-1"
          aria-label="CoreMMC Home"
        >
          <Image
            src="/coremmc-icon.png"
            alt="CoreMMC"
            width={36}
            height={36}
            className="h-9 w-9 object-contain rounded-md logo-icon-animated"
          />
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-2xl tracking-wide logo-text-animated"
            >
              CoreMMC
            </span>
            <span
              className="relative flex items-center -mt-2.5"
            >
              <span className="inline-block bg-gradient-to-r from-violet-600 to-indigo-500 text-[9px] font-bold uppercase tracking-widest text-white px-1.5 py-0.5 rounded-[3px] leading-none shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                Hosting
              </span>
            </span>
          </div>
        </a>

        {/* ── Desktop Navigation (left side, after logo) ───────────── */}
        <div className="hidden lg:flex items-center gap-1 ml-4 xl:ml-6">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-0">
              {/* Hosting Dropdown */}
              {hostingItems.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={playNavSound}
                    className={cn(
                      'text-sm font-medium text-white/70 hover:text-white',
                      'bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5',
                      'focus-visible:ring-0 focus-visible:outline-none',
                      'h-9 px-3.5 min-w-[44px] gap-1.5 rounded-full',
                      'transition-colors duration-200'
                    )}
                  >
                    <HostingNavIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Hosting</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 mt-2',
                      'bg-[#12121a]/95 backdrop-blur-xl',
                      'border border-[rgba(255,255,255,0.08)] rounded-xl',
                      'shadow-2xl shadow-black/40',
                      'overflow-visible'
                    )}
                  >
                    <DropdownGrid
                      items={hostingItems}
                      onSelect={handleCategorySelect}
                      className="min-w-[440px]"
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {/* VPS Dropdown */}
              {vpsItems.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={playNavSound}
                    className={cn(
                      'text-sm font-medium text-white/70 hover:text-white',
                      'bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5',
                      'focus-visible:ring-0 focus-visible:outline-none',
                      'h-9 px-3.5 min-w-[44px] gap-1.5 rounded-full',
                      'transition-colors duration-200'
                    )}
                  >
                    <VpsNavIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-none">VPS</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 mt-2',
                      'bg-[#12121a]/95 backdrop-blur-xl',
                      'border border-[rgba(255,255,255,0.08)] rounded-xl',
                      'shadow-2xl shadow-black/40',
                      'overflow-visible'
                    )}
                  >
                    <DropdownGrid items={vpsItems} onSelect={handleCategorySelect} className="min-w-[440px]" />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {/* Domains Link */}
              {domainItem && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href={`/${domainItem.slug}`}
                    onClick={(e) => { e.preventDefault(); playNavSound(); handleCategorySelect(domainItem.slug); }}
                    className={cn(
                      'text-sm font-medium text-white/70 hover:text-white transition-colors',
                      'bg-transparent hover:bg-white/5',
                      'h-9 inline-flex flex-row items-center justify-center px-3.5 cursor-pointer min-w-[44px] rounded-full leading-none gap-1.5',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/50'
                    )}
                  >
                    <DomainsNavIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Domains</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Services Dropdown */}
              {servicesItems.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={playNavSound}
                    className={cn(
                      'text-sm font-medium text-white/70 hover:text-white',
                      'bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5',
                      'focus-visible:ring-0 focus-visible:outline-none',
                      'h-9 px-3.5 min-w-[44px] gap-1.5 rounded-full',
                      'transition-colors duration-200'
                    )}
                  >
                    <ServicesNavIcon className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Services</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    className={cn(
                      'absolute top-full left-1/2 -translate-x-1/2 mt-2',
                      'bg-[#12121a]/95 backdrop-blur-xl',
                      'border border-[rgba(255,255,255,0.08)] rounded-xl',
                      'shadow-2xl shadow-black/40',
                      'overflow-visible'
                    )}
                  >
                    <DropdownGrid
                      items={servicesItems}
                      onSelect={handleCategorySelect}
                      className="min-w-[480px]"
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Status Link — grouped with center nav, with gap before Search */}
          <Button
            variant="ghost"
            onClick={() => { playNavSound(); navigate('status'); }}
            className={cn(
              'inline-flex items-center gap-1.5',
              'text-white/60 hover:text-white hover:bg-white/5',
              'h-9 px-3 rounded-full text-sm font-medium',
              'transition-colors duration-200 shrink-0'
            )}
            aria-label="Service Status"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400/80" />
            <span className="leading-none">Status</span>
          </Button>
        </div>

        {/* ── Right Side Actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          {/* Search Button — compact on sm, expanded on md+ */}
          <Button
            variant="ghost"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'hidden sm:flex items-center gap-2 text-white/50 hover:text-white',
              'hover:bg-white/5 h-11 px-3 sm:px-4 rounded-full',
              'min-w-[44px]'
            )}
            aria-label="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm hidden md:inline">Search</span>
            <Badge
              variant="outline"
              className="ml-0.5 hidden lg:inline-flex h-5 px-1.5 text-[10px] font-normal text-white/30 border-white/10 bg-white/5 hover:bg-white/5"
            >
              <Command className="mr-0.5 h-2.5 w-2.5" />
              K
            </Badge>
          </Button>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden text-white/50 hover:text-white hover:bg-white/5 h-11 w-11 rounded-full"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notification Bell */}
          {effectiveUser && (
            <Button
              variant="ghost"
              onClick={() => navigate('dashboard-notifications')}
              className="relative text-white/50 hover:text-white hover:bg-white/5 h-11 w-11 rounded-full shrink-0"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          )}

          {/* Cart Button */}
          {effectiveUser && totalCartItems > 0 && (
            <Button
              variant="ghost"
              onClick={() => { playNavSound(); setCartOpen(true); }}
              className="relative text-white/50 hover:text-white hover:bg-white/5 h-11 w-11 rounded-full shrink-0"
              aria-label={`Cart with ${totalCartItems} items`}
              data-cart-icon
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6366f1] text-[10px] font-bold text-white">
                {totalCartItems > 9 ? '9+' : totalCartItems}
              </span>
            </Button>
          )}

          {/* Admin preview exit pill */}
          {viewingAsUser && (
            <button
              onClick={() => setViewingAsUser(false)}
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5',
                'px-3.5 h-10 rounded-full text-xs font-medium',
                'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                'hover:bg-amber-500/20 transition-all duration-200'
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Exit Preview
            </button>
          )}

          {/* Auth Button */}
          {effectiveUser ? (
            <Button
              onClick={() => navigate('dashboard-profile')}
              className={cn(
                'hidden sm:flex items-center gap-2',
                'bg-[#6366f1] hover:bg-[#5558e6] text-white',
                'h-10 px-4 sm:px-5 rounded-full font-medium text-sm',
                'transition-all duration-200',
                'shadow-[0_0_15px_rgba(99,102,241,0.3)]',
                'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
                'shrink-0'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
          ) : (
            <Button
              onClick={() => navigate('login')}
              className={cn(
                'hidden sm:flex items-center gap-2',
                'bg-white/5 hover:bg-white/10 text-white',
                'border border-[rgba(255,255,255,0.1)]',
                'h-10 px-4 sm:px-5 rounded-full font-medium text-sm',
                'transition-all duration-200 min-w-[44px]',
                'shrink-0'
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Login</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="lg:hidden text-white/70 hover:text-white hover:bg-white/5 h-11 w-11 rounded-full shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className={cn(
                'w-[320px] max-w-[85vw]',
                'bg-[#12121a]/95 backdrop-blur-xl',
                'border-r border-[rgba(255,255,255,0.06)]',
                'p-0'
              )}
            >
              <SheetHeader className="flex flex-row items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
                <Image
                  src="/coremmc-icon.png"
                  alt="CoreMMC"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain rounded-md logo-icon-animated"
                />
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl logo-text-animated">
                    CoreMMC
                  </SheetTitle>
                  <span className="inline-block bg-gradient-to-r from-violet-600 to-indigo-500 text-[8px] font-bold uppercase tracking-widest text-white px-1 py-[2px] rounded-[3px] leading-none shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                    Hosting
                  </span>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                {/* Mobile Nav Sections — Dynamic from categories */}
                {hostingItems.length > 0 && (
                  <MobileNavSection title="Game Hosting" items={hostingItems} onSelect={(slug) => { handleCategorySelect(slug); setMobileMenuOpen(false); }} />
                )}

                {vpsItems.length > 0 && (
                  <MobileNavSection title="VPS" items={vpsItems} onSelect={(slug) => { handleCategorySelect(slug); setMobileMenuOpen(false); }} />
                )}

                {/* Domains */}
                {domainItem && (
                  <div className="py-3">
                    <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Domains
                    </p>
                    <a
                      href={`/${domainItem.slug}`}
                      onClick={(e) => { e.preventDefault(); handleCategorySelect(domainItem.slug); setMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-white/5 transition-colors min-h-[44px]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#3b82f6]/15">
                        <DomainIcon className="h-4 w-4 text-[#3b82f6]" />
                      </div>
                      <span className="text-sm text-white/70">{domainItem.name}</span>
                      <ChevronRight className="ml-auto h-4 w-4 text-white/20" />
                    </a>
                  </div>
                )}

                {servicesItems.length > 0 && (
                  <MobileNavSection title="Services" items={servicesItems} onSelect={(slug) => { handleCategorySelect(slug); setMobileMenuOpen(false); }} />
                )}

                {/* Status Link in mobile */}
                <div className="py-3">
                  <a
                    href="/status"
                    onClick={(e) => { e.preventDefault(); navigate('status'); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-white/5 transition-colors min-h-[44px]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/15">
                      <Activity className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm text-white/70">Service Status</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-white/20" />
                  </a>
                </div>
              </div>

              {/* Mobile Footer Actions */}
              <div className="border-t border-[rgba(255,255,255,0.06)] p-4 flex flex-col gap-2">
                <Button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  variant="ghost"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5 h-11"
                >
                  <Search className="mr-3 h-4 w-4" />
                  Search
                  <Badge
                    variant="outline"
                    className="ml-auto h-5 px-1.5 text-[10px] font-normal text-white/30 border-white/10 bg-white/5"
                  >
                    <Command className="mr-0.5 h-2.5 w-2.5" />
                    K
                  </Badge>
                </Button>

                {effectiveUser ? (
                  <Button
                    onClick={() => { navigate('dashboard-profile'); setMobileMenuOpen(false); }}
                    className={cn(
                      'w-full h-11 font-medium text-sm',
                      'bg-[#6366f1] hover:bg-[#5558e6] text-white',
                      'shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    )}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                ) : viewingAsUser ? (
                  <Button
                    onClick={() => { setViewingAsUser(false); setMobileMenuOpen(false); }}
                    className={cn(
                      'w-full h-11 font-medium text-sm',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    )}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Exit Preview
                  </Button>
                ) : (
                  <Button
                    onClick={() => { navigate('login'); setMobileMenuOpen(false); }}
                    className={cn(
                      'w-full h-11 font-medium text-sm',
                      'bg-white/5 hover:bg-white/10 text-white',
                      'border border-[rgba(255,255,255,0.1)]'
                    )}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;