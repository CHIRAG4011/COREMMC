'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
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

const ICON_OPTIONS = [
  'Globe', 'Cpu', 'CircuitBoard', 'Shield', 'ShieldCheck', 'Gamepad2',
  'Server', 'HardDrive', 'Globe2', 'Bot', 'MessageCircle', 'Wrench',
];

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  icon: 'Globe',
  color: '#8b5cf6',
  order: 0,
  featured: false,
  active: true,
  imageUrl: '',
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  icon?: string;
  color?: string;
  order?: number;
  featured?: boolean;
  active?: boolean;
  imageUrl?: string;
};

export default function AdminCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteProductCount, setDeleteProductCount] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      const list: Category[] = (data.categories || []).map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || undefined,
        shortDescription: c.shortDescription || undefined,
        icon: c.icon || undefined,
        color: c.color || undefined,
        order: Number(c.order) || 0,
        featured: c.featured === true,
        active: c.active !== false,
        imageUrl: c.imageUrl || undefined,
      }));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(list);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      shortDescription: cat.shortDescription || '',
      icon: cat.icon || 'Globe',
      color: cat.color || '#8b5cf6',
      order: cat.order || 0,
      featured: cat.featured || false,
      active: cat.active !== false,
      imageUrl: cat.imageUrl || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const slug = form.slug || generateSlug(form.name);
    setSaving(true);
    try {
      // Get auth token — non-blocking, proceed without it if it fails
      let idToken: string | null = null;
      try {
        if (user) idToken = await user.getIdToken();
      } catch (e) {
        console.warn('[admin-categories] getIdToken failed, proceeding without auth:', e);
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const data = { ...form, slug };
      if (editId) {
        const res = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ id: editId, ...data }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Category updated');
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Category created');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      console.error('[admin-categories] save failed:', err);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCheck = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      const prods = data.products || [];
      setDeleteProductCount(prods.filter((p: Record<string, unknown>) => p.category === deleteTarget.id).length);
    } catch {
      setDeleteProductCount(0);
    }
  };

  useEffect(() => {
    if (deleteTarget) handleDeleteCheck();
  }, [deleteTarget]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch(`/api/admin/categories?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error();
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Categories</h1>
          <p className="text-zinc-400 mt-1">Manage service categories</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Icon</TableHead>
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Color</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Order</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
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
              ) : categories.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center text-zinc-500 py-8">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell>
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${cat.color || '#8b5cf6'}20`, color: cat.color || '#8b5cf6' }}
                      >
                        {(cat.icon || '?')[0]}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-white font-medium">{cat.name}</TableCell>
                    <TableCell className="text-sm text-zinc-400">{cat.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: cat.color || '#8b5cf6' }} />
                        <span className="text-xs text-zinc-400">{cat.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 hidden sm:table-cell">{cat.order ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cat.active !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {cat.active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(cat)}>
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
            <DialogTitle className="text-white">{editId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="auto-generated-from-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
                placeholder="Full description"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Short Description</Label>
              <Input
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-9 w-12 p-1 bg-zinc-800/50 border-zinc-700 cursor-pointer"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 bg-zinc-800/50 border-zinc-700"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Featured</Label>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://example.com/category-image.jpg"
              />
              <p className="text-xs text-zinc-500">Banner image shown on the category page</p>
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
            <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 space-y-2">
              <p>Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>?</p>
              {deleteProductCount > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 text-sm">This category has {deleteProductCount} product(s). Deleting it may break references.</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}