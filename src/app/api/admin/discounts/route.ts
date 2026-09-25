import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Get all discounts ──────────────────────────────────────────────
export async function GET() {
  try {
    const discounts = await db.discount.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Get all discounts error:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

// ── Create a new discount ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, startDate, endDate, active } = body;

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }
    if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json({ error: 'Valid discount type is required' }, { status: 400 });
    }
    if (discountValue == null || discountValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    const now = new Date();

    const discount = await db.discount.create({
      data: {
        code: code.trim().toUpperCase(),
        description: (description || '').trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxUses: Number(maxUses || 0),
        usedCount: 0,
        active: active !== false,
        showInBanner: false,
        startDate: startDate || now.toISOString(),
        endDate: endDate || '',
        createdAt: now,
      },
    });

    return NextResponse.json({ id: discount.id, success: true });
  } catch (err) {
    console.error('Failed to create discount:', err);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}

// ── Update an existing discount ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (fields.code !== undefined) updateData.code = fields.code.trim().toUpperCase();
    if (fields.description !== undefined) updateData.description = (fields.description || '').trim();
    if (fields.discountType !== undefined) updateData.discountType = fields.discountType;
    if (fields.discountValue !== undefined) updateData.discountValue = Number(fields.discountValue);
    if (fields.minOrderAmount !== undefined) updateData.minOrderAmount = Number(fields.minOrderAmount);
    if (fields.maxUses !== undefined) updateData.maxUses = Number(fields.maxUses);
    if (fields.active !== undefined) updateData.active = fields.active;
    if (fields.showInBanner !== undefined) updateData.showInBanner = fields.showInBanner;
    if (fields.startDate !== undefined) updateData.startDate = fields.startDate;
    if (fields.endDate !== undefined) updateData.endDate = fields.endDate;

    await db.discount.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update discount:', err);
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
  }
}

// ── Delete a discount ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Discount ID required' }, { status: 400 });
    }

    await db.discount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
  }
}