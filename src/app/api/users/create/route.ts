import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/users/create — create user profile after Firebase Auth registration
// Body: { uid, email, displayName, photoURL }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json({ error: 'uid and email are required' }, { status: 400 });
    }

    await db.user.create({
      data: {
        id: uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[POST /api/users/create]', error);

    // If the user already exists (e.g. duplicate key), return success anyway
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}