import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: safely stringify specs/features (avoid double-stringify)
function safeJsonStringify(val: unknown, fallback: string): string {
  if (typeof val === 'string') return val; // already a JSON string
  try { return JSON.stringify(val); } catch { return fallback; }
}

// Helper: resolve category id → name
async function resolveCategoryName(categoryId: string): Promise<string> {
  if (!categoryId) return '';
  try {
    const cat = await db.category.findUnique({ where: { id: categoryId }, select: { name: true } });
    return cat?.name ?? categoryId;
  } catch {
    return categoryId;
  }
}

// GET /api/admin/products — get all products (including inactive)
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Parse specs/features from JSON strings, add frontend-friendly aliases
    const parsed = products.map((p) => ({
      ...p,
      // Frontend expects 'category' not 'categoryId'
      category: p.categoryId || '',
      // Frontend expects 'order' not 'sortOrder'
      order: p.sortOrder,
      // Parse JSON strings to objects
      specs: (() => { try { return JSON.parse(p.specs || '{}'); } catch { return {}; } })(),
      features: (() => { try { return JSON.parse(p.features || '[]'); } catch { return []; } })(),
    }));

    return NextResponse.json({ products: parsed });
  } catch (error) {
    console.error('[GET /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products — create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept both 'category' (frontend) and 'categoryId' (direct)
    const categoryId = body.categoryId ?? body.category ?? '';
    const categoryName = body.categoryName || (categoryId ? await resolveCategoryName(categoryId) : '');
    // Accept both 'order' (frontend) and 'sortOrder' (direct)
    const sortOrder = body.sortOrder ?? body.order ?? 0;
    // Auto-generate planId if not provided
    const planId = body.planId || `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        planId,
        name: body.name,
        categoryId,
        categoryName,
        price: Number(body.price) || 0,
        originalPrice: body.originalPrice !== undefined && body.originalPrice !== null ? Number(body.originalPrice) : null,
        billingCycle: body.billingCycle ?? 'monthly',
        billingUrl: body.billingUrl ?? '',
        active: body.active ?? true,
        popular: body.popular ?? false,
        badge: body.badge ?? '',
        specs: safeJsonStringify(body.specs, '{}'),
        features: safeJsonStringify(body.features, '[]'),
        support: body.support ?? 'Standard',
        location: body.location ?? '',
        setup: body.setup ?? 'Instant',
        sortOrder: Number(sortOrder) || 0,
        imageUrl: body.imageUrl ?? '',
      },
    });

    return NextResponse.json({ id: product.id, success: true });
  } catch (error: unknown) {
    console.error('[POST /api/admin/products]', error);

    // Unique constraint violation on planId
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'planId already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PATCH /api/admin/products — update product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Handle 'category' → resolve to categoryId + categoryName
    if (fields.category !== undefined) {
      updateData.categoryId = fields.category;
      updateData.categoryName = await resolveCategoryName(fields.category);
    }
    if (fields.categoryId !== undefined) {
      updateData.categoryId = fields.categoryId;
      if (fields.categoryName !== undefined) {
        updateData.categoryName = fields.categoryName;
      } else {
        updateData.categoryName = await resolveCategoryName(fields.categoryId);
      }
    }

    // Handle 'order' → 'sortOrder'
    if (fields.order !== undefined) {
      updateData.sortOrder = Number(fields.order) || 0;
    }
    if (fields.sortOrder !== undefined) {
      updateData.sortOrder = Number(fields.sortOrder) || 0;
    }

    // Whitelist updatable fields
    const simpleFields = [
      'planId', 'name', 'price', 'originalPrice',
      'billingCycle', 'billingUrl', 'active', 'popular', 'badge', 'support',
      'location', 'setup', 'imageUrl',
    ] as const;

    for (const field of simpleFields) {
      if (fields[field] !== undefined) {
        if (field === 'price') {
          updateData[field] = Number(fields[field]);
        } else if (field === 'originalPrice') {
          updateData[field] = fields[field] !== null ? Number(fields[field]) : null;
        } else {
          updateData[field] = fields[field];
        }
      }
    }

    // Handle JSON fields — avoid double-stringify
    if (fields.specs !== undefined) {
      updateData.specs = safeJsonStringify(fields.specs, '{}');
    }
    if (fields.features !== undefined) {
      updateData.features = safeJsonStringify(fields.features, '[]');
    }

    await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[PATCH /api/admin/products]', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'planId already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}