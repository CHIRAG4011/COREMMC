'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Copy, Check, Clock, Users, X, Sparkles, Percent, IndianRupee, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/use-cart-store';
import { toast } from 'sonner';

interface PromoDiscount {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  endDate: string;
}

function getTimeLeft(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export function PromoBanner() {
  const [promo, setPromo] = useState<PromoDiscount | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { appliedDiscount, applyDiscount, removeDiscount, items, getTotalPrice } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/discounts/promo');
        const data = await res.json();
        if (!cancelled && data.discount) {
          setPromo(data.discount);
        }
      } catch { /* silent */ }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!promo?.endDate) return;
    const update = () => setTimeLeft(getTimeLeft(promo.endDate));
    update();
    timerRef.current = setInterval(update, 60000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [promo?.endDate]);

  const handleCopy = async () => {
    if (!promo) return;
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      toast.success(`Code "${promo.code}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleApplyCode = () => {
    if (!promo) return;
    if (appliedDiscount?.code === promo.code) {
      // Already applied — remove it
      removeDiscount();
      toast.info('Discount removed');
      return;
    }

    // Validate and apply
    const totalPrice = getTotalPrice();
    if (items.length === 0 || totalPrice === 0) {
      toast.error('Add items to cart first');
      return;
    }

    fetch('/api/discounts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promo.code, orderAmount: totalPrice }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
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
        } else {
          toast.error(data.error || 'Invalid code');
        }
      })
      .catch(() => {
        toast.error('Failed to validate code');
      });
  };

  const isAlreadyApplied = appliedDiscount?.code === promo?.code;

  if (!promo || dismissed) return null;

  const isLimitedTime = !!promo.endDate;
  const isLimitedUsers = promo.maxUses > 0;
  const remainingUses = promo.maxUses > 0 ? promo.maxUses - promo.usedCount : 0;
  const isExhausted = isLimitedUsers && remainingUses <= 0;
  const isExpired = isLimitedTime && timeLeft === 'Expired';

  if (isExhausted || isExpired) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-[#6366f1]/10 via-[#a855f7]/10 to-[#6366f1]/10 border-y border-[#6366f1]/20">
            {/* Animated gradient shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6366f1]/5 to-transparent animate-shimmer" />

            <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Left: icon + text */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/15 border border-[#6366f1]/25">
                    <Sparkles className="h-4 w-4 text-[#6366f1]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {promo.description || 'Limited Time Offer!'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {/* Discount value badge */}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        {promo.discountType === 'percentage' ? (
                          <><Percent className="h-3 w-3" /> {promo.discountValue}% OFF</>
                        ) : (
                          <><IndianRupee className="h-3 w-3" /> {promo.discountValue} OFF</>
                        )}
                      </span>

                      {/* Time left */}
                      {isLimitedTime && timeLeft && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400/80">
                          <Clock className="h-3 w-3" /> {timeLeft}
                        </span>
                      )}

                      {/* Limited users */}
                      {isLimitedUsers && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/40">
                          <Users className="h-3 w-3" /> {remainingUses} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: code + buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Coupon code display */}
                  <div className="flex items-center gap-2 bg-black/30 border border-dashed border-[#6366f1]/40 rounded-lg px-3 py-2">
                    <Tag className="h-3.5 w-3.5 text-[#6366f1]/70" />
                    <span className="text-sm font-mono font-bold text-[#6366f1] tracking-wider">
                      {promo.code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="ml-1 text-white/30 hover:text-white/70 transition-colors"
                      aria-label="Copy coupon code"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Apply button */}
                  <Button
                    size="sm"
                    onClick={handleApplyCode}
                    className={
                      isAlreadyApplied
                        ? 'bg-white/10 hover:bg-white/15 text-white/70 border border-white/10 h-9 text-xs gap-1.5'
                        : 'bg-[#6366f1] hover:bg-[#5558e0] text-white h-9 text-xs gap-1.5 shadow-lg shadow-[#6366f1]/20'
                    }
                  >
                    {isAlreadyApplied ? (
                      <><Check className="h-3.5 w-3.5" /> Applied</>
                    ) : (
                      <><ShoppingCart className="h-3.5 w-3.5" /> Apply</>
                    )}
                  </Button>

                  {/* Dismiss */}
                  <button
                    onClick={() => setDismissed(true)}
                    className="text-white/20 hover:text-white/50 transition-colors p-1"
                    aria-label="Dismiss promo banner"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}