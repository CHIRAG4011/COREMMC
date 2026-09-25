import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/payments?userId=xxx   → user's payments
// GET /api/payments              → all payments (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const payments = await db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ payments });
    }

    // Admin: get all payments
    const payments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[GET /api/payments]', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments — create manual payment (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userEmail,
      productId,
      productName,
      planName,
      category,
      amount,
      payment,
      status,
      notes,
    } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: 'userId and amount are required' }, { status: 400 });
    }

    const newPayment = await db.payment.create({
      data: {
        userId,
        userEmail: userEmail ?? '',
        productId: productId ?? '',
        productName: productName ?? '',
        planName: planName ?? '',
        category: category ?? '',
        amount: Number(amount),
        payment: payment ?? false,
        status: status ?? 'active',
        notes: notes ?? '',
        paymentDate: new Date(),
      },
    });

    return NextResponse.json({ id: newPayment.id, success: true });
  } catch (error) {
    console.error('[POST /api/payments]', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// PATCH /api/payments — update a payment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, payment, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (payment !== undefined) updateData.payment = Boolean(payment);
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await db.payment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/payments]', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}