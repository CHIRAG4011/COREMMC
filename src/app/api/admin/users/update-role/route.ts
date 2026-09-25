import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/db';

/**
 * PATCH /api/admin/users/update-role
 * Updates a user's role. Only owners can change roles.
 */
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — no token' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const body = await req.json();
    const { userId, role } = body;
    if (!userId || !role) return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    if (!['user', 'admin', 'owner'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const decoded = await getAuth().verifyIdToken(idToken);
    const requesterUid = decoded.uid;

    if (userId === requesterUid) return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });

    const requester = await db.user.findUnique({ where: { id: requesterUid } });
    if (!requester) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    if (requester.role !== 'owner') return NextResponse.json({ error: 'Only owners can manage roles' }, { status: 403 });

    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    const currentRole = target.role || 'user';
    if (currentRole === role) return NextResponse.json({ error: 'User already has this role' }, { status: 400 });

    await db.user.update({ where: { id: userId }, data: { role } });

    return NextResponse.json({ success: true, userId, previousRole: currentRole, newRole: role });
  } catch (error) {
    console.error('Update role error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to update role: ${msg}` }, { status: 500 });
  }
}