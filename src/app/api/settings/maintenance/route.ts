import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CachedData<T> { data: T; timestamp: number }
const CACHE_TTL = 5 * 60_000; // 5 minutes

let cache: CachedData<{ maintenanceMode: boolean; maintenanceMessage: string }> | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const settings = await db.siteSettings.findUnique({
      where: { id: 'website' },
    });

    let data: { maintenanceMode: boolean; maintenanceMessage: string };
    if (settings) {
      data = {
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || 'We are currently performing maintenance. Please check back later.',
      };
    } else {
      data = { maintenanceMode: false, maintenanceMessage: '' };
    }

    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ maintenanceMode: false, maintenanceMessage: '' });
  }
}