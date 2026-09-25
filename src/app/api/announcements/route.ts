import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CachedData<T> { data: T; timestamp: number }
const CACHE_TTL = 5 * 60_000; // 5 minutes

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  imageUrl: string;
  dismissible: boolean;
  startDate: string;
  endDate: string;
};

let cache: CachedData<{ announcements: Announcement[] }> | null = null;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const now = new Date();

    const all = await db.announcement.findMany({ where: { active: true } });

    const filtered = all
      .filter((a) => {
        if (a.startDate && a.startDate > now) return false;
        if (a.endDate && a.endDate < now) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        imageUrl: a.imageUrl,
        dismissible: a.dismissible,
        startDate: a.startDate?.toISOString() || '',
        endDate: a.endDate?.toISOString() || '',
      }));

    const result = { announcements: filtered };
    cache = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ announcements: [] });
  }
}