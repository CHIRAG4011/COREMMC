'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Search, Plus, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

interface Payment {
  id: string;
  userId: string;
  userEmail?: string;
  productId?: string;
  productName?: string;
  amount: number;
  payment: boolean;
  notes?: string;
  createdAt?: string | null;
}

interface ProductItem {
  id: string;
  name: string;
}

interface UserItem {
  id: string;
  email: string;
}

export default function AdminPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  // Manual payment form
  const [mpUser, setMpUser] = useState('');
  const [mpProduct, setMpProduct] = useState('');
  const [mpAmount, setMpAmount] = useState(0);
  const [mpNotes, setMpNotes] = useState('');
  const [mpUserSearch, setMpUserSearch] = useState('');
  const [mpUserResults, setMpUserResults] = useState<UserItem[]>([]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      const list: Payment[] = (data.payments || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        userId: p.userId || '',
        userEmail: p.userEmail || undefined,
        productId: p.productId || undefined,
        productName: p.productName || undefined,
        amount: Number(p.amount) || 0,
        payment: p.payment === true,
        notes: p.notes || undefined,
        createdAt: p.createdAt || null,
      }));
      setPayments(list);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      const list: ProductItem[] = (data.products || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name || '',
      }));
      setProducts(list);
    } catch { /* silent */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const list: UserItem[] = (data.users || []).map((u: Record<string, unknown>) => ({
        id: u.id,
        email: u.email || '',
      }));
      setUsers(list);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchProducts();
    fetchUsers();
  }, [fetchPayments, fetchProducts, fetchUsers]);

  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter((p) => p.userEmail?.toLowerCase().includes(q));
  }, [payments, search]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: toggleTarget.id, payment: !toggleTarget.payment }),
      });
      if (!res.ok) throw new Error();
      toast.success('Payment status updated');
      setToggleTarget(null);
      fetchPayments();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const openManualDialog = () => {
    setMpUser('');
    setMpProduct('');
    setMpAmount(0);
    setMpNotes('');
    setMpUserSearch('');
    setMpUserResults([]);
    setDialogOpen(true);
  };

  const searchUsers = (q: string) => {
    setMpUserSearch(q);
    if (!q.trim()) { setMpUserResults([]); return; }
    const lower = q.toLowerCase();
    setMpUserResults(users.filter((u) => u.email.toLowerCase().includes(lower)).slice(0, 5));
  };

  const handleAddPayment = async () => {
    if (!mpUser || !mpProduct) { toast.error('User and product are required'); return; }
    setSaving(true);
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const userData = users.find((u) => u.id === mpUser);
      const prodData = products.find((p) => p.id === mpProduct);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: mpUser,
          userEmail: userData?.email || '',
          productId: mpProduct,
          productName: prodData?.name || '',
          amount: mpAmount,
          payment: true,
          notes: mpNotes,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Payment added');
      setDialogOpen(false);
      fetchPayments();
    } catch {
      toast.error('Failed to add payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Payments</h1>
          <p className="text-zinc-400 mt-1">Manage payment records ({filtered.length})</p>
        </div>
        <Button onClick={openManualDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Add Manual Payment
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#12121a] border-zinc-800/50"
        />
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">User Email</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Product</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Paid</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
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
              ) : filtered.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">No payments found</TableCell>
                </TableRow>
              ) : (
                filtered.map((pay) => (
                  <TableRow key={pay.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell className="text-sm text-zinc-300">{pay.userEmail || pay.userId}</TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden md:table-cell">{pay.productName || pay.productId || '—'}</TableCell>
                    <TableCell className="text-sm text-white font-medium">₹{pay.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={pay.payment
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {pay.payment ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden sm:table-cell">{formatDate(pay.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-1 ${pay.payment ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                        onClick={() => setToggleTarget(pay)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {pay.payment ? 'Unmark' : 'Mark Paid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Manual Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Manual Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">User</Label>
              <Input
                value={mpUserSearch}
                onChange={(e) => searchUsers(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="Search user by email..."
              />
              {mpUserResults.length > 0 && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 max-h-32 overflow-y-auto">
                  {mpUserResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setMpUser(u.id); setMpUserSearch(u.email); setMpUserResults([]); }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      {u.email}
                    </button>
                  ))}
                </div>
              )}
              {mpUser && <p className="text-xs text-emerald-400">Selected: {users.find((u) => u.id === mpUser)?.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Product</Label>
              <Select value={mpProduct} onValueChange={setMpProduct}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Amount (₹)</Label>
              <Input type="number" value={mpAmount} onChange={(e) => setMpAmount(Number(e.target.value))} className="bg-zinc-800/50 border-zinc-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Notes</Label>
              <Textarea value={mpNotes} onChange={(e) => setMpNotes(e.target.value)} className="bg-zinc-800/50 border-zinc-700 min-h-[60px]" placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-zinc-700" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPayment} disabled={saving}>{saving ? 'Adding...' : 'Add Payment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Confirm */}
      <AlertDialog open={!!toggleTarget} onOpenChange={(open) => !open && setToggleTarget(null)}>
        <AlertDialogContent className="bg-[#12121a] border-zinc-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {toggleTarget?.payment ? 'Unmark as Paid' : 'Mark as Paid'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to {toggleTarget?.payment ? 'unmark' : 'mark'} the payment of <strong className="text-white">₹{toggleTarget?.amount}</strong> for {toggleTarget?.userEmail}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}