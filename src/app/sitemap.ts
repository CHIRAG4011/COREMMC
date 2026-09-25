import { MetadataRoute } from 'next';

const BASE_URL = 'https://coremmc.cloud';

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = [
    { slug: 'minecraft-intel', name: 'Minecraft Intel Hosting', priority: 0.8 },
    { slug: 'minecraft-amd', name: 'Minecraft AMD Hosting', priority: 0.8 },
    { slug: 'hytale-amd', name: 'Hytale AMD Hosting', priority: 0.7 },
    { slug: 'hytale-intel', name: 'Hytale Intel Hosting', priority: 0.7 },
    { slug: 'proxy-amd', name: 'Proxy AMD (CoreMMCShield)', priority: 0.6 },
    { slug: 'proxy-intel', name: 'Proxy Intel (CoreMMCShield)', priority: 0.6 },
    { slug: 'intel-vps', name: 'Intel Xeon VPS', priority: 0.8 },
    { slug: 'amd-vps', name: 'AMD EPYC VPS', priority: 0.8 },
    { slug: 'domain-hosting', name: 'Domain Registration', priority: 0.8 },
    { slug: 'web-hosting', name: 'Web Hosting', priority: 0.8 },
    { slug: 'discord-bot-hosting', name: 'Discord Bot Hosting', priority: 0.7 },
    { slug: 'discord-services', name: 'Discord Services', priority: 0.7 },
    { slug: 'paid-works', name: 'Paid Setup Services', priority: 0.6 },
  ];

  const staticPages = [
    { path: '', name: 'CoreMMC — Premium Hosting', priority: 1.0 },
    { path: '/login', name: 'Login', priority: 0.3 },
    { path: '/register', name: 'Register', priority: 0.4 },
    { path: '/contact', name: 'Contact Us', priority: 0.5 },
    { path: '/terms', name: 'Terms of Service', priority: 0.3 },
    { path: '/privacy', name: 'Privacy Policy', priority: 0.3 },
    { path: '/refund', name: 'Refund Policy', priority: 0.3 },
    { path: '/compare', name: 'Compare Plans', priority: 0.5 },
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.path === '' ? 'daily' : 'monthly',
    priority: page.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: cat.priority,
  }));

  return [...staticEntries, ...categoryEntries];
}