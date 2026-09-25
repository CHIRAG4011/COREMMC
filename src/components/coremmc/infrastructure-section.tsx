'use client';

import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Flame,
  Layers,
  Cpu,
  HardDrive,
  Activity,
  DatabaseBackup,
  Rocket,
  Clock,
  Zap,
  MapPin,
  Server,
} from 'lucide-react';
import { infrastructureSteps } from '@/data/products';

const stepIconMap: Record<string, React.ElementType> = {
  User,
  Shield,
  Flame,
  Layers,
  Cpu,
  HardDrive,
  Activity,
  DatabaseBackup,
  Rocket,
  Clock,
  Zap,
  MapPin,
  Server,
};

const highlights = [
  {
    icon: Clock,
    color: '#6366f1',
    stat: '99.9%',
    title: 'Uptime SLA',
    description: 'Guaranteed uptime with redundant systems and automatic failover.',
  },
  {
    icon: HardDrive,
    color: '#22c55e',
    stat: 'NVMe SSD',
    title: 'Blazing Fast Storage',
    description: 'Enterprise NVMe drives delivering up to 7GB/s read speeds.',
  },
  {
    icon: Shield,
    color: '#a855f7',
    stat: 'CoreMMCNodes',
    title: 'DDoS Protection',
    description: 'Advanced L3/L4/L7 DDoS mitigation protecting your services 24/7.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    stat: '< 15ms',
    title: 'Low Latency India',
    description: 'India-based servers ensuring the lowest ping for Indian users.',
  },
];

export function InfrastructureSection() {
  return (
    <section id="infrastructure" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] max-w-[100vw] rounded-full bg-[#6366f1]/[0.04] blur-[120px]" />
      </div>

      <div className="relative pt-12 z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 mb-4">
            <Shield className="size-3.5 text-[#6366f1]" />
            <span className="text-xs font-medium text-[#6366f1]">CoreMMCShield Protected</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Advanced <span className="gradient-text-animated">Features</span>
          </h2>
          <p className="mt-3 text-white/50 text-lg">
            Why developers and gamers choose CoreMMC
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left - Flow diagram (60%) */}
          <div className="flex-1 lg:max-w-[60%]">
            <div className="relative">
              {infrastructureSteps.map((step, index) => {
                const IconComponent = stepIconMap[step.icon] || Activity;
                const isLast = index === infrastructureSteps.length - 1;

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: 'easeOut',
                    }}
                    className="flex items-center gap-4"
                  >
                    {/* Step node */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10 z-10">
                        <IconComponent className="size-5 text-[#6366f1]" />
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div className="w-px h-10 bg-gradient-to-b from-white/15 to-white/5" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pb-8">
                      <span className="text-sm font-medium text-white/80">
                        {step.title}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right - Highlight cards (40%) */}
          <div className="flex-1 lg:max-w-[40%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass glass-hover rounded-xl p-5 flex gap-4 items-start"
              >
                <div
                  className="p-3 rounded-xl shrink-0"
                  style={{
                    backgroundColor: item.color + '15',
                    boxShadow: `0 0 20px ${item.color}15`,
                  }}
                >
                  <item.icon
                    className="size-5"
                    style={{ color: item.color }}
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}