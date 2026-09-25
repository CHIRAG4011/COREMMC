/**
 * src/lib/paymenter.ts
 *
 * Paymenter Billing Panel Integration for CoreMMC
 * Billing URL: https://billing.coremmc.cloud/
 */

export const PAYMENTER_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENTER_URL || 'https://billing.coremmc.cloud';

export const PAYMENTER_API_KEY =
  process.env.PAYMENTER_API_KEY ||
  'PAYM3eac20793e0b8239f96adc0eb8aa79305eb681cd3a707eec1c43eb2eaa1cc177';

// Known product routes on Paymenter
export const PAYMENTER_CATALOG: Record<string, string[]> = {
  'domain-hosting': ['fun', 'store', 'shop', 'cloud', 'online', 'pro', 'blog', 'cc', 'coin', 'in', 'tech', 'org', 'com', 'net'],
  'discord-bot-hosting': ['pro-bot', 'elite-bot', 'ultra-bot', 'enterprise-bot'],
  'web-hosting': ['coal-plan', 'copper-plan', 'iron-plan', 'emerald-plan', 'diamond-plan'],
  'minecraft-intel': [
    'pig-plan',
    'cow-plan-intel',
    'sheep-plan-intel',
    'slime-plan-intel',
    'villager-plan-intel',
    'chicken-plan-intel',
    'spider-plan-intel',
    'pillager-plan-intel',
    'blaze-plan-intel',
    'warden-plan-intel',
  ],
  'minecraft-amd-ryzen7': [
    'mouse-amd-ryzen7',
    'rabbit-amd-ryzen7',
    'lion-amd-ryzen7',
    'bear-amd-ryzen7',
    'panda-amd-ryzen7',
    'dragon-amd-ryzen7',
    'gorilla-amd-ryzen7',
    'elphant-amd-ryzen7',
    'warden-amd-ryzen7',
    'fox-amd-ryzen7',
  ],
  'minecraft-amd-ryzen9': [
    'fox-amd-ryzen9',
    'mouse-amd-ryzen9',
    'rabbit-amd-ryzen9',
    'bear-amd-ryzen9',
    'panda-amd-ryzen9',
    'lion-amd-ryzen9',
    'dragon-amd-ryzen9',
    'gorilla-amd-ryzen9',
    'elphant-amd-ryzen9',
    'warden-amd-ryzen9',
  ],
  'hytale-intel-hosting': [
    'starter-intel',
    'adventurer-intel',
    'explorer-intel',
    'builder-intel',
    'kingdom-intel',
    'empire-intel',
  ],
  'hytale-amd-hosting': [
    'starter-amd',
    'adventurer-amd',
    'empire-amd',
    'kingdom-amd',
    'builder-amd',
    'explorer-amd',
  ],
  'coreproxy-shield-intel': [
    'starter-intel-coreshield',
    'stander-intel-coreshield',
    'pro-elite-intel-coreshield',
    'elite-network-intel-coreshield',
  ],
  'coreproxy-shield-amd': [
    'starter-amd-coreshield',
    'stander-amd-coreshield',
    'pro-elite-amd-coreshield',
    'elite-network-amd-coreshield',
  ],
  'palworld-intel-servers': [
    'pal-starter-intel',
    'pal-scout-intel',
    'pal-ranger-intel',
    'pal-tamer-intel',
    'pal-master-intel',
    'pal-champion-intel',
    'pal-titan-intel',
    'pal-ultimate-intel',
  ],
  'palworld-amd-servers': [
    'pal-starter-amd',
    'pal-scout-amd',
    'pal-ranger-amd',
    'pal-tamer-amd',
    'pal-master-amd',
    'pal-champion-amd',
    'pal-titan-amd',
    'pal-ultimate-amd',
  ],
  'vps-intel': ['growth-ready', 'ultra-tier'],
  'vps-amd-epyc': ['ultimate-32'],
};

// Map CoreMMC category IDs and slugs to Paymenter category slugs
export const CATEGORY_MAP: Record<string, string> = {
  'minecraft-intel': 'minecraft-intel',
  'minecraft-amd': 'minecraft-amd-ryzen7',
  '5f2DtjSVCiFMxAnLflBF': 'minecraft-amd-ryzen9',
  'minecraft-ryzen9': 'minecraft-amd-ryzen9',
  'hytale-intel': 'hytale-intel-hosting',
  'hytale-amd': 'hytale-amd-hosting',
  'proxy-intel': 'coreproxy-shield-intel',
  'proxy-amd': 'coreproxy-shield-amd',
  'domain-hosting': 'domain-hosting',
  'discord-bot-hosting': 'discord-bot-hosting',
  'web-hosting': 'web-hosting',
  'intel-vps': 'vps-intel',
  'amd-vps': 'vps-amd-epyc',
};

/**
 * Resolves the Paymenter checkout URL for an individual product item
 */
export function getPaymenterProductCheckoutUrl(
  item: {
    planId?: string;
    name?: string;
    categoryId?: string;
    billingUrl?: string;
  },
  options?: {
    discountCode?: string | null;
    userEmail?: string;
  }
): string {
  // 1. If product has an explicit custom billing URL, use it
  if (item.billingUrl && item.billingUrl.startsWith('http')) {
    return appendOptions(item.billingUrl, options);
  }

  const planId = (item.planId || '').toLowerCase().trim();
  const name = (item.name || '').toLowerCase().trim();
  const catKey = (item.categoryId || '').trim();
  const paymenterCat = CATEGORY_MAP[catKey] || catKey;

  const cleanPlan = planId
    .replace(/-plan$/, '')
    .replace(/^plan-/, '')
    .replace('elephant', 'elphant');

  const cleanName = name
    .replace(/\s+plan$/i, '')
    .replace(/\s+/g, '-')
    .replace(/^\./, '')
    .replace('elephant', 'elphant');

  // 2. Search in target category first
  if (PAYMENTER_CATALOG[paymenterCat]) {
    const prods = PAYMENTER_CATALOG[paymenterCat];

    // Exact matches
    for (const prod of prods) {
      if (prod === planId || prod === cleanPlan || prod === cleanName) {
        return appendOptions(
          `${PAYMENTER_BASE_URL}/products/${paymenterCat}/${prod}/checkout`,
          options
        );
      }
    }

    // First token match (e.g. "slime", "dragon", "blaze")
    const planFirstToken = cleanPlan.split('-')[0];
    const nameFirstToken = cleanName.split('-')[0];

    for (const prod of prods) {
      const prodTokens = prod.split('-');
      if (
        (planFirstToken && planFirstToken.length >= 3 && prodTokens[0] === planFirstToken) ||
        (nameFirstToken && nameFirstToken.length >= 3 && prodTokens[0] === nameFirstToken)
      ) {
        return appendOptions(
          `${PAYMENTER_BASE_URL}/products/${paymenterCat}/${prod}/checkout`,
          options
        );
      }
    }
  }

  // 3. Exact search across all categories
  for (const [cat, prods] of Object.entries(PAYMENTER_CATALOG)) {
    for (const prod of prods) {
      if (prod === cleanPlan || prod === cleanName) {
        return appendOptions(
          `${PAYMENTER_BASE_URL}/products/${cat}/${prod}/checkout`,
          options
        );
      }
    }
  }

  // 4. Fallback to category page if known
  if (PAYMENTER_CATALOG[paymenterCat]) {
    return appendOptions(`${PAYMENTER_BASE_URL}/products/${paymenterCat}`, options);
  }

  // 5. Default fallback to Paymenter cart
  return appendOptions(`${PAYMENTER_BASE_URL}/cart`, options);
}

/**
 * Resolves the full redirect URL for any cart state
 */
export function getPaymenterRedirectUrl(
  items: Array<{
    planId?: string;
    name: string;
    categoryId?: string;
    billingUrl?: string;
  }>,
  options?: {
    discountCode?: string | null;
    userEmail?: string;
  }
): string {
  if (!items || items.length === 0) {
    return appendOptions(`${PAYMENTER_BASE_URL}/cart`, options);
  }

  // If single item, send directly to that product's checkout page on Paymenter
  if (items.length === 1) {
    return getPaymenterProductCheckoutUrl(items[0], options);
  }

  // Multi-item cart redirects to Paymenter cart
  return appendOptions(`${PAYMENTER_BASE_URL}/cart`, options);
}

function appendOptions(
  url: string,
  options?: {
    discountCode?: string | null;
    userEmail?: string;
  }
): string {
  if (!options) return url;

  try {
    const parsed = new URL(url);
    if (options.discountCode) {
      parsed.searchParams.set('coupon', options.discountCode);
    }
    if (options.userEmail) {
      parsed.searchParams.set('email', options.userEmail);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
