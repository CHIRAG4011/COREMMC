'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ShoppingBag, Wrench, AlertTriangle, PartyPopper, Sparkles, Info, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  type: string;
  imageUrl?: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; accent: string; bg: string; border: string; label: string }> = {
  sale:        { icon: ShoppingBag,   accent: 'text-green-400',  bg: 'bg-green-500/10',    border: 'border-green-500/20',  label: 'SALE' },
  maintenance: { icon: Wrench,        accent: 'text-amber-400',  bg: 'bg-amber-500/10',    border: 'border-amber-500/20',  label: 'MAINTENANCE' },
  update:      { icon: Info,          accent: 'text-blue-400',   bg: 'bg-blue-500/10',     border: 'border-blue-500/20',   label: 'UPDATE' },
  emergency:   { icon: AlertTriangle,  accent: 'text-red-400',    bg: 'bg-red-500/10',      border: 'border-red-500/20',    label: 'EMERGENCY' },
  holiday:     { icon: PartyPopper,   accent: 'text-purple-400', bg: 'bg-purple-500/10',   border: 'border-purple-500/20', label: 'HOLIDAY' },
  'new-product':{ icon: Sparkles,     accent: 'text-cyan-400',   bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20',   label: 'NEW' },
};

const DEFAULT_CONFIG = TYPE_CONFIG.update;

const PAUSED_KEY = 'coremmc_announcement_paused_until';

function getPausedUntil(id: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PAUSED_KEY);
    if (!raw) return null;
    const map: Record<string, number> = JSON.parse(raw);
    const until = map[id];
    if (until && Date.now() < until) return until;
    delete map[id];
    localStorage.setItem(PAUSED_KEY, JSON.stringify(map));
    return null;
  } catch { return null; }
}

function pauseForToday(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PAUSED_KEY) || '{}';
    const map: Record<string, number> = JSON.parse(raw);
    map[id] = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(PAUSED_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [open, setOpen] = useState(false);
  const [pausedId, setPausedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      const list: AnnouncementData[] = data.announcements || [];
      if (list.length === 0) return;

      const latest = list[0];

      if (getPausedUntil(latest.id)) {
        setPausedId(latest.id);
        return;
      }

      setAnnouncement(latest);
      setOpen(true);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(load);
    return () => cancelAnimationFrame(raf);
  }, [load]);

  const handleClose = () => setOpen(false);

  const handlePauseForToday = () => {
    if (announcement) {
      pauseForToday(announcement.id);
      setPausedId(announcement.id);
    }
    setOpen(false);
  };

  if (!announcement || pausedId === announcement.id) return null;

  const config = TYPE_CONFIG[announcement.type] || DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* RGB glowing border wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="announcement-rgb-border w-full max-w-3xl"
          >
            {/* Inner content with dark bg */}
            <div
              className="announcement-rgb-inner"
              style={{ background: 'linear-gradient(135deg, rgba(18,18,26,0.98) 0%, rgba(14,14,22,0.98) 100%)' }}
            >
              {/* Close button — very top-right corner */}
              <button
                onClick={handleClose}
                className="absolute -top-1 -right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/15 hover:border-white/20 transition-all duration-200 shadow-lg shadow-black/40"
                style={{ background: 'rgba(18,18,26,0.95)' }}
                aria-label="Close announcement"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col sm:flex-row overflow-hidden">
                {/* Left side — text content */}
                <div className="flex-1 min-w-0 p-6 sm:p-8">
                  {/* Type badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.accent}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.bg} ${config.accent} border ${config.border}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                    {announcement.title}
                  </h3>

                  {/* Content */}
                  {announcement.content && (
                    <p className="text-sm text-white/50 leading-relaxed mb-6 whitespace-pre-line">
                      {announcement.content}
                    </p>
                  )}

                  {/* Pause for today checkbox */}
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        onChange={handlePauseForToday}
                      />
                      <div className="h-4.5 w-4.5 rounded border border-white/20 bg-white/5 peer-checked:bg-white/10 peer-checked:border-white/30 transition-colors flex items-center justify-center">
                      </div>
                      <svg
                        className="absolute top-0.5 left-0.5 h-3.5 w-3.5 text-white/0 peer-checked:text-white/70 transition-colors pointer-events-none"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/35 group-hover:text-white/50 transition-colors">
                      Don&apos;t show again today
                    </span>
                  </label>
                </div>

                {/* Right side — 16:9 image, fully visible */}
                {announcement.imageUrl ? (
                  <div className="sm:w-[320px] md:w-[360px] shrink-0 bg-white/[0.02] flex items-center justify-center">
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full aspect-video object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="sm:w-[320px] md:w-[360px] shrink-0 bg-white/[0.02] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-white/10 py-12">
                      <ImageOff className="w-10 h-10" />
                      <span className="text-[10px] uppercase tracking-wider">No Image</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}