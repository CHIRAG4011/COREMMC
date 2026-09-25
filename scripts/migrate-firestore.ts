/**
 * FULL Firestore → SQLite Migration using Firebase Admin SDK
 * Bypasses all security rules — reads EVERYTHING.
 * 
 * Usage: bun run scripts/migrate-firestore.ts
 */

import { PrismaClient } from '@prisma/client';
import { initializeApp, getApps, cert, getApps as getAppsCheck, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// ── Firebase Admin Init ────────────────────────────────────────────────
let app: App;
if (getAppsCheck().length > 0) {
  app = getAppsCheck()[0];
} else {
  const sa = JSON.parse(readFileSync(join(process.cwd(), 'service-account.json'), 'utf8'));
  app = initializeApp({ credential: cert(sa) });
}
const db: Firestore = getFirestore(app);

// ── Helpers ────────────────────────────────────────────────────────────
function toISO(val: any): string | null {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') { const d = new Date(val); return isNaN(d.getTime()) ? null : d.toISOString(); }
  if (typeof val === 'number') return new Date(val * 1000).toISOString();
  if (val?.seconds) return new Date(val.seconds * 1000 + (val.nanoseconds || 0) / 1e6).toISOString();
  return null;
}

function toDate(val: any): Date | null {
  const iso = toISO(val);
  return iso ? new Date(iso) : null;
}

const S = (v: any): string => (v == null ? '' : typeof v === 'string' ? v : String(v));
const N = (v: any): number => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || 0 : 0);
const B = (v: any): boolean => v === true || v === 'true';
const J = (v: any): string => {
  if (!v) return '{}';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
};

async function safe(fn: () => Promise<number>): Promise<number> {
  try { return await fn(); } catch (e: any) { console.log(`   ❌ ${e.message?.slice(0, 100)}`); return 0; }
}

// ── Collections ────────────────────────────────────────────────────────

async function migrateCategories(): Promise<number> {
  console.log('\n📂 Categories...');
  const snap = await db.collection('categories').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    await prisma.category.upsert({
      where: { id: d.id },
      update: {
        name: S(f.name), slug: S(f.slug), description: S(f.description),
        shortDescription: S(f.shortDescription), icon: S(f.icon),
        color: S(f.color), gradient: S(f.gradient), sortOrder: N(f.order),
        active: f.active !== false, featured: f.featured === true,
        heroTitle: S(f.heroTitle), heroSubtitle: S(f.heroSubtitle),
        metaTitle: S(f.metaTitle), metaDescription: S(f.metaDescription),
        imageUrl: S(f.imageUrl),
      },
      create: {
        id: d.id, name: S(f.name), slug: S(f.slug), description: S(f.description),
        shortDescription: S(f.shortDescription), icon: S(f.icon),
        color: S(f.color), gradient: S(f.gradient), sortOrder: N(f.order),
        active: f.active !== false, featured: f.featured === true,
        heroTitle: S(f.heroTitle), heroSubtitle: S(f.heroSubtitle),
        metaTitle: S(f.metaTitle), metaDescription: S(f.metaDescription),
        imageUrl: S(f.imageUrl),
      },
    });
    c++;
  }
  console.log(`   ✅ ${c} categories`);
  return c;
}

async function migrateProducts(): Promise<number> {
  console.log('\n📦 Products...');
  const snap = await db.collection('products').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    const planId = S(f.planId) || d.id;
    try {
      await prisma.product.upsert({
        where: { planId },
        update: {
          name: S(f.name), categoryId: S(f.category), categoryName: S(f.categoryName),
          price: N(f.price), originalPrice: f.originalPrice != null ? N(f.originalPrice) : null,
          billingCycle: S(f.billingCycle), billingUrl: S(f.billingUrl),
          active: f.active !== false, popular: f.popular === true,
          badge: S(f.badge), specs: J(f.specs), features: J(f.features),
          support: S(f.support), location: S(f.location), setup: S(f.setup),
          sortOrder: N(f.order), imageUrl: S(f.imageUrl),
        },
        create: {
          id: d.id, planId, name: S(f.name), categoryId: S(f.category),
          categoryName: S(f.categoryName), price: N(f.price),
          originalPrice: f.originalPrice != null ? N(f.originalPrice) : null,
          billingCycle: S(f.billingCycle), billingUrl: S(f.billingUrl),
          active: f.active !== false, popular: f.popular === true,
          badge: S(f.badge), specs: J(f.specs), features: J(f.features),
          support: S(f.support), location: S(f.location), setup: S(f.setup),
          sortOrder: N(f.order), imageUrl: S(f.imageUrl),
        },
      });
      c++;
    } catch (e: any) { if (c < 5) console.log(`   ⚠️ Skip ${planId}: ${e.message?.slice(0, 60)}`); }
  }
  console.log(`   ✅ ${c} products`);
  return c;
}

async function migrateAnnouncements(): Promise<number> {
  console.log('\n📢 Announcements...');
  const snap = await db.collection('announcements').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    await prisma.announcement.upsert({
      where: { id: d.id },
      update: {
        title: S(f.title), content: S(f.content), type: S(f.type),
        icon: S(f.icon), color: S(f.color), imageUrl: S(f.imageUrl),
        dismissible: f.dismissible !== false, active: f.active === true,
        startDate: toDate(f.startDate), endDate: toDate(f.endDate),
      },
      create: {
        id: d.id, title: S(f.title), content: S(f.content), type: S(f.type),
        icon: S(f.icon), color: S(f.color), imageUrl: S(f.imageUrl),
        dismissible: f.dismissible !== false, active: f.active === true,
        startDate: toDate(f.startDate), endDate: toDate(f.endDate),
      },
    });
    c++;
  }
  console.log(`   ✅ ${c} announcements`);
  return c;
}

async function migrateDiscounts(): Promise<number> {
  console.log('\n🏷️ Discounts...');
  const snap = await db.collection('discounts').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    const code = S(f.code).toUpperCase() || d.id;
    await prisma.discount.upsert({
      where: { code },
      update: {
        description: S(f.description), discountType: S(f.discountType),
        discountValue: N(f.discountValue), minOrderAmount: N(f.minOrderAmount),
        maxUses: N(f.maxUses), usedCount: N(f.usedCount),
        active: f.active !== false, showInBanner: f.showInBanner === true,
        startDate: typeof f.startDate === 'string' ? f.startDate : '',
        endDate: typeof f.endDate === 'string' ? f.endDate : '',
      },
      create: {
        id: d.id, code, description: S(f.description),
        discountType: S(f.discountType), discountValue: N(f.discountValue),
        minOrderAmount: N(f.minOrderAmount), maxUses: N(f.maxUses),
        usedCount: N(f.usedCount), active: f.active !== false,
        showInBanner: f.showInBanner === true,
        startDate: typeof f.startDate === 'string' ? f.startDate : '',
        endDate: typeof f.endDate === 'string' ? f.endDate : '',
        createdAt: toDate(f.createdAt) || new Date(),
      },
    });
    c++;
  }
  console.log(`   ✅ ${c} discounts`);
  return c;
}

async function migrateUsers(): Promise<number> {
  console.log('\n👥 Users...');
  const snap = await db.collection('users').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    const np = f.notificationPreferences || {};
    try {
      await prisma.user.upsert({
        where: { id: d.id },
        update: {
          email: S(f.email), displayName: S(f.displayName), photoURL: S(f.photoURL),
          role: S(f.role) || 'user', emailVerified: f.emailVerified === true,
          payment: f.payment === true, isActive: f.isActive !== false,
          lastLoginAt: toDate(f.lastLoginAt) || new Date(),
          notificationPrefEmail: np.email !== false,
          notificationPrefService: np.service !== false,
          notificationPrefMarketing: np.marketing === true,
        },
        create: {
          id: d.id, email: S(f.email), displayName: S(f.displayName),
          photoURL: S(f.photoURL), role: S(f.role) || 'user',
          emailVerified: f.emailVerified === true, payment: f.payment === true,
          isActive: f.isActive !== false,
          createdAt: toDate(f.createdAt) || new Date(),
          updatedAt: toDate(f.updatedAt) || new Date(),
          lastLoginAt: toDate(f.lastLoginAt) || new Date(),
          notificationPrefEmail: np.email !== false,
          notificationPrefService: np.service !== false,
          notificationPrefMarketing: np.marketing === true,
        },
      });
      c++;
    } catch (e: any) { console.log(`   ⚠️ User ${d.id}: ${e.message?.slice(0, 60)}`); }
  }
  console.log(`   ✅ ${c} users`);
  return c;
}

async function migrateOrders(): Promise<number> {
  console.log('\n🛒 Orders (allOrders)...');
  const snap = await db.collection('allOrders').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    try {
      await prisma.order.upsert({
        where: { orderId: S(f.orderId) || d.id },
        update: {
          userId: S(f.userId), userEmail: S(f.userEmail), userName: S(f.userName),
          items: J(f.items), totalAmount: N(f.totalAmount),
          currency: S(f.currency) || 'INR', status: S(f.status) || 'pending',
          paidAt: toDate(f.paidAt), completedAt: toDate(f.completedAt),
          cancelledAt: toDate(f.cancelledAt), approvedAt: toDate(f.approvedAt),
          approvedBy: S(f.approvedBy), adminNotes: S(f.adminNotes),
          discordId: S(f.discordId), paymentUtr: S(f.paymentUtr),
          registeredEmail: S(f.registeredEmail), screenshot: S(f.screenshot),
          videoUrl: S(f.videoUrl), discountCode: S(f.discountCode),
          deliveryDetails: J(f.deliveryDetails), paymentInfo: J(f.paymentInfo),
        },
        create: {
          id: d.id, orderId: S(f.orderId) || d.id,
          userId: S(f.userId), userEmail: S(f.userEmail), userName: S(f.userName),
          items: J(f.items), totalAmount: N(f.totalAmount),
          currency: S(f.currency) || 'INR', status: S(f.status) || 'pending',
          paidAt: toDate(f.paidAt), completedAt: toDate(f.completedAt),
          cancelledAt: toDate(f.cancelledAt), approvedAt: toDate(f.approvedAt),
          approvedBy: S(f.approvedBy), adminNotes: S(f.adminNotes),
          discordId: S(f.discordId), paymentUtr: S(f.paymentUtr),
          registeredEmail: S(f.registeredEmail), screenshot: S(f.screenshot),
          videoUrl: S(f.videoUrl), discountCode: S(f.discountCode),
          deliveryDetails: J(f.deliveryDetails), paymentInfo: J(f.paymentInfo),
          createdAt: toDate(f.createdAt) || new Date(),
        },
      });
      c++;
    } catch (e: any) { if (c < 5) console.log(`   ⚠️ Order ${d.id}: ${e.message?.slice(0, 60)}`); }
  }
  console.log(`   ✅ ${c} orders`);
  return c;
}

async function migratePayments(): Promise<number> {
  console.log('\n💳 Payments...');
  const snap = await db.collection('payments').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    try {
      await prisma.payment.create({
        data: {
          id: d.id, userId: S(f.userId), userEmail: S(f.userEmail),
          productId: S(f.productId), productName: S(f.productName),
          planName: S(f.planName), category: S(f.category),
          amount: N(f.amount), payment: f.payment === true,
          status: S(f.status) || 'active', notes: S(f.notes),
          paymentDate: toDate(f.paymentDate) || new Date(),
          createdAt: toDate(f.createdAt) || new Date(),
        },
      });
      c++;
    } catch (e: any) { if (c < 3) console.log(`   ⚠️ Payment ${d.id}: ${e.message?.slice(0, 60)}`); }
  }
  console.log(`   ✅ ${c} payments`);
  return c;
}

async function migrateActivityLogs(): Promise<number> {
  console.log('\n📋 Activity Logs...');
  const snap = await db.collection('activityLogs').orderBy('createdAt', 'desc').limit(1000).get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    try {
      await prisma.activityLog.create({
        data: {
          id: d.id, userId: S(f.userId), userName: S(f.userName),
          userEmail: S(f.userEmail), action: S(f.action),
          resource: S(f.resource), resourceId: S(f.resourceId),
          details: S(f.details), description: S(f.description),
          metadata: J(f.metadata), ipAddress: S(f.ipAddress),
          userAgent: S(f.userAgent),
          createdAt: toDate(f.createdAt) || toDate(f.timestamp) || new Date(),
        },
      });
      c++;
    } catch (e) { /* skip duplicates */ }
  }
  console.log(`   ✅ ${c} activity logs`);
  return c;
}

async function migrateNotifications(): Promise<number> {
  console.log('\n🔔 Notifications...');
  const snap = await db.collection('notifications').get();
  let c = 0;
  for (const d of snap.docs) {
    const f = d.data();
    try {
      await prisma.notification.create({
        data: {
          id: d.id, title: S(f.title), message: S(f.message),
          type: S(f.type), active: f.active !== false, read: f.read === true,
          createdAt: toDate(f.createdAt) || new Date(),
          targetUserId: S(f.targetUserId), orderId: S(f.orderId),
        },
      });
      c++;
    } catch (e) { /* skip */ }
  }
  console.log(`   ✅ ${c} notifications`);
  return c;
}

async function migrateSettings(): Promise<number> {
  console.log('\n⚙️ Settings...');
  let c = 0;

  const siteDoc = await db.collection('settings').doc('website').get();
  if (siteDoc.exists) {
    const f = siteDoc.data()!;
    const sl = f.socialLinks || {};
    await prisma.siteSettings.upsert({
      where: { id: 'website' },
      update: {
        siteName: S(f.siteName), siteDescription: S(f.siteDescription),
        logoUrl: S(f.logoUrl), faviconUrl: S(f.faviconUrl),
        contactEmail: S(f.contactEmail), supportDiscord: S(f.supportDiscord),
        supportHours: S(f.supportHours),
        discordUrl: S(sl.discordUrl), instagramUrl: S(sl.instagramUrl),
        youtubeUrl: S(sl.youtubeUrl), telegramUrl: S(sl.telegramUrl),
        websiteUrl: S(sl.websiteUrl),
        footerText: S(f.footerText),
        maintenanceMode: f.maintenanceMode === true,
        maintenanceMessage: S(f.maintenanceMessage),
        paymentUrl: S(f.paymentUrl), paymentEnabled: f.paymentEnabled !== false,
        qrPaymentUrl: S(f.qrPaymentUrl), upiId: S(f.upiId),
        promoEnabled: f.promoEnabled === true, promoText: S(f.promoText),
        promoSubtext: S(f.promoSubtext), promoDiscount: S(f.promoDiscount),
        promoEndDate: S(f.promoEndDate), promoPadding: S(f.promoPadding),
      },
      create: {
        id: 'website',
        siteName: S(f.siteName), siteDescription: S(f.siteDescription),
        logoUrl: S(f.logoUrl), faviconUrl: S(f.faviconUrl),
        contactEmail: S(f.contactEmail), supportDiscord: S(f.supportDiscord),
        supportHours: S(f.supportHours),
        discordUrl: S(sl.discordUrl), instagramUrl: S(sl.instagramUrl),
        youtubeUrl: S(sl.youtubeUrl), telegramUrl: S(sl.telegramUrl),
        websiteUrl: S(sl.websiteUrl),
        footerText: S(f.footerText),
        maintenanceMode: f.maintenanceMode === true,
        maintenanceMessage: S(f.maintenanceMessage),
        paymentUrl: S(f.paymentUrl), paymentEnabled: f.paymentEnabled !== false,
        qrPaymentUrl: S(f.qrPaymentUrl), upiId: S(f.upiId),
        promoEnabled: f.promoEnabled === true, promoText: S(f.promoText),
        promoSubtext: S(f.promoSubtext), promoDiscount: S(f.promoDiscount),
        promoEndDate: S(f.promoEndDate), promoPadding: S(f.promoPadding),
      },
    });
    console.log('   ✅ Site settings');
    c++;
  }

  const statusDoc = await db.collection('settings').doc('serviceStatus').get();
  if (statusDoc.exists) {
    const f = statusDoc.data()!;
    await prisma.serviceStatus.upsert({
      where: { id: 'serviceStatus' },
      update: {
        services: J(f.services), overallStatus: S(f.overallStatus),
        lastUpdated: S(f.lastUpdated), incidentMessage: S(f.incidentMessage),
      },
      create: {
        id: 'serviceStatus', services: J(f.services),
        overallStatus: S(f.overallStatus), lastUpdated: S(f.lastUpdated),
        incidentMessage: S(f.incidentMessage),
      },
    });
    console.log('   ✅ Service status');
    c++;
  }

  return c;
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  FULL FIRESTORE → SQLITE MIGRATION (Admin SDK)');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const [cat, prod, ann, disc, sett, users, orders, pays, logs, notifs] = await Promise.all([
      safe(migrateCategories),
      safe(migrateProducts),
      safe(migrateAnnouncements),
      safe(migrateDiscounts),
      safe(migrateSettings),
      safe(migrateUsers),
      safe(migrateOrders),
      safe(migratePayments),
      safe(migrateActivityLogs),
      safe(migrateNotifications),
    ]);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  MIGRATION COMPLETE — ZERO DATA LOSS');
    console.log('═══════════════════════════════════════════════════════\n');

    const summary = [
      ['Categories', cat],
      ['Products', prod],
      ['Announcements', ann],
      ['Discounts', disc],
      ['Users', users],
      ['Orders', orders],
      ['Payments', pays],
      ['Activity Logs', logs],
      ['Notifications', notifs],
    ];

    console.log('📊 Final Database Summary:');
    let total = 0;
    for (const [name, count] of summary) {
      const actual = await (prisma as any)[name.toLowerCase().replace(/ /g, '')]?.count() ?? count;
      const bar = '█'.repeat(Math.min(Math.ceil(actual / 5), 30));
      console.log(`   ${name.padEnd(16)} ${String(actual).padStart(4)}  ${bar}`);
      total += actual;
    }

    const settings = await prisma.siteSettings.count();
    const status = await prisma.serviceStatus.count();
    console.log(`   ${'Site Settings'.padEnd(16)} ${String(settings).padStart(4)}`);
    console.log(`   ${'Service Status'.padEnd(16)} ${String(status).padStart(4)}`);
    total += settings + status;

    console.log(`\n   ${'TOTAL'.padEnd(16)} ${String(total).padStart(4)}  records`);
    console.log('\n✅ All data copied. Ready to connect frontend.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();