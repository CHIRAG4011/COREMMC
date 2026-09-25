'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, Zap, Cpu, MemoryStick, HardDrive, Network, Globe, Shield, Mail, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatPrice,
  getDiscountPercent,
  SPEC_LABELS,
  getOrderedSpecs,
} from '@/data/products';
import { useSiteData } from '@/contexts/site-data-context';
import { useAppStore } from '@/store/use-app-store';
import { useCartStore } from '@/store/use-cart-store';
import { useAuth } from '@/components/coremmc/auth-provider';
import { useCartFly } from '@/hooks/use-cart-fly';
import { playCartSound, playBuySound } from '@/lib/sounds';
import { TiltCard } from '@/components/ui/tilt-card';
import { toast } from 'sonner';
import { getPaymenterRedirectUrl } from '@/lib/paymenter';

const specIconMap: Record<string, React.ElementType> = {
  ram: MemoryStick,
  cpu: Cpu,
  storage: HardDrive,
  ports: Network,
  network: Network,
  websites: Globe,
  ssl: Shield,
  email: Mail,
  databases: Database,
  bandwidth: Network,
};

async function handleBuyNow(
  product: { planId: string; name: string; categoryName: string; categoryId: string; price: number; originalPrice: number | null; currency: string; setup?: string },
  userId: string,
  userEmail: string,
  userName: string,
) {
  const orderRes = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userEmail,
      userName,
      items: [{
        planId: product.planId,
        name: product.name,
        categoryName: product.categoryName,
        categoryId: product.categoryId,
        price: product.price,
        originalPrice: product.originalPrice,
        currency: product.currency,
        quantity: 1,
        selectedDuration: product.setup || 'monthly',
      }],
      totalAmount: product.price,
      currency: 'INR',
    }),
  });

  if (!orderRes.ok) throw new Error('Failed to create order');

  const redirectUrl = getPaymenterRedirectUrl([product], { userEmail: user.email || undefined });
  toast.success('Redirecting to CoreMMC Billing Panel...', { duration: 3000 });
  window.location.href = redirectUrl;
}

export function PopularPlansSection() {
  const navigate = useAppStore((s) => s.navigate);
  const showAuthToast = useAppStore((s) => s.showAuthToast);
  const addToCart = useCartStore((s) => s.addToCart);
  const { user } = useAuth();
  const { startFly } = useCartFly();
  const { getPopularProducts, categories, loading } = useSiteData();

  const popularProducts = useMemo(() => getPopularProducts().slice(0, 3), [getPopularProducts]);
  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color || '#6366f1';
  };

  if (loading) {
    return (
      <section id="popular-plans" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[#6366f1]/8 blur-[100px] animate-float-1 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-[#a855f7]/6 blur-[100px] animate-float-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-[100vw] rounded-full bg-[#6366f1]/[0.03] blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px stat-line-shimmer opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-14 md:mb-20">
            <Skeleton className="h-6 w-40 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-10 md:h-14 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-52 mx-auto" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-20 mb-6" />
                <Skeleton className="h-10 w-24 mb-6" />
                <div className="space-y-3 mb-6">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px stat-line-shimmer opacity-20" />
      </section>
    );
  }

  if (popularProducts.length === 0) {
    return null;
  }

  return (
    <section id="popular-plans" className="relative py-20 md:py-28 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[#6366f1]/8 blur-[100px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-[#a855f7]/6 blur-[100px] animate-float-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-[100vw] rounded-full bg-[#6366f1]/[0.03] blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px stat-line-shimmer opacity-30" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Handpicked for you</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Most <span className="gradient-text-animated">Popular Plans</span>
          </h2>
          <p className="mt-4 text-white/40 text-base md:text-lg max-w-md mx-auto">
            Top picks chosen by thousands of customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {popularProducts.map((product, index) => {
            const discount = getDiscountPercent(
              product.originalPrice,
              product.price
            );
            const isMiddle = index === 1;
            const catColor = getCategoryColor(product.categoryId);

            return (
              <TiltCard key={product.planId} className="relative rounded-2xl p-[1px]">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className={`relative rounded-2xl h-full ${
                    isMiddle
                      ? 'plans-card-featured'
                      : 'plans-card-standard'
                  }`}
              >
                {/* Inner card */}
                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={{
                    background: isMiddle
                      ? 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(18,18,26,0.98) 40%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(18,18,26,0.95) 40%)',
                  }}
                >
                  {isMiddle && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-[#6366f1] text-white border-0 px-4 py-1 text-xs font-semibold shadow-lg shadow-[#6366f1]/30">
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {product.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] border-white/10 text-white/50"
                      >
                        {product.categoryName}
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {product.originalPrice && (
                        <span className="text-sm text-white/50 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {discount && (
                        <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl md:text-4xl font-bold gradient-text">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-white/40 text-sm">/mo</span>
                    </div>
                  </div>

                  {/* Specs — now with labels & fixed order */}
                  <div className="space-y-2 mb-6 flex-1">
                    {getOrderedSpecs(product.specs).map(([key, value]) => {
                      const label = SPEC_LABELS[key] || key;
                      const SpecIcon = specIconMap[key] || Check;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.15 + 0.2 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div
                            className="p-1.5 rounded-lg shrink-0"
                            style={{ backgroundColor: catColor + '15' }}
                          >
                            <SpecIcon className="size-3.5" style={{ color: catColor }} />
                          </div>
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span className="text-white/50 text-xs font-medium uppercase tracking-wider shrink-0">{label}</span>
                            <span className="text-white/80 font-medium truncate">{value}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      className="w-full h-11 rounded-lg font-semibold glow-primary"
                      onClick={(e) => {
                        if (!user) {
                          showAuthToast();
                          navigate('login');
                          return;
                        }
                        addToCart({
                          planId: product.planId,
                          name: product.name,
                          categoryName: product.categoryName,
                          categoryId: product.categoryId,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          currency: product.currency,
                          selectedDuration: product.setup || 'monthly',
                        });
                        playCartSound();
                        startFly(e, product.name);
                      }}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-lg text-sm font-medium border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20"
                      onClick={async () => {
                        if (!user) {
                          showAuthToast();
                          navigate('login');
                          return;
                        }
                        playBuySound();
                        try {
                          await handleBuyNow(
                            product,
                            user.uid,
                            user.email || '',
                            user.displayName || '',
                          );
                        } catch {
                          // Error handled silently
                        }
                      }}
                    >
                      <Zap className="size-3.5 mr-1.5" />
                      Buy Now
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Checkbox id={`compare-${product.planId}`} className="data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]" />
                    <label
                      htmlFor={`compare-${product.planId}`}
                      className="text-xs text-white/40 cursor-pointer select-none"
                    >
                      Add to compare
                    </label>
                  </div>
                </div>
              </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px stat-line-shimmer opacity-20" />
    </section>
  );
}