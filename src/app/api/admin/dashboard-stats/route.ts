import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PENDING_STATUSES = ['pending'];

export async function GET() {
  try {
    const [totalUsers, totalProducts, allOrders, recentOrders, pendingOrdersList] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.order.findMany(),
      db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      db.order.findMany({ where: { status: { in: PENDING_STATUSES } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    let totalRevenue = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    for (const o of allOrders) {
      if (o.status === 'completed') {
        totalRevenue += o.totalAmount;
        completedOrders++;
      }
      if (PENDING_STATUSES.includes(o.status)) {
        pendingOrders++;
      }
    }

    const recentOrdersMapped = recentOrders.map((o) => {
      const items = JSON.parse(o.items || '[]');
      return {
        id: o.id,
        orderId: o.orderId,
        userName: o.userName || 'Unknown',
        userEmail: o.userEmail || '',
        totalAmount: o.totalAmount,
        status: o.status || 'pending',
        createdAt: o.createdAt.toISOString(),
      };
    });

    const pendingOrdersMapped = pendingOrdersList.map((o) => {
      const items = JSON.parse(o.items || '[]');
      return {
        id: o.id,
        orderId: o.orderId,
        userName: o.userName || 'Unknown',
        userEmail: o.userEmail || '',
        totalAmount: o.totalAmount,
        status: o.status || 'pending',
        serviceName: items?.[0]?.name || 'Unknown Service',
        discordId: o.discordId || '',
        paymentUtr: o.paymentUtr || '',
        createdAt: o.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      totalUsers,
      totalProducts,
      completedOrders,
      pendingOrders,
      totalRevenue,
      recentOrders: recentOrdersMapped,
      pendingOrdersList: pendingOrdersMapped,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}