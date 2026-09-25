'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Users, Package, ShoppingBag, IndianRupee, Clock, Plus, CreditCard, Megaphone, ShoppingCart, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

interface RecentOrder {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface PendingOrder {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  serviceName: string;
  discordId: string;
  paymentUtr: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
};

function formatRelativeTime(isoString: string): string {
  if (!isoString) return '—';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const navigate = useAppStore((s) => s.navigate);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingOrdersList, setPendingOrdersList] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard-stats');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      const pendingCount = data.pendingOrders ?? 0;

      setStats([
        { title: 'Total Users', value: data.totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
        { title: 'Total Products', value: data.totalProducts ?? 0, icon: Package, color: 'text-emerald-400' },
        { title: 'Completed Orders', value: data.completedOrders ?? 0, icon: ShoppingBag, color: 'text-amber-400' },
        {
          title: 'Pending Orders',
          value: pendingCount,
          icon: Clock,
          color: pendingCount > 0 ? 'text-orange-400' : 'text-zinc-500',
          subtitle: pendingCount > 0 ? `${pendingCount} order${pendingCount > 1 ? 's' : ''} awaiting action` : 'No pending orders',
        },
        { title: 'Total Revenue', value: `\u20B9${(data.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-400' },
      ]);

      setRecentOrders(data.recentOrders || []);
      setPendingOrdersList(data.pendingOrdersList || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load dashboard data. Ensure FIREBASE_SERVICE_ACCOUNT is set in Vercel environment variables.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickLinks = [
    { label: 'Add Product', icon: Plus, view: 'admin-products' as const, color: 'text-emerald-400 hover:text-emerald-300' },
    { label: 'View Payments', icon: CreditCard, view: 'admin-payments' as const, color: 'text-amber-400 hover:text-amber-300' },
    { label: 'Announcements', icon: Megaphone, view: 'admin-announcements' as const, color: 'text-purple-400 hover:text-purple-300' },
    { label: 'Manage Orders', icon: ShoppingCart, view: 'admin-orders' as const, color: 'text-indigo-400 hover:text-indigo-300' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of your hosting platform</p>
      </div>

      {/* Stats Grid */}
      {error && !loading ? (
        <Card className="bg-[#12121a] border-amber-500/20">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-amber-400" />
            <p className="text-sm text-amber-300 font-medium">Admin features require Firebase credentials</p>
            <p className="text-xs text-white/50 max-w-md">
              Set the <code className="px-1.5 py-0.5 rounded bg-white/5 text-amber-300 text-[11px]">FIREBASE_SERVICE_ACCOUNT</code> environment variable on Vercel (Project → Settings → Environment Variables) with your Firebase service account JSON.
            </p>
            <Button variant="outline" size="sm" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10" onClick={fetchDashboardData}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-zinc-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-[#12121a] border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-zinc-500 mt-1">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`h-12 w-12 rounded-lg bg-zinc-800/80 flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending Orders Section */}
      {!loading && pendingOrdersList.length > 0 && (
        <Card className="bg-[#12121a] border-orange-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-white">Pending Orders</CardTitle>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                  {pendingOrdersList.length}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
                onClick={() => navigate('admin-orders')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <span className="col-span-3">Order</span>
                <span className="col-span-2">Customer</span>
                <span className="col-span-3">Service</span>
                <span className="col-span-2 text-right">Amount</span>
                <span className="col-span-2 text-right">Time</span>
              </div>
              {pendingOrdersList.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate('admin-orders')}
                >
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-zinc-300 font-mono truncate" title={order.orderId}>
                      #{order.orderId.length > 10 ? order.orderId.slice(-8) : order.orderId}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-0.5 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-white truncate">{order.userName}</p>
                    {order.discordId && (
                      <p className="text-xs text-zinc-500 truncate">{order.discordId}</p>
                    )}
                  </div>
                  <p className="col-span-3 text-sm text-zinc-400 truncate">{order.serviceName}</p>
                  <span className="col-span-2 text-sm font-medium text-white text-right">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="col-span-2 text-xs text-zinc-500 text-right">
                    {formatRelativeTime(order.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.view}
                variant="outline"
                className={`h-auto py-4 flex flex-col items-center gap-2 bg-[#12121a] border-zinc-800/50 ${link.color} hover:bg-zinc-800/80`}
                onClick={() => navigate(link.view)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{link.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <Card className="bg-[#12121a] border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-zinc-800/50" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No recent orders</p>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-5 gap-3 px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <span>Order ID</span>
                <span>Customer</span>
                <span className="text-right">Amount</span>
                <span className="text-center">Status</span>
                <span className="text-right">Time</span>
              </div>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-5 gap-3 items-center p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm text-zinc-300 font-mono truncate" title={order.orderId}>
                    {order.orderId.length > 10
                      ? `#${order.orderId.slice(-8)}`
                      : `#${order.orderId}`}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{order.userName}</p>
                    <p className="text-xs text-zinc-500 truncate">{order.userEmail}</p>
                  </div>
                  <span className="text-sm font-medium text-white text-right">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500 text-right">
                    {formatRelativeTime(order.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}