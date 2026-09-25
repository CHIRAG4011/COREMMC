import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/db';

/**
 * POST /api/admin/seed-catalog
 * Seeds Prisma/SQLite with 13 categories + 108 products.
 * Uses upsert — safe to run multiple times.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(idToken);

    const requester = await db.user.findUnique({ where: { id: decoded.uid } });
    if (!requester || requester.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can seed data' }, { status: 403 });
    }

    const { categories, productDefs } = getSeedData();

    // Seed categories via upsert
    let catCount = 0;
    for (const cat of categories) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          shortDescription: cat.shortDescription,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
          featured: cat.featured,
          active: cat.active,
          imageUrl: cat.imageUrl,
        },
        create: cat,
      });
      catCount++;
    }

    // Seed products via upsert
    let prodCount = 0;
    for (const [catSlug, name, planId, catName, priceStr, origPrice, badge, specs, features, support, order] of productDefs) {
      await db.product.upsert({
        where: { planId },
        update: {
          name,
          categoryId: catSlug,
          categoryName: catName,
          price: Number(priceStr),
          originalPrice: origPrice > 0 ? origPrice : null,
          active: true,
          popular: badge === 'Most Popular',
          badge,
          specs: JSON.stringify(specs),
          features: JSON.stringify(features),
          support,
          location: 'India',
          setup: 'Instant',
          sortOrder: order,
        },
        create: {
          planId,
          name,
          categoryId: catSlug,
          categoryName: catName,
          price: Number(priceStr),
          originalPrice: origPrice > 0 ? origPrice : null,
          active: true,
          popular: badge === 'Most Popular',
          badge,
          specs: JSON.stringify(specs),
          features: JSON.stringify(features),
          support,
          location: 'India',
          setup: 'Instant',
          sortOrder: order,
        },
      });
      prodCount++;
    }

    return NextResponse.json({
      success: true,
      categoriesSeeded: catCount,
      productsSeeded: prodCount,
      message: `Seeded ${catCount} categories and ${prodCount} products.`,
    });
  } catch (error) {
    console.error('Seed catalog error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Seed failed: ${msg}` }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Seed data — 13 categories + 108 products
// ═══════════════════════════════════════════════════════════════════════════

function getSeedData() {
  const C = (name: string, slug: string, desc: string, short: string, icon: string, color: string, order: number) => ({
    name, slug, description: desc, shortDescription: short, icon, color, order,
    featured: true, active: true, imageUrl: '',
  });

  // ── 13 Categories ──────────────────────────────────────────────────
  const categories = [
    C('Domain Hosting', 'domain-hosting', 'Register your perfect domain name with premium DNS management, WHOIS privacy, and free subdomains. Choose from 14 TLDs at India-best prices.', '14 TLDs starting ₹159', 'Globe', '#3b82f6', 1),
    C('Minecraft Intel', 'minecraft-intel', 'High-performance Intel-powered Minecraft server hosting with DDR4 RAM, NVMe SSD storage, DDoS protection, and instant setup. Starting from just ₹39/mo.', 'From ₹39/mo — 7 Plans', 'Cpu', '#22c55e', 2),
    C('Minecraft AMD', 'minecraft-amd', 'AMD-powered Minecraft servers with EPYC/Ryzen CPUs, massive RAM, NVMe SSD. Perfect for large communities and modded servers. 9 plans available.', 'From ₹89/mo — 9 Plans', 'CircuitBoard', '#f97316', 3),
    C('Proxy AMD (CoreShield)', 'proxy-amd', 'CoreShield AMD proxy servers with DDoS protection, multi-location deployment in India & Mumbai. Perfect for BungeeCord and Velocity setups.', 'From ₹99/mo — 4 Plans', 'Shield', '#a855f7', 4),
    C('Proxy Intel (CoreShield)', 'proxy-intel', 'Intel-powered CoreShield proxy servers with ultra-low latency. Budget-friendly entry point for proxy hosting.', 'From ₹59/mo — 4 Plans', 'ShieldCheck', '#6366f1', 5),
    C('Hytale AMD', 'hytale-amd', 'AMD-powered Hytale server hosting with instant setup, DDoS protection, full file access, and one-click mod installation.', 'From ₹180/mo — 6 Plans', 'Gamepad2', '#ef4444', 6),
    C('Hytale Intel', 'hytale-intel', 'Budget-friendly Intel Hytale servers with the same features as AMD. Great for starting your Hytale community.', 'From ₹159/mo — 6 Plans', 'Gamepad2', '#f59e0b', 7),
    C('Intel Xeon VPS', 'intel-vps', 'Enterprise-grade Intel Xeon VPS with dedicated IPv4, Pterodactyl panel, 2Gbps unmetered network, and NVMe SSD. Anti-DDoS included.', 'From ₹159/mo — 6 Plans', 'Server', '#06b6d4', 8),
    C('AMD EPYC VPS', 'amd-vps', 'High-performance AMD EPYC VPS with up to 64GB DDR4 RAM, 16 vCPU cores, 2Gbps unmetered network. Premium hosting for demanding workloads.', 'From ₹199/mo — 6 Plans', 'HardDrive', '#14b8a6', 9),
    C('Web Hosting', 'web-hosting', 'Affordable web hosting with SSD storage, unmetered bandwidth, SSL, and one-click WordPress installer. From Coal to Diamond tier.', 'From ₹10/mo — 5 Plans', 'Globe2', '#22c55e', 10),
    C('Discord Bot Hosting', 'discord-bot-hosting', '24/7 Discord bot hosting supporting Python, JavaScript, Java, and Go. From 512MB to 8GB RAM with full SSH access.', 'From ₹20/mo — 5 Plans', 'Bot', '#8b5cf6', 11),
    C('Discord Services', 'discord-services', 'Professional Discord services including server setup, bot creation, VPS deployment, and custom design work. Expert Discord solutions.', 'Server, Bot & Design Services', 'MessageCircle', '#ec4899', 12),
    C('Paid Setup Services', 'paid-works', 'Professional setup services for Pterodactyl Panel, Wings, Blueprint, DDoS Protection, Billing Panel, and complete bundle packages.', 'Panel, Wings & Bundle Setups', 'Wrench', '#64748b', 13),
  ];

  // ── Feature sets ───────────────────────────────────────────────────
  const mcF = ['DDoS Protection', '99.9% Uptime', 'Instant Setup', 'Modpack Installer'];
  const prF = ['CoreDDoS', 'Multi-Location', 'India & Mumbai'];
  const hyF = ['Instant Setup', 'DDoS Protection', 'Full File Access', 'One-Click Mods'];
  const vpF = ['Dedicated IPv4', 'Pterodactyl Panel', 'Anti-DDoS', 'NVMe SSD'];
  const btF = ['24/7 Uptime', 'Python/JS/Java/Go', 'SSH Access'];
  const domF = ['DNS Management', 'WHOIS Privacy', 'Free Subdomain', 'Easy Setup'];
  const dsServerF = ['Full Server Setup', 'Channels & Roles', 'Welcome System', 'Custom Bots'];
  const dsBotF = ['Custom Bot Setup', 'Commands & Handlers', 'Error Handling', 'Documentation'];
  const dsCreationF = ['Complete Server Build', 'Custom Design', 'Roles & Channels', 'Welcome & Rules'];
  const dsVpsF = ['Dedicated VPS', 'Full Root Access', 'Bot & Server Hosting', 'DDoS Protection'];
  const dsDesignF = ['Custom Design', 'Source File Included', 'Unlimited Revisions', 'Fast Delivery'];
  const dsExtraF = ['Quick Setup', 'Professional Config', '24/7 Support'];
  const pwSetupF = ['Professional Setup', 'Secure Configuration', 'Documentation', 'Post-Setup Support'];
  const pwVpsF = ['Dedicated VPS', 'Full Root Access', 'Instant Deployment', 'NVMe SSD'];

  // ── Product definitions ────────────────────────────────────────────
  // Format: [catSlug, name, planId, catName, price, originalPrice, badge, specs, features, support, order]
  type P = [string, string, string, string, string, number, number | null, Record<string, string>, string[], string, number];

  const productDefs: P[] = [
    // ─── Domain Hosting (14) ─────────────────────────────────────────
    ['domain-hosting', '.FUN Domain', 'dom-fun', 'Domain Hosting', '159', 0, 'Popular', { tld: '.fun', type: 'Domain Registration' }, domF, 'Standard', 1],
    ['domain-hosting', '.STORE Domain', 'dom-store', 'Domain Hosting', '199', 0, 'Popular', { tld: '.store', type: 'Domain Registration' }, domF, 'Standard', 2],
    ['domain-hosting', '.SHOP Domain', 'dom-shop', 'Domain Hosting', '229', 0, '', { tld: '.shop', type: 'Domain Registration' }, domF, 'Standard', 3],
    ['domain-hosting', '.ONLINE Domain', 'dom-online', 'Domain Hosting', '299', 0, '', { tld: '.online', type: 'Domain Registration' }, domF, 'Standard', 4],
    ['domain-hosting', '.CLOUD Domain', 'dom-cloud', 'Domain Hosting', '289', 0, '', { tld: '.cloud', type: 'Domain Registration' }, domF, 'Standard', 5],
    ['domain-hosting', '.PRO Domain', 'dom-pro', 'Domain Hosting', '359', 0, '', { tld: '.pro', type: 'Domain Registration' }, domF, 'Standard', 6],
    ['domain-hosting', '.BLOG Domain', 'dom-blog', 'Domain Hosting', '489', 0, '', { tld: '.blog', type: 'Domain Registration' }, domF, 'Standard', 7],
    ['domain-hosting', '.CC Domain', 'dom-cc', 'Domain Hosting', '529', 0, '', { tld: '.cc', type: 'Domain Registration' }, domF, 'Standard', 8],
    ['domain-hosting', '.CO.IN Domain', 'dom-co-in', 'Domain Hosting', '649', 0, '', { tld: '.co.in', type: 'Domain Registration' }, domF, 'Standard', 9],
    ['domain-hosting', '.IN Domain', 'dom-in', 'Domain Hosting', '779', 0, '', { tld: '.in', type: 'Domain Registration' }, domF, 'Standard', 10],
    ['domain-hosting', '.TECH Domain', 'dom-tech', 'Domain Hosting', '819', 0, '', { tld: '.tech', type: 'Domain Registration' }, domF, 'Standard', 11],
    ['domain-hosting', '.ORG Domain', 'dom-org', 'Domain Hosting', '899', 0, '', { tld: '.org', type: 'Domain Registration' }, domF, 'Standard', 12],
    ['domain-hosting', '.COM Domain', 'dom-com', 'Domain Hosting', '1119', 0, '', { tld: '.com', type: 'Domain Registration' }, domF, 'Standard', 13],
    ['domain-hosting', '.NET Domain', 'dom-net', 'Domain Hosting', '1639', 0, '', { tld: '.net', type: 'Domain Registration' }, domF, 'Standard', 14],

    // ─── Minecraft Intel (7) ─────────────────────────────────────────
    ['minecraft-intel', 'Cow', 'cow-plan', 'Minecraft Intel', '39', 99, '', { ram: '2GB DDR4', cpu: '100% (1 vCPU)', storage: '20GB NVMe SSD', ports: '2' }, mcF, 'Standard', 1],
    ['minecraft-intel', 'Pig', 'pig-plan', 'Minecraft Intel', '99', 149, '', { ram: '4GB DDR4', cpu: '200% (2 vCPU)', storage: '30GB NVMe SSD', ports: '4' }, mcF, 'Standard', 2],
    ['minecraft-intel', 'Sheep', 'sheep-plan', 'Minecraft Intel', '199', 299, '', { ram: '6GB DDR4', cpu: '300% (3 vCPU)', storage: '45GB NVMe SSD', ports: '6' }, mcF, 'Standard', 3],
    ['minecraft-intel', 'Slime', 'slime-plan', 'Minecraft Intel', '299', 429, 'Most Popular', { ram: '8GB DDR4', cpu: '400% (4 vCPU)', storage: '90GB NVMe SSD', ports: '5' }, mcF, 'Priority', 4],
    ['minecraft-intel', 'Villager', 'villager-plan', 'Minecraft Intel', '499', 600, '', { ram: '12GB DDR4', cpu: '500% (5 vCPU)', storage: '100GB NVMe SSD', ports: '10' }, mcF, 'Priority', 5],
    ['minecraft-intel', 'Chicken', 'chicken-plan', 'Minecraft Intel', '559', 599, '', { ram: '16GB DDR4', cpu: '600% (6 vCPU)', storage: '110GB NVMe SSD', ports: '12' }, mcF, 'Priority', 6],
    ['minecraft-intel', 'Spider', 'spider-plan', 'Minecraft Intel', '699', 1299, 'Best Value', { ram: '24GB DDR4', cpu: '700% (7 vCPU)', storage: '120GB NVMe SSD', ports: '10' }, mcF, 'Premium', 7],

    // ─── Minecraft AMD (9) ───────────────────────────────────────────
    ['minecraft-amd', 'Mouse', 'mouse-plan', 'Minecraft AMD', '89', 149, '', { ram: '2GB DDR4', cpu: '100% (1 vCPU)', storage: '20GB NVMe SSD', ports: '2' }, mcF, 'Standard', 1],
    ['minecraft-amd', 'Rabbit', 'rabbit-plan', 'Minecraft AMD', '189', 249, '', { ram: '4GB DDR4', cpu: '200% (2 vCPU)', storage: '30GB NVMe SSD', ports: '3' }, mcF, 'Standard', 2],
    ['minecraft-amd', 'Fox', 'fox-plan', 'Minecraft AMD', '299', 499, 'Most Popular', { ram: '6GB DDR4', cpu: '300% (3 vCPU)', storage: '45GB NVMe SSD', ports: '4' }, mcF, 'Priority', 3],
    ['minecraft-amd', 'Lion', 'lion-plan', 'Minecraft AMD', '439', 599, '', { ram: '8GB DDR4', cpu: '400% (4 vCPU)', storage: '90GB NVMe SSD', ports: '5' }, mcF, 'Priority', 4],
    ['minecraft-amd', 'Bear', 'bear-plan', 'Minecraft AMD', '549', 749, '', { ram: '12GB DDR4', cpu: '500% (5 vCPU)', storage: '100GB NVMe SSD', ports: '6' }, mcF, 'Priority', 5],
    ['minecraft-amd', 'Panda', 'panda-plan', 'Minecraft AMD', '649', 899, '', { ram: '16GB DDR4', cpu: '600% (6 vCPU)', storage: '110GB NVMe SSD', ports: '8' }, mcF, 'Premium', 6],
    ['minecraft-amd', 'Dragon', 'dragon-plan', 'Minecraft AMD', '749', 999, '', { ram: '24GB DDR4', cpu: '700% (7 vCPU)', storage: '120GB NVMe SSD', ports: '10' }, mcF, 'Premium', 7],
    ['minecraft-amd', 'Gorilla', 'gorilla-plan', 'Minecraft AMD', '999', 1599, 'Best Value', { ram: '32GB DDR4', cpu: '800% (8 vCPU)', storage: '140GB NVMe SSD', ports: '10' }, mcF, 'Premium', 8],
    ['minecraft-amd', 'Elephant', 'elephant-plan', 'Minecraft AMD', '1499', 1999, '', { ram: '48GB DDR4', cpu: '900% (9 vCPU)', storage: '160GB NVMe SSD', ports: '16' }, mcF, 'Premium', 9],

    // ─── Proxy AMD (4) ───────────────────────────────────────────────
    ['proxy-amd', 'Starter', 'proxy-starter-amd', 'Proxy AMD', '99', 159, '', { ram: '1.5GB DDR4', cpu: '1 vCPU', storage: '10GB NVMe SSD' }, prF, 'Standard', 1],
    ['proxy-amd', 'Standard', 'proxy-standard-amd', 'Proxy AMD', '159', 299, '', { ram: '3GB DDR4', cpu: '2 vCPU', storage: '20GB NVMe SSD' }, prF, 'Standard', 2],
    ['proxy-amd', 'Pro Elite', 'proxy-pro-elite-amd', 'Proxy AMD', '199', 399, 'Most Popular', { ram: '6GB DDR4', cpu: '3 vCPU', storage: '30GB NVMe SSD' }, prF, 'Priority', 3],
    ['proxy-amd', 'Elite Network', 'proxy-elite-network-amd', 'Proxy AMD', '249', 449, '', { ram: '10GB DDR4', cpu: '4 vCPU', storage: '40GB NVMe SSD' }, prF, 'Priority', 4],

    // ─── Proxy Intel (4) ─────────────────────────────────────────────
    ['proxy-intel', 'Starter', 'proxy-starter-intel', 'Proxy Intel', '59', 99, '', { ram: '1.5GB DDR4', cpu: '1 vCPU', storage: '10GB NVMe SSD' }, prF, 'Standard', 1],
    ['proxy-intel', 'Standard', 'proxy-standard-intel', 'Proxy Intel', '99', 159, '', { ram: '3GB DDR4', cpu: '2 vCPU', storage: '20GB NVMe SSD' }, prF, 'Standard', 2],
    ['proxy-intel', 'Pro Elite', 'proxy-pro-elite-intel', 'Proxy Intel', '159', 199, 'Most Popular', { ram: '6GB DDR4', cpu: '3 vCPU', storage: '30GB NVMe SSD' }, prF, 'Priority', 3],
    ['proxy-intel', 'Elite Network', 'proxy-elite-network-intel', 'Proxy Intel', '209', 249, '', { ram: '10GB DDR4', cpu: '4 vCPU', storage: '40GB NVMe SSD' }, prF, 'Priority', 4],

    // ─── Hytale AMD (6) ──────────────────────────────────────────────
    ['hytale-amd', 'STARTER', 'hytale-amd-starter', 'Hytale AMD', '180', 0, '', { ram: '4GB DDR4', cpu: '200%' }, hyF, 'Standard', 1],
    ['hytale-amd', 'ADVENTURER', 'hytale-amd-adventurer', 'Hytale AMD', '280', 0, '', { ram: '6GB DDR4', cpu: '300%' }, hyF, 'Standard', 2],
    ['hytale-amd', 'EXPLORER', 'hytale-amd-explorer', 'Hytale AMD', '380', 0, 'Most Popular', { ram: '8GB DDR4', cpu: '400%' }, hyF, 'Priority', 3],
    ['hytale-amd', 'BUILDER', 'hytale-amd-builder', 'Hytale AMD', '520', 0, '', { ram: '12GB DDR4', cpu: '600%' }, hyF, 'Priority', 4],
    ['hytale-amd', 'KINGDOM', 'hytale-amd-kingdom', 'Hytale AMD', '680', 0, '', { ram: '16GB DDR4', cpu: '800%' }, hyF, 'Premium', 5],
    ['hytale-amd', 'EMPIRE', 'hytale-amd-empire', 'Hytale AMD', '799', 0, 'Best Value', { ram: '24GB DDR4', cpu: '1200%' }, hyF, 'Premium', 6],

    // ─── Hytale Intel (6) ────────────────────────────────────────────
    ['hytale-intel', 'STARTER', 'hytale-intel-starter', 'Hytale Intel', '159', 0, '', { ram: '4GB DDR4', cpu: '200%' }, hyF, 'Standard', 1],
    ['hytale-intel', 'ADVENTURER', 'hytale-intel-adventurer', 'Hytale Intel', '199', 0, '', { ram: '6GB DDR4', cpu: '300%' }, hyF, 'Standard', 2],
    ['hytale-intel', 'EXPLORER', 'hytale-intel-explorer', 'Hytale Intel', '299', 0, 'Most Popular', { ram: '8GB DDR4', cpu: '400%' }, hyF, 'Priority', 3],
    ['hytale-intel', 'BUILDER', 'hytale-intel-builder', 'Hytale Intel', '399', 0, '', { ram: '12GB DDR4', cpu: '600%' }, hyF, 'Priority', 4],
    ['hytale-intel', 'KINGDOM', 'hytale-intel-kingdom', 'Hytale Intel', '499', 0, '', { ram: '16GB DDR4', cpu: '800%' }, hyF, 'Premium', 5],
    ['hytale-intel', 'EMPIRE', 'hytale-intel-empire', 'Hytale Intel', '599', 0, 'Best Value', { ram: '24GB DDR4', cpu: '1200%' }, hyF, 'Premium', 6],

    // ─── Intel Xeon VPS (6) ──────────────────────────────────────────
    ['intel-vps', 'Entry Level', 'intel-vps-entry', 'Intel Xeon VPS', '159', 300, '', { ram: '2GB DDR4', cpu: '1 vCore', network: '2Gbps Unmetered' }, vpF, 'Standard', 1],
    ['intel-vps', 'Growth Ready', 'intel-vps-growth', 'Intel Xeon VPS', '259', 490, '', { ram: '4GB DDR4', cpu: '2 vCore', network: '2Gbps Unmetered' }, vpF, 'Standard', 2],
    ['intel-vps', 'Performance', 'intel-vps-performance', 'Intel Xeon VPS', '399', 550, 'Most Popular', { ram: '8GB DDR4', cpu: '2 vCore', network: '2Gbps Unmetered' }, vpF, 'Priority', 3],
    ['intel-vps', 'Pro Edition', 'intel-vps-pro', 'Intel Xeon VPS', '759', 1200, '', { ram: '16GB DDR4', cpu: '4 vCore', network: '2Gbps Unmetered' }, vpF, 'Priority', 4],
    ['intel-vps', 'Ultra Tier', 'intel-vps-ultra', 'Intel Xeon VPS', '1499', 2100, '', { ram: '32GB DDR4', cpu: '8 vCore', network: '2Gbps Unmetered' }, vpF, 'Premium', 5],
    ['intel-vps', 'Supreme Tier', 'intel-vps-supreme', 'Intel Xeon VPS', '2999', 3999, 'Best Value', { ram: '64GB DDR4', cpu: '16 vCore', network: '2Gbps Unmetered' }, vpF, 'Premium', 6],

    // ─── AMD EPYC VPS (6) ────────────────────────────────────────────
    ['amd-vps', 'BRONZE', 'amd-vps-bronze', 'AMD EPYC VPS', '199', 390, '', { ram: '2GB DDR4', cpu: '1 vCore', network: '2Gbps Unmetered' }, vpF, 'Standard', 1],
    ['amd-vps', 'SILVER', 'amd-vps-silver', 'AMD EPYC VPS', '319', 480, '', { ram: '4GB DDR4', cpu: '2 vCore', network: '2Gbps Unmetered' }, vpF, 'Standard', 2],
    ['amd-vps', 'GOLD', 'amd-vps-gold', 'AMD EPYC VPS', '559', 699, 'Most Popular', { ram: '8GB DDR4', cpu: '2 vCore', network: '2Gbps Unmetered' }, vpF, 'Priority', 3],
    ['amd-vps', 'PLATINUM', 'amd-vps-platinum', 'AMD EPYC VPS', '999', 1260, '', { ram: '16GB DDR4', cpu: '4 vCore', network: '2Gbps Unmetered' }, vpF, 'Priority', 4],
    ['amd-vps', 'ULTIMATE 32', 'amd-vps-ultimate-32', 'AMD EPYC VPS', '1999', 2599, '', { ram: '32GB DDR4', cpu: '8 vCore', network: '2Gbps Unmetered' }, vpF, 'Premium', 5],
    ['amd-vps', 'ULTIMATE 64', 'amd-vps-ultimate-64', 'AMD EPYC VPS', '3999', 4730, 'Best Value', { ram: '64GB DDR4', cpu: '16 vCore', network: '2Gbps Unmetered' }, vpF, 'Premium', 6],

    // ─── Web Hosting (5) ─────────────────────────────────────────────
    ['web-hosting', 'COAL', 'web-coal', 'Web Hosting', '10', 0, '', { websites: '1', storage: '500MB SSD', bandwidth: '1GB', ssl: 'No', email: '0', databases: '1' }, ['SSD Storage', 'cPanel', 'Free SSL'], 'Standard', 1],
    ['web-hosting', 'COPPER', 'web-copper', 'Web Hosting', '35', 0, '', { websites: '1', storage: '5GB SSD', bandwidth: 'Unmetered', ssl: 'Yes', email: '1', databases: '5' }, ['Unmetered Bandwidth', 'Free SSL', 'cPanel'], 'Standard', 2],
    ['web-hosting', 'IRON', 'web-iron', 'Web Hosting', '64', 0, 'Most Popular', { websites: '3', storage: '10GB SSD', bandwidth: 'Unmetered', ssl: 'Yes', email: '5', databases: '10' }, ['Unmetered Bandwidth', 'Free SSL', 'cPanel', 'Multi-site'], 'Priority', 3],
    ['web-hosting', 'EMERALD', 'web-emerald', 'Web Hosting', '104', 0, '', { websites: '5', storage: '15GB SSD', bandwidth: 'Unmetered', ssl: 'Yes', email: '10', databases: 'Unlimited' }, ['Unmetered Bandwidth', 'Free SSL', 'cPanel', 'Multi-site'], 'Priority', 4],
    ['web-hosting', 'DIAMOND', 'web-diamond', 'Web Hosting', '154', 0, 'Best Value', { websites: '10', storage: '25GB SSD', bandwidth: 'Unmetered', ssl: 'Yes', email: 'Unlimited', databases: 'Unlimited' }, ['Unmetered Bandwidth', 'Free SSL', 'cPanel', 'Multi-site', 'Priority Support'], 'Premium', 5],

    // ─── Discord Bot Hosting (5) ─────────────────────────────────────
    ['discord-bot-hosting', 'STARTER', 'discord-bot-starter', 'Discord Bot Hosting', '20', 0, '', { ram: '512MB', cpu: '50%', storage: '2GB SSD' }, btF, 'Standard', 1],
    ['discord-bot-hosting', 'PRO', 'discord-bot-pro', 'Discord Bot Hosting', '35', 0, 'Most Popular', { ram: '1GB', cpu: '100%', storage: '5GB SSD' }, btF, 'Priority', 2],
    ['discord-bot-hosting', 'ELITE', 'discord-bot-elite', 'Discord Bot Hosting', '65', 0, '', { ram: '2GB', cpu: '150%', storage: '10GB SSD' }, btF, 'Priority', 3],
    ['discord-bot-hosting', 'ULTRA', 'discord-bot-ultra', 'Discord Bot Hosting', '105', 0, '', { ram: '4GB', cpu: '200%', storage: '20GB SSD' }, btF, 'Premium', 4],
    ['discord-bot-hosting', 'ENTERPRISE', 'discord-bot-enterprise', 'Discord Bot Hosting', '205', 0, 'Best Value', { ram: '8GB', cpu: '400%', storage: '50GB SSD' }, btF, 'Premium', 5],

    // ─── Discord Services (22) ───────────────────────────────────────
    // Server Setup (3)
    ['discord-services', 'Server Setup — Basic', 'ds-server-basic', 'Discord Services', '25', 0, '', { tier: 'Server Setup', item: 'Basic Setup', includes: '10 channels, 5 roles' }, dsServerF, 'Standard', 1],
    ['discord-services', 'Server Setup — Medium', 'ds-server-medium', 'Discord Services', '55', 0, '', { tier: 'Server Setup', item: 'Medium Setup', includes: '25 channels, 15 roles, welcome' }, dsServerF, 'Standard', 2],
    ['discord-services', 'Server Setup — Pro', 'ds-server-pro', 'Discord Services', '105', 0, 'Most Popular', { tier: 'Server Setup', item: 'Pro Setup', includes: '50+ channels, 25+ roles, tickets, welcome, rules' }, dsServerF, 'Priority', 3],
    // Bot Setup (3)
    ['discord-services', 'Bot Setup — Basic', 'ds-bot-basic', 'Discord Services', '20', 0, '', { tier: 'Bot Setup', item: 'Basic Bot', includes: 'Prefix commands, help menu' }, dsBotF, 'Standard', 4],
    ['discord-services', 'Bot Setup — AutoMod', 'ds-bot-automod', 'Discord Services', '35', 0, '', { tier: 'Bot Setup', item: 'AutoMod Bot', includes: 'Anti-spam, anti-raid, auto-mod, logs' }, dsBotF, 'Standard', 5],
    ['discord-services', 'Bot Setup — Music', 'ds-bot-music', 'Discord Services', '25', 0, '', { tier: 'Bot Setup', item: 'Music Bot', includes: 'Music playback, queue, playlists' }, dsBotF, 'Standard', 6],
    // Server Creation (3)
    ['discord-services', 'Server Creation — Normal', 'ds-creation-normal', 'Discord Services', '60', 0, '', { tier: 'Server Creation', item: 'Normal Server', includes: 'Custom server from scratch, 20 channels' }, dsCreationF, 'Standard', 7],
    ['discord-services', 'Server Creation — Best', 'ds-creation-best', 'Discord Services', '120', 0, '', { tier: 'Server Creation', item: 'Best Server', includes: 'Premium design, 40+ channels, bots, forms' }, dsCreationF, 'Priority', 8],
    ['discord-services', 'Server Creation — World Class', 'ds-creation-worldbest', 'Discord Services', '200', 0, 'Best Value', { tier: 'Server Creation', item: 'World Class Server', includes: 'Ultimate design, 60+ channels, custom bots, tickets, forms, economy' }, dsCreationF, 'Premium', 9],
    // VPS (6)
    ['discord-services', 'Discord VPS — 4GB', 'ds-vps-4gb', 'Discord Services', '89', 0, '', { tier: 'VPS', ram: '4GB DDR4', cpu: '2 vCPU', storage: '40GB NVMe SSD' }, dsVpsF, 'Standard', 10],
    ['discord-services', 'Discord VPS — 8GB', 'ds-vps-8gb', 'Discord Services', '129', 0, '', { tier: 'VPS', ram: '8GB DDR4', cpu: '4 vCPU', storage: '80GB NVMe SSD' }, dsVpsF, 'Standard', 11],
    ['discord-services', 'Discord VPS — 16GB', 'ds-vps-16gb', 'Discord Services', '189', 0, 'Most Popular', { tier: 'VPS', ram: '16GB DDR4', cpu: '6 vCPU', storage: '120GB NVMe SSD' }, dsVpsF, 'Priority', 12],
    ['discord-services', 'Discord VPS — 32GB', 'ds-vps-32gb', 'Discord Services', '219', 0, '', { tier: 'VPS', ram: '32GB DDR4', cpu: '8 vCPU', storage: '200GB NVMe SSD' }, dsVpsF, 'Priority', 13],
    ['discord-services', 'Discord VPS — 48GB', 'ds-vps-48gb', 'Discord Services', '299', 0, '', { tier: 'VPS', ram: '48GB DDR4', cpu: '12 vCPU', storage: '300GB NVMe SSD' }, dsVpsF, 'Premium', 14],
    ['discord-services', 'Discord VPS — 64GB', 'ds-vps-64gb', 'Discord Services', '399', 0, '', { tier: 'VPS', ram: '64GB DDR4', cpu: '16 vCPU', storage: '400GB NVMe SSD' }, dsVpsF, 'Premium', 15],
    // Design (3)
    ['discord-services', 'Banner Design', 'ds-design-banner', 'Discord Services', '25', 0, '', { tier: 'Design', item: 'Server Banner', includes: 'Custom banner, 1920x1080px' }, dsDesignF, 'Standard', 16],
    ['discord-services', 'Profile Design', 'ds-design-profile', 'Discord Services', '20', 0, '', { tier: 'Design', item: 'Profile Design', includes: 'Server icon + invite background' }, dsDesignF, 'Standard', 17],
    ['discord-services', 'Logo Design', 'ds-design-logo', 'Discord Services', '25', 0, '', { tier: 'Design', item: 'Logo Design', includes: 'Custom logo, multiple formats' }, dsDesignF, 'Standard', 18],
    // Extras (4)
    ['discord-services', 'Extra Channels', 'ds-extra-channel', 'Discord Services', '15', 0, '', { tier: 'Add-on', item: 'Extra Channels', count: '10 channels' }, dsExtraF, 'Standard', 19],
    ['discord-services', 'Extra Roles', 'ds-extra-roles', 'Discord Services', '15', 0, '', { tier: 'Add-on', item: 'Extra Roles', count: '10 roles with perms' }, dsExtraF, 'Standard', 20],
    ['discord-services', 'Extra Emoji', 'ds-extra-emoji', 'Discord Services', '20', 0, '', { tier: 'Add-on', item: 'Custom Emoji Pack', count: '20 animated emojis' }, dsExtraF, 'Standard', 21],
    ['discord-services', 'Extra Security', 'ds-extra-security', 'Discord Services', '30', 0, '', { tier: 'Add-on', item: 'Security Setup', includes: 'Anti-nuke, anti-raid, verification' }, dsExtraF, 'Standard', 22],

    // ─── Paid Setup Services (17) ────────────────────────────────────
    ['paid-works', 'Pterodactyl Panel Setup', 'pw-panel', 'Paid Setup Services', '39', 0, '', { type: 'Panel Setup', includes: 'Panel installation & configuration' }, pwSetupF, 'Standard', 1],
    ['paid-works', 'Wings Setup', 'pw-wings', 'Paid Setup Services', '49', 0, '', { type: 'Wings Setup', includes: 'Wings daemon installation & node config' }, pwSetupF, 'Standard', 2],
    ['paid-works', 'Panel + Wings Bundle', 'pw-panel-wings', 'Paid Setup Services', '75', 0, '', { type: 'Bundle Setup', includes: 'Panel + Wings full setup & connection' }, pwSetupF, 'Standard', 3],
    ['paid-works', 'Blueprint Setup', 'pw-blueprint', 'Paid Setup Services', '49', 0, '', { type: 'Blueprint Setup', includes: 'Blueprint mod installation & config' }, pwSetupF, 'Standard', 4],
    ['paid-works', 'Wings + Blueprint', 'pw-wings-blueprint', 'Paid Setup Services', '69', 0, '', { type: 'Bundle Setup', includes: 'Wings + Blueprint combined setup' }, pwSetupF, 'Standard', 5],
    ['paid-works', 'Full Bundle Setup', 'pw-bundle', 'Paid Setup Services', '119', 0, 'Most Popular', { type: 'Bundle Setup', includes: 'Panel + Wings + Blueprint full setup' }, pwSetupF, 'Priority', 6],
    ['paid-works', '10-Slot Extension', 'pw-ext-10', 'Paid Setup Services', '149', 0, '', { type: 'Extension', includes: 'Extend to 10 server slots' }, pwSetupF, 'Standard', 7],
    ['paid-works', '20-Slot Extension', 'pw-ext-20', 'Paid Setup Services', '159', 0, '', { type: 'Extension', includes: 'Extend to 20 server slots' }, pwSetupF, 'Standard', 8],
    ['paid-works', 'DDoS Protection Setup', 'pw-ddos', 'Paid Setup Services', '159', 0, '', { type: 'Security Setup', includes: 'Enterprise DDoS protection config' }, pwSetupF, 'Priority', 9],
    ['paid-works', 'Billing Panel Setup', 'pw-billing', 'Paid Setup Services', '129', 0, '', { type: 'Billing Setup', includes: 'Billing panel installation & payment gateway' }, pwSetupF, 'Priority', 10],
    // VPS Setups (6)
    ['paid-works', 'VPS Setup — 4GB', 'pw-vps-4gb', 'Paid Setup Services', '89', 0, '', { type: 'VPS Setup', ram: '4GB DDR4', cpu: '2 vCPU', storage: '40GB NVMe SSD' }, pwVpsF, 'Standard', 11],
    ['paid-works', 'VPS Setup — 8GB', 'pw-vps-8gb', 'Paid Setup Services', '129', 0, '', { type: 'VPS Setup', ram: '8GB DDR4', cpu: '4 vCPU', storage: '80GB NVMe SSD' }, pwVpsF, 'Standard', 12],
    ['paid-works', 'VPS Setup — 16GB', 'pw-vps-16gb', 'Paid Setup Services', '189', 0, '', { type: 'VPS Setup', ram: '16GB DDR4', cpu: '6 vCPU', storage: '120GB NVMe SSD' }, pwVpsF, 'Priority', 13],
    ['paid-works', 'VPS Setup — 32GB', 'pw-vps-32gb', 'Paid Setup Services', '219', 0, '', { type: 'VPS Setup', ram: '32GB DDR4', cpu: '8 vCPU', storage: '200GB NVMe SSD' }, pwVpsF, 'Priority', 14],
    ['paid-works', 'VPS Setup — 48GB', 'pw-vps-48gb', 'Paid Setup Services', '299', 0, '', { type: 'VPS Setup', ram: '48GB DDR4', cpu: '12 vCPU', storage: '300GB NVMe SSD' }, pwVpsF, 'Premium', 15],
    ['paid-works', 'VPS Setup — 64GB', 'pw-vps-64gb', 'Paid Setup Services', '399', 0, '', { type: 'VPS Setup', ram: '64GB DDR4', cpu: '16 vCPU', storage: '400GB NVMe SSD' }, pwVpsF, 'Premium', 16],
    // Mega Pack
    ['paid-works', 'MEGA PACK', 'pw-mega-pack', 'Paid Setup Services', '1000', 0, 'Best Value', { type: 'Mega Pack', includes: 'Panel + Wings + Blueprint + DDoS + Billing + 16GB VPS' }, pwSetupF, 'Premium', 17],
  ];

  return { categories, productDefs };
}