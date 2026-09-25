'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
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
import { formatPrice } from '@/data/products';
import { useSiteData } from '@/contexts/site-data-context';
import { useAppStore } from '@/store/use-app-store';
import { Skeleton } from '@/components/ui/skeleton';

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

export function CategoriesSection() {
  const navigate = useAppStore((s) => s.navigate);
  const { categories, products, loading } = useSiteData();

  const categoryPricing = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of categories) {
      const catProducts = products.filter(
        (p) => p.categoryId === cat.id && p.isActive
      );
      if (catProducts.length > 0) {
        map[cat.id] = Math.min(...catProducts.map((p) => p.price));
      }
    }
    return map;
  }, [categories, products]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  if (loading) {
    return (
      <section id="services" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[#6366f1]/[0.04] blur-[120px] animate-float-1 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 max-w-[100vw] rounded-full bg-[#a855f7]/[0.03] blur-[140px] animate-float-2 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-14 md:mb-20">
            <Skeleton className="h-6 w-32 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-10 md:h-14 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 md:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Skeleton className="w-10 h-10 rounded-lg mb-3" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <section id="services" className="relative py-20 md:py-28 overflow-hidden">
      {/* Animated ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[#6366f1]/[0.04] blur-[120px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 max-w-[100vw] rounded-full bg-[#a855f7]/[0.03] blur-[140px] animate-float-2 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
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
            <Sparkles className="size-3.5 text-[#6366f1]" />
            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">What we offer</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Our <span className="gradient-text-animated">Services</span>
          </h2>
          <p className="mt-4 text-white/40 text-base md:text-lg max-w-md mx-auto">
            Everything you need to power your projects
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {sortedCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || DomainIcon;
            const startingPrice = categoryPricing[category.id];

            return (
              <motion.a
                key={category.id}
                href={`/${category.slug}`}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { duration: 0.25 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); navigate('category', category.slug); }}
                className="cat-card-anim group relative text-left p-4 md:p-5 rounded-xl cursor-pointer border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
                style={{
                  ['--cat-color' as string]: category.color,
                }}
              >
                {/* Animated glow on hover — pseudo via box-shadow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 1px 0 ${category.color}20, 0 0 30px ${category.color}10, 0 0 60px ${category.color}05`,
                  }}
                />

                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${category.color}60, transparent)`,
                  }}
                />

                <div className="relative">
                  <div
                    className="mb-3 p-2.5 rounded-lg w-fit transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: category.color + '15' }}
                  >
                    <IconComponent
                      className="size-5 transition-colors duration-300"
                      style={{ color: category.color }}
                    />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-white/90 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/50 line-clamp-2">
                    {category.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    {startingPrice != null && (
                      <span className="text-xs font-medium text-white/50">
                        Starting {formatPrice(startingPrice)}
                      </span>
                    )}
                    <ArrowRight className="size-3.5 text-white/20 group-hover:text-white/70 group-hover:translate-x-1.5 transition-all duration-300" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}