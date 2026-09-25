'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Instagram, Youtube, Send, Globe } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

interface SiteSettings {
  siteName: string;
  footerText: string;
  socialLinks: {
    discordUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    telegramUrl: string;
    websiteUrl: string;
  };
}

const SOCIAL_CONFIG = [
  { key: 'discordUrl' as const, icon: MessageCircle, label: 'Discord' },
  { key: 'instagramUrl' as const, icon: Instagram, label: 'Instagram' },
  { key: 'youtubeUrl' as const, icon: Youtube, label: 'YouTube' },
  { key: 'telegramUrl' as const, icon: Send, label: 'Telegram' },
  { key: 'websiteUrl' as const, icon: Globe, label: 'Website' },
];

const companyLinks = [
  { label: 'Home', page: 'home' as const },
  { label: 'About', page: 'about' as const },
  { label: 'Service Status', page: 'status' as const },
  { label: 'Contact', page: 'contact' as const },
  { label: 'Terms of Service', page: 'terms' as const },
  { label: 'Privacy Policy', page: 'privacy' as const },
  { label: 'Refund Policy', page: 'refund' as const },
];

const hostingLinks = [
  { label: 'Minecraft Intel', slug: 'minecraft-intel' },
  { label: 'Minecraft AMD', slug: 'minecraft-amd' },
  { label: 'Hytale Servers', slug: 'hytale-amd' },
  { label: 'Web Hosting', slug: 'web-hosting' },
];

const servicesLinks = [
  { label: 'VPS Hosting', slug: 'intel-vps' },
  { label: 'Domain Registration', slug: 'domain-hosting' },
  { label: 'Discord Bot Hosting', slug: 'discord-bot-hosting' },
  { label: 'Setup Services', slug: 'paid-works' },
];

const DEFAULT_FOOTER = '\u00A9 2025 CoreMMC. All rights reserved.';

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'CoreMMC',
    footerText: DEFAULT_FOOTER,
    socialLinks: {
      discordUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      telegramUrl: '',
      websiteUrl: '',
    },
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/site')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setSettings({
            siteName: data.siteName || 'CoreMMC',
            footerText: data.footerText || DEFAULT_FOOTER,
            socialLinks: data.socialLinks || {
              discordUrl: '', instagramUrl: '', youtubeUrl: '', telegramUrl: '', websiteUrl: '',
            },
          });
        }
      })
      .catch(() => { /* keep defaults */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="mt-auto bg-[#0a0a0f] border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 md:py-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/coremmc-icon.png"
              alt="CoreMMC"
              width={40}
              height={40}
              className="h-10 w-10 object-contain rounded-lg mb-3"
            />
            <p className="text-sm text-white/40 leading-relaxed max-w-[280px] mb-5">
              India&apos;s premium hosting platform. High-performance servers with lowest
              latency.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_CONFIG.map((social) => {
                const url = settings.socialLinks[social.key];
                if (url) {
                  return (
                    <a
                      key={social.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.label}`}
                      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      <social.icon className="w-[18px] h-[18px]" />
                    </a>
                  );
                }
                return (
                  <div
                    key={social.key}
                    aria-label={social.label}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] text-white/25 cursor-default"
                  >
                    <social.icon className="w-[18px] h-[18px]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2 — Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => {
                const hrefMap: Record<string, string> = {
                  home: '/',
                  status: '/status',
                  contact: '/contact',
                  terms: '/terms',
                  privacy: '/privacy',
                  refund: '/refund',
                };
                const href = hrefMap[link.page] || '#';
                return (
                  <li key={link.label}>
                    <a
                      href={href}
                      onClick={(e) => { e.preventDefault(); navigate(link.page); }}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3 — Hosting */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Hosting
            </h3>
            <ul className="space-y-2.5">
              {hostingLinks.map((link) => (
                <li key={link.slug}>
                  <a
                    href={`/${link.slug}`}
                    onClick={(e) => { e.preventDefault(); navigate('category', link.slug); }}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.slug}>
                  <a
                    href={`/${link.slug}`}
                    onClick={(e) => { e.preventDefault(); navigate('category', link.slug); }}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/35">
            {settings.footerText}
          </p>
          <p className="text-xs text-white/35">
            Powered by {settings.siteName} Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}