'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Send, Trash2, Bell, Info, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { value: 'error', label: 'Error', icon: XCircle, color: 'bg-red-500/15 text-red-400 border-red-500/25' },
] as const;

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: string;
  active: boolean;
  createdAt: number;
}

function getTypeConfig(type: string) {
  return TYPES.find((t) => t.value === type) || TYPES[0];
}

function formatTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleSend = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type }),
      });
      if (!res.ok) throw new Error();
      toast.success('Notification sent to all users');
      setTitle('');
      setMessage('');
      setType('info');
      fetchNotifications();
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Notification deleted');
      setDeleteTarget(null);
      fetchNotifications();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
        <p className="text-zinc-400 mt-1">Send live notifications to all users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
                placeholder="e.g. Server Maintenance"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 min-h-[100px]"
                placeholder="Describe what's happening..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" /> {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? 'Sending...' : 'Send to All Users'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="bg-[#12121a] border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-zinc-800/50 rounded-lg" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No notifications sent yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const cfg = getTypeConfig(n.type);
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                        <cfg.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[10px] text-zinc-600 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 shrink-0 transition-opacity"
                        onClick={() => setDeleteTarget(n)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#12121a] border-zinc-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Notification</AlertDialogTitle>
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