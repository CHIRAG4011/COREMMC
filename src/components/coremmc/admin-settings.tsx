'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Save, CreditCard, Info, QrCode, Wallet, ShieldAlert, Timer, Database, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const emptySettings = {
  siteName: 'CoreMMC',
  siteDescription: 'Premium Gaming Hosting Platform',
  contactEmail: '',
  discordUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  telegramUrl: '',
  websiteUrl: '',
  footerText: '© 2025 CoreMMC. All rights reserved.',
  paymentUrl: 'https://billing.coremmc.cloud',
  paymentEnabled: true,
  qrPaymentUrl: '',
  upiId: '',
  maintenanceMode: false,
  maintenanceMessage: '',
  promoEnabled: false,
  promoText: '',
  promoSubtext: '',
  promoDiscount: '30',
  promoEndDate: '',
  promoPadding: 'py-6 md:py-8',
};

interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  discordUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  footerText?: string;
  paymentUrl?: string;
  paymentEnabled?: boolean;
  qrPaymentUrl?: string;
  upiId?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  promoEnabled?: boolean;
  promoText?: string;
  promoSubtext?: string;
  promoDiscount?: string;
  promoEndDate?: string;
  promoPadding?: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...emptySettings, ...data });
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const idToken = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      toast.success('Settings saved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const [seeding, setSeeding] = useState(false);

  const update = (key: keyof SiteSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSeedCatalog = async () => {
    if (!user) {
      toast.error('Please re-login and try again');
      return;
    }
    const confirmed = window.confirm(
      'This will seed (or re-seed) 13 categories and 111 products into the database.\n\n' +
      'Existing categories/products with matching IDs will be updated (merged).\n' +
      'New ones will be created.\n\n' +
      'Continue?'
    );
    if (!confirmed) return;

    setSeeding(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/seed-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Seed failed');
        return;
      }
      toast.success(data.message || `Seeded ${data.categoriesSeeded} categories and ${data.productsSeeded} products`);
    } catch {
      toast.error('Seed failed — network error');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-zinc-800/50" />
        <Skeleton className="h-64 w-full bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your website</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Seed Catalog Data */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Catalog Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-xl p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                If your homepage categories and plans are empty, click the button below to populate the database with
                13 categories and 111 products. This is safe to run multiple times (merge mode).
              </p>
            </div>
            <Button
              onClick={handleSeedCatalog}
              disabled={seeding}
              variant="outline"
              className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 gap-2"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {seeding ? 'Seeding...' : 'Seed Catalog Data (13 Categories, 111 Products)'}
            </Button>
          </CardContent>
        </Card>

        {/* General */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Site Name</Label>
              <Input
                value={settings.siteName || ''}
                onChange={(e) => update('siteName', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Site Description</Label>
              <Textarea
                value={settings.siteDescription || ''}
                onChange={(e) => update('siteDescription', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Contact Email</Label>
              <Input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => update('contactEmail', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="contact@coremmc.cloud"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Discord URL</Label>
              <Input
                value={settings.discordUrl || ''}
                onChange={(e) => update('discordUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://discord.gg/..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Instagram URL</Label>
              <Input
                value={settings.instagramUrl || ''}
                onChange={(e) => update('instagramUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">YouTube URL</Label>
              <Input
                value={settings.youtubeUrl || ''}
                onChange={(e) => update('youtubeUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Telegram URL</Label>
              <Input
                value={settings.telegramUrl || ''}
                onChange={(e) => update('telegramUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://t.me/..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Website URL</Label>
              <Input
                value={settings.websiteUrl || ''}
                onChange={(e) => update('websiteUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white">Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Footer Text</Label>
              <Input
                value={settings.footerText || ''}
                onChange={(e) => update('footerText', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Enable Maintenance Mode</Label>
                <p className="text-xs text-zinc-500 mt-1">
                  Block all non-admin users from accessing the site
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode === true}
                onCheckedChange={(v) => update('maintenanceMode', v)}
              />
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2">
              <Label className="text-zinc-300">Maintenance Message</Label>
              <Textarea
                value={settings.maintenanceMessage || ''}
                onChange={(e) => update('maintenanceMessage', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
                placeholder="We are currently performing maintenance. Please check back later."
              />
              <p className="text-xs text-zinc-500">
                Message displayed to users while maintenance mode is active
              </p>
            </div>
            {settings.maintenanceMode && (
              <div className="flex items-start gap-3 bg-red-500/[0.08] border border-red-500/[0.15] rounded-xl p-3.5">
                <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300/80 leading-relaxed">
                  Maintenance mode is <strong>active</strong>. All non-admin visitors will see a maintenance page.
                  Admin users can still access the site normally.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promo Banner */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Promo Banner (Product Pages)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Show Promo Banner</Label>
                <p className="text-xs text-zinc-500 mt-1">Display the limited time offer banner on all product pages</p>
              </div>
              <Switch
                checked={settings.promoEnabled === true}
                onCheckedChange={(v) => update('promoEnabled', v)}
              />
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2">
              <Label className="text-zinc-300">Promo Text</Label>
              <Input
                value={settings.promoText || ''}
                onChange={(e) => update('promoText', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="⚡ Limited Time Offer — Save up to {discount}% OFF"
              />
              <p className="text-xs text-zinc-500">Use {'{discount}'} as placeholder for the discount percentage</p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Banner Padding (Tailwind classes)</Label>
              <Input
                value={settings.promoPadding || ''}
                onChange={(e) => update('promoPadding', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 font-mono"
                placeholder="py-6 md:py-8"
              />
              <p className="text-xs text-zinc-500">Tailwind CSS padding classes for the banner container</p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Subtext</Label>
              <Input
                value={settings.promoSubtext || ''}
                onChange={(e) => update('promoSubtext', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="Don't miss out on our biggest sale of the year"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Discount %</Label>
                <Input
                  value={settings.promoDiscount || ''}
                  onChange={(e) => update('promoDiscount', e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">End Date</Label>
                <Input
                  type="datetime-local"
                  value={settings.promoEndDate ? settings.promoEndDate.slice(0, 16) : ''}
                  onChange={(e) => update('promoEndDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>
            {settings.promoEnabled && (
              <div className="flex items-start gap-3 bg-emerald-500/[0.06] border border-emerald-500/[0.12] rounded-xl p-3.5">
                <Timer className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-300/80 leading-relaxed">
                  Promo banner is <strong>active</strong> on all product pages. The countdown timer will use your end date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Enable Payments</Label>
                <p className="text-xs text-zinc-500 mt-1">Allow users to proceed to payment from cart</p>
              </div>
              <Switch
                checked={settings.paymentEnabled !== false}
                onCheckedChange={(v) => update('paymentEnabled', v)}
              />
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2">
              <Label className="text-zinc-300">Payment URL</Label>
              <Input
                value={settings.paymentUrl || ''}
                onChange={(e) => update('paymentUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://billing.coremmc.cloud"
              />
              <div className="flex items-start gap-2 text-xs text-zinc-500">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p>
                  Available placeholders:{' '}
                  <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">{'{orderId}'}</code>,{' '}
                  <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">{'{amount}'}</code>,{' '}
                  <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">{'{userId}'}</code>,{' '}
                  <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">{'{email}'}</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Payment */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-xl p-3.5">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Users will see this QR code and your UPI ID on the payment page after placing an order.
                Paste the direct image URL of your UPI QR code below.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">QR Code Image URL</Label>
              <Input
                value={settings.qrPaymentUrl || ''}
                onChange={(e) => update('qrPaymentUrl', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="https://example.com/qr-code.png"
              />
              <p className="text-xs text-zinc-500">Direct URL to your UPI QR code image (PNG, JPG, or SVG)</p>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-white/40" />
                UPI ID
              </Label>
              <Input
                value={settings.upiId || ''}
                onChange={(e) => update('upiId', e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="yourname@upi"
              />
              <p className="text-xs text-zinc-500">Your UPI ID displayed to users for manual verification</p>
            </div>
            {settings.qrPaymentUrl && (
              <div className="pt-1">
                <p className="text-xs text-zinc-500 mb-2">QR Code Preview</p>
                <div className="bg-white rounded-lg p-2.5 inline-block">
                  <img
                    src={settings.qrPaymentUrl}
                    alt="QR Preview"
                    className="w-[140px] h-[140px] object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        </div>
    </div>
  );
}