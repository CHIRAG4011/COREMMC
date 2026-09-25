'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Server, Users, Clock, MapPin, Sparkles, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Server, value: 1000, suffix: '+', label: 'Servers Deployed', desc: 'And growing every day' },
  { icon: Users, value: 5000, suffix: '+', label: 'Happy Customers', desc: 'Trusted by thousands' },
  { icon: Clock, value: 99.9, suffix: '%', label: 'Uptime SLA', desc: 'Near-perfect reliability' },
  { icon: MapPin, value: 2, suffix: '', label: 'Data Centers', desc: 'Strategic India locations' },
];

function useCountUp(
  target: number,
  duration: number = 2500,
  startOnView: boolean = false,
  isViewed: boolean = false
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (startOnView && !isViewed) return;

    let startTime: number | null = null;
    const isDecimal = target % 1 !== 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, startOnView, isViewed]);

  return count;
}

function StatCard({
  stat,
  index,
}: {
  stat: (typeof stats)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useCountUp(stat.value, 2500, true, isInView);
  const isDecimal = stat.value % 1 !== 0;

  const colorSchemes = [
    { from: '#6366f1', to: '#a855f7', glow: 'rgba(99,102,241,0.15)' },
    { from: '#22c55e', to: '#06b6d4', glow: 'rgba(34,197,94,0.15)' },
    { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.15)' },
    { from: '#ec4899', to: '#8b5cf6', glow: 'rgba(236,72,153,0.15)' },
  ];
  const colors = colorSchemes[index % colorSchemes.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      className="stat-card-glow group relative rounded-2xl p-5 md:p-6 text-center cursor-default overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-500"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        animationDelay: `${index * 1}s`,
      }}
    >
      {/* Top shimmer line */}
      <div className="stat-line-shimmer absolute top-0 left-0 right-0 h-px opacity-60" />

      {/* Subtle radial glow behind icon - appears on hover */}
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none"
        style={{ background: colors.glow }}
      />

      {/* Icon - compact size */}
      <div
        className="relative mx-auto mb-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}10)`,
          boxShadow: `inset 0 1px 0 ${colors.from}20`,
        }}
      >
        <stat.icon
          className="size-[18px]"
          style={{
            color: colors.from,
          }}
        />
      </div>

      {/* Value */}
      <div className="relative">
        <span
          className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {isDecimal ? count.toFixed(1) : count.toLocaleString('en-IN')}
          <span className="text-lg md:text-xl">{stat.suffix}</span>
        </span>
      </div>

      {/* Label */}
      <p className="mt-2 text-xs md:text-sm font-semibold text-white/70 tracking-wide">
        {stat.label}
      </p>

      {/* Sub description with trend icon */}
      <div className="mt-1 flex items-center justify-center gap-1">
        <TrendingUp className="size-3 text-emerald-500/60" />
        <span className="text-[11px] text-white/50">
          {stat.desc}
        </span>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className="relative w-full bg-[#12121a] py-16 md:py-20 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Subtle radial glow top-center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] max-w-[100vw] bg-gradient-to-b from-[#6366f1]/5 to-transparent pointer-events-none" />

      {/* Animated border glow container */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-8">
        {/* Outer decorative border with gradient animation */}
        <div className="stat-container-glow rounded-3xl p-[1px]">
          <div className="rounded-3xl bg-[#12121a] p-6 md:p-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 md:mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="size-3.5 text-[#6366f1]" />
                <span className="text-xs font-medium text-white/50">By the Numbers</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Trusted by <span className="gradient-text-animated">Thousands</span>
              </h2>
              <p className="mt-3 text-white/40 text-base md:text-lg max-w-lg mx-auto">
                Real metrics that reflect our commitment to reliability and performance
              </p>
            </motion.div>

            {/* Stats Grid */}
            <ul role="list" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 list-none p-0 m-0">
              {stats.map((stat, index) => (
                <li key={stat.label} role="listitem">
                  <StatCard stat={stat} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#12121a] to-transparent pointer-events-none" />
    </section>
  );
}