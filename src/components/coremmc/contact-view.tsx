'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  Users,
  Headphones,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_DISCORD_URL = 'https://discord.gg/coremmc';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function CardIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'discord':
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10"
          fill={color}
        >
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
        </svg>
      );
    case 'ticket':
      return <MessageSquare className="w-10 h-10" style={{ color }} />;
    case 'hours':
      return <Clock className="w-10 h-10" style={{ color }} />;
    case 'community':
      return <Users className="w-10 h-10" style={{ color }} />;
    default:
      return <Headphones className="w-10 h-10" style={{ color }} />;
  }
}

function DiscordBanner({ discordUrl }: { discordUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 max-w-7xl mx-auto mb-12"
    >
      <a
        href={discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(88,101,242,0.12) 0%, rgba(88,101,242,0.04) 50%, rgba(155,89,182,0.08) 100%)',
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Floating Discord icons / particles */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-[#5865F2]/[0.08] animate-float" />
            <div className="absolute top-1/4 -right-8 w-32 h-32 rounded-full bg-[#9b59b6]/[0.06] animate-float-delayed" />
            <div className="absolute -bottom-6 left-1/3 w-20 h-20 rounded-full bg-[#5865F2]/[0.06] animate-float-slow" />

            {/* Animated horizontal light streak */}
            <div
              className="absolute top-0 left-0 h-full w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(88,101,242,0.08), transparent)',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Discord icon with animated glow */}
            <div className="relative shrink-0">
              <div
                className="absolute -inset-3 rounded-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(88,101,242,0.3), rgba(155,89,182,0.3), rgba(88,101,242,0.3))',
                  filter: 'blur(12px)',
                  animation: 'rgb-border-spin 4s linear infinite',
                }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-[#5865F2]/20 flex items-center justify-center border border-[#5865F2]/30 group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-9 h-9" fill="#5865F2">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                </svg>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Join CoreMMC on Discord
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#5865F2]/20 text-[#5865F2] rounded-full border border-[#5865F2]/20">
                  Live
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-xl">
                Get instant support, chat with the community, stay updated on announcements,
                and get exclusive deals. We&apos;re always active!
              </p>
            </div>

            {/* CTA button */}
            <div className="shrink-0">
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 group-hover:gap-3 group-hover:shadow-lg group-hover:shadow-[#5865F2]/20"
                style={{
                  background: 'linear-gradient(135deg, #5865F2, #4752C4)',
                }}
              >
                Join Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bottom animated gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div
              className="h-full w-[200%]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(88,101,242,0.6) 25%, rgba(155,89,182,0.6) 50%, rgba(88,101,242,0.6) 75%, transparent 100%)',
                backgroundSize: '50% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export function ContactView() {
  const [discordUrl, setDiscordUrl] = useState(FALLBACK_DISCORD_URL);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.socialLinks?.discordUrl) {
          setDiscordUrl(data.socialLinks.discordUrl);
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const supportCards = [
    {
      icon: 'discord',
      title: 'Join Our Discord',
      description: 'Get instant support from our team and community',
      action: 'Join Server',
      actionHref: discordUrl,
      accentColor: '#8b5cf6',
    },
    {
      icon: 'ticket',
      title: 'Open a Ticket',
      description: 'Create a support ticket for detailed assistance',
      extra: 'Join our Discord server and use the #tickets channel',
      action: null,
      accentColor: '#6366f1',
    },
    {
      icon: 'hours',
      title: 'Support Hours',
      description: '24/7 Support',
      extra: 'Our team is available around the clock',
      action: null,
      accentColor: '#22c55e',
    },
    {
      icon: 'community',
      title: 'Community',
      description: 'Join 5000+ members',
      extra: 'Connect with other CoreMMC users',
      action: null,
      accentColor: '#f59e0b',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get <span className="gradient-text">Support</span>
          </h1>
          <p className="text-white/50 text-lg">
            We&apos;re here to help you 24/7
          </p>
        </motion.div>

        {/* Discord Animated Banner */}
        <DiscordBanner discordUrl={discordUrl} />

        {/* Cards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {supportCards.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: card.accentColor + '15' }}
              >
                <CardIcon type={card.icon} color={card.accentColor} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {card.extra && (
                <p className="text-xs text-white/50 flex items-start gap-1.5 mt-1">
                  <span className="mt-0.5">→</span>
                  {card.extra}
                </p>
              )}

              {card.action && card.actionHref && (
                <div className="mt-auto pt-2">
                  <Button
                    asChild
                    className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl h-11 font-medium transition-all duration-200"
                  >
                    <a
                      href={card.actionHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {card.action}
                    </a>
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Email fallback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-white/50">
            <Mail className="w-4 h-4" />
            <span>
              Prefer email? Contact us at{' '}
              <a
                href="mailto:support@coremmc.cloud"
                className="text-[#6366f1] hover:text-[#818cf8] transition-colors underline underline-offset-2"
              >
                support@coremmc.cloud
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}