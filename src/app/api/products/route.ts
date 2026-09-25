import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

let productsCache: CachedData<unknown[]> | null = null;
const CACHE_TTL = 5 * 60_000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categorySlug = searchParams.get('category');

    // Use cache only when no category filter is applied
    if (!categorySlug && productsCache && Date.now() - productsCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ products: productsCache.data });
    }

    // Fetch categories for name lookup and slug filter
    const categories = await db.category.findMany({ where: { active: true } });
    const categoryNameMap = new Map<string, string>();
    const categoryIdBySlug = new Map<string, string>();
    for (const cat of categories) {
      categoryNameMap.set(cat.id, cat.name);
      categoryIdBySlug.set(cat.slug, cat.id);
    }

    // Resolve category filter
    let categoryId: string | null = null;
    if (categorySlug) {
      categoryId = categoryIdBySlug.get(categorySlug) || null;
    }

    // Fetch products
    const products = await db.product.findMany({ where: { active: true } });

    const result = products
      .filter((p) => {
        if (categorySlug && categoryId && p.categoryId !== categoryId) return false;
        return true;
      })
      .map((p) => {
        // Parse specs: handle both array-of-objects and record formats
        let specsRecord: Record<string, string> = {};
        try {
          const raw = JSON.parse(p.specs);
          if (Array.isArray(raw)) {
            for (const spec of raw) {
              if (spec && spec.key) {
                specsRecord[spec.key] = spec.value ?? '';
              }
            }
          } else if (raw && typeof raw === 'object') {
            specsRecord = raw;
          }
        } catch {
          specsRecord = {};
        }

        // Parse features
        let features: string[] = [];
        try {
          const raw = JSON.parse(p.features);
          if (Array.isArray(raw)) {
            features = raw.filter((f: unknown) => typeof f === 'string');
          }
        } catch {
          features = [];
        }

        return {
          id: p.id,
          planId: p.planId,
          name: p.name,
          categoryId: p.categoryId,
          categoryName: categoryNameMap.get(p.categoryId) || '',
          price: p.price,
          originalPrice: p.originalPrice,
          isActive: p.active,
          isPopular: p.popular,
          badge: p.badge,
          specs: specsRecord,
          features,
          support: p.support,
          location: p.location,
          setup: p.setup,
          order: p.sortOrder,
          imageUrl: p.imageUrl,
        };
      })
      .sort((a, b) => a.order - b.order);

    // Update cache (only cache unfiltered results)
    if (!categorySlug) {
      productsCache = { data: result, timestamp: Date.now() };
    }

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ products: [] });
  }
}