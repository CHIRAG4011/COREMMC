'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  Zap,
  Headphones,
  Server,
  ArrowRight,
  Check,
  Search,
  ChevronDown,
  Timer,
  Tag,
  MapPin,
  ShoppingCart,

} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatPrice,
  getDiscountPercent,
  SPEC_LABELS,
  getOrderedSpecs,
  faqs,
} from '@/data/products';
import { useSiteData, type SiteProduct, type SiteCategory } from '@/contexts/site-data-context';
import { useAppStore } from '@/store/use-app-store';
import { useCartStore } from '@/store/use-cart-store';
import { useAuth } from '@/components/coremmc/auth-provider';
import { toast } from 'sonner';
import { useCartFly } from '@/hooks/use-cart-fly';
import { playCartSound, playBuySound } from '@/lib/sounds';
import { TiltCard } from '@/components/ui/tilt-card';

// ─── Icon Mapping ───────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
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
};

function getIcon(name: string): React.ElementType {
  return iconMap[name] || DomainIcon;
}

// ─── Countdown Timer Hook ───────────────────────────────────────
function useCountdown(targetDate: Date) {
  const calc = useCallback(() => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

// ─── Buy Now helper ────────────────────────────────────────────
function buyNowSingleProduct(
  userId: string,
  userEmail: string,
  userName: string,
  item: { planId: string; name: string; categoryName: string; categoryId: string; price: number; originalPrice: number | null; currency: string; selectedDuration: string },
) {
  // Don't create order yet - show payment view with item data
  const { showPaymentView } = useAppStore.getState();
  showPaymentView({
    amount: item.price,
    orderId: '',
    items: [{ name: item.name, price: item.price, quantity: 1, categoryName: item.categoryName }],
    cartItems: [{ ...item, quantity: 1 }],
  });
}

// ─── Category-specific FAQs ─────────────────────────────────────
function getCategoryFaqs(slug: string) {
  const categoryFaqsMap: Record<string, typeof faqs> = {
    'domain-hosting': [
      { question: 'How long does domain registration take?', answer: 'Domain registration is instant after payment confirmation. DNS propagation may take up to 24-48 hours globally.' },
      { question: 'Do I get WHOIS privacy protection?', answer: 'Yes, all domains registered through CoreMMC include free WHOIS privacy protection to keep your personal information safe.' },
      { question: 'Can I transfer my existing domain to CoreMMC?', answer: 'Yes! Contact our support team on Discord and we\'ll guide you through the domain transfer process step by step.' },
      { question: 'What payment methods do you accept for domains?', answer: 'We accept UPI, bank transfer, and other popular Indian payment methods. Contact us on Discord for payment details.' },
      { question: 'Do you offer free subdomains?', answer: 'Yes, we offer free subdomains with all hosting plans. You can create custom subdomains from your control panel.' },
    ],
    'minecraft-intel': [
      { question: 'What CPU do you use for Intel Minecraft servers?', answer: 'We use high-performance Intel Xeon processors with DDR4 RAM and NVMe SSD storage for optimal Minecraft performance.' },
      { question: 'How quickly is my server set up?', answer: 'All Minecraft Intel servers are set up instantly after payment. You\'ll receive your server credentials within minutes.' },
      { question: 'Can I install mods on my server?', answer: 'Absolutely! You have full access to install any Forge, Fabric, or Spigot mods. Our panel makes it easy to manage mods.' },
      { question: 'Do you offer DDoS protection?', answer: 'Yes! All plans include CoreMMCNodes protection at no additional cost, keeping your server online 24/7.' },
      { question: 'Can I upgrade my plan later?', answer: 'Yes, you can upgrade anytime. Contact our support team on Discord and we\'ll handle the migration seamlessly.' },
    ],
    'minecraft-amd': [
      { question: 'What AMD processors do you use?', answer: 'We use AMD EPYC and Ryzen processors known for their exceptional multi-threading performance, perfect for Minecraft.' },
      { question: 'Are AMD servers good for modded Minecraft?', answer: 'AMD servers excel at modded Minecraft due to their high core counts. They\'re ideal for large modpacks and big communities.' },
      { question: 'How quickly is my server set up?', answer: 'All servers are set up instantly after payment confirmation. You\'ll have access within minutes.' },
      { question: 'Do you offer DDoS protection?', answer: 'Yes! All plans include CoreMMCNodes protection at no additional cost. Your servers are protected 24/7.' },
      { question: 'Can I upgrade my plan later?', answer: 'Absolutely! You can upgrade your plan at any time. Contact our support team on Discord.' },
    ],
    'discord-bot-hosting': [
      { question: 'What languages are supported for bot hosting?', answer: 'We support Python, JavaScript (Node.js), Java, Go, and many more. You get full SSH access to your environment.' },
      { question: 'Will my bot stay online 24/7?', answer: 'Yes! All our bot hosting plans guarantee 24/7 uptime. Your bot will stay online as long as you maintain an active subscription.' },
      { question: 'Do I get SSH access?', answer: 'Yes, all plans include full SSH access so you can install any dependencies and manage your bot\'s environment.' },
      { question: 'Can I host multiple bots on one plan?', answer: 'Yes, if your plan\'s resources allow it. You can run multiple bot processes within your allocated RAM and CPU.' },
      { question: 'Do you offer DDoS protection?', answer: 'Yes! All bot hosting plans include CoreMMCNodes protection at no additional cost.' },
    ],
  };

  return categoryFaqsMap[slug] || [
    { question: 'What locations are your servers in?', answer: 'All our servers are located in India (Mumbai) data centers, ensuring the lowest latency for Indian users.' },
    { question: 'What payment methods do you accept?', answer: 'We accept UPI, bank transfer, and other popular Indian payment methods. Contact us on Discord for payment details.' },
    { question: 'How quickly is my server set up?', answer: 'All servers are set up instantly after payment confirmation. You\'ll receive your server credentials within minutes.' },
    { question: 'Do you offer DDoS protection?', answer: 'Yes! All our hosting plans include CoreMMCNodes protection at no additional cost. Your servers are protected 24/7.' },
    { question: 'Can I upgrade my plan later?', answer: 'Absolutely! You can upgrade your plan at any time. Contact our support team on Discord and we\'ll handle the migration seamlessly.' },
  ];
}

// ─── Sort Type ───────────────────────────────────────────────────
type SortType = 'price-asc' | 'price-desc' | 'name-asc';

// ─── Category View Component ────────────────────────────────────
export function CategoryView() {
  const categorySlug = useAppStore((s) => s.categorySlug);
  const navigate = useAppStore((s) => s.navigate);
  const showAuthToast = useAppStore((s) => s.showAuthToast);
  const addToCart = useCartStore((s) => s.addToCart);
  const { user } = useAuth();
  const { startFly } = useCartFly();

  const { categories, getCategoryBySlug, getProductsByCategory, products: siteProducts, loading: siteDataLoading } = useSiteData();

  const category = useMemo(
    () => getCategoryBySlug(categorySlug || ''),
    [getCategoryBySlug, categorySlug]
  );

  const [sortType, setSortType] = useState<SortType>('price-asc');
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [faqSearch, setFaqSearch] = useState('');
  const [promoSettings, setPromoSettings] = useState<{
    enabled: boolean;
    text: string;
    subtext: string;
    discount: string;
    endDate: string;
    padding: string;
  }>({ enabled: false, text: '', subtext: '', discount: '30', endDate: '', padding: 'py-6 md:py-8' });

  // Fetch promo settings
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.promo) {
          setPromoSettings(data.promo);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const promoCountdownTarget = useMemo(() => {
    if (promoSettings.enabled && promoSettings.endDate) {
      const target = new Date(promoSettings.endDate);
      if (target.getTime() > Date.now()) return target;
    }
    // Fallback: 7 days from now if no admin date or date passed
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }, [promoSettings.enabled, promoSettings.endDate]);

  const countdown = useCountdown(promoCountdownTarget);

  const categoryProducts = useMemo(() => {
    if (!categorySlug) return [];
    return getProductsByCategory(categorySlug);
  }, [categorySlug, getProductsByCategory]);

  const sortedProducts = useMemo(() => {
    const sorted = [...categoryProducts];
    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [categoryProducts, sortType]);

  const planCount = useMemo(() => {
    return categoryProducts.length;
  }, [categoryProducts.length]);

  const startingPrice = useMemo(() => {
    if (categoryProducts.length === 0) return 0;
    return Math.min(...categoryProducts.map((p) => p.price));
  }, [categoryProducts]);

  const toggleCompare = useCallback((planId: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else if (next.size < 6) {
        next.add(planId);
      }
      return next;
    });
  }, []);

  const selectedCompareProducts = useMemo(
    () => categoryProducts.filter((p) => compareIds.has(p.planId)),
    [categoryProducts, compareIds]
  );

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedCompareProducts.forEach((p) =>
      Object.keys(p.specs).forEach((k) => keys.add(k))
    );
    return Array.from(keys);
  }, [selectedCompareProducts]);

  const categoryFaqs = useMemo(
    () => getCategoryFaqs(categorySlug || ''),
    [categorySlug]
  );

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return categoryFaqs;
    const q = faqSearch.toLowerCase();
    return categoryFaqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [categoryFaqs, faqSearch]);

  const relatedCategories = useMemo(() => {
    if (!category) return categories.slice(0, 6);
    return categories
      .filter((c) => c.id !== category.id)
      .sort((a, b) => a.order - b.order)
      .slice(0, 6);
  }, [category, categories]);

  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ─── Loading State ──────────────────────────────────────────
  if (siteDataLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero skeleton */}
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-white/5 mx-auto" />
            <div className="h-10 w-64 bg-white/5 rounded-lg mx-auto" />
            <div className="h-5 w-96 max-w-full bg-white/5 rounded-lg mx-auto" />
            <div className="flex gap-4 justify-center">
              <div className="h-10 w-32 bg-white/5 rounded-lg" />
              <div className="h-10 w-32 bg-white/5 rounded-lg" />
            </div>
            <div className="h-12 w-40 bg-white/5 rounded-xl mx-auto" />
          </div>
        </section>
        {/* Pricing grid skeleton */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 space-y-3 animate-pulse">
              <div className="h-10 w-48 bg-white/5 rounded-lg mx-auto" />
              <div className="h-5 w-72 bg-white/5 rounded-lg mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="h-5 w-24 bg-white/5 rounded" />
                  <div className="h-8 w-20 bg-white/5 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                  </div>
                  <div className="h-11 w-full bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Category Not Found
          </h1>
          <Button variant="outline" onClick={() => navigate('home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const HeroIcon = iconMap[category.icon] || Server;

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${category.color}10 0%, transparent 60%), #0a0a0f`,
        }}
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{ backgroundColor: category.color + '15' }}
            >
              <HeroIcon
                className="w-10 h-10"
                style={{ color: category.color }}
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              <span
                className="gradient-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${category.color}, ${category.color}88, #a855f7)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {category.name}
              </span>
            </h1>

            <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              {category.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                <Server className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/60">
                  <strong className="text-white">
                    {planCount}
                  </strong>{' '}
                  Plans Available
                </span>
              </div>
              <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
                <Tag className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/60">
                  Starting at{' '}
                  <strong className="text-white">
                    {formatPrice(startingPrice)}
                  </strong>
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={scrollToPricing}
              className="rounded-xl font-semibold h-12 px-8 text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: category.color,
                boxShadow: `0 0 24px ${category.color}40`,
              }}
            >
              See Plans
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Banner / Promo Section ────────────────────────────── */}
      {promoSettings.enabled && (
      <section className="relative overflow-hidden">
        <div
          className={promoSettings.padding || 'py-6 md:py-8'}
          style={{
            backgroundColor: category.color + '0d',
            borderTop: `1px solid ${category.color}15`,
            borderBottom: `1px solid ${category.color}15`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Timer
                  className="w-5 h-5"
                  style={{ color: category.color }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {promoSettings.text
                    ? promoSettings.text.replace('{discount}', promoSettings.discount)
                    : <>⚡ Limited Time Offer — Save up to <span style={{ color: category.color }}>{promoSettings.discount}% OFF</span></>
                  }
                </p>
                <p className="text-xs text-white/40">
                  {promoSettings.subtext || "Don't miss out on our biggest sale of the year"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {[
                  { val: countdown.days, label: 'D' },
                  { val: countdown.hours, label: 'H' },
                  { val: countdown.minutes, label: 'M' },
                  { val: countdown.seconds, label: 'S' },
                ].map((unit) => (
                  <div key={unit.label} className="text-center">
                    <div
                      className="glass px-2.5 py-1.5 rounded-lg min-w-[42px]"
                      style={{
                        borderColor: category.color + '20',
                      }}
                    >
                      <span
                        className="text-base md:text-lg font-bold font-mono"
                        style={{ color: category.color }}
                      >
                        {String(unit.val).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 mt-0.5 block">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── Pricing Section ───────────────────────────────────── */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Choose Your{' '}
              <span
                className="gradient-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${category.color}, ${category.color}88, #a855f7)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Plan
              </span>
            </h2>
            <p className="mt-3 text-white/50 text-lg">
              Select the perfect plan for your needs
            </p>
          </motion.div>

          {sortedProducts.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: category.color + '15' }}
              >
                <Server
                  className="w-8 h-8"
                  style={{ color: category.color }}
                />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Plans Available
              </h3>
              <p className="text-sm text-white/40">
                There are currently no plans available for this category. Please check back later or contact us on Discord.
              </p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
              >
                <p className="text-sm text-white/40">
                  Showing {sortedProducts.length} plan
                  {sortedProducts.length !== 1 ? 's' : ''}
                </p>
                <Select
                  value={sortType}
                  onValueChange={(v) => setSortType(v as SortType)}
                >
                  <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white text-sm h-10 rounded-lg">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="price-asc">Price: Low → High</SelectItem>
                    <SelectItem value="price-desc">Price: High → Low</SelectItem>
                    <SelectItem value="name-asc">Name: A → Z</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {sortedProducts.map((product, index) => (
                  <PricingCard
                    key={product.planId}
                    product={product}
                    category={category}
                    index={index}
                    isCompared={compareIds.has(product.planId)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Advantages Section ────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#12121a]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Why Choose CoreMMC{' '}
              <span
                className="gradient-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${category.color}, ${category.color}88, #a855f7)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {category.name}
              </span>
            </h2>
            <p className="mt-3 text-white/50 text-lg">
              Industry-leading features included with every plan
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'DDoS Protection',
                desc: 'Enterprise-grade CoreMMCNodes protection keeps your services online and safe from attacks 24/7.',
              },
              {
                icon: Clock,
                title: '99.9% Uptime',
                desc: 'Our infrastructure guarantees near-perfect uptime with redundant systems and automatic failover.',
              },
              {
                icon: Zap,
                title: 'Instant Setup',
                desc: 'Get started in minutes. All services are deployed automatically after payment confirmation.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Our expert support team is available around the clock via Discord to help you with any issue.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 group"
                style={{
                  ['--cat-color' as string]: category.color,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: category.color + '15' }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: category.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan Comparison Section ───────────────────────────── */}
      {categoryProducts.length > 1 && (
        <section id="compare" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Compare{' '}
                <span className="gradient-text">Plans</span>
              </h2>
              <p className="mt-3 text-white/50 text-lg">
                Select 2–6 plans above to compare them side by side
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {selectedCompareProducts.length < 2 ? (
                <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: category.color + '15' }}
                  >
                    <Server
                      className="w-8 h-8"
                      style={{ color: category.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Plans Selected
                  </h3>
                  <p className="text-sm text-white/40">
                    Check the &quot;Compare&quot; checkbox on 2 or more
                    pricing cards above to see a detailed comparison.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl glass">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-white/50 border-b border-white/5 min-w-[140px]">
                          Feature
                        </th>
                        {selectedCompareProducts.map((p) => (
                          <th
                            key={p.planId}
                            className="p-4 text-center border-b border-white/5"
                          >
                            <div className="text-sm font-bold text-white">
                              {p.name}
                            </div>
                            <div className="text-lg font-bold mt-1 gradient-text">
                              ₹{p.price.toLocaleString('en-IN')}
                              <span className="text-xs text-white/40 font-normal">
                                /mo
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allSpecKeys.map((specKey) => {
                        const values = selectedCompareProducts.map(
                          (p) => p.specs[specKey] || '—'
                        );
                        // Find best value (simple heuristic: longest numeric value or first non-dash)
                        const numericValues = values.map((v) => {
                          const num = parseFloat(v.replace(/[^0-9.]/g, ''));
                          return isNaN(num) ? -1 : num;
                        });
                        const maxVal = Math.max(...numericValues);
                        const hasNumeric = numericValues.some((v) => v > 0);

                        return (
                          <tr key={specKey} className="border-b border-white/5 last:border-0">
                            <td className="p-4 text-sm text-white/60 capitalize">
                              {specKey.replace(/_/g, ' ')}
                            </td>
                            {values.map((val, idx) => {
                              const isBest =
                                hasNumeric &&
                                numericValues[idx] === maxVal &&
                                maxVal > 0;
                              return (
                                <td
                                  key={idx}
                                  className="p-4 text-center text-sm"
                                >
                                  <span
                                    className={
                                      isBest
                                        ? 'text-[#10b981] font-semibold'
                                        : 'text-white/70'
                                    }
                                  >
                                    {val}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* Features row */}
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-sm text-white/60">
                          Features
                        </td>
                        {selectedCompareProducts.map((p) => (
                          <td key={p.planId} className="p-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {p.features.map((f) => (
                                <span
                                  key={f}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Support row */}
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-sm text-white/60">
                          Support
                        </td>
                        {selectedCompareProducts.map((p) => (
                          <td
                            key={p.planId}
                            className="p-4 text-center text-sm text-white/70"
                          >
                            {p.support}
                          </td>
                        ))}
                      </tr>
                      {/* Buy row */}
                      <tr>
                        <td />
                        {selectedCompareProducts.map((p) => (
                          <td key={p.planId} className="p-4 text-center">
                            <div className="flex flex-col gap-1.5">
                              <Button
                                size="sm"
                                className="rounded-lg font-semibold text-xs h-9 px-4"
                                style={{
                                  backgroundColor: category.color,
                                  boxShadow: `0 0 16px ${category.color}30`,
                                }}
                                onClick={(e) => {
                                  if (!user) {
                                    showAuthToast();
                                    navigate('login');
                                    return;
                                  }
                                  addToCart({
                                    planId: p.planId,
                                    name: p.name,
                                    categoryName: p.categoryName,
                                    categoryId: p.categoryId,
                                    price: p.price,
                                    originalPrice: p.originalPrice,
                                    currency: 'INR',
                                    selectedDuration: p.setup || 'monthly',
                                  });
                                  playCartSound();
                                  startFly(e, p.name);
                                }}
                              >
                                <ShoppingCart className="size-3.5 mr-1.5" />
                                Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg text-xs h-8 px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20"
                                onClick={async () => {
                                  if (!user) {
                                    showAuthToast();
                                    navigate('login');
                                    return;
                                  }
                                  playBuySound();
                                  try {
                                    await buyNowSingleProduct(user.uid, user.email || '', user.displayName || '', {
                                      planId: p.planId,
                                      name: p.name,
                                      categoryName: p.categoryName,
                                      categoryId: p.categoryId,
                                      price: p.price,
                                      originalPrice: p.originalPrice,
                                      currency: 'INR',
                                      selectedDuration: p.setup || 'monthly',
                                    });
                                  } catch { /* silent */ }
                                }}
                              >
                                <Zap className="size-3 mr-1.5" />
                                Buy Now
                              </Button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── FAQ Section ───────────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-24 bg-[#12121a]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Frequently Asked{' '}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="mt-3 text-white/50 text-lg">
              Common questions about {category.name}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
              <Input
                placeholder="Search questions..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus-visible:border-[#6366f1]/50 focus-visible:ring-[#6366f1]/20"
              />
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/40">
                  No questions match your search.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={`cat-faq-${index}`}
                      className="glass rounded-xl px-5 border-0 data-[state=open]:bg-white/[0.04]"
                    >
                      <AccordionTrigger className="text-sm md:text-base font-medium text-white/90 hover:no-underline hover:text-white py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-white/50 leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Related Products Section ──────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Explore More{' '}
              <span className="gradient-text">Services</span>
            </h2>
            <p className="mt-3 text-white/50 text-lg">
              Discover what else CoreMMC has to offer
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {relatedCategories.map((cat, index) => {
              const RelIcon = getIcon(cat.icon);
              const catProducts = siteProducts.filter(
                (p) => p.categoryId === cat.id && p.isActive
              );
              const minPrice =
                catProducts.length > 0
                  ? Math.min(...catProducts.map((p) => p.price))
                  : null;

              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.04,
                    ease: 'easeOut',
                  }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('category', cat.slug)}
                  className="group glass glass-hover text-left p-4 md:p-5 rounded-xl cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      cat.color + '40';
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.boxShadow = `0 0 20px ${cat.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.borderColor = '';
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.boxShadow = '';
                  }}
                >
                  <div
                    className="mb-3 p-2.5 rounded-lg w-fit"
                    style={{ backgroundColor: cat.color + '15' }}
                  >
                    <RelIcon
                      className="size-5"
                      style={{ color: cat.color }}
                    />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-white/90 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">
                    {cat.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    {minPrice != null && (
                      <span className="text-xs font-medium text-white/50">
                        Starting {formatPrice(minPrice)}
                      </span>
                    )}
                    <ArrowRight className="size-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Pricing Card ───────────────────────────────────────────────
function PricingCard({
  product,
  category,
  index,
  isCompared,
  onToggleCompare,
}: {
  product: SiteProduct;
  category: SiteCategory;
  index: number;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const discount = getDiscountPercent(product.originalPrice, product.price);

  const { user } = useAuth();
  const showAuthToast = useAppStore((s) => s.showAuthToast);
  const navigate = useAppStore((s) => s.navigate);
  const addToCart = useCartStore((s) => s.addToCart);
  const { startFly } = useCartFly();

  const handleBuyClick = (event?: React.MouseEvent) => {
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
      currency: 'INR',
      selectedDuration: product.setup || 'monthly',
    });
    playCartSound();
    startFly(event!, product.name);
  };

  return (
    <TiltCard className="relative rounded-b-2xl">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`relative glass rounded-b-2xl p-5 md:p-6 pt-0 transition-all duration-300 hover:-translate-y-1 ${
        product.isPopular ? '' : ''
      }`}
      style={{
        borderColor: product.isPopular ? category.color + '50' : undefined,
        boxShadow: product.isPopular
          ? `0 0 30px ${category.color}15, inset 0 0 30px ${category.color}05`
          : undefined,
      }}
    >


      {/* Badge */}
      {product.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge
            className="text-white border-0 px-3 py-1 text-[10px] font-semibold"
            style={{ backgroundColor: category.color }}
          >
            {product.badge}
          </Badge>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-lg font-bold text-white mt-1">{product.name}</h3>

      {/* Pricing */}
      <div className="my-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          {product.originalPrice && (
            <span className="text-sm text-white/30 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {discount && (
            <span className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span
            className="text-3xl md:text-4xl font-bold"
            style={{
              backgroundImage: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-white/40 text-sm">/mo</span>
        </div>
      </div>

      {/* Specs */}
      <div className="space-y-2 mb-4">
        {getOrderedSpecs(product.specs).map(([key, value]) => {
          const label = SPEC_LABELS[key] || key;
          return (
            <div key={key} className="flex items-center gap-2.5 text-sm">
              <div className="p-0.5 rounded-full bg-[#10b981]/10">
                <Check className="size-3 text-[#10b981]" />
              </div>
              <span className="text-white/35 text-xs uppercase tracking-wider">{label}</span>
              <span className="text-white/80 font-medium">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Features */}
      {product.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.features.map((f) => (
            <span
              key={f}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Support + Location */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Badge
          variant="outline"
          className="text-[10px] border-white/10 text-white/50"
        >
          <Headphones className="size-3 mr-1" />
          {product.support}
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] border-white/10 text-white/50"
        >
          <MapPin className="size-3 mr-1" />
          {product.location}
        </Badge>
      </div>

      {/* Buy Button */}
      <Button
        className="w-full h-11 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5"
        style={{
          backgroundColor: category.color,
          boxShadow: `0 0 20px ${category.color}30`,
        }}
        onClick={(e) => handleBuyClick(e)}
      >
        <ShoppingCart className="size-4 mr-2" />
        Add to Cart
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-lg text-xs h-8 px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 mt-1.5 w-full"
        onClick={async () => {
          if (!user) { showAuthToast(); navigate('login'); return; }
          playBuySound();
          try {
            await buyNowSingleProduct(user.uid, user.email || '', user.displayName || '', {
              planId: product.planId,
              name: product.name,
              categoryName: product.categoryName,
              categoryId: product.categoryId,
              price: product.price,
              originalPrice: product.originalPrice,
              currency: 'INR',
              selectedDuration: product.setup || 'monthly',
            });
          } catch { /* silent */ }
        }}
      >
        <Zap className="size-3 mr-1.5" />
        Buy Now
      </Button>

      {/* Compare */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Checkbox
          id={`cat-compare-${product.planId}`}
          checked={isCompared}
          onCheckedChange={() => onToggleCompare(product.planId)}
          className="data-[state=checked]:bg-white/20 data-[state=checked]:border-white/30"
        />
        <label
          htmlFor={`cat-compare-${product.planId}`}
          className="text-xs text-white/40 cursor-pointer select-none"
        >
          Add to compare
        </label>
      </div>
    </motion.div>
    </TiltCard>
  );
}