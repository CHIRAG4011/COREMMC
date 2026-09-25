'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Clock,
  Server,
  CreditCard,
  User,
  Loader2,
  ExternalLink,
  CheckCircle2,
  ImageIcon,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  planId: string;
  name: string;
  categoryName: string;
  categoryId: string;
  price: number;
  quantity: number;
  selectedDuration: string;
}

interface DeliveryDetails {
  serverIp: string;
  port: string;
  credentials: string;
  panelUrl: string;
  customMessage: string;
}

interface Order {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed';
  discordId: string;
  paymentUtr: string;
  registeredEmail: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  adminNotes: string;
  deliveryDetails: DeliveryDetails;
  screenshot?: string;
  videoUrl?: string;
}

type StatusFilter = 'all' | 'pending' | 'processing' | 'completed';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusTabs: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
];

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
};

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function capitalizeStatus(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobileSheetOrder, setMobileSheetOrder] = useState<Order | null>(null);

  // Edit states for expanded/sheet order
  const [localNotes, setLocalNotes] = useState('');
  const [localDelivery, setLocalDelivery] = useState<DeliveryDetails>({
    serverIp: '',
    port: '',
    credentials: '',
    panelUrl: '',
    customMessage: '',
  });
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [screenshotFullscreen, setScreenshotFullscreen] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Filtered orders ────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.userName.toLowerCase().includes(q) ||
          o.userEmail.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // ─── Local state sync when expanded/sheet changes ───────────────────────

  const activeOrder = expandedId
    ? orders.find((o) => o.orderId === expandedId) || null
    : null;

  useEffect(() => {
    if (activeOrder) {
      setLocalNotes(activeOrder.adminNotes || '');
      setLocalDelivery(activeOrder.deliveryDetails || { serverIp: '', port: '', credentials: '', panelUrl: '', customMessage: '' });
    }
  }, [activeOrder?.orderId]);

  useEffect(() => {
    if (mobileSheetOrder) {
      setLocalNotes(mobileSheetOrder.adminNotes || '');
      setLocalDelivery(mobileSheetOrder.deliveryDetails || { serverIp: '', port: '', credentials: '', panelUrl: '', customMessage: '' });
    }
  }, [mobileSheetOrder?.orderId]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleCopyId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      toast.success('Order ID copied');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(orderId);
    try {
      const order = orders.find((o) => o.orderId === orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          adminNotes: order?.adminNotes || '',
          deliveryDetails: order?.deliveryDetails || {},
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Order marked as ${capitalizeStatus(newStatus)}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async (orderId: string) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    setSavingNotes(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: order.status,
          adminNotes: localNotes,
          deliveryDetails: order.deliveryDetails || {},
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Notes saved');
      fetchOrders();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveDelivery = async (orderId: string) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    setSavingDelivery(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: order.status,
          adminNotes: order.adminNotes || '',
          deliveryDetails: localDelivery,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Delivery details saved');
      fetchOrders();
    } catch {
      toast.error('Failed to save delivery details');
    } finally {
      setSavingDelivery(false);
    }
  };

  // ─── Approve handler ─────────────────────────────────────────────────

  const handleApprove = async (orderId: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'processing' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success('Order approved — now processing');
      fetchOrders();
    } catch {
      toast.error('Failed to approve order');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ─── Status action buttons ──────────────────────────────────────────────

  const renderStatusActions = (order: Order) => {
    const isUpdating = updatingStatus === order.orderId;
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]"
              disabled={isUpdating}
              onClick={(e) => { e.stopPropagation(); handleApprove(order.orderId); }}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              Approve → Processing
            </Button>
          </div>
        );
      case 'processing':
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]"
              disabled={isUpdating}
              onClick={() => handleStatusChange(order.orderId, 'completed')}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Mark Completed
            </Button>
          </div>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 px-4 py-2 text-sm">
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  // ─── Quick action buttons for row ──────────────────────────────────────

  const renderQuickActions = (order: Order) => {
    if (order.status !== 'pending' && order.status !== 'processing') return null;
    const isUpdating = updatingStatus === order.orderId;

    if (order.status === 'pending') {
      return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[32px] h-8 px-2 text-xs"
            disabled={isUpdating}
            onClick={() => handleApprove(order.orderId)}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          </Button>
        </div>
      );
    }

    if (order.status === 'processing') {
      return (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[32px] h-8 px-2 text-[10px]"
            disabled={isUpdating}
            onClick={() => handleStatusChange(order.orderId, 'completed')}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
            Done
          </Button>
        </div>
      );
    }

    return null;
  };

  // ─── Expanded detail (shared between desktop expand & mobile sheet) ─────

  const renderOrderDetail = (order: Order, source: 'desktop' | 'mobile') => {
    return (
      <div className={cn('space-y-6', source === 'desktop' && 'pt-4')}>
        <Separator className="bg-zinc-800/50" />

        {/* Items */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-zinc-400" />
            Order Items
          </h4>
          <div className="rounded-lg border border-zinc-800/50 overflow-hidden">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3',
                  idx > 0 && 'border-t border-zinc-800/50'
                )}
              >
                <div className="space-y-0.5">
                  <p className="text-sm text-white font-medium">{item.name}</p>
                  <p className="text-xs text-white/50">{item.categoryName} · {item.selectedDuration}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/70">×{item.quantity}</span>
                  <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-800/50 px-4 py-3 flex items-center justify-between bg-zinc-800/10">
              <span className="text-sm text-white/70 font-medium">Total</span>
              <span className="text-lg text-white font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-400" />
            Customer Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">Name</p>
              <p className="text-sm text-white">{order.userName || '—'}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">Email</p>
              <p className="text-sm text-white break-all">{order.userEmail || '—'}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">User ID</p>
              <p className="text-sm text-white/70 font-mono break-all">{order.userId}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">Created</p>
              <p className="text-sm text-white/70">{formatDate(order.createdAt)}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">Last Updated</p>
              <p className="text-sm text-white/70">{formatDate(order.updatedAt)}</p>
            </div>
            {order.completedAt && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
              <p className="text-xs text-white/50 mb-0.5">Completed</p>
              <p className="text-sm text-emerald-400">{formatDate(order.completedAt)}</p>
            </div>
            )}
          </div>
        </div>

        {/* Payment Info (Discord ID, UTR, Email) */}
        {(order.discordId || order.paymentUtr || order.registeredEmail) && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-zinc-400" />
              Payment Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
                <p className="text-xs text-white/50 mb-0.5">Discord ID</p>
                <p className="text-sm text-white break-all">{order.discordId || '—'}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
                <p className="text-xs text-white/50 mb-0.5">UTR Number</p>
                <p className="text-sm text-white font-mono break-all">{order.paymentUtr || '—'}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/20 border border-zinc-800/50 px-4 py-3">
                <p className="text-xs text-white/50 mb-0.5">Registered Email</p>
                <p className="text-sm text-white break-all">{order.registeredEmail || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Screenshot */}
        {order.screenshot && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-400" />
              Payment Screenshot
            </h4>
            <div
              className="cursor-pointer rounded-lg border border-zinc-800/50 overflow-hidden inline-block hover:border-indigo-500/30 transition-colors"
              onClick={() => setScreenshotFullscreen(order.screenshot || null)}
            >
              <img
                src={order.screenshot}
                alt="Payment screenshot for order"
                className="max-w-full max-h-64 object-contain"
              />
            </div>
            <p className="text-xs text-white/30 mt-1">Click image to view full size</p>
          </div>
        )}

        {/* Video URL */}
        {order.videoUrl && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-400" />
              Video
            </h4>
            <a
              href={order.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors break-all"
            >
              {order.videoUrl}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        )}

        {/* Admin Notes */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Admin Notes</h4>
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Add internal notes about this order..."
            className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[80px] resize-y"
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              className="min-h-[44px]"
              disabled={savingNotes}
              onClick={() => handleSaveNotes(order.orderId)}
            >
              {savingNotes ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Save Notes
            </Button>
          </div>
        </div>

        {/* Delivery Details - show for processing and completed orders */}
        {(order.status === 'processing' || order.status === 'completed') && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Server className="h-4 w-4 text-zinc-400" />
            Delivery Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Server IP</Label>
              <Input
                value={localDelivery.serverIp}
                onChange={(e) => setLocalDelivery((d) => ({ ...d, serverIp: e.target.value }))}
                placeholder="e.g. 192.168.1.1"
                className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Port</Label>
              <Input
                value={localDelivery.port}
                onChange={(e) => setLocalDelivery((d) => ({ ...d, port: e.target.value }))}
                placeholder="e.g. 25565"
                className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Credentials</Label>
              <Input
                value={localDelivery.credentials}
                onChange={(e) => setLocalDelivery((d) => ({ ...d, credentials: e.target.value }))}
                placeholder="Username / Password"
                className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Panel URL</Label>
              <Input
                value={localDelivery.panelUrl}
                onChange={(e) => setLocalDelivery((d) => ({ ...d, panelUrl: e.target.value }))}
                placeholder="https://panel.example.com"
                className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-zinc-400 text-xs">Custom Message</Label>
              <Textarea
                value={localDelivery.customMessage}
                onChange={(e) => setLocalDelivery((d) => ({ ...d, customMessage: e.target.value }))}
                placeholder="Message to display to customer..."
                className="bg-zinc-800/30 border-zinc-800/50 text-white placeholder:text-white/30 min-h-[60px] resize-y"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
              disabled={savingDelivery}
              onClick={() => handleSaveDelivery(order.orderId)}
            >
              {savingDelivery ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Server className="h-4 w-4 mr-1.5" />}
              Save Delivery Details
            </Button>
          </div>
        </div>
        )}

        {/* Status Actions */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-zinc-400" />
            Status Actions
          </h4>
          {renderStatusActions(order)}
        </div>
      </div>
    );
  };

  // ─── Render: Desktop row with expand ────────────────────────────────────

  const renderDesktopRow = (order: Order) => {
    const isExpanded = expandedId === order.orderId;
    return (
      <div key={order.orderId} className="border-b border-zinc-800/50 last:border-b-0">
        <div
          className="grid grid-cols-[1fr_1.2fr_0.6fr_0.8fr_0.8fr_1fr_auto] items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-zinc-800/20 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
        >
          {/* Order ID */}
          <div className="flex items-center gap-2 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
            )}
            <span className="font-mono text-sm text-white truncate">{order.orderId}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId(order.orderId);
              }}
              className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Copy order ID"
            >
              {copiedId === order.orderId ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />
              )}
            </button>
          </div>

          {/* Customer */}
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{order.userName}</p>
            <p className="text-xs text-white/50 truncate">{order.userEmail}</p>
          </div>

          {/* Items */}
          <div className="text-sm text-white/70">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </div>

          {/* Amount */}
          <div className="text-sm text-white font-medium">
            {formatPrice(order.totalAmount)}
          </div>

          {/* Status */}
          <div>
            <Badge
              variant="outline"
              className={cn('text-xs', statusBadgeStyles[order.status] || '')}
            >
              {capitalizeStatus(order.status)}
            </Badge>
          </div>

          {/* Date */}
          <div className="text-sm text-white/50 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formatDate(order.createdAt)}</span>
          </div>

          {/* Quick Actions (desktop) / Detail button (mobile) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {renderQuickActions(order)}
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white min-h-[44px] min-w-[44px]"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetOrder(order);
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Detail (desktop only) */}
        {isExpanded && (
          <div className="px-4 pb-4 hidden lg:block">
            {renderOrderDetail(order, 'desktop')}
          </div>
        )}
      </div>
    );
  };

  // ─── Render: Mobile card ────────────────────────────────────────────────

  const renderMobileCard = (order: Order) => (
    <div
      key={order.orderId}
      className="lg:hidden rounded-xl border border-zinc-800/50 bg-[#12121a] p-4 space-y-3"
      onClick={() => setMobileSheetOrder(order)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm text-white truncate">{order.orderId}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyId(order.orderId);
            }}
            className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Copy order ID"
          >
            {copiedId === order.orderId ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </button>
        </div>
        <Badge
          variant="outline"
          className={cn('text-xs shrink-0', statusBadgeStyles[order.status] || '')}
        >
          {capitalizeStatus(order.status)}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-white truncate">{order.userName}</p>
        <p className="text-xs text-white/50 truncate">{order.userEmail}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
        <span className="text-white font-medium">{formatPrice(order.totalAmount)}</span>
      </div>
      <div className="text-xs text-white/50 flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {formatDate(order.createdAt)}
      </div>
      {order.screenshot && (
        <div className="flex items-center gap-1.5 text-xs text-indigo-400/70">
          <ImageIcon className="h-3 w-3" />
          Has screenshot
        </div>
      )}
      {renderQuickActions(order) && (
        <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          {renderQuickActions(order)}
        </div>
      )}
    </div>
  );

  // ─── Skeleton loader ────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800/50 bg-[#12121a] p-4 lg:p-0 lg:rounded-none lg:border-0 lg:border-b lg:border-zinc-800/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 bg-zinc-800/50" />
            <Skeleton className="h-4 w-32 bg-zinc-800/50" />
            <Skeleton className="h-4 w-40 bg-zinc-800/50 hidden sm:block" />
            <Skeleton className="h-4 w-16 bg-zinc-800/50 hidden sm:block" />
            <Skeleton className="h-4 w-20 bg-zinc-800/50 hidden sm:block" />
            <Skeleton className="h-6 w-20 bg-zinc-800/50 hidden md:block" />
            <Skeleton className="h-4 w-36 bg-zinc-800/50 hidden lg:block" />
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Main render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Orders</h1>
        <p className="text-zinc-400 mt-1">Manage and track all customer orders</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by order ID, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#12121a] border-zinc-800/50 min-h-[44px]"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {statusTabs.map((tab) => {
          const count = statusCounts[tab.value] || 0;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[44px]',
                activeTab === tab.value
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.value
                    ? 'bg-white/10 text-white/80'
                    : 'bg-white/5 text-zinc-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        renderSkeleton()
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-800/50 mb-4">
            <Package className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No orders yet</h3>
          <p className="text-sm text-zinc-500 max-w-xs">
            {search || activeTab !== 'all'
              ? 'No orders match your current filters. Try adjusting your search or status filter.'
              : 'Orders will appear here once customers start placing them.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: Table-like layout */}
          <div className="hidden lg:block rounded-xl border border-zinc-800/50 overflow-hidden bg-[#12121a]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.2fr_0.6fr_0.8fr_0.8fr_1fr_auto] items-center gap-4 px-4 py-3 border-b border-zinc-800/50 bg-zinc-800/10">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Order ID</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Customer</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Items</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</span>
              <span className="w-10" />
            </div>
            {/* Rows */}
            <div className="divide-y-0">
              {filteredOrders.map(renderDesktopRow)}
            </div>
          </div>

          {/* Mobile: Card layout */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map(renderMobileCard)}
          </div>
        </>
      )}

      {/* Mobile Sheet for order detail */}
      <Sheet
        open={!!mobileSheetOrder}
        onOpenChange={(open) => {
          if (!open) setMobileSheetOrder(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg bg-[#12121a] border-zinc-800/50 overflow-y-auto">
          {mobileSheetOrder && (
            <>
              <SheetHeader className="mb-2">
                <SheetTitle className="text-white flex items-center gap-2 text-lg">
                  <span className="font-mono text-base">{mobileSheetOrder.orderId}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusBadgeStyles[mobileSheetOrder.status] || '')}
                  >
                    {capitalizeStatus(mobileSheetOrder.status)}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              {renderOrderDetail(mobileSheetOrder, 'mobile')}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Screenshot Fullscreen Dialog */}
      <Dialog open={!!screenshotFullscreen} onOpenChange={(open) => { if (!open) setScreenshotFullscreen(null); }}>
        <DialogContent className="bg-[#0a0a0f] border-zinc-800/50 max-w-4xl p-2">
          <DialogHeader>
            <DialogTitle className="text-white text-sm">Payment Screenshot</DialogTitle>
          </DialogHeader>
          {screenshotFullscreen && (
            <img
              src={screenshotFullscreen}
              alt="Payment screenshot full size"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}