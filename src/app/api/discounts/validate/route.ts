import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Find the discount by code (case-insensitive via first)
    const discount = await db.discount.findFirst({
      where: { code: normalizedCode },
    });

    if (!discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
    }

    // Check if active
    if (!discount.active) {
      return NextResponse.json({ error: 'This discount code is no longer active' }, { status: 400 });
    }

    // Check date range
    const now = new Date();
    if (discount.startDate) {
      const start = new Date(discount.startDate);
      if (now < start) {
        return NextResponse.json({ error: 'This discount code is not yet active' }, { status: 400 });
      }
    }
    if (discount.endDate) {
      const end = new Date(discount.endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 });
      }
    }

    // Check usage limit
    if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 });
    }

    // Check minimum order amount
    const amount = Number(orderAmount) || 0;
    if (discount.minOrderAmount > 0 && amount < discount.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount of ₹${discount.minOrderAmount.toLocaleString('en-IN')} required`,
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = Math.round((amount * discount.discountValue) / 100);
    } else {
      discountAmount = discount.discountValue;
    }

    // Ensure discount doesn't make total negative
    discountAmount = Math.min(discountAmount, amount);

    return NextResponse.json({
      valid: true,
      discountId: discount.id,
      code: discount.code,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      discountAmount,
      description: discount.description || '',
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    return NextResponse.json({ error: 'Failed to validate discount code' }, { status: 500 });
  }
}