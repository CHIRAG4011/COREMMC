import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/settings — get all settings
export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'website' },
    });

    return NextResponse.json(settings ?? {});
  } catch (error) {
    console.error('[GET /api/admin/settings]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/admin/settings — save all settings (upsert)
export async function POST(request: NextRequest) {
  try {
    const { id: _id, ...body } = await request.json();

    await db.siteSettings.upsert({
      where: { id: 'website' },
      update: body,
      create: {
        id: 'website',
        ...body,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/admin/settings]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}