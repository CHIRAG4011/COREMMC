'use client';

import React, { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowRight,
  Tag,
  TicketCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { useAppStore } from '@/store/use-app-store';
import { useAuth } from '@/components/coremmc/auth-provider';
import { formatPrice } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getPaymenterRedirectUrl } from '@/lib/paymenter';

export function CartDrawer() {
  const {
    items,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getDiscountedTotal,
    appliedDiscount,
    applyDiscount,
    removeDiscount,
  } = useCartStore();

  const { navigate, showAuthToast } = useAppStore();
  const { user } = useAuth();

  const [discountCode, setDiscountCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const discountedTotal = getDiscountedTotal();

  const handleApplyDiscount = useCallback(async () => {
    const code = discountCode.trim();
    if (!code) {
      toast.error('Please enter a discount code');
      return;
    }
    if (items.length === 0) {
      toast.error('Add items to your cart first');
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: totalPrice }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid discount code');
        return;
      }

      applyDiscount({
        discountId: data.discountId,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        description: data.description,
      });

      toast.success(
        data.discountType === 'percentage'
          ? `${data.code} applied — ${data.discountValue}% off!`
          : `${data.code} applied — ₹${data.discountAmount.toLocaleString('en-IN')} off!`
      );
    } catch {
      toast.error('Failed to validate discount code');
    } finally {
      setValidating(false);
    }
  }, [discountCode, totalPrice, items.length, applyDiscount]);

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountCode('');
    toast.info('Discount removed');
  };

  // Recalculate discount amount when cart changes (in case items were modified)
  const effectiveDiscount = appliedDiscount
    ? appliedDiscount.discountType === 'percentage'
      ? Math.round((totalPrice * appliedDiscount.discountValue) / 100)
      : appliedDiscount.discountValue
    : 0;
  const finalDiscount = Math.min(effectiveDiscount, totalPrice);
  const finalTotal = Math.max(0, totalPrice - finalDiscount);

  const handleProceedToPayment = async () => {
    if (!user) {
      showAuthToast();
      setCartOpen(false);
      navigate('login');
      return;
    }

    setRedirecting(true);

    // Update applied discount with recalculated amount before proceeding
    if (appliedDiscount && finalDiscount !== appliedDiscount.discountAmount) {
      applyDiscount({ ...appliedDiscount, discountAmount: finalDiscount });
    }

    const defaultRedirectUrl = getPaymenterRedirectUrl(items, {
      discountCode: appliedDiscount?.code,
      userEmail: user.email || undefined,
    });

    try {
      // Record order in CoreMMC backend for user's order history
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || '',
          items,
          totalAmount: finalTotal,
          discountCode: appliedDiscount?.code || '',
          discountAmount: finalDiscount,
        }),
      });

      const data = await res.json();
      const redirectUrl = data.redirectUrl || defaultRedirectUrl;

      toast.success('Redirecting to CoreMMC Billing Panel...', { duration: 3000 });
      clearCart();
      setCartOpen(false);
      window.location.href = redirectUrl;
    } catch (e) {
      console.warn('API checkout order creation warning, redirecting directly:', e);
      toast.success('Redirecting to CoreMMC Billing Panel...', { duration: 3000 });
      clearCart();
      setCartOpen(false);
      window.location.href = defaultRedirectUrl;
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-[420px] max-w-[90vw] bg-[#12121a]/95 backdrop-blur-xl border-white/[0.06] p-0 flex flex-col [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="p-5 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-white text-lg font-semibold">
                Shopping Cart
              </SheetTitle>
              {totalItems > 0 && (
                <Badge className="bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30 hover:bg-[#6366f1]/30 text-xs font-medium px-2 py-0.5 rounded-full">
                  {totalItems}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(false)}
              className="min-h-[44px] min-w-[44px] text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Cart Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <ShoppingBag className="h-9 w-9 text-zinc-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center"
            >
              <p className="text-zinc-300 font-medium text-base">
                Your cart is empty
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Browse our plans and add services to get started
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                onClick={() => {
                  setCartOpen(false);
                  navigate('home');
                }}
                className="min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/[0.06] px-6 font-medium text-sm gap-2"
              >
                Browse Plans
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Scrollable Items */}
            <ScrollArea className="flex-1 px-4 pt-4" style={{ maxHeight: 'calc(100vh - 370px)' }}>
              <div className="flex flex-col gap-3 pb-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.planId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {item.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-1.5 text-[11px] font-medium px-2 py-0 rounded-full border-white/[0.08] text-zinc-400 bg-white/[0.02]"
                          >
                            {item.categoryName}
                          </Badge>
                          <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-white font-semibold text-base">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-zinc-500 text-xs line-through">
                                {formatPrice(item.originalPrice * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Remove button */}
                        <button
                          onClick={() => removeFromCart(item.planId)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.planId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[40px] text-center text-white text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.planId, item.quantity + 1)
                          }
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="ml-2 text-zinc-500 text-xs">
                          {item.selectedDuration}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="shrink-0 px-5 pb-5 pt-3 space-y-3">
              {/* Discount Code Input */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <TicketCheck className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-400 font-mono truncate">
                          {appliedDiscount.code}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {appliedDiscount.discountType === 'percentage'
                            ? `${appliedDiscount.discountValue}% off`
                            : `Flat ₹${appliedDiscount.discountValue.toLocaleString('en-IN')} off`}
                          {appliedDiscount.description ? ` — ${appliedDiscount.description}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="min-h-[36px] min-w-[36px] shrink-0 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label="Remove discount"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                        placeholder="Discount code"
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 pl-9 pr-3 h-10 rounded-lg text-sm font-mono"
                        disabled={validating}
                      />
                    </div>
                    <Button
                      onClick={handleApplyDiscount}
                      disabled={validating || !discountCode.trim()}
                      className="h-10 px-4 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white border border-white/[0.08] font-medium text-sm gap-1.5 shrink-0 disabled:opacity-40"
                    >
                      {validating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TicketCheck className="h-4 w-4" />
                      )}
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Price Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Subtotal</span>
                  <span className="text-white text-sm font-medium">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                {appliedDiscount && finalDiscount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-emerald-400 text-sm flex items-center gap-1.5">
                      <TicketCheck className="h-3.5 w-3.5" />
                      Discount ({appliedDiscount.code})
                    </span>
                    <span className="text-emerald-400 text-sm font-medium">
                      -₹{finalDiscount.toLocaleString('en-IN')}
                    </span>
                  </motion.div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-300 text-sm font-semibold">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={redirecting}
                className="w-full h-12 rounded-full bg-[#6366f1] hover:bg-[#5558e6] text-white font-semibold text-base transition-all gap-2 shadow-lg shadow-[#6366f1]/25 hover:shadow-[#6366f1]/40"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirecting to Billing Panel...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Proceed to Payment
                    <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;