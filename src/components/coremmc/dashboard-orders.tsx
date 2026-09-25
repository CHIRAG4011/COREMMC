'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Package,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Server,
  ShoppingBag,
  Loader2,
  Upload,
  X,
  ImageIcon,
  Video,
  FileText,
  ShoppingCart,
  CreditCard,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────
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
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  adminNotes: string;
  deliveryDetails: DeliveryDetails;
  screenshot?: string;
  videoUrl?: string;
  discordId?: string;
  paymentUtr?: string;
  discountCode?: string;
}

type StatusFilter = 'all' | 'pending' | 'processing' | 'completed';

// ── Helpers ──────────────────────────────────────────────────────────────
function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = d.getDate();
    const monthShort = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${day} ${monthShort} ${year}, ${h12}:${minutes} ${ampm}`;
  } catch {
    return '—';
  }
}

// ── Order Status Timeline ────────────────────────────────────────────────
interface TimelineStep {
  key: string;
  label: string;
  icon: typeof ShoppingCart;
  completed: boolean;
  active: boolean;
  timestamp: string | null;
}

function getTimelineSteps(order: Order): TimelineStep[] {
  const isCancelled = !!order.cancelledAt;
  const steps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      icon: ShoppingCart,
      completed: !!order.createdAt,
      active: !order.paidAt && !isCancelled && order.status === 'pending',
      timestamp: order.createdAt,
    },
    {
      key: 'paid',
      label: 'Payment Verified',
      icon: CreditCard,
      completed: !!order.paidAt || order.status === 'processing' || order.status === 'completed',
      active: order.status === 'processing' || (order.status === 'pending' && !!order.screenshot),
      timestamp: order.paidAt || null,
    },
    {
      key: 'processing',
      label: 'Processing',
      icon: Package,
      completed: order.status === 'completed',
      active: order.status === 'processing',
      timestamp: order.status === 'processing' || order.status === 'completed' ? order.updatedAt : null,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: Truck,
      completed: order.status === 'completed',
      active: false,
      timestamp: order.completedAt,
    },
  ];

  // If cancelled, mark all as not active
  if (isCancelled) {
    steps.forEach((s) => { s.active = false; });
  }

  return steps;
}

function OrderTimeline({ order }: { order: Order }) {
  const steps = getTimelineSteps(order);
  const isCancelled = !!order.cancelledAt;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-white/40" />
        <span className="text-sm font-semibold text-white/60">Order Timeline</span>
      </div>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/[0.08]">
          {/* Filled progress portion */}
          <div
            className="w-full bg-emerald-500/60 rounded-full transition-all duration-700"
            style={{
              height: `${(steps.filter((s) => s.completed).length / steps.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="relative flex items-start gap-3">
                {/* Dot */}
                <div
                  className={cn(
                    'absolute -left-6 top-0.5 h-[22px] w-[22px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500 z-10',
                    step.completed
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : step.active
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse'
                        : 'bg-white/[0.08] border border-white/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3 w-3',
                      step.completed ? 'text-white' : step.active ? 'text-white' : 'text-white/30'
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-0.5 min-w-0 pb-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.completed ? 'text-emerald-400' : step.active ? 'text-amber-400' : 'text-white/30'
                    )}
                  >
                    {step.label}
                    {step.completed && <Check className="inline h-3.5 w-3.5 ml-1.5 -mt-0.5" />}
                    {step.active && !step.completed && (
                      <Loader2 className="inline h-3.5 w-3.5 ml-1.5 -mt-0.5 animate-spin" />
                    )}
                  </p>
                  {step.timestamp && (
                    <p className="text-[11px] text-white/30">{formatDate(step.timestamp)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400/70">
            <X className="h-3.5 w-3.5" />
            <span>Order was cancelled</span>
            {order.cancelledAt && <span className="text-white/25">{formatDate(order.cancelledAt)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Invoice PDF Generator ────────────────────────────────────────────────
function generateInvoiceHtml(order: Order, siteName: string): string {
  const itemsHtml = order.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #374151;">${i + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111827; font-weight: 500;">${item.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #6b7280;">${item.categoryName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #374151; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #374151; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111827; font-weight: 600; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const subTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${order.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #111827; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
    .brand h1 { font-size: 24px; font-weight: 700; color: #6366f1; margin-bottom: 4px; }
    .brand p { font-size: 12px; color: #9ca3af; }
    .invoice-badge { background: #f3f4f6; padding: 8px 16px; border-radius: 8px; text-align: right; }
    .invoice-badge h2 { font-size: 20px; font-weight: 700; color: #111827; }
    .invoice-badge p { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .detail-section h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; }
    .detail-section p { font-size: 13px; color: #374151; line-height: 1.6; }
    .detail-section .value { font-weight: 500; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    thead th:nth-child(4), thead th:nth-child(5), thead th:nth-child(6) { text-align: center; }
    thead th:nth-child(5), thead th:nth-child(6) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 13px; }
    .totals-row.total { border-top: 2px solid #111827; font-weight: 700; font-size: 16px; padding-top: 12px; margin-top: 4px; }
    .totals-row .label { color: #6b7280; }
    .totals-row .amount { color: #111827; font-weight: 500; }
    .totals-row.total .amount { color: #6366f1; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #f0f0f0; text-align: center; }
    .footer p { font-size: 11px; color: #9ca3af; }
    .status-completed { display: inline-flex; align-items: center; gap: 4px; background: #ecfdf5; color: #059669; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand" style="display:flex;align-items:center;gap:12px;">
        <img src="https://coremmc.cloud/coremmc-icon.png" alt="CoreMMC" style="width:44px;height:44px;border-radius:10px;" />
        <div>
          <h1>${siteName}</h1>
          <p>Premium Hosting Solutions</p>
        </div>
      </div>
      <div class="invoice-badge">
        <h2>INVOICE</h2>
        <p>${order.orderId}</p>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-section">
        <h3>Bill To</h3>
        <p class="value">${order.userName || 'Customer'}</p>
        <p>${order.userEmail || ''}</p>
        ${order.discordId ? `<p>Discord: ${order.discordId}</p>` : ''}
      </div>
      <div class="detail-section" style="text-align: right;">
        <h3>Invoice Details</h3>
        <p>Date: <span class="value">${formatDate(order.createdAt)}</span></p>
        <p>Status: <span class="status-completed">Completed</span></p>
        <p>Payment: <span class="value">UPI</span></p>
        ${order.paymentUtr ? `<p>UTR: <span class="value">${order.paymentUtr}</span></p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Service</th>
          <th>Category</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span class="label">Subtotal</span>
          <span class="amount">${formatPrice(subTotal)}</span>
        </div>
        ${order.discountCode ? `
        <div class="totals-row">
          <span class="label">Discount (${order.discountCode})</span>
          <span class="amount" style="color: #059669;">-${formatPrice(subTotal - order.totalAmount)}</span>
        </div>` : ''}
        <div class="totals-row total">
          <span class="label">Total Paid</span>
          <span class="amount">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing ${siteName}. This is a computer-generated invoice.</p>
      <p style="margin-top: 4px;">For support, contact us through the dashboard.</p>
    </div>
  </div>
</body>
</html>`;
}

function handleDownloadInvoice(order: Order, siteName: string) {
  const html = generateInvoiceHtml(order, siteName);
  const win = window.open('', '_blank');
  if (!win) {
    // Fallback: download as HTML file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
  // Trigger print after a small delay for fonts to load
  setTimeout(() => {
    win.print();
  }, 500);
}

// ── Status Badge ─────────────────────────────────────────────────────────
function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config: Record<Order['status'], { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/20',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-500/15 text-blue-400 border-blue-500/25 hover:bg-blue-500/20',
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20',
    },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

// ── Copy Button ──────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-white/40 hover:text-white/70 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Delivery Details Section ─────────────────────────────────────────────
function DeliverySection({ details, completedAt }: { details: DeliveryDetails; completedAt?: string | null }) {
  const [showCredentials, setShowCredentials] = useState(false);

  const fields: Array<{ key: keyof DeliveryDetails; label: string; type: 'text' | 'copy' | 'masked' | 'link' }> = [
    { key: 'serverIp', label: 'Server IP', type: 'copy' },
    { key: 'port', label: 'Port', type: 'text' },
    { key: 'credentials', label: 'Credentials', type: 'masked' },
    { key: 'panelUrl', label: 'Panel URL', type: 'link' },
    { key: 'customMessage', label: 'Custom Message', type: 'text' },
  ];

  const visibleFields = fields.filter((f) => details[f.key] && details[f.key].trim() !== '');

  if (visibleFields.length === 0) return null;

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-400">Delivery Details</span>
        {completedAt && (
          <span className="text-[10px] text-white/25 ml-auto">Delivered {formatDate(completedAt)}</span>
        )}
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-3">
        {visibleFields.map((field) => (
          <div key={field.key}>
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">{field.label}</p>
            {field.type === 'text' && (
              <p className="text-sm text-white break-all">{details[field.key]}</p>
            )}
            {field.type === 'copy' && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-mono">{details[field.key]}</p>
                <CopyButton text={details[field.key]} />
              </div>
            )}
            {field.type === 'masked' && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-mono">
                  {showCredentials ? details[field.key] : '••••••••••••'}
                </p>
                <button
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-white/40 hover:text-white/70 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  aria-label={showCredentials ? 'Hide credentials' : 'Show credentials'}
                >
                  {showCredentials ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <CopyButton text={details[field.key]} />
              </div>
            )}
            {field.type === 'link' && (
              <a
                href={details[field.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors min-h-[44px] break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded"
              >
                {details[field.key]}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screenshot Upload Section ────────────────────────────────────────────
function ScreenshotUpload({ order, onUpload }: { order: Order; onUpload: (orderId: string, base64: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(order.screenshot || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setPreview(base64);
      onUpload(order.orderId, base64);
      toast.success('Screenshot uploaded');
    } catch {
      toast.error('Failed to upload screenshot');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload(order.orderId, '');
    toast.success('Screenshot removed');
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-400">Payment Screenshot</span>
      </div>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Payment screenshot"
            className="max-w-full max-h-64 rounded-lg border border-white/10 object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
            aria-label="Remove screenshot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
            'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5',
            uploading && 'pointer-events-none opacity-50'
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload payment screenshot"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-white/30" />
              <div className="text-center">
                <p className="text-sm text-white/60">Click to upload screenshot</p>
                <p className="text-xs text-white/30 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Choose screenshot file"
      />
    </div>
  );
}

// ── Order Card ───────────────────────────────────────────────────────────
function OrderCard({ order, index, onScreenshotUpload }: { order: Order; index: number; onScreenshotUpload: (orderId: string, base64: string) => void }) {
  const hasDeliveryDetails =
    order.status === 'completed' &&
    order.deliveryDetails &&
    (order.deliveryDetails.serverIp ||
      order.deliveryDetails.port ||
      order.deliveryDetails.credentials ||
      order.deliveryDetails.panelUrl ||
      order.deliveryDetails.customMessage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className="bg-[#12121a] border-zinc-800/50 rounded-xl overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-mono text-white/80 truncate">
                {order.orderId}
              </CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-white/50">{formatDate(order.createdAt)}</span>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Items */}
          <div className="flex flex-col gap-2 pt-2">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-white/[0.04] last:border-0"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm text-white/90 truncate">{item.name}</p>
                  <p className="text-xs text-white/50">{item.categoryName}</p>
                </div>
                <p className="text-sm text-white/70 shrink-0">
                  {formatPrice(item.price)}
                  {item.quantity > 1 && <span className="text-white/50"> x{item.quantity}</span>}
                </p>
              </div>
            ))}
            {order.items.length > 1 && (
              <p className="text-xs text-white/50 pt-1">
                {order.items.length} items in this order
              </p>
            )}
          </div>

          {/* Screenshot Upload (pending and processing orders) */}
          {(order.status === 'pending' || order.status === 'processing') && (
            <ScreenshotUpload order={order} onUpload={onScreenshotUpload} />
          )}

          {/* Screenshot display (completed orders) */}
          {order.status === 'completed' && order.screenshot && (
            <div className="mt-1">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-400">Payment Screenshot</span>
              </div>
              <img
                src={order.screenshot}
                alt="Payment screenshot"
                className="max-w-full max-h-64 rounded-lg border border-white/10 object-contain"
              />
            </div>
          )}

          {/* Video URL */}
          {order.videoUrl && (
            <div className="mt-1">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Video</span>
              </div>
              <a
                href={order.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-300 hover:text-purple-200 transition-colors break-all"
              >
                {order.videoUrl}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Delivery Details (completed orders) */}
          {hasDeliveryDetails && (
            <DeliverySection details={order.deliveryDetails} completedAt={order.completedAt} />
          )}

          {/* Order Status Timeline */}
          <OrderTimeline order={order} />

          {/* Status-specific messages */}
          {order.status === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-amber-400/70">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Your order is pending. Please upload a payment screenshot and wait for admin approval.</span>
            </div>
          )}
          {order.status === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-blue-400/70">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Your order is being processed. We&apos;ll deliver your service soon.</span>
            </div>
          )}

          {/* Invoice Download (completed orders) */}
          {order.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadInvoice(order, 'CoreMMC')}
              className="w-full sm:w-auto border-white/10 text-white/70 hover:text-white hover:bg-white/5 gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Invoice
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Skeleton Loading ─────────────────────────────────────────────────────
function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-40 bg-white/5 mb-2" />
        <Skeleton className="h-4 w-64 bg-white/5" />
      </div>
      <Skeleton className="h-9 w-80 bg-white/5 rounded-lg" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#12121a] border border-zinc-800/50 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 bg-white/5" />
                <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
              </div>
              <Skeleton className="h-6 w-24 bg-white/5" />
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <Skeleton className="h-4 w-48 bg-white/5" />
              <Skeleton className="h-4 w-36 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────
function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
        <Package className="h-8 w-8 text-white/20" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">No orders yet</h2>
      <p className="text-sm text-white/50 max-w-sm mb-6">
        Add services to your cart and place your first order
      </p>
      <Button
        onClick={onBrowse}
        className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Browse Plans
      </Button>
    </motion.div>
  );
}

// ── Dashboard Orders ─────────────────────────────────────────────────────
export default function DashboardOrders() {
  const { user } = useAuth();
  const navigate = useAppStore((s) => s.navigate);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/orders?userId=${user.uid}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError(true);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const handleScreenshotUpload = useCallback(async (orderId: string, base64: string) => {
    try {
      const res = await fetch('/api/orders/screenshot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, screenshot: base64, userId: user?.uid }),
      });
      if (!res.ok) throw new Error('Failed to upload');
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, screenshot: base64 || undefined } : o))
      );
    } catch {
      toast.error('Failed to save screenshot');
    }
  }, [user?.uid]);

  // Loading
  if (loading) {
    return <OrdersSkeleton />;
  }

  // Error state with retry
  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-4">
          <Server className="h-8 w-8 text-red-400/50" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Failed to load orders</h2>
        <p className="text-sm text-white/50 max-w-sm mb-6">
          Something went wrong while fetching your orders
        </p>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">My Orders</h1>
        <p className="text-white/50 text-sm md:text-base">
          Track and manage your service orders
        </p>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <EmptyState onBrowse={() => navigate('home')} />
      ) : (
        <>
          {/* Filter Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as StatusFilter)}
          >
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="bg-white/5 border border-white/[0.06] w-auto min-w-0">
                <TabsTrigger
                  value="all"
                  className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs sm:text-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs sm:text-sm"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="processing"
                  className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs sm:text-sm"
                >
                  Processing
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 text-xs sm:text-sm"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <Package className="h-10 w-10 text-white/15 mb-3" />
                  <p className="text-white/50 text-sm">
                    No {activeTab === 'all' ? '' : activeTab + ' '}orders found
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[50vh] sm:max-h-[600px] overflow-y-auto pr-1 -mx-1 px-1">
                  {filteredOrders.map((order, i) => (
                    <OrderCard key={order.orderId} order={order} index={i} onScreenshotUpload={handleScreenshotUpload} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </motion.div>
  );
}