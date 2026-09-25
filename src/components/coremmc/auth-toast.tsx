'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

export function AuthToast() {
  const authToast = useAppStore((s) => s.authToast);

  return (
    <AnimatePresence>
      {authToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a2e] text-white border border-white/10 rounded-full px-5 py-3 flex items-center gap-3 shadow-lg shadow-black/30 max-w-lg"
        >
          <Info className="size-5 text-[#f59e0b] shrink-0" />
          <span className="text-sm font-medium text-white/90 text-center leading-snug">
            You need to Register/Login your Account to order the products of
            CoreMMC!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}