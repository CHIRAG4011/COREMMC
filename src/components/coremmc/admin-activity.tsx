'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityLog {
  id: string;
  action?: string;
  userName?: string;
  userEmail?: string;
  resource?: string;
  details?: string;
  timestamp?: string | null;
}

const ITEMS_PER_PAGE = 50;

const ACTION_TYPES = [
  'all',
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'register',
  'purchase',
];

export default function AdminActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/activity-logs/user?limit=100');
      const data = await res.json();
      const list: ActivityLog[] = (data.logs || []).map((l: Record<string, unknown>) => ({
        id: l.id,
        action: l.action || undefined,
        userName: l.userName || undefined,
        userEmail: l.userEmail || undefined,
        resource: l.resource || undefined,
        details: l.details || undefined,
        timestamp: l.timestamp || null,
      }));
      setLogs(list);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = useMemo(() => {
    let result = logs;

    if (actionFilter !== 'all') {
      result = result.filter((l) => l.action?.toLowerCase().includes(actionFilter));
    }

    if (emailFilter.trim()) {
      const q = emailFilter.toLowerCase();
      result = result.filter((l) => l.userEmail?.toLowerCase().includes(q));
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((l) => {
        if (!l.timestamp) return false;
        return new Date(l.timestamp) >= from;
      });
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((l) => {
        if (!l.timestamp) return false;
        return new Date(l.timestamp) <= to;
      });
    }

    return result;
  }, [logs, actionFilter, emailFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [actionFilter, emailFilter, dateFrom, dateTo]);

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return '—';
    }
  };

  const actionColor = (action?: string) => {
    if (!action) return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (a.includes('update') || a.includes('edit')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (a.includes('delete') || a.includes('remove')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (a.includes('login')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    if (a.includes('purchase') || a.includes('payment')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Activity Logs</h1>
        <p className="text-zinc-400 mt-1">Track all platform activity ({filtered.length} entries)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full md:w-[160px] bg-[#12121a] border-zinc-800/50">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a} value={a}>
                {a === 'all' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="pl-9 bg-[#12121a] border-zinc-800/50"
          />
        </div>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full md:w-auto bg-[#12121a] border-zinc-800/50"
          placeholder="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full md:w-auto bg-[#12121a] border-zinc-800/50"
          placeholder="To date"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Timestamp</TableHead>
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Email</TableHead>
                <TableHead className="text-zinc-400">Action</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Resource</TableHead>
                <TableHead className="text-zinc-400 hidden xl:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-800/50 hover:bg-transparent">
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full bg-zinc-800/50" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell className="text-sm text-zinc-400 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm text-white">
                      {log.userName || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden md:table-cell">
                      {log.userEmail || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColor(log.action)}>
                        {log.action || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden lg:table-cell">
                      {log.resource || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500 hidden xl:table-cell max-w-[200px] truncate">
                      {log.details || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages} ({filtered.length} logs)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800/50"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800/50"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}