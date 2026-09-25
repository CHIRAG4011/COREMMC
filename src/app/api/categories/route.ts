import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

let categoriesCache: CachedData<unknown[]> | null = null;
const CACHE_TTL = 5 * 60_000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if still fresh
    if (categoriesCache && Date.now() - categoriesCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ categories: categoriesCache.data });
    }

    const categories = await db.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      shortDescription: c.shortDescription,
      icon: c.icon,
      color: c.color,
      order: c.sortOrder,
      featured: c.featured,
      active: c.active,
      imageUrl: c.imageUrl,
    }));

    // Update cache
    categoriesCache = { data: result, timestamp: Date.now() };

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ categories: [] });
  }
}