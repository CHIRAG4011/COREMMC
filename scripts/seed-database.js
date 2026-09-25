/**
 * scripts/seed-database.js
 *
 * Automatically seeds the PostgreSQL database from db/export.json (or coremmc.db)
 * when deployed to Vercel or run locally with DATABASE_URL.
 */

let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  console.log('[seed] @prisma/client not found — skipping seed.');
  process.exit(0);
}

const fs = require('fs');
const path = require('path');

const db = new PrismaClient();

const IMPORT_ORDER = [
  'SiteSettings',
  'ServiceStatus',
  'User',
  'Category',
  'Product',
  'Discount',
  'Announcement',
  'Order',
  'Payment',
  'ActivityLog',
  'Notification',
  'UserNotification',
];

const BOOLEAN_FIELDS = {
  User: ['emailVerified', 'payment', 'isActive', 'notificationPrefEmail', 'notificationPrefService', 'notificationPrefMarketing'],
  Product: ['active', 'popular'],
  Category: ['active', 'featured'],
  Payment: ['payment'],
  Order: [],
  ActivityLog: [],
  Notification: ['active', 'read'],
  UserNotification: ['read'],
  Announcement: ['dismissible', 'active'],
  Discount: ['active', 'showInBanner'],
  SiteSettings: ['maintenanceMode', 'paymentEnabled', 'promoEnabled'],
  ServiceStatus: [],
};

const DATE_FIELDS = {
  User: ['createdAt', 'updatedAt', 'lastLoginAt'],
  Product: ['createdAt', 'updatedAt'],
  Category: ['createdAt', 'updatedAt'],
  Payment: ['paymentDate', 'createdAt'],
  Order: ['paidAt', 'completedAt', 'cancelledAt', 'approvedAt', 'createdAt', 'updatedAt'],
  ActivityLog: ['createdAt'],
  Notification: ['createdAt'],
  UserNotification: ['createdAt'],
  Announcement: ['startDate', 'endDate', 'createdAt', 'updatedAt'],
  Discount: ['createdAt'],
  SiteSettings: ['updatedAt'],
  ServiceStatus: [],
};

function parseSafeDate(val, isRequired = false) {
  if (val === null || val === undefined || val === '') {
    return isRequired ? new Date() : null;
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? (isRequired ? new Date() : null) : d;
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    const d = new Date(val);
    return isNaN(d.getTime()) ? (isRequired ? new Date() : null) : d;
  }
  return isRequired ? new Date() : null;
}

function convertRow(model, row) {
  const fixed = {};
  const boolFields = BOOLEAN_FIELDS[model] || [];
  const dateFields = DATE_FIELDS[model] || [];

  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      continue;
    }

    if (boolFields.includes(key)) {
      fixed[key] = val === 1 || val === true || val === '1' || val === 'true';
      continue;
    }

    if (dateFields.includes(key)) {
      const isReq = ['createdAt', 'updatedAt'].includes(key);
      const parsed = parseSafeDate(val, isReq);
      if (parsed !== null) {
        fixed[key] = parsed;
      }
      continue;
    }

    fixed[key] = val;
  }

  return fixed;
}

async function importModel(model, rows) {
  let imported = 0;

  for (const row of rows) {
    try {
      const data = convertRow(model, row);

      switch (model) {
        case 'User':
          await db.user.upsert({ where: { id: data.id }, update: data, create: data });
          break;
        case 'Product':
          await db.product.upsert({ where: { planId: data.planId }, update: data, create: data });
          break;
        case 'Category':
          await db.category.upsert({ where: { slug: data.slug }, update: data, create: data });
          break;
        case 'Order':
          await db.order.upsert({ where: { orderId: data.orderId }, update: data, create: data });
          break;
        case 'Discount':
          await db.discount.upsert({ where: { code: data.code }, update: data, create: data });
          break;
        case 'SiteSettings':
          await db.siteSettings.upsert({ where: { id: 'website' }, update: data, create: data });
          break;
        case 'ServiceStatus':
          await db.serviceStatus.upsert({ where: { id: 'serviceStatus' }, update: data, create: data });
          break;
        case 'Announcement':
          await db.announcement.upsert({ where: { id: data.id }, update: data, create: data });
          break;
        case 'Payment':
          if (data.id) {
            await db.payment.upsert({ where: { id: data.id }, update: data, create: data });
          } else {
            await db.payment.create({ data });
          }
          break;
        case 'ActivityLog':
          if (data.id) {
            await db.activityLog.upsert({ where: { id: data.id }, update: data, create: data });
          } else {
            await db.activityLog.create({ data });
          }
          break;
        case 'Notification':
          if (data.id) {
            await db.notification.upsert({ where: { id: data.id }, update: data, create: data });
          } else {
            await db.notification.create({ data });
          }
          break;
        case 'UserNotification':
          if (data.id) {
            await db.userNotification.upsert({ where: { id: data.id }, update: data, create: data });
          } else {
            await db.userNotification.create({ data });
          }
          break;
      }
      imported++;
    } catch (err) {
      console.warn(`[seed] Warning importing ${model} [${row.id || row.orderId || row.code || '?'}]`, err.message);
    }
  }

  return imported;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[seed] DATABASE_URL not set — skipping automated database seeding.');
    return;
  }

  console.log('[seed] Connecting to database...');
  await db.$connect();

  // Check if seeding is already done (e.g. products already exist)
  try {
    const existingProducts = await db.product.count();
    if (existingProducts >= 120) {
      console.log(`[seed] Database already contains ${existingProducts} products. Skipping initial seed.`);
      await db.$disconnect();
      return;
    }
  } catch (err) {
    console.log('[seed] Tables might not be initialized yet:', err.message);
  }

  // Load export data
  const exportPath = path.join(process.cwd(), 'db', 'export.json');
  if (!fs.existsSync(exportPath)) {
    console.log('[seed] db/export.json not found, skipping seed.');
    await db.$disconnect();
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  let totalImported = 0;

  for (const model of IMPORT_ORDER) {
    const rows = rawData[model];
    if (!rows || rows.length === 0) continue;

    console.log(`[seed] Importing ${rows.length} records for ${model}...`);
    const count = await importModel(model, rows);
    totalImported += count;
  }

  console.log(`[seed] Successfully seeded ${totalImported} records into database!`);
  await db.$disconnect();
}

main()
  .catch((err) => {
    console.error('[seed] Unexpected error during seed:', err);
    // Don't fail the build completely if seed errors on existing rows
    process.exit(0);
  });
