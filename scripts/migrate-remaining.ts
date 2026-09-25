import { PrismaClient } from '@prisma/client';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(JSON.parse(readFileSync(join(process.cwd(), 'service-account.json'), 'utf8'))) });
const fsDb = getFirestore(app);

const S = (v: any): string => (v == null ? '' : typeof v === 'string' ? v : String(v));
const N = (v: any): number => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || 0 : 0);
const B = (v: any): boolean => v === true || v === 'true';
const J = (v: any): string => (!v ? '{}' : typeof v === 'string' ? v : JSON.stringify(v));

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val && typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === 'string') { const d = new Date(val); return isNaN(d.getTime()) ? null : d; }
  if (typeof val === 'number') return new Date(val * 1000);
  if (val?.seconds) return new Date(val.seconds * 1000 + (val.nanoseconds || 0) / 1e6);
  return null;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('═ MIGRATING REMAINING COLLECTIONS (sequential, with delays) ═\n');

  // 1. Payments
  console.log('💳 Payments...');
  try {
    const snap = await fsDb.collection('payments').get();
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
      } catch (e: any) { if (c < 3) console.log(`   ⚠️ ${e.code || ''}`); }
    }
    console.log(`   ✅ ${c} payments`);
  } catch (e: any) {
    console.log(`   ❌ ${e.message?.slice(0, 80)}`);
  }

  await wait(5000); // Wait 5s between collections

  // 2. Activity Logs
  console.log('\n📋 Activity Logs...');
  try {
    const snap = await fsDb.collection('activityLogs').orderBy('createdAt', 'desc').limit(500).get();
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
      } catch (e) { /* skip */ }
    }
    console.log(`   ✅ ${c} activity logs`);
  } catch (e: any) {
    console.log(`   ❌ ${e.message?.slice(0, 80)}`);
  }

  await wait(5000);

  // 3. Notifications
  console.log('\n🔔 Notifications...');
  try {
    const snap = await fsDb.collection('notifications').get();
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
  } catch (e: any) {
    console.log(`   ❌ ${e.message?.slice(0, 80)}`);
  }

  await wait(3000);

  // 4. Also grab user subcollection notifications
  console.log('\n🔔 User Notifications (subcollections)...');
  try {
    const usersSnap = await fsDb.collection('users').listDocuments();
    let c = 0;
    for (const userDoc of usersSnap.slice(0, 20)) { // limit to first 20 users
      const notifsSnap = await userDoc.collection('notifications').get();
      for (const d of notifsSnap.docs) {
        const f = d.data();
        try {
          await prisma.userNotification.create({
            data: {
              id: d.id, userId: userDoc.id, title: S(f.title),
              message: S(f.message), type: S(f.type),
              read: f.read === true,
              createdAt: toDate(f.createdAt) || new Date(),
              orderId: S(f.orderId),
            },
          });
          c++;
        } catch (e) { /* skip */ }
      }
    }
    console.log(`   ✅ ${c} user notifications`);
  } catch (e: any) {
    console.log(`   ❌ ${e.message?.slice(0, 80)}`);
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 FINAL DATABASE:');
  const counts = [
    ['Categories', prisma.category.count()],
    ['Products', prisma.product.count()],
    ['Announcements', prisma.announcement.count()],
    ['Discounts', prisma.discount.count()],
    ['Users', prisma.user.count()],
    ['Orders', prisma.order.count()],
    ['Payments', prisma.payment.count()],
    ['ActivityLogs', prisma.activityLog.count()],
    ['Notifications', prisma.notification.count()],
    ['UserNotifications', prisma.userNotification.count()],
  ];
  let total = 0;
  for (const [name, p] of counts) {
    const n = await p;
    if (n > 0) { console.log(`   ${name}: ${n}`); total += n; }
  }
  const ss = await prisma.siteSettings.count();
  const sv = await prisma.serviceStatus.count();
  if (ss) { console.log(`   SiteSettings: ${ss}`); total += ss; }
  if (sv) { console.log(`   ServiceStatus: ${sv}`); total += sv; }
  console.log(`\n   TOTAL: ${total} records`);

  await prisma.$disconnect();
}

main();