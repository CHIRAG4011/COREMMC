import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPaymenterRedirectUrl } from '@/lib/paymenter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, items, totalAmount, discountCode, discountAmount } = body;

    const cartItems = Array.isArray(items) ? items : [];
    const redirectUrl = getPaymenterRedirectUrl(cartItems, {
      discountCode: discountCode || null,
      userEmail: userEmail || undefined,
    });

    let orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Record order in CoreMMC PostgreSQL database if userId provided
    if (userId) {
      try {
        const order = await db.order.create({
          data: {
            orderId,
            userId,
            userEmail: userEmail || '',
            userName: userName || '',
            items: JSON.stringify(cartItems),
            totalAmount: Number(totalAmount) || 0,
            currency: 'INR',
            status: 'pending',
            discountCode: discountCode || '',
            adminNotes: 'Paymenter Billing Panel checkout initiated',
            paymentInfo: JSON.stringify({
              provider: 'paymenter',
              redirectUrl,
              discountAmount: discountAmount || 0,
              initiatedAt: new Date().toISOString(),
            }),
          },
        });
        orderId = order.orderId;
      } catch (dbErr) {
        console.warn('[checkout] Failed to record order in DB (continuing redirect):', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
      orderId,
    });
  } catch (err) {
    console.error('[checkout] Error processing billing checkout:', err);
    return NextResponse.json(
      {
        success: false,
        redirectUrl: 'https://billing.coremmc.cloud/shop',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
