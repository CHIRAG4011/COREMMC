// CoreMMC — Firestore Seed Script
// Run:  bun run scripts/seed-firestore.ts
// Requires: firebase-admin package (bun add firebase-admin)
// Set env vars or place service-account.json in project root:
//   FIREBASE_SERVICE_ACCOUNT  OR  service-account.json
//   OWNER_UID (optional — your Firebase Auth UID for the owner account)

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── Firebase Admin Init ───────────────────────────────────────────────────
let serviceAccount;
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || readFileSync('service-account.json', 'utf8');
  serviceAccount = JSON.parse(raw);
} catch {
  console.error('⚠ No Firebase service account found.');
  console.error('  Set FIREBASE_SERVICE_ACCOUNT env var or place service-account.json in project root.');
  process.exit(1);
}

const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const db = getFirestore(app);
const now = Timestamp.now();

// ══════════════════════════════════════════════════════════════════════════
// 1. ROLES
// ══════════════════════════════════════════════════════════════════════════
const roles = [
  {
    name: 'user', label: 'User', priority: 1,
    permissions: ['dashboard.read'],
  },
  {
    name: 'admin', label: 'Admin', priority: 2,
    permissions: [
      'users.read', 'users.write',
      'products.read', 'products.write', 'products.create', 'products.delete',
      'categories.read', 'categories.write', 'categories.create', 'categories.delete',
      'payments.read', 'payments.write', 'payments.create', 'payments.delete',
      'announcements.read', 'announcements.write', 'announcements.create', 'announcements.delete',
      'offers.read', 'offers.write', 'offers.create', 'offers.delete',
      'settings.read', 'settings.write',
      'activity.read', 'dashboard.read',
    ],
  },
  {
    name: 'owner', label: 'Owner', priority: 3,
    permissions: [
      'users.read', 'users.write', 'users.delete', 'users.manageRoles',
      'products.read', 'products.write', 'products.create', 'products.delete',
      'categories.read', 'categories.write', 'categories.create', 'categories.delete',
      'payments.read', 'payments.write', 'payments.create', 'payments.delete',
      'announcements.read', 'announcements.write', 'announcements.create', 'announcements.delete',
      'offers.read', 'offers.write', 'offers.create', 'offers.delete',
      'settings.read', 'settings.write',
      'activity.read', 'dashboard.read',
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════
// 2. CATEGORIES (13)
// ══════════════════════════════════════════════════════════════════════════
const categories = [
  { id: 'domain-hosting', name: 'Domain Hosting', slug: 'domain-hosting', description: 'Register your perfect domain name with premium DNS management, WHOIS privacy, and free subdomains. Choose from 15+ TLDs at India-best prices.', shortDescription: '15+ TLDs starting ₹159', icon: 'Globe', color: '#3b82f6', gradient: 'from-blue-500 to-blue-700', order: 1, active: true, featured: true, heroTitle: 'Find Your Perfect Domain', heroSubtitle: 'Premium domains with free DNS management and WHOIS privacy protection.', metaTitle: 'Domain Registration | CoreMMC — .com .in .net from ₹159', metaDescription: "Register .com, .in, .net, .org domains starting ₹159. Free WHOIS privacy, DNS management, and subdomains. India's best domain prices.", createdAt: now, updatedAt: now },
  { id: 'minecraft-intel', name: 'Minecraft Intel', slug: 'minecraft-intel', description: 'High-performance Intel-powered Minecraft server hosting with DDR4 RAM, NVMe SSD storage, DDoS protection, and instant setup. Starting from just ₹39/mo.', shortDescription: 'From ₹39/mo — 7 Plans', icon: 'Cpu', color: '#22c55e', gradient: 'from-green-500 to-emerald-700', order: 2, active: true, featured: true, heroTitle: 'Intel Minecraft Hosting', heroSubtitle: 'DDR4 RAM · NVMe SSD · 99.9% Uptime · Instant Setup', metaTitle: 'Minecraft Intel Hosting | CoreMMC — From ₹39/mo', metaDescription: 'Intel-powered Minecraft server hosting from ₹39/mo. DDR4 RAM, NVMe SSD, DDoS protection. 7 plans available.', createdAt: now, updatedAt: now },
  { id: 'minecraft-amd', name: 'Minecraft AMD', slug: 'minecraft-amd', description: 'AMD-powered Minecraft servers with EPYC/Ryzen CPUs, massive RAM, NVMe SSD. Perfect for large communities and modded servers. 9 plans available.', shortDescription: 'From ₹89/mo — 9 Plans', icon: 'CircuitBoard', color: '#f97316', gradient: 'from-orange-500 to-red-600', order: 3, active: true, featured: true, heroTitle: 'AMD Minecraft Hosting', heroSubtitle: 'EPYC/Ryzen CPUs · Up to 48GB RAM · Modpack Support', metaTitle: 'Minecraft AMD Hosting | CoreMMC — From ₹89/mo', metaDescription: 'AMD EPYC/Ryzen Minecraft hosting from ₹89/mo. Up to 48GB RAM, NVMe SSD, DDoS protection. 9 plans.', createdAt: now, updatedAt: now },
  { id: 'proxy-amd', name: 'Proxy AMD (CoreShield)', slug: 'proxy-amd', description: 'CoreShield AMD proxy servers with DDoS protection, multi-location deployment in India & Mumbai. Perfect for BungeeCord and Velocity setups.', shortDescription: 'From ₹99/mo — 4 Plans', icon: 'Shield', color: '#a855f7', gradient: 'from-purple-500 to-violet-700', order: 4, active: true, featured: true, heroTitle: 'CoreShield AMD Proxy', heroSubtitle: 'DDoS Protected · Multi-Location · BungeeCord Ready', metaTitle: 'Proxy AMD CoreShield | CoreMMC — From ₹99/mo', metaDescription: 'CoreShield AMD proxy hosting from ₹99/mo. DDoS protection, multi-location India deployment. 4 plans.', createdAt: now, updatedAt: now },
  { id: 'proxy-intel', name: 'Proxy Intel (CoreShield)', slug: 'proxy-intel', description: 'Intel-powered CoreShield proxy servers with ultra-low latency. Budget-friendly entry point for proxy hosting.', shortDescription: 'From ₹59/mo — 4 Plans', icon: 'ShieldCheck', color: '#6366f1', gradient: 'from-indigo-500 to-purple-700', order: 5, active: true, featured: true, heroTitle: 'CoreShield Intel Proxy', heroSubtitle: 'Budget-Friendly · Ultra-Low Latency · DDoS Shield', metaTitle: 'Proxy Intel CoreShield | CoreMMC — From ₹59/mo', metaDescription: 'Intel CoreShield proxy hosting from ₹59/mo. Budget-friendly DDoS protection for BungeeCord. 4 plans.', createdAt: now, updatedAt: now },
  { id: 'hytale-amd', name: 'Hytale AMD', slug: 'hytale-amd', description: 'AMD-powered Hytale server hosting with instant setup, DDoS protection, full file access, and one-click mod installation.', shortDescription: 'From ₹180/mo — 6 Plans', icon: 'Gamepad2', color: '#ef4444', gradient: 'from-red-500 to-rose-700', order: 6, active: true, featured: true, heroTitle: 'Hytale AMD Servers', heroSubtitle: 'Instant Setup · One-Click Mods · DDoS Protection', metaTitle: 'Hytale AMD Hosting | CoreMMC — From ₹180/mo', metaDescription: 'AMD Hytale server hosting from ₹180/mo. Full file access, DDoS protection, one-click mods. 6 plans.', createdAt: now, updatedAt: now },
  { id: 'hytale-intel', name: 'Hytale Intel', slug: 'hytale-intel', description: 'Budget-friendly Intel Hytale servers with the same features as AMD. Great for starting your Hytale community.', shortDescription: 'From ₹159/mo — 6 Plans', icon: 'Gamepad2', color: '#f59e0b', gradient: 'from-amber-500 to-orange-700', order: 7, active: true, featured: true, heroTitle: 'Hytale Intel Servers', heroSubtitle: 'Budget Hytale Hosting · Same Features · Lower Price', metaTitle: 'Hytale Intel Hosting | CoreMMC — From ₹159/mo', metaDescription: 'Intel Hytale server hosting from ₹159/mo. Budget-friendly with full features. 6 plans available.', createdAt: now, updatedAt: now },
  { id: 'intel-vps', name: 'Intel Xeon VPS', slug: 'intel-vps', description: 'Enterprise-grade Intel Xeon VPS with dedicated IPv4, Pterodactyl panel, 2Gbps unmetered network, and NVMe SSD. Anti-DDoS included.', shortDescription: 'From ₹159/mo — 6 Plans', icon: 'Server', color: '#06b6d4', gradient: 'from-cyan-500 to-teal-700', order: 8, active: true, featured: true, heroTitle: 'Intel Xeon VPS', heroSubtitle: 'Dedicated IPv4 · 2Gbps Unmetered · Pterodactyl Panel', metaTitle: 'Intel Xeon VPS | CoreMMC — From ₹159/mo', metaDescription: 'Intel Xeon VPS from ₹159/mo. Dedicated IPv4, 2Gbps unmetered, NVMe SSD, anti-DDoS. 6 plans.', createdAt: now, updatedAt: now },
  { id: 'amd-vps', name: 'AMD EPYC VPS', slug: 'amd-vps', description: 'High-performance AMD EPYC VPS with up to 64GB DDR4 RAM, 16 vCPU cores, 2Gbps unmetered network. Premium hosting for demanding workloads.', shortDescription: 'From ₹199/mo — 6 Plans', icon: 'HardDrive', color: '#14b8a6', gradient: 'from-teal-500 to-emerald-700', order: 9, active: true, featured: true, heroTitle: 'AMD EPYC VPS', heroSubtitle: 'Up to 64GB RAM · 16 vCPU · 2Gbps Unmetered', metaTitle: 'AMD EPYC VPS | CoreMMC — From ₹199/mo', metaDescription: 'AMD EPYC VPS from ₹199/mo. Up to 64GB RAM, 16 vCPU, 2Gbps unmetered network. 6 plans.', createdAt: now, updatedAt: now },
  { id: 'web-hosting', name: 'Web Hosting', slug: 'web-hosting', description: 'Affordable web hosting with SSD storage, unmetered bandwidth, SSL, and one-click WordPress installer. From Coal to Diamond tier.', shortDescription: 'From ₹10/mo — 5 Plans', icon: 'Globe2', color: '#22c55e', gradient: 'from-green-500 to-teal-600', order: 10, active: true, featured: true, heroTitle: 'Web Hosting', heroSubtitle: 'SSD Storage · Free SSL · cPanel · Unmetered Bandwidth', metaTitle: 'Web Hosting India | CoreMMC — From ₹10/mo', metaDescription: 'Affordable web hosting from ₹10/mo. SSD storage, free SSL, cPanel, unmetered bandwidth. 5 plans.', createdAt: now, updatedAt: now },
  { id: 'discord-bot-hosting', name: 'Discord Bot Hosting', slug: 'discord-bot-hosting', description: '24/7 Discord bot hosting supporting Python, JavaScript, Java, and Go. From 512MB to 8GB RAM with full SSH access.', shortDescription: 'From ₹20/mo — 5 Plans', icon: 'Bot', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-700', order: 11, active: true, featured: true, heroTitle: 'Discord Bot Hosting', heroSubtitle: 'Python · JavaScript · Java · Go · 24/7 Uptime', metaTitle: 'Discord Bot Hosting | CoreMMC — From ₹20/mo', metaDescription: 'Discord bot hosting from ₹20/mo. Python, JS, Java, Go support. 512MB to 8GB RAM, SSH access. 5 plans.', createdAt: now, updatedAt: now },
  { id: 'discord-services', name: 'Discord Services', slug: 'discord-services', description: 'Professional Discord services including server setup, bot creation, VPS deployment, and custom design work. Expert Discord solutions.', shortDescription: 'Server, Bot & Design Services', icon: 'MessageCircle', color: '#ec4899', gradient: 'from-pink-500 to-rose-700', order: 12, active: true, featured: true, heroTitle: 'Discord Services', heroSubtitle: 'Server Setup · Bot Creation · VPS Deploy · Design', metaTitle: 'Discord Services | CoreMMC — Setup, Bots, Design', metaDescription: 'Professional Discord services. Server setup from ₹25, bot creation from ₹60, VPS deploy, design work.', createdAt: now, updatedAt: now },
  { id: 'paid-works', name: 'Paid Setup Services', slug: 'paid-works', description: 'Professional setup services for Pterodactyl Panel, Wings, Blueprint, DDoS Protection, Billing Panel, and complete bundle packages.', shortDescription: 'Panel, Wings & Bundle Setups', icon: 'Wrench', color: '#64748b', gradient: 'from-slate-500 to-gray-700', order: 13, active: true, featured: true, heroTitle: 'Setup Services', heroSubtitle: 'Pterodactyl Panel · Wings · Blueprint · DDoS Shield', metaTitle: 'Setup Services | CoreMMC — Panel, Wings, Bundle', metaDescription: 'Professional setup services. Pterodactyl Panel from ₹39, Wings from ₹49, Bundle from ₹119, Mega Pack ₹1000.', createdAt: now, updatedAt: now },
];

// ══════════════════════════════════════════════════════════════════════════
// 3. PRODUCTS (60 total)
// ══════════════════════════════════════════════════════════════════════════
const mcF = ['DDoS Protection', '99.9% Uptime', 'Instant Setup', 'Modpack Installer'];
const prF = ['CoreDDoS', 'Multi-Location', 'India & Mumbai'];
const hyF = ['Instant Setup', 'DDoS Protection', 'Full File Access', 'One-Click Mods'];
const vpF = ['Dedicated IPv4', 'Pterodactyl Panel', 'Anti-DDoS', 'NVMe SSD'];
const btF = ['24/7 Uptime', 'Python/JS/Java/Go', 'SSH Access'];
const P = (cat: string, name: string, cid: string, cn: string, price: number, op: number | null, badge: string, specs: Record<string, string>, features: string[], support: string, order: number) => ({
  planId: cid, name, category: cat, categoryName: cn, price, originalPrice: op,
  currency: 'INR', billingCycle: 'monthly', billingUrl: '', active: true,
  popular: badge === 'Most Popular', badge, specs, features, support, location: 'India', setup: 'Instant', order, createdAt: now, updatedAt: now,
});

const products = [
  // Minecraft Intel (7)
  P('minecraft-intel','Cow','cow-plan','Minecraft Intel',39,99,'', {ram:'2GB DDR4',cpu:'100% (1 vCPU)',storage:'20GB NVMe SSD',ports:'2'},mcF,'Standard',1),
  P('minecraft-intel','Pig','pig-plan','Minecraft Intel',99,149,'', {ram:'4GB DDR4',cpu:'200% (2 vCPU)',storage:'30GB NVMe SSD',ports:'4'},mcF,'Standard',2),
  P('minecraft-intel','Sheep','sheep-plan','Minecraft Intel',199,299,'', {ram:'6GB DDR4',cpu:'300% (3 vCPU)',storage:'45GB NVMe SSD',ports:'6'},mcF,'Standard',3),
  P('minecraft-intel','Slime','slime-plan','Minecraft Intel',299,429,'Most Popular', {ram:'8GB DDR4',cpu:'400% (4 vCPU)',storage:'90GB NVMe SSD',ports:'5'},mcF,'Priority',4),
  P('minecraft-intel','Villager','villager-plan','Minecraft Intel',499,600,'', {ram:'12GB DDR4',cpu:'500% (5 vCPU)',storage:'100GB NVMe SSD',ports:'10'},mcF,'Priority',5),
  P('minecraft-intel','Chicken','chicken-plan','Minecraft Intel',559,599,'', {ram:'16GB DDR4',cpu:'600% (6 vCPU)',storage:'110GB NVMe SSD',ports:'12'},mcF,'Priority',6),
  P('minecraft-intel','Spider','spider-plan','Minecraft Intel',699,1299,'Best Value', {ram:'24GB DDR4',cpu:'700% (7 vCPU)',storage:'120GB NVMe SSD',ports:'10'},mcF,'Premium',7),
  // Minecraft AMD (9)
  P('minecraft-amd','Mouse','mouse-plan','Minecraft AMD',89,149,'', {ram:'2GB DDR4',cpu:'100% (1 vCPU)',storage:'20GB NVMe SSD',ports:'2'},mcF,'Standard',1),
  P('minecraft-amd','Rabbit','rabbit-plan','Minecraft AMD',189,249,'', {ram:'4GB DDR4',cpu:'200% (2 vCPU)',storage:'30GB NVMe SSD',ports:'3'},mcF,'Standard',2),
  P('minecraft-amd','Fox','fox-plan','Minecraft AMD',299,499,'Most Popular', {ram:'6GB DDR4',cpu:'300% (3 vCPU)',storage:'45GB NVMe SSD',ports:'4'},mcF,'Priority',3),
  P('minecraft-amd','Lion','lion-plan','Minecraft AMD',439,599,'', {ram:'8GB DDR4',cpu:'400% (4 vCPU)',storage:'90GB NVMe SSD',ports:'5'},mcF,'Priority',4),
  P('minecraft-amd','Bear','bear-plan','Minecraft AMD',549,749,'', {ram:'12GB DDR4',cpu:'500% (5 vCPU)',storage:'100GB NVMe SSD',ports:'6'},mcF,'Priority',5),
  P('minecraft-amd','Panda','panda-plan','Minecraft AMD',649,899,'', {ram:'16GB DDR4',cpu:'600% (6 vCPU)',storage:'110GB NVMe SSD',ports:'8'},mcF,'Premium',6),
  P('minecraft-amd','Dragon','dragon-plan','Minecraft AMD',749,999,'', {ram:'24GB DDR4',cpu:'700% (7 vCPU)',storage:'120GB NVMe SSD',ports:'10'},mcF,'Premium',7),
  P('minecraft-amd','Gorilla','gorilla-plan','Minecraft AMD',999,1599,'Best Value', {ram:'32GB DDR4',cpu:'800% (8 vCPU)',storage:'140GB NVMe SSD',ports:'10'},mcF,'Premium',8),
  P('minecraft-amd','Elephant','elephant-plan','Minecraft AMD',1499,1999,'', {ram:'48GB DDR4',cpu:'900% (9 vCPU)',storage:'160GB NVMe SSD',ports:'16'},mcF,'Premium',9),
  // Proxy AMD (4)
  P('proxy-amd','Starter','proxy-starter-amd','Proxy AMD',99,159,'', {ram:'1.5GB DDR4',cpu:'1 vCPU',storage:'10GB NVMe SSD'},prF,'Standard',1),
  P('proxy-amd','Standard','proxy-standard-amd','Proxy AMD',159,299,'', {ram:'3GB DDR4',cpu:'2 vCPU',storage:'20GB NVMe SSD'},prF,'Standard',2),
  P('proxy-amd','Pro Elite','proxy-pro-elite-amd','Proxy AMD',199,399,'Most Popular', {ram:'6GB DDR4',cpu:'3 vCPU',storage:'30GB NVMe SSD'},prF,'Priority',3),
  P('proxy-amd','Elite Network','proxy-elite-network-amd','Proxy AMD',249,449,'', {ram:'10GB DDR4',cpu:'4 vCPU',storage:'40GB NVMe SSD'},prF,'Priority',4),
  // Proxy Intel (4)
  P('proxy-intel','Starter','proxy-starter-intel','Proxy Intel',59,99,'', {ram:'1.5GB DDR4',cpu:'1 vCPU',storage:'10GB NVMe SSD'},prF,'Standard',1),
  P('proxy-intel','Standard','proxy-standard-intel','Proxy Intel',99,159,'', {ram:'3GB DDR4',cpu:'2 vCPU',storage:'20GB NVMe SSD'},prF,'Standard',2),
  P('proxy-intel','Pro Elite','proxy-pro-elite-intel','Proxy Intel',159,199,'Most Popular', {ram:'6GB DDR4',cpu:'3 vCPU',storage:'30GB NVMe SSD'},prF,'Priority',3),
  P('proxy-intel','Elite Network','proxy-elite-network-intel','Proxy Intel',209,249,'', {ram:'10GB DDR4',cpu:'4 vCPU',storage:'40GB NVMe SSD'},prF,'Priority',4),
  // Hytale AMD (6)
  P('hytale-amd','STARTER','hytale-amd-starter','Hytale AMD',180,null,'', {ram:'4GB DDR4',cpu:'200%'},hyF,'Standard',1),
  P('hytale-amd','ADVENTURER','hytale-amd-adventurer','Hytale AMD',280,null,'', {ram:'6GB DDR4',cpu:'300%'},hyF,'Standard',2),
  P('hytale-amd','EXPLORER','hytale-amd-explorer','Hytale AMD',380,null,'Most Popular', {ram:'8GB DDR4',cpu:'400%'},hyF,'Priority',3),
  P('hytale-amd','BUILDER','hytale-amd-builder','Hytale AMD',520,null,'', {ram:'12GB DDR4',cpu:'600%'},hyF,'Priority',4),
  P('hytale-amd','KINGDOM','hytale-amd-kingdom','Hytale AMD',680,null,'', {ram:'16GB DDR4',cpu:'800%'},hyF,'Premium',5),
  P('hytale-amd','EMPIRE','hytale-amd-empire','Hytale AMD',799,null,'Best Value', {ram:'24GB DDR4',cpu:'1200%'},hyF,'Premium',6),
  // Hytale Intel (6)
  P('hytale-intel','STARTER','hytale-intel-starter','Hytale Intel',159,null,'', {ram:'4GB DDR4',cpu:'200%'},hyF,'Standard',1),
  P('hytale-intel','ADVENTURER','hytale-intel-adventurer','Hytale Intel',199,null,'', {ram:'6GB DDR4',cpu:'300%'},hyF,'Standard',2),
  P('hytale-intel','EXPLORER','hytale-intel-explorer','Hytale Intel',299,null,'Most Popular', {ram:'8GB DDR4',cpu:'400%'},hyF,'Priority',3),
  P('hytale-intel','BUILDER','hytale-intel-builder','Hytale Intel',399,null,'', {ram:'12GB DDR4',cpu:'600%'},hyF,'Priority',4),
  P('hytale-intel','KINGDOM','hytale-intel-kingdom','Hytale Intel',499,null,'', {ram:'16GB DDR4',cpu:'800%'},hyF,'Premium',5),
  P('hytale-intel','EMPIRE','hytale-intel-empire','Hytale Intel',599,null,'Best Value', {ram:'24GB DDR4',cpu:'1200%'},hyF,'Premium',6),
  // Intel VPS (6)
  P('intel-vps','Entry Level','intel-vps-entry','Intel Xeon VPS',159,300,'', {ram:'2GB DDR4',cpu:'1 vCore',network:'2Gbps Unmetered'},vpF,'Standard',1),
  P('intel-vps','Growth Ready','intel-vps-growth','Intel Xeon VPS',259,490,'', {ram:'4GB DDR4',cpu:'2 vCore',network:'2Gbps Unmetered'},vpF,'Standard',2),
  P('intel-vps','Performance','intel-vps-performance','Intel Xeon VPS',399,550,'Most Popular', {ram:'8GB DDR4',cpu:'2 vCore',network:'2Gbps Unmetered'},vpF,'Priority',3),
  P('intel-vps','Pro Edition','intel-vps-pro','Intel Xeon VPS',759,1200,'', {ram:'16GB DDR4',cpu:'4 vCore',network:'2Gbps Unmetered'},vpF,'Priority',4),
  P('intel-vps','Ultra Tier','intel-vps-ultra','Intel Xeon VPS',1499,2100,'', {ram:'32GB DDR4',cpu:'8 vCore',network:'2Gbps Unmetered'},vpF,'Premium',5),
  P('intel-vps','Supreme Tier','intel-vps-supreme','Intel Xeon VPS',2999,3999,'Best Value', {ram:'64GB DDR4',cpu:'16 vCore',network:'2Gbps Unmetered'},vpF,'Premium',6),
  // AMD VPS (6)
  P('amd-vps','BRONZE','amd-vps-bronze','AMD EPYC VPS',199,390,'', {ram:'2GB DDR4',cpu:'1 vCore',network:'2Gbps Unmetered'},vpF,'Standard',1),
  P('amd-vps','SILVER','amd-vps-silver','AMD EPYC VPS',319,480,'', {ram:'4GB DDR4',cpu:'2 vCore',network:'2Gbps Unmetered'},vpF,'Standard',2),
  P('amd-vps','GOLD','amd-vps-gold','AMD EPYC VPS',559,699,'Most Popular', {ram:'8GB DDR4',cpu:'2 vCore',network:'2Gbps Unmetered'},vpF,'Priority',3),
  P('amd-vps','PLATINUM','amd-vps-platinum','AMD EPYC VPS',999,1260,'', {ram:'16GB DDR4',cpu:'4 vCore',network:'2Gbps Unmetered'},vpF,'Priority',4),
  P('amd-vps','ULTIMATE 32','amd-vps-ultimate-32','AMD EPYC VPS',1999,2599,'', {ram:'32GB DDR4',cpu:'8 vCore',network:'2Gbps Unmetered'},vpF,'Premium',5),
  P('amd-vps','ULTIMATE 64','amd-vps-ultimate-64','AMD EPYC VPS',3999,4730,'Best Value', {ram:'64GB DDR4',cpu:'16 vCore',network:'2Gbps Unmetered'},vpF,'Premium',6),
  // Web Hosting (5)
  P('web-hosting','COAL','web-coal','Web Hosting',10,null,'', {websites:'1',storage:'500MB SSD',bandwidth:'1GB',ssl:'No',email:'0',databases:'1'},['SSD Storage','cPanel','Free SSL'],'Standard',1),
  P('web-hosting','COPPER','web-copper','Web Hosting',35,null,'', {websites:'1',storage:'5GB SSD',bandwidth:'Unmetered',ssl:'Yes',email:'1',databases:'5'},['Unmetered Bandwidth','Free SSL','cPanel'],'Standard',2),
  P('web-hosting','IRON','web-iron','Web Hosting',64,null,'Most Popular', {websites:'3',storage:'10GB SSD',bandwidth:'Unmetered',ssl:'Yes',email:'5',databases:'10'},['Unmetered Bandwidth','Free SSL','cPanel','Multi-site'],'Priority',3),
  P('web-hosting','EMERALD','web-emerald','Web Hosting',104,null,'', {websites:'5',storage:'15GB SSD',bandwidth:'Unmetered',ssl:'Yes',email:'10',databases:'Unlimited'},['Unmetered Bandwidth','Free SSL','cPanel','Multi-site'],'Priority',4),
  P('web-hosting','DIAMOND','web-diamond','Web Hosting',154,null,'Best Value', {websites:'10',storage:'25GB SSD',bandwidth:'Unmetered',ssl:'Yes',email:'Unlimited',databases:'Unlimited'},['Unmetered Bandwidth','Free SSL','cPanel','Multi-site','Priority Support'],'Premium',5),
  // Discord Bot (5)
  P('discord-bot-hosting','STARTER','discord-bot-starter','Discord Bot Hosting',20,null,'', {ram:'512MB',cpu:'50%',storage:'2GB SSD'},btF,'Standard',1),
  P('discord-bot-hosting','PRO','discord-bot-pro','Discord Bot Hosting',35,null,'Most Popular', {ram:'1GB',cpu:'100%',storage:'5GB SSD'},btF,'Priority',2),
  P('discord-bot-hosting','ELITE','discord-bot-elite','Discord Bot Hosting',65,null,'', {ram:'2GB',cpu:'150%',storage:'10GB SSD'},btF,'Priority',3),
  P('discord-bot-hosting','ULTRA','discord-bot-ultra','Discord Bot Hosting',105,null,'', {ram:'4GB',cpu:'200%',storage:'20GB SSD'},btF,'Premium',4),
  P('discord-bot-hosting','ENTERPRISE','discord-bot-enterprise','Discord Bot Hosting',205,null,'Best Value', {ram:'8GB',cpu:'400%',storage:'50GB SSD'},btF,'Premium',5),
];

// ══════════════════════════════════════════════════════════════════════════
// 4-7. SETTINGS, STATUS, ANNOUNCEMENTS, OFFERS, OWNER, LOGS
// ══════════════════════════════════════════════════════════════════════════
const OWNER_UID = process.env.OWNER_UID || 'PLACEHOLDER_OWNER_UID';

const settingsDoc = {
  siteName: 'CoreMMC',
  siteDescription: "India's premium hosting platform — Minecraft, VPS, Domains, Discord Bots",
  logoUrl: '/coremmc-icon.png',
  faviconUrl: '/coremmc-icon.png',
  contactEmail: 'support@coremmc.cloud',
  supportDiscord: 'https://discord.gg/coremmc',
  supportHours: '24/7 Support',
  socialLinks: { discord: 'https://discord.gg/coremmc', twitter: 'https://x.com/coremmc', github: 'https://github.com/coremmc', email: 'mailto:support@coremmc.cloud' },
  footerText: '© 2025 CoreMMC. All rights reserved.',
  maintenanceMode: false,
  maintenanceMessage: '',
  updatedAt: now,
};

const statusDoc = { totalUsers: 0, totalProducts: products.length, totalPurchases: 0, totalRevenue: 0, updatedAt: now };

const announcements = [
  { title: 'Welcome to CoreMMC! 🎉', content: "India's premium hosting platform is now live. Explore our Minecraft, VPS, and Discord bot hosting plans starting from just ₹20/mo.", type: 'new-product', icon: 'sparkles', color: '#06b6d4', active: true, isDismissible: true, startDate: Timestamp.fromDate(new Date('2025-01-01')), endDate: Timestamp.fromDate(new Date('2025-12-31')), createdAt: now, updatedAt: now },
  { title: 'Grand Launch Sale — Up to 60% Off', content: 'Limited time offer on all Minecraft and VPS hosting plans. Use the offer before it expires!', type: 'sale', icon: 'tag', color: '#10b981', active: true, isDismissible: true, startDate: Timestamp.fromDate(new Date('2025-06-01')), endDate: Timestamp.fromDate(new Date('2025-08-15')), createdAt: now, updatedAt: now },
];

const offers = [
  { title: 'Grand Launch Sale', description: 'Get up to 60% off on all hosting plans. Limited time only!', discountPercent: 60, endDate: Timestamp.fromDate(new Date('2025-08-15')), active: true, displayLocation: ['hero', 'pricing', 'popup', 'banner'], backgroundColor: null, textColor: null, createdAt: now, updatedAt: now },
];

const ownerUser = { uid: OWNER_UID, email: 'owner@coremmc.cloud', displayName: 'CoreMMC Owner', photoURL: null, role: 'owner', emailVerified: true, payment: false, active: true, createdAt: now, updatedAt: now, lastLoginAt: now, notificationPreferences: { email: true, service: true, marketing: false } };

const activityLogs = [
  { userId: OWNER_UID, userEmail: 'owner@coremmc.cloud', userName: 'CoreMMC Owner', action: 'create', resource: 'system', resourceId: 'seed', details: 'Database seeded with initial data', metadata: { products: products.length, categories: categories.length }, ipAddress: null, userAgent: 'seed-script', createdAt: now },
];

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('🚀 Seeding CoreMMC Firestore...\n');

  // Helper: batch write
  async function writeCollection(name: string, docs: any[], idField?: string) {
    const ref = db.collection(name);
    let batch = db.batch();
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const id = idField ? doc[idField] : doc.planId || doc.name || undefined;
      if (id) { batch.set(ref.doc(id), doc, { merge: true }); }
      else { batch.set(ref.doc(), doc); }
      if ((i + 1) % 500 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    console.log(`  ✅ ${name}: ${docs.length} documents`);
  }

  await writeCollection('roles', roles, 'name');
  await writeCollection('categories', categories, 'id');
  await writeCollection('products', products, 'planId');
  await writeCollection('announcements', announcements);
  await writeCollection('offers', offers);
  await writeCollection('activityLogs', activityLogs);

  // Single-doc collections
  await db.collection('settings').doc('website').set(settingsDoc, { merge: true });
  console.log('  ✅ settings: website');
  await db.collection('websiteStatus').doc('status').set(statusDoc, { merge: true });
  console.log('  ✅ websiteStatus: status');

  // Owner user
  await db.collection('users').doc(OWNER_UID).set(ownerUser, { merge: true });
  console.log(`  ✅ users: owner (${OWNER_UID})`);

  console.log(`\n✨ Done! ${roles.length} roles · ${categories.length} categories · ${products.length} products · ${announcements.length} announcements · ${offers.length} offers`);
  if (OWNER_UID === 'PLACEHOLDER_OWNER_UID') console.log('\n⚠  Set OWNER_UID env var to your Firebase Auth UID and re-run to link your account.');
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });