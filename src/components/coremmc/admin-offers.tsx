'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Percent, IndianRupee, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Discount {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  showInBanner: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  active: true,
  showInBanner: false,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateShort(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export default function AdminOffers() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      if (data.discounts) {
        setDiscounts(data.discounts);
      }
    } catch {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
    // Auto-refresh every 10s for realtime usage limit tracking
    const interval = setInterval(fetchDiscounts, 10000);
    return () => clearInterval(interval);
  }, [fetchDiscounts]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditId(d.id);
    setForm({
      code: d.code || '',
      description: d.description || '',
      discountType: d.discountType || 'percentage',
      discountValue: String(d.discountValue || ''),
      minOrderAmount: String(d.minOrderAmount || 0),
      maxUses: String(d.maxUses || 0),
      active: d.active !== false,
      showInBanner: d.showInBanner === true,
      startDate: d.startDate ? d.startDate.split('T')[0] : '',
      endDate: d.endDate ? d.endDate.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('Discount code is required');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxUses: Number(form.maxUses || 0),
        active: form.active,
        showInBanner: form.showInBanner,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : '',
        endDate: form.endDate ? new Date(form.endDate).toISOString() : '',
      };

      if (editId) {
        const res = await fetch('/api/admin/discounts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Failed to update discount');
          return;
        }
        toast.success('Discount updated');
      } else {
        const res = await fetch('/api/admin/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Failed to create discount');
          return;
        }
        toast.success('Discount created');
      }
      setDialogOpen(false);
      fetchDiscounts();
    } catch {
      toast.error('Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/discounts?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to delete discount');
        return;
      }
      toast.success('Discount deleted');
      setDeleteTarget(null);
      fetchDiscounts();
    } catch {
      toast.error('Failed to delete discount');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Discounts & Offers</h1>
          <p className="text-zinc-400 mt-1">Create and manage discount codes</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Discount
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Code</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Description</TableHead>
                <TableHead className="text-zinc-400">Type / Value</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Uses</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Valid</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-800/50 hover:bg-transparent">
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full bg-zinc-800/50" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : discounts.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center text-zinc-500 py-8">
                    No discounts yet
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((d) => (
                  <TableRow key={d.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span className="text-sm text-white font-mono font-medium">{d.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden sm:table-cell max-w-[200px] truncate">
                      {d.description || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {d.discountType === 'percentage' ? (
                          <>
                            <Percent className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-sm text-white">{d.discountValue}%</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-sm text-white">₹{d.discountValue}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            d.active !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }
                        >
                          {d.active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        {d.showInBanner && (
                          <span className="flex items-center gap-1 text-[10px] bg-[#6366f1]/15 text-[#6366f1] px-1.5 py-0.5 rounded-full border border-[#6366f1]/25">
                            <Megaphone className="h-2.5 w-2.5" />
                            Banner
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {d.maxUses > 0 ? (
                        <span className={d.usedCount >= d.maxUses ? 'text-red-400 font-medium' : d.usedCount >= d.maxUses * 0.8 ? 'text-amber-400' : 'text-zinc-400'}>
                          {d.usedCount}/{d.maxUses}
                          {d.usedCount >= d.maxUses && <span className="ml-1.5 text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">EXHAUSTED</span>}
                        </span>
                      ) : (
                        <span className="text-zinc-400">
                          {d.usedCount} / ∞
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden lg:table-cell">
                      <span>
                        {formatDateShort(d.startDate)} — {d.endDate ? formatDateShort(d.endDate) : 'No end'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          onClick={() => openEdit(d)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={() => setDeleteTarget(d)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editId ? 'Edit Discount' : 'Add Discount'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Discount Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="bg-zinc-800/50 border-zinc-700 font-mono"
                placeholder="e.g. SUMMER20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
                placeholder="Brief description of this discount..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm({ ...form, discountType: v as 'percentage' | 'fixed' })
                  }
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <span className="flex items-center gap-2">
                        <Percent className="h-3.5 w-3.5" /> Percentage
                      </span>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <span className="flex items-center gap-2">
                        <IndianRupee className="h-3.5 w-3.5" /> Fixed Amount
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Discount Value *
                </Label>
                <div className="relative">
                  {form.discountType === 'percentage' ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  ) : (
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  )}
                  <Input
                    type="number"
                    min="0"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-9"
                    placeholder={form.discountType === 'percentage' ? '20' : '500'}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Min Order Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-9"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Max Uses</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700"
                  placeholder="0 for unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Active</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Show in Promo Banner</Label>
                <p className="text-[11px] text-zinc-500 mt-0.5">Display this code in the homepage promo banner</p>
              </div>
              <Switch
                checked={form.showInBanner}
                onCheckedChange={(v) => setForm({ ...form, showInBanner: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-700"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-[#12121a] border-zinc-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Discount</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete the discount code{' '}
              <strong className="text-white font-mono">{deleteTarget?.code}</strong>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}