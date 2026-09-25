import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'website' },
    });
    if (settings) {
      return NextResponse.json({
        paymentUrl: settings.paymentUrl || '',
        paymentEnabled: settings.paymentEnabled !== false,
      });
    }
    return NextResponse.json({ paymentUrl: '', paymentEnabled: true });
  } catch {
    return NextResponse.json({ paymentUrl: '', paymentEnabled: true });
  }
}