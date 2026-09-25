'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────
type ServiceStatus = 'operational' | 'degraded' | 'down';

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
}

interface StatusData {
  services: Service[];
  overallStatus: ServiceStatus;
  lastUpdated: string;
  incidentMessage: string;
}

// ── Status config ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; dot: string; pulse: string }
> = {
  operational: {
    label: 'Operational',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    pulse: 'shadow-emerald-400/30',
  },
  degraded: {
    label: 'Degraded',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    pulse: 'shadow-amber-400/30',
  },
  down: {
    label: 'Down',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
    pulse: 'shadow-red-400/30',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────
function formatUptime(uptime: number): string {
  return uptime.toFixed(2);
}

function formatLastUpdated(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return 'Just now';
  }
}

// ── Skeleton ─────────────────────────────────────────────────────────────
function StatusSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-white/5 animate-pulse" />
        <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/[0.03] rounded-xl border border-white/[0.06] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ── Uptime Bar (90-day visual) ───────────────────────────────────────────
function UptimeBar({ uptime }: { uptime: number }) {
  // Generate 90 days of fake daily uptime data based on overall uptime
  const days = useMemo(() => {
    const arr: boolean[] = [];
    for (let i = 0; i < 90; i++) {
      // Use seeded pseudo-random based on index and uptime
      const seed = (uptime * 1000 + i * 7.31) % 100;
      arr.push(uptime >= 99.9 ? true : seed < uptime);
    }
    return arr;
  }, [uptime]);

  return (
    <div className="flex gap-[2px] h-5" title={`${formatUptime(uptime)}% uptime`}>
      {days.map((up, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-[1px] transition-colors',
            up ? 'bg-emerald-400/80' : 'bg-red-400/80'
          )}
        />
      ))}
    </div>
  );
}

// ── Overall Status Banner ────────────────────────────────────────────────
function OverallBanner({ status, message }: { status: ServiceStatus; message: string }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'w-full max-w-2xl mx-auto rounded-2xl border p-6 md:p-8 flex flex-col items-center gap-4 text-center',
        config.bg,
        config.border
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center',
            status === 'operational' && 'bg-emerald-500/15',
            status === 'degraded' && 'bg-amber-500/15',
            status === 'down' && 'bg-red-500/15'
          )}
        >
          <Icon className={cn('h-8 w-8', config.color)} />
        </div>
        {/* Pulse ring */}
        {status !== 'operational' && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-20',
              status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'
            )}
          />
        )}
      </div>
      <div>
        <h2 className={cn('text-xl md:text-2xl font-bold', config.color)}>
          All Systems {status === 'operational' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Experiencing Issues'}
        </h2>
        {message ? (
          <p className="text-sm text-white/60 mt-2 max-w-md">{message}</p>
        ) : (
          <p className="text-sm text-white/50 mt-2">
            {status === 'operational'
              ? 'All services are running smoothly'
              : status === 'degraded'
                ? 'Some services may be experiencing issues'
                : 'We are aware of the issues and working on a fix'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Service Row ──────────────────────────────────────────────────────────
function ServiceRow({ service, index }: { service: Service; index: number }) {
  const config = STATUS_CONFIG[service.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.04 }}
      className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
    >
      {/* Status dot */}
      <div className="relative shrink-0">
        <div className={cn('h-3 w-3 rounded-full', config.dot)} />
        {(service.status === 'degraded' || service.status === 'down') && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-30',
              config.dot
            )}
          />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-medium text-white truncate">{service.name}</p>
      </div>

      {/* Uptime bar (hidden on very small screens) */}
      <div className="hidden sm:block w-28 md:w-40 shrink-0">
        <UptimeBar uptime={service.uptime} />
      </div>

      {/* Uptime percentage */}
      <span
        className={cn(
          'text-xs md:text-sm font-mono tabular-nums shrink-0 w-16 text-right',
          service.uptime >= 99.9 ? 'text-emerald-400/80' : service.uptime >= 99 ? 'text-amber-400/80' : 'text-red-400/80'
        )}
      >
        {formatUptime(service.uptime)}%
      </span>

      {/* Status badge */}
      <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0', config.bg, config.border, config.color)}>
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{config.label}</span>
      </div>
    </motion.div>
  );
}

// ── Main Status Page ─────────────────────────────────────────────────────
export function StatusView() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/status');
      const json = await res.json();
      setData(json);
    } catch {
      // Keep stale data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchStatus(), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh every 60s

  if (loading || !data) {
    return (
      <section className="min-h-[60vh] flex items-start justify-center pt-12 md:pt-20 px-4">
        <StatusSkeleton />
      </section>
    );
  }

  const operationalCount = data.services.filter((s) => s.status === 'operational').length;
  const totalCount = data.services.length;

  return (
    <section className="min-h-[60vh] flex flex-col items-center pt-12 md:pt-20 pb-20 px-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Activity className="h-4 w-4" />
            <span>Real-time monitoring</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Service Status</h1>
          <p className="text-sm text-white/50 max-w-md">
            Monitor the health and uptime of all CoreMMC infrastructure services
          </p>
        </motion.div>

        {/* Overall status banner */}
        <OverallBanner status={data.overallStatus} message={data.incidentMessage} />

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-center gap-6 md:gap-10"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-xl md:text-2xl font-bold text-emerald-400">{operationalCount}/{totalCount}</span>
            </div>
            <span className="text-[11px] text-white/40 uppercase tracking-wider">Services Online</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xl md:text-2xl font-bold text-white">
                {data.services.reduce((sum, s) => sum + s.uptime, 0) / data.services.length >= 99.9
                  ? '99.9%+'
                  : `${(data.services.reduce((sum, s) => sum + s.uptime, 0) / data.services.length).toFixed(1)}%`}
              </span>
            </div>
            <span className="text-[11px] text-white/40 uppercase tracking-wider">Avg Uptime</span>
          </div>
        </motion.div>

        {/* Services list */}
        <div className="flex flex-col gap-2">
          {data.services.map((service, i) => (
            <ServiceRow key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-col items-center gap-3 pt-4"
        >
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated {formatLastUpdated(data.lastUpdated)}</span>
            <span className="text-white/15">|</span>
            <span>Auto-refreshes every 60s</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="text-white/40 hover:text-white/70 hover:bg-white/5 text-xs gap-1.5"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}