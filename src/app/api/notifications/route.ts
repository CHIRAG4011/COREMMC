import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const result = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      active: n.active,
      read: n.read,
      createdAt: n.createdAt.getTime(),
      targetUserId: n.targetUserId,
      orderId: n.orderId,
    }));

    return NextResponse.json({ notifications: result });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Mark all as read
    if (body.markAllRead) {
      await db.notification.updateMany({
        where: { active: true },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    // Mark single notification as read
    if (body.notificationId) {
      await db.notification.update({
        where: { id: body.notificationId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}