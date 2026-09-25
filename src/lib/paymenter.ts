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

// Complete live product catalog on Paymenter (billing.coremmc.cloud)
export const PAYMENTER_CATALOG: Record<string, string[]> = {
  'minecraft-intel': [
    'cow-plan-intel',
    'pig-plan',
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
    'fox-amd-ryzen7',
    'lion-amd-ryzen7',
    'bear-amd-ryzen7',
    'panda-amd-ryzen7',
    'dragon-amd-ryzen7',
    'gorilla-amd-ryzen7',
    'elphant-amd-ryzen7',
    'warden-amd-ryzen7',
  ],
  'minecraft-amd-ryzen9': [
    'mouse-amd-ryzen9',
    'rabbit-amd-ryzen9',
    'fox-amd-ryzen9',
    'lion-amd-ryzen9',
    'bear-amd-ryzen9',
    'panda-amd-ryzen9',
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
    'copy-of-builder-amd',
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
  'vps-intel': [
    'entry-level',
    'growth-ready',
    'performence',
    'pro-edition',
    'ultra-tier',
    'supreme-tier',
  ],
  'vps-amd-epyc': [
    'bronze',
    'silver',
    'gold',
    'platinum',
    'ultimate-32',
    'ultimate-64',
  ],
  'domain-hosting': [
    'fun',
    'store',
    'shop',
    'cloud',
    'online',
    'pro',
    'blog',
    'cc',
    'coin',
    'in',
    'tech',
    'org',
    'com',
    'net',
  ],
  'discord-bot-hosting': [
    'pro-bot',
    'elite-bot',
    'ultra-bot',
    'enterprise-bot',
  ],
  'web-hosting': [
    'coal-plan',
    'copper-plan',
    'iron-plan',
    'emerald-plan',
    'diamond-plan',
  ],
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
  'palworld-intel': 'palworld-intel-servers',
  'palworld-amd': 'palworld-amd-servers',
  'domain-hosting': 'domain-hosting',
  'discord-bot-hosting': 'discord-bot-hosting',
  'web-hosting': 'web-hosting',
  'intel-vps': 'vps-intel',
  'amd-vps': 'vps-amd-epyc',
};

/**
 * Resolves the Paymenter checkout URL for an individual product item.
 * Always takes the user directly to the service checkout screen, avoiding empty cart errors.
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

  // 2. Domain Hosting
  if (paymenterCat === 'domain-hosting') {
    const cleanTld = name.replace(/^\./, '').replace(/^dom-/, '').trim();
    const tldFromPlan = planId.replace(/^dom-/, '').replace(/-/g, '').trim();
    for (const d of PAYMENTER_CATALOG['domain-hosting']) {
      if (d === cleanTld || d === tldFromPlan || cleanTld === `co.${d}`) {
        return appendOptions(`${PAYMENTER_BASE_URL}/products/domain-hosting/${d}/checkout`, options);
      }
    }
    return appendOptions(`${PAYMENTER_BASE_URL}/products/domain-hosting/com/checkout`, options);
  }

  // 3. Discord Bot Hosting
  if (paymenterCat === 'discord-bot-hosting') {
    for (const b of PAYMENTER_CATALOG['discord-bot-hosting']) {
      const bKey = b.replace('-bot', '');
      if (planId.includes(bKey) || name.includes(bKey)) {
        return appendOptions(`${PAYMENTER_BASE_URL}/products/discord-bot-hosting/${b}/checkout`, options);
      }
    }
    return appendOptions(`${PAYMENTER_BASE_URL}/products/discord-bot-hosting/pro-bot/checkout`, options);
  }

  // 4. AMD VPS
  if (paymenterCat === 'vps-amd-epyc') {
    for (const v of PAYMENTER_CATALOG['vps-amd-epyc']) {
      if (planId.includes(v) || name.includes(v)) {
        return appendOptions(`${PAYMENTER_BASE_URL}/products/vps-amd-epyc/${v}/checkout`, options);
      }
    }
    return appendOptions(`${PAYMENTER_BASE_URL}/products/vps-amd-epyc/bronze/checkout`, options);
  }

  // 5. Intel VPS
  if (paymenterCat === 'vps-intel') {
    for (const v of PAYMENTER_CATALOG['vps-intel']) {
      const vKey = v.replace('-tier', '').replace('-level', '').replace('-ready', '').replace('-edition', '');
      if (
        planId.includes(vKey) ||
        name.includes(vKey) ||
        (v === 'performence' && (planId.includes('performance') || name.includes('performance')))
      ) {
        return appendOptions(`${PAYMENTER_BASE_URL}/products/vps-intel/${v}/checkout`, options);
      }
    }
    return appendOptions(`${PAYMENTER_BASE_URL}/products/vps-intel/entry-level/checkout`, options);
  }

  // 6. Discord Services & Paid Works (Custom services managed directly via ticket)
  if (catKey === 'discord-services' || catKey === 'paid-works') {
    return appendOptions(`${PAYMENTER_BASE_URL}/tickets/create`, options);
  }

  // 7. Search in mapped category first
  if (PAYMENTER_CATALOG[paymenterCat]) {
    const prods = PAYMENTER_CATALOG[paymenterCat];

    const cleanPlan = planId
      .replace(/-plan$/, '')
      .replace(/^plan-/, '')
      .replace('elephant', 'elphant');

    const cleanName = name
      .replace(/\s+plan$/i, '')
      .replace(/\s+/g, '-')
      .replace(/^\./, '')
      .replace('elephant', 'elphant');

    // Exact matches
    for (const prod of prods) {
      if (prod === planId || prod === cleanPlan || prod === cleanName) {
        return appendOptions(
          `${PAYMENTER_BASE_URL}/products/${paymenterCat}/${prod}/checkout`,
          options
        );
      }
    }

    // Token / Prefix match (e.g. "slime", "dragon", "blaze", "pal-starter")
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

    // Fallback to first product in this category
    if (prods.length > 0) {
      return appendOptions(
        `${PAYMENTER_BASE_URL}/products/${paymenterCat}/${prods[0]}/checkout`,
        options
      );
    }
  }

  // 8. Cross-category search
  for (const [cat, prods] of Object.entries(PAYMENTER_CATALOG)) {
    for (const prod of prods) {
      if (prod === planId || planId.includes(prod) || name.includes(prod)) {
        return appendOptions(
          `${PAYMENTER_BASE_URL}/products/${cat}/${prod}/checkout`,
          options
        );
      }
    }
  }

  // 9. Safe fallback to Paymenter shop (never /cart)
  return appendOptions(`${PAYMENTER_BASE_URL}/shop`, options);
}

/**
 * Resolves the full redirect URL for any cart state.
 * Directs the user to the direct checkout of the primary item to avoid "Cart is empty" error.
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
    return appendOptions(`${PAYMENTER_BASE_URL}/shop`, options);
  }

  // Always redirect to the direct product checkout of the primary item
  return getPaymenterProductCheckoutUrl(items[0], options);
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
