'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, MemoryStick, Cpu, HardDrive, Plug } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  planId?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  specs?: Record<string, string>;
  features?: string[];
  support?: string;
  location?: string;
  setup?: string;
  order?: number;
  popular?: boolean;
  active?: boolean;
  badge?: string;
  billingUrl?: string;
  imageUrl?: string;
}

const DEDICATED_SPEC_KEYS = ['ram', 'cpu', 'storage', 'ports'] as const;

interface SpecRow {
  key: string;
  value: string;
}

interface FormState {
  planId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  ram: string;
  cpu: string;
  storage: string;
  ports: string;
  additionalSpecs: SpecRow[];
  features: string[];
  support: string;
  location: string;
  setup: string;
  order: number;
  popular: boolean;
  active: boolean;
  badge: string;
  billingUrl: string;
  imageUrl: string;
}

const emptyForm: FormState = {
  planId: '',
  name: '',
  category: '',
  price: 0,
  originalPrice: 0,
  ram: '',
  cpu: '',
  storage: '',
  ports: '',
  additionalSpecs: [{ key: '', value: '' }],
  features: [],
  support: '',
  location: '',
  setup: '',
  order: 0,
  popular: false,
  active: true,
  badge: '',
  billingUrl: '',
  imageUrl: '',
};

/** Extract dedicated spec fields from a specs Record, return the rest as SpecRow[] */
function parseSpecsToForm(specs: Record<string, string> | undefined): {
  ram: string;
  cpu: string;
  storage: string;
  ports: string;
  additionalSpecs: SpecRow[];
} {
  if (!specs || typeof specs !== 'object') {
    return { ram: '', cpu: '', storage: '', ports: '', additionalSpecs: [{ key: '', value: '' }] };
  }
  const ram = specs.ram || '';
  const cpu = specs.cpu || '';
  const storage = specs.storage || '';
  const ports = specs.ports || '';

  const additional: SpecRow[] = [];
  for (const [k, v] of Object.entries(specs)) {
    if (!DEDICATED_SPEC_KEYS.includes(k as (typeof DEDICATED_SPEC_KEYS)[number])) {
      additional.push({ key: k, value: v });
    }
  }
  if (additional.length === 0) additional.push({ key: '', value: '' });

  return { ram, cpu, storage, ports, additionalSpecs: additional };
}

/** Merge dedicated fields + additional specs into a single Record<string, string> */
function buildSpecsRecord(form: FormState): Record<string, string> {
  const record: Record<string, string> = {};
  if (form.ram.trim()) record.ram = form.ram.trim();
  if (form.cpu.trim()) record.cpu = form.cpu.trim();
  if (form.storage.trim()) record.storage = form.storage.trim();
  if (form.ports.trim()) record.ports = form.ports.trim();
  for (const row of form.additionalSpecs) {
    if (row.key.trim()) {
      record[row.key.trim()] = row.value.trim();
    }
  }
  return record;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [featureInput, setFeatureInput] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      /* silent */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      const list: Product[] = (data.products || []).map((p: Record<string, unknown>) => {
        let specs: Record<string, string> | undefined;
        if (typeof p.specs === 'string') {
          try { specs = JSON.parse(p.specs); } catch { specs = undefined; }
        } else if (typeof p.specs === 'object' && p.specs !== null) {
          specs = p.specs as Record<string, string>;
        }

        let features: string[] = [];
        if (typeof p.features === 'string') {
          try { features = JSON.parse(p.features); } catch { features = []; }
        } else if (Array.isArray(p.features)) {
          features = p.features;
        }

        return {
          id: p.id,
          planId: p.planId || undefined,
          name: p.name || '',
          category: p.category || '',
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          specs,
          features,
          support: p.support || undefined,
          location: p.location || undefined,
          setup: p.setup || undefined,
          order: Number(p.order) || 0,
          popular: p.popular === true,
          active: p.active !== false,
          badge: p.badge || undefined,
          billingUrl: p.billingUrl || undefined,
          imageUrl: p.imageUrl || undefined,
        } as Product;
      });
      setProducts(list);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const filtered = useMemo(() => {
    if (catFilter === 'all') return products;
    return products.filter((p) => p.category === catFilter);
  }, [products, catFilter]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id;

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFeatureInput('');
    setDialogOpen(true);
  };

  const openEdit = (prod: Product) => {
    setEditId(prod.id);
    const parsed = parseSpecsToForm(prod.specs);
    setForm({
      planId: prod.planId || '',
      name: prod.name || '',
      category: prod.category || '',
      price: prod.price || 0,
      originalPrice: prod.originalPrice || 0,
      ram: parsed.ram,
      cpu: parsed.cpu,
      storage: parsed.storage,
      ports: parsed.ports,
      additionalSpecs: parsed.additionalSpecs,
      features: prod.features || [],
      support: prod.support || '',
      location: prod.location || '',
      setup: prod.setup || '',
      order: prod.order || 0,
      popular: prod.popular || false,
      active: prod.active !== false,
      badge: prod.badge || '',
      billingUrl: prod.billingUrl || '',
      imageUrl: prod.imageUrl || '',
    });
    setFeatureInput('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }
    setSaving(true);
    try {
      // Get auth token — non-blocking, proceed without it if it fails
      let idToken: string | null = null;
      try {
        if (user) idToken = await user.getIdToken();
      } catch (e) {
        console.warn('[admin-products] getIdToken failed, proceeding without auth:', e);
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const specs = buildSpecsRecord(form);
      const data = {
        planId: form.planId || undefined,
        name: form.name.trim(),
        category: form.category,
        price: form.price,
        originalPrice: form.originalPrice || undefined,
        specs,
        features: form.features,
        support: form.support || undefined,
        location: form.location || undefined,
        setup: form.setup || undefined,
        order: form.order || 0,
        popular: form.popular || false,
        active: form.active,
        badge: form.badge || undefined,
        billingUrl: form.billingUrl || undefined,
        imageUrl: form.imageUrl || undefined,
      };
      if (editId) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ id: editId, ...data }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Product updated');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error ${res.status}`);
        }
        toast.success('Product created');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      console.error('[admin-products] save failed:', err);
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

      const res = await fetch(`/api/admin/products?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error();
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const toggleField = async (product: Product, field: 'popular' | 'active') => {
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: product.id, [field]: !product[field] }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${field} updated`);
      fetchProducts();
    } catch {
      toast.error(`Failed to update ${field}`);
    }
  };

  const addSpec = () => setForm({ ...form, additionalSpecs: [...form.additionalSpecs, { key: '', value: '' }] });
  const removeSpec = (i: number) => {
    const next = form.additionalSpecs.filter((_, idx) => idx !== i);
    if (next.length === 0) next.push({ key: '', value: '' });
    setForm({ ...form, additionalSpecs: next });
  };
  const updateSpec = (i: number, key: 'key' | 'value', val: string) => {
    const specs = [...form.additionalSpecs];
    specs[i] = { ...specs[i], [key]: val };
    setForm({ ...form, additionalSpecs: specs });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm({ ...form, features: [...form.features, featureInput.trim()] });
    setFeatureInput('');
  };
  const removeFeature = (i: number) => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Products</h1>
          <p className="text-zinc-400 mt-1">Manage hosting plans ({filtered.length})</p>
        </div>
        <div className="flex gap-3">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[160px] bg-[#12121a] border-zinc-800/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Category</TableHead>
                <TableHead className="text-zinc-400">Price</TableHead>
                <TableHead className="text-zinc-400 hidden sm:table-cell">Original</TableHead>
                <TableHead className="text-zinc-400">Popular</TableHead>
                <TableHead className="text-zinc-400">Active</TableHead>
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
              ) : filtered.length === 0 ? (
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center text-zinc-500 py-8">No products found</TableCell>
                </TableRow>
              ) : (
                filtered.map((prod) => (
                  <TableRow key={prod.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell className="text-sm text-white font-medium">{prod.name}</TableCell>
                    <TableCell className="text-sm text-zinc-400 hidden md:table-cell">{catName(prod.category)}</TableCell>
                    <TableCell className="text-sm text-white">₹{prod.price}</TableCell>
                    <TableCell className="text-sm text-zinc-500 hidden sm:table-cell">{prod.originalPrice ? `₹${prod.originalPrice}` : '—'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${prod.popular ? 'text-amber-400' : 'text-zinc-600'}`}
                        onClick={() => toggleField(prod, 'popular')}
                      >
                        {prod.popular ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={prod.active !== false}
                        onCheckedChange={() => toggleField(prod, 'active')}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => openEdit(prod)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(prod)}>
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
        <DialogContent className="bg-[#12121a] border-zinc-800/50 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Plan ID & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Plan ID</Label>
                <Input value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="plan_abc123" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="Product name" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Price (₹)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Original Price (₹)</Label>
                <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
            </div>

            {/* ── Dedicated Specification Fields ── */}
            <div className="space-y-3">
              <Label className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">Core Specifications</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* RAM */}
                <div className="relative">
                  <MemoryStick className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-10"
                    placeholder="e.g. 4GB DDR4"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600 font-medium pointer-events-none select-none">RAM</span>
                </div>
                {/* CPU */}
                <div className="relative">
                  <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    value={form.cpu}
                    onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-10"
                    placeholder="e.g. 100% (2 vCPU Cores)"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600 font-medium pointer-events-none select-none">CPU</span>
                </div>
                {/* Storage */}
                <div className="relative">
                  <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-10"
                    placeholder="e.g. 40GB NVMe SSD"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600 font-medium pointer-events-none select-none">Storage</span>
                </div>
                {/* Ports */}
                <div className="relative">
                  <Plug className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    value={form.ports}
                    onChange={(e) => setForm({ ...form, ports: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 pl-10"
                    placeholder="e.g. 10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600 font-medium pointer-events-none select-none">Ports</span>
                </div>
              </div>
            </div>

            {/* ── Additional Specifications (key-value) ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">Additional Specifications</Label>
                <Button variant="outline" size="sm" className="border-zinc-700" onClick={addSpec}>
                  <Plus className="h-3 w-3 mr-1" /> Add Row
                </Button>
              </div>
              <div className="space-y-2">
                {form.additionalSpecs.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="Key (e.g. Network)" />
                    <Input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className="flex-1 bg-zinc-800/50 border-zinc-700" placeholder="Value (e.g. 1Gbps)" />
                    <Button variant="ghost" size="icon" className="shrink-0 text-red-400 hover:text-red-300" onClick={() => removeSpec(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="bg-zinc-800/50 border-zinc-700" placeholder="Type feature and press Enter" />
                <Button variant="outline" className="border-zinc-700" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.features.map((f, i) => (
                  <Badge key={i} variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300 gap-1">
                    {f}
                    <button onClick={() => removeFeature(i)} className="text-zinc-500 hover:text-red-400" aria-label="Remove feature"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Support / Location / Setup */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Support</Label>
                <Input value={form.support} onChange={(e) => setForm({ ...form, support: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="24/7" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="India" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Setup</Label>
                <Input value={form.setup} onChange={(e) => setForm({ ...form, setup: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="Instant" />
              </div>
            </div>

            {/* Order & Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Badge Text</Label>
                <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="e.g. Best Value" />
              </div>
            </div>

            {/* Billing URL */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Billing URL</Label>
              <Input value={form.billingUrl} onChange={(e) => setForm({ ...form, billingUrl: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="https://billing.example.com/..." />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="bg-zinc-800/50 border-zinc-700" placeholder="https://example.com/image.jpg" />
            </div>

            {/* Popular & Active toggles */}
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Popular</Label>
              <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
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
            <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
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