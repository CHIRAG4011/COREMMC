import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/categories — get all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    // Add 'order' alias for frontend compatibility
    const withAlias = categories.map((c) => ({ ...c, order: c.sortOrder }));
    return NextResponse.json({ categories: withAlias });
  } catch (error) {
    console.error('[GET /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories — create category
// If id is provided, use it; otherwise let Prisma generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      shortDescription,
      icon,
      color,
      gradient,
      order,
      active,
      featured,
      heroTitle,
      heroSubtitle,
      metaTitle,
      metaDescription,
      imageUrl,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {
      name,
      slug,
      description: description ?? '',
      shortDescription: shortDescription ?? '',
      icon: icon ?? 'Globe',
      color: color ?? '#3b82f6',
      gradient: gradient ?? '',
      sortOrder: Number(order) || 0,
      active: active ?? true,
      featured: featured ?? false,
      heroTitle: heroTitle ?? '',
      heroSubtitle: heroSubtitle ?? '',
      metaTitle: metaTitle ?? '',
      metaDescription: metaDescription ?? '',
      imageUrl: imageUrl ?? '',
    };

    if (id) {
      data.id = id;
    }

    const category = await db.category.create({ data });

    return NextResponse.json({ id: category.id, success: true });
  } catch (error: unknown) {
    console.error('[POST /api/admin/categories]', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PATCH /api/admin/categories — update category
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
      'name', 'slug', 'description', 'shortDescription', 'icon', 'color',
      'gradient', 'order', 'active', 'featured', 'heroTitle', 'heroSubtitle',
      'metaTitle', 'metaDescription', 'imageUrl',
    ] as const;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        // Map 'order' to 'sortOrder' in the database
        if (field === 'order') {
          updateData.sortOrder = Number(fields[field]) || 0;
        } else {
          updateData[field] = fields[field];
        }
      }
    }

    await db.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[PATCH /api/admin/categories]', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/categories]', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}