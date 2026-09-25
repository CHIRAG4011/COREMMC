'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { MagneticButton } from '@/components/ui/magnetic-button';

const DEFAULT_DISCORD_URL = 'https://discord.gg/coremmc';

const typingStrings = [
  'Premium Hosting',
  'Minecraft Servers',
  'Cloud VPS',
  'Domain Registration',
  'Discord Bots',
];

export function HeroSection() {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(DEFAULT_DISCORD_URL);
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    const currentFull = typingStrings[currentStringIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText.length < currentFull.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentFull.slice(0, displayedText.length + 1));
      }, 80);
    } else if (!isDeleting && displayedText.length === currentFull.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentFull.slice(0, displayedText.length - 1));
      }, 40);
    } else if (isDeleting && displayedText.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentStringIndex((prev) => (prev + 1) % typingStrings.length);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentStringIndex]);

  // Fetch Discord URL from site settings
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.socialLinks?.discordUrl) {
          setDiscordUrl(data.socialLinks.discordUrl);
        }
      })
      .catch(() => { /* keep default */ });
    return () => { cancelled = true; };
  }, []);

  const handleViewPlans = () => {
    navigate('category', 'minecraft-intel');
  };

  const handleJoinDiscord = () => {
    window.open(discordUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center hero-gradient overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-video absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/hero-bg-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#0a0a0f]/60" />
      </div>

      {/* Ambient glow orbs (CSS-only, GPU-composited) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] max-w-[100vw] rounded-full bg-[#6366f1]/[0.06] blur-[150px] will-change-transform" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] max-w-[100vw] rounded-full bg-[#a855f7]/[0.04] blur-[180px] will-change-transform" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] max-w-[100vw] rounded-full bg-[#22c55e]/[0.03] blur-[120px] will-change-transform" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Floating particles canvas */}
      <FloatingParticles />

      {/* Floating cubes — CSS animations only, composited */}
      <div
        className="absolute top-[15%] left-[10%] w-16 h-16 rounded-lg bg-[#6366f1] opacity-10 animate-float pointer-events-none will-change-transform"
        aria-hidden="true"
      />
      <div
        className="absolute top-[60%] left-[5%] w-12 h-12 rounded-lg bg-[#a855f7] opacity-15 animate-float-delayed pointer-events-none will-change-transform"
        aria-hidden="true"
      />
      <div
        className="absolute top-[25%] right-[15%] w-20 h-20 rounded-lg bg-[#ec4899] opacity-10 animate-float-slow pointer-events-none will-change-transform"
        aria-hidden="true"
      />
      <div
        className="absolute top-[70%] right-[10%] w-14 h-14 rounded-lg bg-[#22c55e] opacity-10 animate-float pointer-events-none will-change-transform"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full py-20 md:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Text side - 60% */}
          <div className="flex-1 max-w-2xl lg:max-w-[60%]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
              <span className="text-white">Power Your World with</span>
              <br />
              <span className="gradient-text-animated">CoreMMC</span>
            </h1>

            <div className="mt-4 md:mt-6 h-8 md:h-10 animate-fade-in-up animation-delay-200">
              <span className="text-xl md:text-2xl font-semibold text-white/80" aria-live="polite" aria-atomic="true">
                {displayedText}
                <span className="inline-block w-[2px] h-6 md:h-8 bg-[#6366f1] ml-1 align-middle animate-pulse" aria-hidden="true" />
              </span>
            </div>

            <p className="mt-4 md:mt-6 text-base md:text-lg text-white/50 max-w-xl leading-relaxed animate-fade-in-up animation-delay-350">
              India&apos;s #1 hosting platform with enterprise-grade infrastructure,
              DDoS protection, and 24/7 support.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up animation-delay-500">
              <MagneticButton
                as="a"
                href="/minecraft-intel"
                onClick={(e) => { e.preventDefault(); handleViewPlans(); }}
                className="glow-primary inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-lg text-base transition-colors"
              >
                View Plans
                <ArrowRight className="ml-1 size-4" />
              </MagneticButton>
              <MagneticButton
                as={Button}
                variant="outline"
                onClick={handleJoinDiscord}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-12 rounded-lg text-base"
              >
                Join Discord
              </MagneticButton>
            </div>
          </div>

          {/* Visual side - 40% */}
          <div className="flex-1 max-w-lg lg:max-w-[40%] hidden md:flex items-center justify-center animate-fade-in-up animation-delay-300">
            <div className="relative w-full">
              {/* Glow orb behind the card */}
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-[#6366f1]/15 via-[#a855f7]/10 to-[#22c55e]/10 blur-2xl" />
              {/* Terminal card image */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
                <Image
                  src="/terminal-card.png"
                  alt="CoreMMC server deployment terminal"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animation-delay-1200">
        <span className="text-xs text-white/50 tracking-widest uppercase">
          Scroll
        </span>
        <div className="animate-bounce">
          <ChevronDown className="size-5 text-white/50" />
        </div>
      </div>
    </section>
  );
}