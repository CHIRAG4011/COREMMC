import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const checks: Record<string, string | boolean | number> = {};

  // 1. Check Prisma/SQLite connectivity
  try {
    const userCount = await db.user.count();
    const productCount = await db.product.count();
    checks.sqliteConnected = true;
    checks.userCount = userCount;
    checks.productCount = productCount;
  } catch (e) {
    checks.sqliteConnected = false;
    checks.sqliteError = e instanceof Error ? e.message.substring(0, 300) : String(e).substring(0, 300);
  }

  // 2. Environment info
  checks.nodeEnv = process.env.NODE_ENV || 'unknown';
  checks.platform = process.env.VERCEL ? 'vercel' : (process.env.NETLIFY ? 'netlify' : 'other');
  checks.timestamp = new Date().toISOString();

  return NextResponse.json(checks);
}
