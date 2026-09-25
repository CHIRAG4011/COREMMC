import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/get?uid=xxx — get user by Firebase UID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: uid },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        payment: user.payment,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        notificationPreferences: {
          email: user.notificationPrefEmail,
          service: user.notificationPrefService,
          marketing: user.notificationPrefMarketing,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/users/get]', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}