import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users — get all users (admin list)
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PATCH /api/users — update user profile (displayName)
// Body: { userId, displayName }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await db.user.update({
      where: { id: userId },
      data: { displayName: displayName ?? '' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/users]', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}