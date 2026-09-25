import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, discordId, utrNumber, paymentEmail } = body;

    if (!orderId || !discordId || !utrNumber || !paymentEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Find order by orderId
    const existing = await db.order.findUnique({ where: { orderId } });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    await db.order.update({
      where: { orderId },
      data: {
        paymentInfo: JSON.stringify({ discordId, utrNumber, paymentEmail, submittedAt: now }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update payment info error:', error);
    return NextResponse.json({ error: 'Failed to update payment info' }, { status: 500 });
  }
}