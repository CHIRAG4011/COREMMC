import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type DiscountData = {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  endDate: string;
};

interface CachedData<T> { data: T; timestamp: number }
const CACHE_TTL = 5 * 60_000; // 5 minutes

let cache: CachedData<{ discount: DiscountData | null }> | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const now = new Date();

    // 1. Try to find a discount explicitly marked for the banner
    const bannerDiscount = await db.discount.findFirst({
      where: { showInBanner: true, active: true },
    });

    if (bannerDiscount) {
      if (bannerDiscount.startDate && now < new Date(bannerDiscount.startDate)) {
        cache = { data: { discount: null }, timestamp: Date.now() };
        return NextResponse.json({ discount: null });
      }
      if (bannerDiscount.endDate && now > new Date(bannerDiscount.endDate)) {
        cache = { data: { discount: null }, timestamp: Date.now() };
        return NextResponse.json({ discount: null });
      }
      const discount: DiscountData = {
        code: bannerDiscount.code,
        description: bannerDiscount.description || '',
        discountType: bannerDiscount.discountType,
        discountValue: bannerDiscount.discountValue,
        maxUses: bannerDiscount.maxUses || 0,
        usedCount: bannerDiscount.usedCount || 0,
        endDate: bannerDiscount.endDate || '',
      };
      cache = { data: { discount }, timestamp: Date.now() };
      return NextResponse.json({ discount });
    }

    // 2. Fallback: first active discount with a time or usage limit
    const allDiscounts = await db.discount.findMany({
      where: { active: true },
      take: 10,
    });

    for (const d of allDiscounts) {
      if (!d.endDate && !d.maxUses) continue;
      if (d.startDate && now < new Date(d.startDate)) continue;
      if (d.endDate && now > new Date(d.endDate)) continue;
      if (d.maxUses > 0 && d.usedCount >= d.maxUses) continue;

      const discount: DiscountData = {
        code: d.code,
        description: d.description || '',
        discountType: d.discountType,
        discountValue: d.discountValue,
        maxUses: d.maxUses || 0,
        usedCount: d.usedCount || 0,
        endDate: d.endDate || '',
      };
      cache = { data: { discount }, timestamp: Date.now() };
      return NextResponse.json({ discount });
    }

    cache = { data: { discount: null }, timestamp: Date.now() };
    return NextResponse.json({ discount: null });
  } catch (error) {
    console.error('Promo banner API error:', error);
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ discount: null });
  }
}