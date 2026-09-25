import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userEmail, action, resource, details } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    await db.activityLog.create({
      data: {
        userId: userId || '',
        userName: userName || '',
        userEmail: userEmail || '',
        action,
        resource: resource || '',
        details: details || '',
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}