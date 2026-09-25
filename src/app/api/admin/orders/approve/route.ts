import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action } = body; // action: 'approve'

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'approve') {
      return NextResponse.json({ error: 'Action must be approve' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    await getAuth().verifyIdToken(idToken);

    const order = await db.order.findUnique({ where: { orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await db.order.update({
      where: { orderId },
      data: {
        status: 'processing',
        approvedAt: new Date(),
        approvedBy: 'admin',
      },
    });

    // Create notification for the user
    await db.notification.create({
      data: {
        title: 'Order Approved!',
        message: `Your order ${orderId} has been approved. We're now processing your service delivery.`,
        type: 'success',
        active: true,
        createdAt: new Date(),
        targetUserId: order.userId,
        orderId,
      },
    });

    // Log admin activity
    await db.activityLog.create({
      data: {
        userId: order.userId,
        userEmail: order.userEmail || '',
        userName: order.userName || '',
        action: 'order_approved',
        description: `Order ${orderId} approved by admin`,
        resource: 'order',
        details: `Order ID: ${orderId}, Action: approve`,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order approval error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}