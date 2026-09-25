'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserRecord {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  [key: string]: unknown;
}

const ITEMS_PER_PAGE = 20;

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const list: UserRecord[] = (data.users || []).map((u: Record<string, unknown>) => ({
        id: u.id,
        uid: u.id,
        email: u.email || '',
        displayName: u.displayName || '',
        role: u.role || 'user',
        isActive: u.isActive !== false,
        createdAt: u.createdAt || null,
        lastLoginAt: u.lastLoginAt || null,
      }));
      setUsers(list);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Users</h1>
        <p className="text-zinc-400 mt-1">View user accounts — manage roles in the Roles tab ({filtered.length} total)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#12121a] border-zinc-800/50"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-[#12121a] border-zinc-800/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Role</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Created</TableHead>
                <TableHead className="text-zinc-400 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-800/50 hover:bg-transparent">
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full bg-zinc-800/50" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow key={user.id} className="border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer" onClick={() => setDetailUser(user)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-zinc-700">
                          <AvatarFallback className="text-xs text-white">
                            {getInitials(user.displayName || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white font-medium truncate max-w-[120px]">
                          {user.displayName || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={roleColor(user.role)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={user.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden md:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); setDetailUser(user); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
            Page {page} of {totalPages} ({filtered.length} users)
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

      {/* User Detail Dialog (read-only) */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">User Details</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 bg-zinc-700">
                  <AvatarFallback className="text-lg text-white">
                    {getInitials(detailUser.displayName || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-lg">{detailUser.displayName || 'Unknown'}</p>
                  <p className="text-sm text-zinc-400">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Role</p>
                  <Badge variant="outline" className={roleColor(detailUser.role)}>
                    {detailUser.role}
                  </Badge>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Status</p>
                  <Badge
                    variant="outline"
                    className={detailUser.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {detailUser.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Created</p>
                  <p className="text-sm text-white">{formatDateTime(detailUser.createdAt)}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Last Login</p>
                  <p className="text-sm text-white">{formatDateTime(detailUser.lastLoginAt)}</p>
                </div>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">UID</p>
                <p className="text-xs text-white/70 font-mono break-all">{detailUser.uid}</p>
              </div>
              <p className="text-xs text-zinc-600 text-center">Manage roles and permissions in the Roles tab</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}