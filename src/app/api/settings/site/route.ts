import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CachedData<T> { data: T; timestamp: number }
const CACHE_TTL = 5 * 60_000; // 5 minutes

const DEFAULTS = {
  siteName: 'CoreMMC',
  siteDescription: '',
  contactEmail: '',
  footerText: '\u00A9 2025 CoreMMC. All rights reserved.',
  socialLinks: {
    discordUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    telegramUrl: '',
    websiteUrl: '',
  },
  promo: { enabled: false, text: '', subtext: '', discount: '30', endDate: '', padding: 'py-6 md:py-8' },
};

let cache: CachedData<typeof DEFAULTS> | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const settings = await db.siteSettings.findUnique({
      where: { id: 'website' },
    });

    let data: typeof DEFAULTS;
    if (settings) {
      data = {
        siteName: settings.siteName || 'CoreMMC',
        siteDescription: settings.siteDescription || '',
        contactEmail: settings.contactEmail || '',
        footerText: settings.footerText || '\u00A9 2025 CoreMMC. All rights reserved.',
        socialLinks: {
          discordUrl: settings.discordUrl || '',
          instagramUrl: settings.instagramUrl || '',
          youtubeUrl: settings.youtubeUrl || '',
          telegramUrl: settings.telegramUrl || '',
          websiteUrl: settings.websiteUrl || '',
        },
        promo: {
          enabled: settings.promoEnabled === true,
          text: settings.promoText || '',
          subtext: settings.promoSubtext || '',
          discount: settings.promoDiscount || '30',
          endDate: settings.promoEndDate || '',
          padding: settings.promoPadding || 'py-6 md:py-8',
        },
      };
    } else {
      data = { ...DEFAULTS, socialLinks: { ...DEFAULTS.socialLinks }, promo: { ...DEFAULTS.promo } };
    }

    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch site settings error:', error);
    return NextResponse.json({ ...DEFAULTS, socialLinks: { ...DEFAULTS.socialLinks }, promo: { ...DEFAULTS.promo } });
  }
}