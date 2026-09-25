'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Home, ClipboardList, AlertCircle, Loader2, X, Clock, ShieldCheck, Send, Upload, ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { useCartStore } from '@/store/use-cart-store';
import { useAuth } from '@/components/coremmc/auth-provider';
import { formatPrice } from '@/data/products';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QrPaymentViewProps {
  amount: number;
  orderId: string;
  items: Array<{ name: string; price: number; quantity: number; categoryName: string }>;
  isSingleProduct?: boolean;
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
}

export function QrPaymentView({ amount, orderId, items, isSingleProduct, cartItems, discountCode, discountAmount }: QrPaymentViewProps) {
  const [qrPaymentUrl, setQrPaymentUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment info fields
  const [discordId, setDiscordId] = useState('');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Screenshot upload
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Video URL
  const [videoUrl, setVideoUrl] = useState('');

  const { navigate, closePaymentView } = useAppStore();
  const { user } = useAuth();
  const { clearCart } = useCartStore();

  useEffect(() => {
    async function fetchQrSettings() {
      try {
        const res = await fetch('/api/settings/qr-payment-url');
        const data = await res.json();
        setQrPaymentUrl(data.qrPaymentUrl || '');
        setUpiId(data.upiId || '');
      } catch {
        setQrPaymentUrl('');
        setUpiId('');
      } finally {
        setLoading(false);
      }
    }
    fetchQrSettings();
  }, []);

  // Pre-fill email from auth user
  useEffect(() => {
    if (user?.email) {
      setRegisteredEmail(user.email);
    }
  }, [user?.email]);

  const singleItem = items.length === 1;

  // Handle screenshot file selection
  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
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
      setScreenshotBase64(base64);
      setScreenshotPreview(base64);
      toast.success('Screenshot attached');
    } catch {
      toast.error('Failed to read image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotBase64(null);
    setScreenshotPreview(null);
    toast.success('Screenshot removed');
  };

  const handleSubmit = async () => {
    if (!discordId.trim()) {
      toast.error('Please enter your Discord ID');
      return;
    }
    if (!paymentUtr.trim()) {
      toast.error('Please enter your Payment UTR Number');
      return;
    }
    if (!registeredEmail.trim()) {
      toast.error('Please enter your registered email');
      return;
    }

    setSubmitting(true);
    try {
      const itemsToSubmit = cartItems || items.map((item) => ({
        planId: `plan-${Date.now()}`,
        name: item.name,
        categoryName: item.categoryName,
        categoryId: '',
        price: item.price,
        originalPrice: null,
        currency: 'INR',
        quantity: item.quantity,
        selectedDuration: '1 Month',
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          userEmail: registeredEmail.trim(),
          userName: user?.displayName || '',
          items: itemsToSubmit,
          totalAmount: amount,
          currency: 'INR',
          discordId: discordId.trim(),
          paymentUtr: paymentUtr.trim(),
          registeredEmail: registeredEmail.trim(),
          discountCode: discountCode || null,
          discountAmount: discountAmount || 0,
          screenshot: screenshotBase64 || '',
          videoUrl: videoUrl.trim(),
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => null);
        throw new Error(data?.error || 'Failed to create order');
      }

      clearCart();

      toast.success('Payment details submitted! Your order is now pending approval.');
      closePaymentView();
      navigate('dashboard-orders');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#12121a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Complete Your Payment</h2>
              <p className="text-xs text-white/40 mt-0.5">{orderId ? `Order #${orderId.slice(0, 12)}...` : 'Complete payment to create order'}</p>
            </div>
          </div>
          <button
            onClick={closePaymentView}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close payment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Amount Display */}
        <div className="text-center">
          <p className="text-sm text-white/40 mb-1">Amount to Pay</p>
          {discountAmount && discountAmount > 0 ? (
            <div className="space-y-1">
              <p className="text-lg text-white/50 line-through">
                ₹{(amount + (discountAmount || 0)).toLocaleString('en-IN')}
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                ₹{amount.toLocaleString('en-IN')}
              </p>
              {discountCode && (
                <p className="text-xs text-emerald-400 font-medium">
                  Discount applied: {discountCode}
                </p>
              )}
            </div>
          ) : (
            <p className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
              ₹{amount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
          {singleItem ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{items[0].name}</p>
                <Badge
                  variant="outline"
                  className="mt-1 text-[10px] border-white/[0.08] text-white/40 bg-white/[0.02]"
                >
                  {items[0].categoryName}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white ml-3 shrink-0">
                {formatPrice(items[0].price)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Order Items</p>
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80 truncate">{item.name}</p>
                      <p className="text-xs text-white/30">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-white shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* QR Code Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            <p className="text-sm text-white/30 mt-3">Loading payment details...</p>
          </div>
        ) : qrPaymentUrl ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white rounded-xl p-3 shadow-lg">
              <img
                src={qrPaymentUrl}
                alt="Payment QR Code"
                className="w-[280px] h-[280px] object-contain rounded-lg"
              />
            </div>
            <p className="text-sm text-white/60 font-medium">Scan QR code to pay</p>
            {upiId && (
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5">
                <ShieldCheck className="w-4 h-4 text-[#6366f1]" />
                <p className="text-sm text-white/60">
                  Pay to: <span className="text-white font-medium">{upiId}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-amber-300">Payment method not configured</p>
              <p className="text-xs text-white/40 mt-1">Please contact support for assistance.</p>
            </div>
          </div>
        )}

        <Separator className="bg-white/[0.06]" />

        {/* Payment Details Form */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            Fill in your payment details below
          </h3>
          <div className="space-y-4">
            {/* Discord ID */}
            <div className="space-y-1.5">
              <Label htmlFor="discord-id" className="text-zinc-400 text-xs">
                Discord ID <span className="text-red-400">*</span>
              </Label>
              <Input
                id="discord-id"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="e.g. username#1234 or user_id"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-white/30 min-h-[44px] rounded-lg"
              />
            </div>

            {/* Payment UTR */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-utr" className="text-zinc-400 text-xs">
                Payment UTR Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="payment-utr"
                value={paymentUtr}
                onChange={(e) => setPaymentUtr(e.target.value)}
                placeholder="Enter your UTR / Transaction Reference Number"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-white/30 min-h-[44px] rounded-lg"
              />
            </div>

            {/* Registered Email */}
            <div className="space-y-1.5">
              <Label htmlFor="registered-email" className="text-zinc-400 text-xs">
                Registered Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="registered-email"
                type="email"
                value={registeredEmail}
                readOnly
                disabled
                placeholder="your@email.com"
                className="bg-zinc-800/30 border-zinc-700/50 text-white/60 placeholder:text-white/30 min-h-[44px] rounded-lg cursor-not-allowed"
              />
              <p className="text-[10px] text-white/25 mt-0.5">This is your registered email and cannot be changed</p>
            </div>

            <Separator className="bg-white/[0.04]" />

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Payment Screenshot
              </Label>
              {screenshotPreview ? (
                <div className="relative inline-block">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot preview"
                    className="max-w-full max-h-48 rounded-lg border border-white/10 object-contain"
                  />
                  <button
                    onClick={handleRemoveScreenshot}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                    'border-white/10 hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5',
                    uploading && 'pointer-events-none opacity-50'
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload payment screenshot"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-[#6366f1] animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-white/30" />
                  )}
                  <div className="text-center">
                    <p className="text-xs text-white/60">Click to upload payment screenshot</p>
                    <p className="text-[10px] text-white/30 mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
                aria-label="Choose screenshot file"
              />
            </div>

            {/* Video URL */}
            <div className="space-y-1.5">
              <Label htmlFor="video-url" className="text-zinc-400 text-xs flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Video URL <span className="text-white/20">(optional)</span>
              </Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste a video link (e.g. YouTube, drive link)"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-white/30 min-h-[44px] rounded-lg"
              />
              <p className="text-[10px] text-white/25 mt-0.5">Add a video URL related to this order (payment proof video, etc.)</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !qrPaymentUrl}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e0] hover:to-[#9333ea] text-white font-semibold text-sm shadow-lg shadow-[#6366f1]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? 'Submitting...' : 'Submit for Approval'}
        </Button>

        {/* Status Message */}
        <div className="flex items-start gap-3 bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-xl p-4">
          <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            After submitting, your order will be reviewed by our team. You&apos;ll see updates on your orders page.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            onClick={() => {
              closePaymentView();
              navigate('dashboard-orders');
            }}
            variant="outline"
            className="w-full h-11 rounded-xl border-white/[0.08] text-white/70 hover:text-white hover:bg-white/5 hover:border-white/15 font-medium text-sm gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            View My Orders
          </Button>
          <Button
            onClick={() => {
              closePaymentView();
              navigate('home');
            }}
            className="w-full h-11 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white font-medium text-sm gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QrPaymentOverlay() {
  const paymentView = useAppStore((s) => s.paymentView);
  const closePaymentView = useAppStore((s) => s.closePaymentView);
  const { user } = useAuth();

  if (!paymentView || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
        onClick={closePaymentView}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <QrPaymentView
            amount={paymentView.amount}
            orderId={paymentView.orderId}
            items={paymentView.items}
            cartItems={paymentView.cartItems}
            discountCode={paymentView.discountCode}
            discountAmount={paymentView.discountAmount}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}