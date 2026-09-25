import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Get all orders (admin) ────────────────────────────────────────────
export async function GET() {
  try {
    const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      deliveryDetails: JSON.parse(o.deliveryDetails || '{}'),
      paymentInfo: JSON.parse(o.paymentInfo || '{}'),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
      completedAt: o.completedAt?.toISOString() ?? null,
      cancelledAt: o.cancelledAt?.toISOString() ?? null,
      approvedAt: o.approvedAt?.toISOString() ?? null,
    }));
    return NextResponse.json({ orders: mapped });
  } catch (error) {
    console.error('Get all orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ── Update order status / delivery details (admin) ────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, adminNotes, deliveryDetails, rejectionReason } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const existing = await db.order.findUnique({ where: { orderId } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === 'completed') updateData.completedAt = new Date();
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (rejectionReason !== undefined) updateData.adminNotes = rejectionReason;
    if (deliveryDetails) {
      updateData.deliveryDetails =
        typeof deliveryDetails === 'string' ? deliveryDetails : JSON.stringify(deliveryDetails);
    }

    await db.order.update({ where: { orderId }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}