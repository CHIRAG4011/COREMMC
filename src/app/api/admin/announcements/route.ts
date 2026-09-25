import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/announcements — get all announcements (including inactive)
export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('[GET /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST /api/admin/announcements — create announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      type,
      icon,
      color,
      imageUrl,
      dismissible,
      active,
      startDate,
      endDate,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content: content ?? '',
        type: type ?? 'update',
        icon: icon ?? 'sparkles',
        color: color ?? '',
        imageUrl: imageUrl ?? '',
        dismissible: dismissible ?? true,
        active: active ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ id: announcement.id, success: true });
  } catch (error) {
    console.error('[POST /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PATCH /api/admin/announcements — update announcement
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Whitelist updatable fields
    const allowedFields = [
      'title', 'content', 'type', 'icon', 'color', 'imageUrl',
      'dismissible', 'active', 'startDate', 'endDate',
    ] as const;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updateData[field] = fields[field] ? new Date(fields[field]) : null;
        } else {
          updateData[field] = fields[field];
        }
      }
    }

    await db.announcement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE /api/admin/announcements?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/announcements]', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}