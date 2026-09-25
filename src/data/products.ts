// ── Utility Functions (used across the app) ─────────────────────────────

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}/mo`;
}

export function getDiscountPercent(original: number | null, current: number): number | null {
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export const SPEC_LABELS: Record<string, string> = {
  ram: 'RAM',
  cpu: 'CPU',
  storage: 'Storage',
  ports: 'Ports',
  network: 'Network',
  websites: 'Websites',
  bandwidth: 'Bandwidth',
  ssl: 'SSL',
  email: 'Emails',
  databases: 'Databases',
  tld: 'TLD',
  type: 'Type',
  tier: 'Tier',
  item: 'Item',
  includes: 'Includes',
  count: 'Count',
};

/** Fixed display order for specs. Keys not listed here appear after. */
export const SPEC_ORDER = [
  'ram',
  'cpu',
  'storage',
  'ports',
  'network',
  'bandwidth',
  'websites',
  'ssl',
  'email',
  'databases',
  'tier',
  'type',
  'item',
  'includes',
  'tld',
  'count',
] as const;

/**
 * Returns specs entries sorted by the fixed SPEC_ORDER.
 * RAM → CPU → Storage → Ports → … → any extra keys at the end.
 */
export function getOrderedSpecs(specs: Record<string, string>): [string, string][] {
  const entries = Object.entries(specs);
  const orderIndex = new Map<string, number>();
  SPEC_ORDER.forEach((key, i) => orderIndex.set(key, i));

  return entries.sort(([a], [b]) => {
    const ia = orderIndex.get(a) ?? SPEC_ORDER.length;
    const ib = orderIndex.get(b) ?? SPEC_ORDER.length;
    return ia - ib;
  });
}

// ── Static Site Content ──────────────────────────────────────────────────

export const testimonials = [
  { name: 'Rahul K.', role: 'Minecraft Server Owner', quote: 'CoreMMC made hosting my Minecraft server incredibly easy. The panel is intuitive and the performance is outstanding!', avatar: 'R', rating: 5, service: 'Minecraft Hosting' },
  { name: 'Priya S.', role: 'Discord Bot Developer', quote: 'Best Discord bot hosting I\'ve used. Uptime is solid and the support team responds within minutes.', avatar: 'P', rating: 4.5, service: 'Discord Bot Hosting' },
  { name: 'Arjun M.', role: 'VPS User', quote: 'Switched from a big-name provider and got better performance at half the price. CoreMMC is the real deal.', avatar: 'A', rating: 5, service: 'VPS Hosting' },
  { name: 'Sneha D.', role: 'Web Developer', quote: 'The web hosting is fast and reliable. My clients love the load times. Highly recommended for developers.', avatar: 'S', rating: 5, service: 'Web Hosting' },
  { name: 'Vikram T.', role: 'Minecraft YouTuber', quote: 'I run a 100-player server for my community. CoreMMC handles it without breaking a sweat!', avatar: 'V', rating: 4.5, service: 'Minecraft Hosting' },
  { name: 'Ananya R.', role: 'Small Business Owner', quote: 'Domain registration was seamless and the free DNS management saved me a lot of hassle.', avatar: 'A', rating: 5, service: 'Domain Services' },
];

export const faqs = [
  { question: 'What is your refund policy?', answer: 'We offer a 48-hour refund policy on all hosting plans. If you\'re not satisfied, contact our support team within 48 hours of purchase for a full refund.' },
  { question: 'How quickly is my server set up?', answer: 'Most servers are set up instantly after payment confirmation. In rare cases, setup may take up to 15 minutes.' },
  { question: 'Do you offer DDoS protection?', answer: 'Yes! All our game server and VPS plans include enterprise-grade DDoS protection at no extra cost.' },
  { question: 'Can I upgrade my plan later?', answer: 'Absolutely! You can upgrade your plan at any time from your dashboard. The price difference will be prorated.' },
  { question: 'What locations are your servers in?', answer: 'Our servers are located in India data centers, ensuring the lowest latency for Indian users.' },
  { question: 'Do you provide a control panel?', answer: 'Yes, all plans include access to our modern control panel where you can manage your server, files, and settings.' },
  { question: 'What payment methods do you accept?', answer: 'We accept UPI, bank transfer, and other Indian payment methods. All payments are processed securely.' },
  { question: 'Is there a bandwidth limit?', answer: 'Our plans include generous bandwidth allowances. Specific limits depend on your chosen plan. Unlimited bandwidth is available on select plans.' },
];

export const infrastructureSteps = [
  { title: 'Enterprise Hardware', description: 'Latest-gen Intel & AMD processors with DDR4/DDR5 RAM', icon: 'Server' },
  { title: 'NVMe SSD Storage', description: 'Lightning-fast NVMe drives for instant load times', icon: 'HardDrive' },
  { title: 'DDoS Protection', description: 'Enterprise-grade protection keeping your services online', icon: 'Shield' },
  { title: 'India Data Centers', description: 'Strategically located for lowest latency across India', icon: 'MapPin' },
  { title: '99.9% Uptime SLA', description: 'Guaranteed availability with automatic failover', icon: 'Activity' },
  { title: 'Instant Deployment', description: 'Automated setup gets you running in under 60 seconds', icon: 'Rocket' },
];