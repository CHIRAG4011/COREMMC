import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications/user?userId=xxx&limit=20&offset=0
// GET /api/notifications/user?userId=xxx&unreadOnly=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (unreadOnly) {
      const unreadCount = await db.userNotification.count({
        where: { userId, read: false },
      });
      return NextResponse.json({ unreadCount });
    }

    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    const [notifications, total] = await Promise.all([
      db.userNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.userNotification.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({ notifications, total });
  } catch (error) {
    console.error('[GET /api/notifications/user]', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/notifications/user — mark notification(s) as read
// Body: { userId, notificationId? }
// If no notificationId, mark all as read for user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (notificationId) {
      await db.userNotification.updateMany({
        where: { userId, id: notificationId },
        data: { read: true },
      });
    } else {
      await db.userNotification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/notifications/user]', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}