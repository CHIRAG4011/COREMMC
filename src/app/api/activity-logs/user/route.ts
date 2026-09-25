import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/activity-logs/user?userId=xxx&limit=5&offset=0
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 10, 1), 100);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.activityLog.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('[GET /api/activity-logs/user]', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}