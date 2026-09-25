import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Create a new order ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, userEmail, userName, totalAmount, currency, discordId, paymentUtr, registeredEmail, discountCode, screenshot, videoUrl } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const computedTotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);

    const order = await db.order.create({
      data: {
        orderId,
        userId,
        userEmail: userEmail || '',
        userName: userName || '',
        items: JSON.stringify(items),
        totalAmount: totalAmount || computedTotal,
        currency: currency || 'INR',
        status: 'pending',
        discordId: discordId || '',
        paymentUtr: paymentUtr || '',
        registeredEmail: registeredEmail || '',
        screenshot: screenshot || '',
        videoUrl: videoUrl || '',
        discountCode: discountCode || '',
        deliveryDetails: JSON.stringify({
          serverIp: '',
          port: '',
          credentials: '',
          panelUrl: '',
          customMessage: '',
        }),
      },
    });

    // Increment discount usedCount if a discount code was applied
    if (discountCode) {
      try {
        await db.discount.update({
          where: { code: discountCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      } catch (discountErr) {
        // Log but don't fail the order if discount increment fails
        console.error('Failed to increment discount usedCount:', discountErr);
      }
    }

    return NextResponse.json({ success: true, orderId, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// ── Get user's orders ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      deliveryDetails: JSON.parse(o.deliveryDetails),
      paymentInfo: JSON.parse(o.paymentInfo),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      paidAt: o.paidAt?.toISOString() || null,
      completedAt: o.completedAt?.toISOString() || null,
      cancelledAt: o.cancelledAt?.toISOString() || null,
      approvedAt: o.approvedAt?.toISOString() || null,
    }));

    return NextResponse.json({ orders: parsed });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ── User updates their own order with payment info ────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, discordId, paymentUtr, registeredEmail, userId } = body;

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'orderId and userId are required' }, { status: 400 });
    }

    if (!discordId || !paymentUtr || !registeredEmail) {
      return NextResponse.json({ error: 'Discord ID, UTR, and Email are all required' }, { status: 400 });
    }

    // Verify the order exists, belongs to this user, and is pending
    const existing = await db.order.findUnique({ where: { orderId } });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ error: 'Order can only be updated while pending' }, { status: 400 });
    }

    await db.order.update({
      where: { orderId },
      data: { discordId, paymentUtr, registeredEmail },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}