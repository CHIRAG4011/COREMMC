'use client';

import { useEffect, useState } from 'react';
import { Server, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '@/components/coremmc/auth-provider';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  productName: string;
  planName: string;
  category: string;
  amount: number;
  status: string;
  paymentDate: unknown;
}

// ── Status badge helper ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s === 'active') {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20">
        Active
      </Badge>
    );
  }
  if (s === 'suspended') {
    return (
      <Badge className="bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/20">
        Suspended
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/20">
      Expired
    </Badge>
  );
}

// ── Date formatter ───────────────────────────────────────────────────────
function formatDate(date: unknown): string {
  if (!date) return '—';
  let ts: number;
  if (typeof date === 'number') {
    ts = date;
  } else if (typeof date === 'string') {
    ts = new Date(date).getTime();
  } else if (typeof date === 'object' && date !== null && 'seconds' in date) {
    ts = (date as { seconds: number }).seconds * 1000;
  } else {
    return '—';
  }
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Payment Card (mobile) ────────────────────────────────────────────────
function PaymentCard({ payment, index }: { payment: Payment; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {payment.planName || payment.productName}
          </h3>
          <p className="text-xs text-white/50 mt-0.5">{payment.category}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">
          ₹{payment.amount?.toLocaleString('en-IN') || '0'}
        </span>
        <span className="text-xs text-white/50">{formatDate(payment.paymentDate)}</span>
      </div>
      <Button variant="outline" className="w-full text-sm border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-9">
        Manage
      </Button>
    </motion.div>
  );
}

// ── Dashboard Services ───────────────────────────────────────────────────
export function DashboardServices() {
  const { user, userProfile } = useAuth();
  const navigate = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const hasPayments = userProfile?.payment === true;

  // Fetch payments
  useEffect(() => {
    if (!user || !hasPayments) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchPayments() {
      try {
        const res = await fetch(`/api/payments?userId=${user.uid}`);
        const data = await res.json();
        if (cancelled) return;
        setPayments(data.payments || []);
      } catch {
        // Silently handle
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPayments();
    return () => { cancelled = true; };
  }, [user, hasPayments]);

  // Filter by tab
  const filteredPayments = payments.filter((p) => {
    const s = p.status?.toLowerCase() || '';
    if (tab === 'active') return s === 'active';
    if (tab === 'expired') return s === 'expired' || s === 'suspended';
    return true;
  });

  // Skeleton loading
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">My Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-32 bg-white/5" />
                <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
              </div>
              <Skeleton className="h-7 w-20 bg-white/5" />
              <Skeleton className="h-9 w-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no payments)
  if (!hasPayments) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-white">My Services</h1>
        <div className="glass p-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
            <Package className="h-8 w-8 text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            No Services Yet
          </h2>
          <p className="text-sm text-white/50 max-w-sm mb-6">
            You haven&apos;t purchased any services yet. Browse our collection and get started!
          </p>
          <Button
            onClick={() => navigate('home')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            Browse Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Services</h1>
        <span className="text-sm text-white/50">{payments.length} service{payments.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/[0.06]">
          <TabsTrigger value="all" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">All</TabsTrigger>
          <TabsTrigger value="active" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">Active</TabsTrigger>
          <TabsTrigger value="expired" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filteredPayments.length === 0 ? (
            <div className="glass p-10 flex flex-col items-center justify-center text-center">
              <Server className="h-10 w-10 text-white/15 mb-3" />
              <p className="text-white/50 text-sm">
                No {tab === 'active' ? 'active' : 'expired'} services found
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block glass overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-white/50 font-medium">Service</TableHead>
                      <TableHead className="text-white/50 font-medium">Category</TableHead>
                      <TableHead className="text-white/50 font-medium">Price</TableHead>
                      <TableHead className="text-white/50 font-medium">Status</TableHead>
                      <TableHead className="text-white/50 font-medium">Date</TableHead>
                      <TableHead className="text-white/50 font-medium text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment, i) => (
                      <TableRow
                        key={payment.id}
                        className="border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="font-medium text-white">
                          {payment.planName || payment.productName}
                        </TableCell>
                        <TableCell className="text-white/60 text-sm">{payment.category}</TableCell>
                        <TableCell className="text-white font-semibold">
                          ₹{payment.amount?.toLocaleString('en-IN') || '0'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-white/50 text-sm">
                          {formatDate(payment.paymentDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-8 text-xs"
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden flex flex-col gap-3">
                {filteredPayments.map((payment, i) => (
                  <PaymentCard key={payment.id} payment={payment} index={i} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default DashboardServices;