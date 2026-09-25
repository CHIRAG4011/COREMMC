import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── In-memory cache (5 min) ──────────────────────────────────────────────
let _cache: { data: unknown; ts: number } | null = null;
const TTL = 5 * 60_000;

const DEFAULT_SERVICES = [
  { id: 'minecraft', name: 'Minecraft Hosting', status: 'operational' as const, uptime: 99.98 },
  { id: 'vps', name: 'VPS Hosting', status: 'operational' as const, uptime: 99.95 },
  { id: 'web', name: 'Web Hosting', status: 'operational' as const, uptime: 99.99 },
  { id: 'discord', name: 'Discord Bot Hosting', status: 'operational' as const, uptime: 100 },
  { id: 'domain', name: 'Domain Services', status: 'operational' as const, uptime: 100 },
  { id: 'panel', name: 'Control Panel', status: 'operational' as const, uptime: 99.97 },
  { id: 'api', name: 'API Gateway', status: 'operational' as const, uptime: 99.99 },
  { id: 'database', name: 'Database Cluster', status: 'operational' as const, uptime: 99.99 },
];

export async function GET() {
  try {
    // Return cached data if fresh
    if (_cache && Date.now() - _cache.ts < TTL) {
      return NextResponse.json(_cache.data);
    }

    const status = await db.serviceStatus.findUnique({
      where: { id: 'serviceStatus' },
    });

    let services = DEFAULT_SERVICES;
    let overallStatus: 'operational' | 'degraded' | 'down' = 'operational';
    let lastUpdated: string = new Date().toISOString();
    let incidentMessage = '';

    if (status) {
      try {
        const parsed = JSON.parse(status.services);
        if (Array.isArray(parsed) && parsed.length > 0) {
          services = parsed;
        }
      } catch {
        // use defaults
      }
      overallStatus = (status.overallStatus as 'operational' | 'degraded' | 'down') || 'operational';
      lastUpdated = status.lastUpdated || lastUpdated;
      incidentMessage = status.incidentMessage || '';
    }

    // Derive overall from services if not set
    if (!status || !status.overallStatus) {
      const hasDown = services.some((s: { status: string }) => s.status === 'down');
      const hasDegraded = services.some((s: { status: string }) => s.status === 'degraded');
      overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';
    }

    const result = { services, overallStatus, lastUpdated, incidentMessage };

    // Cache
    _cache = { data: result, ts: Date.now() };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Status API error:', error);
    // Return stale cache or defaults on error
    if (_cache) return NextResponse.json(_cache.data);
    return NextResponse.json({
      services: DEFAULT_SERVICES,
      overallStatus: 'operational',
      lastUpdated: new Date().toISOString(),
      incidentMessage: '',
    });
  }
}