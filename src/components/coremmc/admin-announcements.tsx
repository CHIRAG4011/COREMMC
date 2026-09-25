'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

const TYPES = [
  { value: 'sale', label: 'Sale', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🟢' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🟡' },
  { value: 'update', label: 'Update', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴' },
  { value: 'holiday', label: 'Holiday', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🟣' },
  { value: 'new-product', label: 'New Product', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: '🩵' },
] as const;

const typeColorMap: Record<string, string> = {};
TYPES.forEach((t) => { typeColorMap[t.value] = t.color; });

const emptyForm = {
  title: '',
  content: '',
  type: 'update',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  imageUrl: '',
  dismissible: true,
  active: true,
  createdAt: new Date().toISOString(),
};

interface Announcement {
  id: string;
  title: string;
  content?: string;
  type: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  dismissible?: boolean;
  active?: boolean;
  createdAt?: string;
}

function formatTimestamp(val?: string | null): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      const list: Announcement[] = (data.announcements || []).map((a: Record<string, unknown>) => ({
        id: a.id,
        title: a.title || '',
        content: a.content || undefined,
        type: a.type || 'update',
        imageUrl: a.imageUrl || undefined,
        startDate: a.startDate || undefined,
        endDate: a.endDate || undefined,
        dismissible: a.dismissible !== false,
        active: a.active !== false,
        createdAt: a.createdAt || undefined,
      }));
      setAnnouncements(list);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditId(ann.id);
    setForm({
      title: ann.title || '',
      content: ann.content || '',
      type: ann.type || 'update',
      startDate: ann.startDate || '',
      endDate: ann.endDate || '',
      imageUrl: ann.imageUrl || '',
      dismissible: ann.dismissible !== false,
      active: ann.active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      if (editId) {
        const res = await fetch('/api/admin/announcements', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ id: editId, ...form }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Announcement updated');
      } else {
        const res = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...form,
            createdAt: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Announcement created');
      }
      setDialogOpen(false);
      fetchAnnouncements();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save announcement';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch(`/api/admin/announcements?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      toast.success('Announcement deleted');
      setDeleteTarget(null);
      fetchAnnouncements();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete announcement';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Announcements</h1>
          <p className="text-zinc-400 mt-1">Manage site announcements</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Announcement
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Start</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">End</TableHead>
                <TableHead className="text-zinc-400 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-800/50 hover:bg-transparent">
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full bg-zinc-800/50" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center text-zinc-500 py-8">No announcements</TableCell>
                </TableRow>
              ) : (
                announcements.map((ann) => (
                  <TableRow key={ann.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell className="text-sm text-white font-medium">{ann.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColorMap[ann.type] || typeColorMap['update']}>
                        {TYPES.find((t) => t.value === ann.type)?.label || ann.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ann.active !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {ann.active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden sm:table-cell">{formatTimestamp(ann.startDate)}</TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden md:table-cell">{formatTimestamp(ann.endDate)}</TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden lg:table-cell">{formatTimestamp(ann.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => openEdit(ann)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(ann)}>
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
            <DialogTitle className="text-white">{editId ? 'Edit Announcement' : 'Add Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-zinc-800/50 border-zinc-700 min-h-[100px]" placeholder="Announcement content..." />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span> {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Banner Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="https://example.com/banner.png" />
              <p className="text-xs text-zinc-500">Direct URL to an image shown on the right side of the announcement popup</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Dismissible</Label>
              <Switch checked={form.dismissible} onCheckedChange={(v) => setForm({ ...form, dismissible: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-zinc-700" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#12121a] border-zinc-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete <strong className="text-white">{deleteTarget?.title}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}