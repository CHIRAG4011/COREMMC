import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'website' },
    });
    if (settings) {
      return NextResponse.json({
        qrPaymentUrl: settings.qrPaymentUrl || '',
        upiId: settings.upiId || '',
      });
    }
    return NextResponse.json({ qrPaymentUrl: '', upiId: '' });
  } catch {
    return NextResponse.json({ qrPaymentUrl: '', upiId: '' });
  }
}