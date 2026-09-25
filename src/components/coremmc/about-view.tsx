'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Code2, Server, Globe, Shield, Github, Twitter, Instagram,
  Cpu, Zap, Rocket, Users, Clock, Award, ChevronRight, Sparkles, Youtube, Crown
} from 'lucide-react';

/* ── Animated Counters ──────────────────────────────────────────── */
function AnimatedStat({ value, label, color, suffix = '' }: { value: number; label: string; color: string; suffix?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      className="text-center"
    >
      <p className="text-3xl md:text-4xl font-extrabold" style={{ color }}>
        {value}{suffix}
      </p>
      <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

/* ── Glitch Text Effect ─────────────────────────────────────────── */
function GlitchText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className || ''}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 z-20 text-white/20 animate-pulse"
        style={{ transform: 'translate(2px, -2px)' }}
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
}

/* ── Team Member Card Component ────────────────────────────────── */
function TeamCard({
  label, labelIcon: LabelIcon, labelColor,
  name, handle, age,
  imageSrc, imageAlt, imageComponent: ImgComp,
  badgeText, badgeBg, badgeTextCls,
  bio, bioHighlight,
  terminalPrompt, terminalOutput1, terminalOutput2, terminalEcho, terminalEchoOut,
  socialLinks,
  borderFrom, borderVia, borderTo, ringFrom, ringVia, ringTo,
  accentColor, promptColor, echoColor,
  animate = true,
  delay = 0,
}: {
  label: string;
  labelIcon: React.ElementType;
  labelColor: string;
  name: string;
  handle: string;
  age: number;
  imageSrc: string;
  imageAlt: string;
  imageComponent?: 'next-image' | 'img';
  badgeText: string;
  badgeBg: string;
  badgeTextCls: string;
  bio: React.ReactNode;
  bioHighlight?: string;
  terminalPrompt: string;
  terminalOutput1: string;
  terminalOutput2: string;
  terminalEcho: string;
  terminalEchoOut: string;
  socialLinks: { icon: React.ElementType; label: string; href: string; color: string }[];
  borderFrom: string; borderVia: string; borderTo: string;
  ringFrom: string; ringVia: string; ringTo: string;
  accentColor: string;
  promptColor: string;
  echoColor: string;
  animate?: boolean;
  delay?: number;
}) {
  const anim = animate
    ? { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      {...anim}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto mb-10"
    >
      <div className="flex items-center gap-2 mb-4 justify-center">
        <LabelIcon className="size-4" style={{ color: labelColor }} />
        <span className="text-sm font-semibold text-white/50">{label}</span>
      </div>
      <div className="relative rounded-2xl overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl opacity-40 blur-[0px]"
          style={{ background: `linear-gradient(to right, ${borderFrom}, ${borderVia}, ${borderTo})` }} />
        <div className="absolute -inset-[1px] rounded-2xl opacity-20">
          <div className="w-full h-full animate-spin" style={{
            animationDuration: '8s',
            background: `conic-gradient(from 0deg, transparent 0%, ${borderFrom} 25%, transparent 50%, ${borderTo} 75%, transparent 100%)`
          }} />
        </div>

        {/* Inner card */}
        <div className="relative z-10 glass-noise glass rounded-2xl p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar with animated ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              {...(animate ? { whileInView: { scale: 1, opacity: 1 }, viewport: { once: true } } : { animate: { scale: 1, opacity: 1 } })}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex-shrink-0 relative"
            >
              {/* Spinning gradient ring */}
              <div className="absolute -inset-1.5 rounded-full animate-spin" style={{ animationDuration: '6s' }}>
                <div className="w-full h-full rounded-full"
                  style={{ background: `linear-gradient(to top right, ${ringFrom}, ${ringVia}, ${ringTo})` }} />
              </div>
              {/* Avatar container */}
              <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-[3px] border-[#0a0a0f]">
                {ImgComp === 'img' ? (
                  <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover" />
                ) : (
                  <Image src={imageSrc} alt={imageAlt} width={400} height={400} className="w-full h-full object-cover" priority />
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#22c55e] border-[3px] border-[#0a0a0f] z-10" />
              {/* Status badge */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                {...(animate ? { whileInView: { x: 0, opacity: 1 }, viewport: { once: true } } : { animate: { x: 0, opacity: 1 } })}
                transition={{ delay: delay + 0.3 }}
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${badgeBg} ${badgeTextCls} text-[10px] font-bold uppercase tracking-wider whitespace-nowrap`}
              >
                {badgeText}
              </motion.div>
            </motion.div>

            {/* Info section */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                {...(animate ? { whileInView: { opacity: 1, x: 0 }, viewport: { once: true } } : { animate: { opacity: 1, x: 0 } })}
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">
                  {name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 justify-center md:justify-start">
                  <span className="font-bold text-sm" style={{ color: accentColor }}>{handle}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/40 text-sm">Age {age}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/40 text-sm">India 🇮🇳</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                {...(animate ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } } : { animate: { opacity: 1, y: 0 } })}
                className="text-white/60 text-sm md:text-base mt-4 leading-relaxed"
              >
                {bio}
              </motion.p>

              {/* Terminal-style code block */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                {...(animate ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } } : { animate: { opacity: 1, y: 0 } })}
                className="mt-5 rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden"
              >
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
                  <span className="ml-2 text-[10px] text-white/30 font-mono">{terminalPrompt}@coremmc:~</span>
                </div>
                <div className="px-4 py-3 font-mono text-xs md:text-sm space-y-1">
                  <p><span className="text-[#22c55e]">$</span> <span style={{ color: promptColor }}>whoami</span></p>
                  <p className="text-white/70 pl-4">{terminalOutput1}</p>
                  <p><span className="text-[#22c55e]">$</span> <span style={{ color: promptColor }}>cat</span> passion.txt</p>
                  <p className="text-white/70 pl-4">{terminalOutput2}</p>
                  <p><span className="text-[#22c55e]">$</span> <span style={{ color: promptColor }}>echo</span> <span style={{ color: echoColor }}>&quot;{terminalEcho}&quot;</span></p>
                  <p className="pl-4" style={{ color: accentColor }}>{terminalEchoOut}</p>
                  <p className="text-white/20"><span className="text-[#22c55e]">$</span> <span className="animate-pulse">▊</span></p>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                {...(animate ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } } : { animate: { opacity: 1, y: 0 } })}
                className="flex items-center gap-3 mt-5 justify-center md:justify-start"
              >
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 text-white/60 hover:text-white text-sm"
                  >
                    <social.icon
                      className="size-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: social.color }}
                    />
                    <span className="font-medium">{social.label}</span>
                    <ChevronRight className="size-3 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-50 group-hover:translate-x-0" />
                  </a>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AboutView() {
  const techStack = [
    { icon: Code2, label: 'Full-Stack Dev', color: '#06b6d4', desc: 'React, Next.js, Node.js' },
    { icon: Server, label: 'Cloud Infra', color: '#22c55e', desc: 'AWS, VPS, Docker' },
    { icon: Shield, label: 'Cybersecurity', color: '#ef4444', desc: 'DDoS Protection' },
    { icon: Globe, label: 'Networking', color: '#06b6d4', desc: 'TCP/IP, DNS, CDN' },
    { icon: Cpu, label: 'System Admin', color: '#f59e0b', desc: 'Linux, Nginx, PM2' },
    { icon: Zap, label: 'Performance', color: '#a855f7', desc: 'Optimization Expert' },
  ];

  const coremmcFeatures = [
    { icon: Server, title: 'Enterprise-Grade Infrastructure', desc: 'Powered by high-performance NVMe SSDs, AMD EPYC processors, and DDR5 RAM across 9 global data centers.', color: '#06b6d4' },
    { icon: Shield, title: 'Military-Grade DDoS Protection', desc: 'Advanced L3/L4/L7 DDoS mitigation keeps your services online 24/7, even during the largest attacks.', color: '#22c55e' },
    { icon: Users, title: '5,000+ Community Strong', desc: 'A thriving Discord community of developers, gamers, and businesses who trust CoreMMC every day.', color: '#a855f7' },
    { icon: Clock, title: '24/7 Expert Support', desc: 'Real humans, not bots. Our support team is available round the clock via Discord and dashboard tickets.', color: '#f59e0b' },
    { icon: Globe, title: '9 Global Locations', desc: 'Data centers across India, Germany, UAE, Singapore, Japan, and the US ensure low latency worldwide.', color: '#06b6d4' },
    { icon: Award, title: '99.99% Uptime SLA', desc: 'We guarantee near-perfect uptime with redundant networks, automated failover, and proactive monitoring.', color: '#ec4899' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] max-w-[100vw] rounded-full bg-[#06b6d4]/[0.04] blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] max-w-[100vw] rounded-full bg-[#f59e0b]/[0.03] blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] max-w-[100vw] rounded-full bg-[#22c55e]/[0.02] blur-[150px]" />
      </div>
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-5"
          >
            <Sparkles className="size-4 text-[#f59e0b]" />
            <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">About Us</span>
          </motion.div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            The <GlitchText className="gradient-text">Team</GlitchText> Behind
            <br />
            <span className="gradient-text-animated">CoreMMC</span>
          </h1>
          <p className="mt-4 text-white/40 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Meet the people who built CoreMMC from the ground up.
          </p>
        </motion.div>

        {/* ── Founder Card (Top) ─────────────────────────────────── */}
        <TeamCard
          label="Founder"
          labelIcon={Crown}
          labelColor="#f59e0b"
          name="SuperGMT"
          handle="@SuperGMT"
          age={19}
          imageSrc="https://i.imgur.com/JmE990g.jpeg"
          imageAlt="SuperGMT — Founder of CoreMMC"
          imageComponent="img"
          badgeText="👑 Founder"
          badgeBg="bg-[#f59e0b]"
          badgeTextCls="text-black"
          bio={
            <>
              The <span className="text-white font-medium">visionary founder</span> of CoreMMC.
              SuperGMT is the driving force behind the brand — shaping the company&apos;s direction,
              building partnerships, and leading the community growth strategy. With a passion
              for content creation and a deep understanding of the hosting industry, he ensures
              CoreMMC stays ahead of the curve and delivers the best experience for every user.
              You can catch him creating tech content on YouTube and sharing updates with the community.
            </>
          }
          terminalPrompt="supergmt"
          terminalOutput1="SuperGMT — Founder @ CoreMMC"
          terminalOutput2="Content Creation · Community Building · Tech Innovation"
          terminalEcho="Making hosting accessible for all 🌍"
          terminalEchoOut="Making hosting accessible for all 🌍"
          socialLinks={[
            { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@supergmt95-c5?si=cKyTxLul6NP8_BEO', color: '#FF0000' },
            { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/supergmt95', color: '#E4405F' },
          ]}
          borderFrom="#f59e0b" borderVia="#ef4444" borderTo="#f59e0b"
          ringFrom="#f59e0b" ringVia="#ef4444" ringTo="#f59e0b"
          accentColor="#f59e0b"
          promptColor="#f59e0b"
          echoColor="#a855f7"
          animate={false}
          delay={0.15}
        />

        {/* ── Developer Card (Below Founder) — Aqua/Cyan Theme ──── */}
        <TeamCard
          label="Developer"
          labelIcon={Code2}
          labelColor="#06b6d4"
          name="Nitin Sharma"
          handle="@NITINDYT"
          age={16}
          imageSrc="/nitin-dev.webp"
          imageAlt="Nitin Sharma — Developer of CoreMMC"
          imageComponent="next-image"
          badgeText="Available for Hire"
          badgeBg="bg-[#06b6d4]"
          badgeTextCls="text-white"
          bio={
            <>
              A passionate <span className="text-white font-medium">full-stack developer</span> and tech enthusiast
              who started coding at the age of 12. Nitin built CoreMMC from scratch — designing the infrastructure,
              writing every line of code, and crafting the user experience. When he&apos;s not shipping features
              or managing servers, you&apos;ll find him experimenting with new tech stacks, contributing to
              open-source projects, or helping the community on Discord.
            </>
          }
          terminalPrompt="nitin"
          terminalOutput1="Nitin Sharma — Developer @ CoreMMC"
          terminalOutput2="React · Next.js · TypeScript · Node.js · Docker · Linux"
          terminalEcho="Building the future of hosting 🚀"
          terminalEchoOut="Building the future of hosting 🚀"
          socialLinks={[
            { icon: Github, label: 'GitHub', href: 'https://github.com/codeandearnyt', color: '#fff' },
            { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/NITINDYT', color: '#1DA1F2' },
            { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/itz_nitin_sharma08', color: '#E4405F' },
          ]}
          borderFrom="#06b6d4" borderVia="#22d3ee" borderTo="#0891b2"
          ringFrom="#06b6d4" ringVia="#22d3ee" ringTo="#0891b2"
          accentColor="#06b6d4"
          promptColor="#06b6d4"
          echoColor="#f59e0b"
          animate={true}
          delay={0}
        />

        {/* ── Quick Stats ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-14"
        >
          <div className="glass rounded-2xl border border-white/[0.06] p-6 md:p-8">
            <div className="grid grid-cols-3 gap-6">
              <AnimatedStat value={5} label="Team Members" color="#f59e0b" suffix="K+" />
              <AnimatedStat value={9} label="Global Locations" color="#06b6d4" />
              <AnimatedStat value={99.99} label="Uptime" color="#22c55e" suffix="%" />
            </div>
          </div>
        </motion.div>

        {/* ── Tech Stack ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white">Tech Arsenal</h3>
            <p className="text-white/30 text-sm mt-1">Technologies powering CoreMMC</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {techStack.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="glass glass-hover rounded-xl p-4 text-center group cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <item.icon className="size-6 mx-auto mb-2.5 transition-colors duration-300" style={{ color: item.color }} />
                </motion.div>
                <span className="text-xs font-semibold text-white/80 block">{item.label}</span>
                <span className="text-[10px] text-white/30 mt-1 block">{item.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CoreMMC Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 mb-4"
            >
              <Rocket className="size-4 text-[#22c55e]" />
              <span className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider">The Platform</span>
            </motion.div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              What is <span className="gradient-text">CoreMMC</span>?
            </h2>
            <p className="mt-3 text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              CoreMMC is India&apos;s fastest-growing hosting platform, built from the ground up to deliver
              enterprise-grade performance at prices everyone can afford. From Minecraft servers to cloud VPS,
              we power thousands of projects worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coremmcFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-300 group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="size-5" style={{ color: feature.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{feature.title}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Mission Quote ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl border border-white/[0.06] p-8 md:p-10 relative overflow-hidden">
            {/* Decorative quotes */}
            <div className="absolute top-3 left-5 text-6xl font-serif text-white/[0.04] leading-none select-none">&ldquo;</div>
            <div className="absolute bottom-3 right-5 text-6xl font-serif text-white/[0.04] leading-none select-none">&rdquo;</div>

            <blockquote className="text-white/50 text-sm md:text-base italic leading-relaxed relative z-10">
              We started CoreMMC because we believed hosting should be accessible, fast, and reliable
              for everyone — whether you&apos;re running a Minecraft server with friends or scaling a
              production application. Every feature we build is driven by real user feedback.
            </blockquote>
            <div className="mt-4 flex items-center gap-3 justify-center">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                <Image src="/nitin-dev.webp" alt="Nitin" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">CoreMMC Team</p>
                <p className="text-xs text-[#06b6d4]">Built with passion from India 🇮🇳</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}