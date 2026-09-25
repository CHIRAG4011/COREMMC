/**
 * scripts/import-to-postgres.ts
 *
 * Imports the exported SQLite data (db/export.json) into a PostgreSQL database.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." bun run scripts/import-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new PrismaClient();

// Import order: referenced tables first
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

// Boolean fields per model (SQLite stores as 0/1)
const BOOLEAN_FIELDS: Record<string, string[]> = {
  User: ['emailVerified', 'payment', 'isActive', 'notificationPrefEmail', 'notificationPrefService', 'notificationPrefMarketing'],
  Product: ['active', 'popular'],
  Category: ['active', 'featured'],
  Payment: ['payment'],
  Order: [],  // no booleans
  ActivityLog: [],
  Notification: ['active', 'read'],
  UserNotification: ['read'],
  Announcement: ['dismissible', 'active'],
  Discount: ['active', 'showInBanner'],
  SiteSettings: ['maintenanceMode', 'paymentEnabled', 'promoEnabled'],
  ServiceStatus: [],
};

// DateTime fields per model
const DATE_FIELDS: Record<string, string[]> = {
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

function convertRow(model: string, row: Record<string, unknown>): Record<string, unknown> {
  const fixed: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      continue; // skip nulls, let Prisma defaults handle them
    }

    // Convert 0/1 to boolean
    if (BOOLEAN_FIELDS[model]?.includes(key)) {
      fixed[key] = val === 1 || val === true || val === '1' || val === 'true';
      continue;
    }

    // Convert timestamps to Date
    if (DATE_FIELDS[model]?.includes(key)) {
      if (typeof val === 'number') {
        // Unix timestamp in milliseconds
        fixed[key] = new Date(val);
      } else if (typeof val === 'string' && val.length > 0) {
        fixed[key] = new Date(val);
      }
      continue;
    }

    fixed[key] = val;
  }

  return fixed;
}

async function importModel(model: string, rows: Record<string, unknown>[]) {
  let imported = 0;

  for (const row of rows) {
    try {
      const data = convertRow(model, row);

      switch (model) {
        case 'User':
          await db.user.upsert({ where: { id: data.id as string }, update: data, create: data as any });
          break;
        case 'Product':
          await db.product.upsert({ where: { planId: data.planId as string }, update: data, create: data as any });
          break;
        case 'Category':
          await db.category.upsert({ where: { slug: data.slug as string }, update: data, create: data as any });
          break;
        case 'Order':
          await db.order.upsert({ where: { orderId: data.orderId as string }, update: data, create: data as any });
          break;
        case 'Discount':
          await db.discount.upsert({ where: { code: data.code as string }, update: data, create: data as any });
          break;
        case 'SiteSettings':
          await db.siteSettings.upsert({ where: { id: 'website' }, update: data, create: data as any });
          break;
        case 'ServiceStatus':
          await db.serviceStatus.upsert({ where: { id: 'serviceStatus' }, update: data, create: data as any });
          break;
        case 'Announcement':
          await db.announcement.upsert({ where: { id: data.id as string }, update: data, create: data as any });
          break;
        case 'Payment':
          await db.payment.create({ data: data as any });
          break;
        case 'ActivityLog':
          await db.activityLog.create({ data: data as any });
          break;
        case 'Notification':
          await db.notification.create({ data: data as any });
          break;
        case 'UserNotification':
          await db.userNotification.create({ data: data as any });
          break;
      }

      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message.substring(0, 200) : String(err);
      console.error(`    ${model} [${row.id || row.orderId || row.code || '?'}] error: ${msg}`);
    }
  }

  return imported;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('ERROR: DATABASE_URL not set');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL...');
  await db.$connect();
  console.log('Connected!\n');

  const filePath = join(process.cwd(), 'db', 'export.json');
  const rawData = JSON.parse(readFileSync(filePath, 'utf-8'));

  let totalImported = 0;

  for (const model of IMPORT_ORDER) {
    const rows = rawData[model] as Record<string, unknown>[] | undefined;
    if (!rows || rows.length === 0) {
      console.log(`  ${model}: 0 rows (skipping)`);
      continue;
    }

    const imported = await importModel(model, rows);
    console.log(`  ${model}: ${imported}/${rows.length} rows`);
    totalImported += imported;
  }

  console.log(`\n✅ Total imported: ${totalImported} rows`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});