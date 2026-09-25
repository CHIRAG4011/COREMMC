import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userId, screenshot } = body;

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'orderId and userId are required' }, { status: 400 });
    }

    // Verify the order exists and belongs to this user
    const existing = await db.order.findUnique({ where: { orderId } });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.order.update({
      where: { orderId },
      data: { screenshot: screenshot || '' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update screenshot error:', error);
    return NextResponse.json({ error: 'Failed to update screenshot' }, { status: 500 });
  }
}