import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        title: title.trim(),
        message: (message || '').trim(),
        type: type || 'info',
        active: true,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ id: notification.id, success: true });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    await db.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}