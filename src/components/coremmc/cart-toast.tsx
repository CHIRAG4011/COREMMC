'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';

export function CartToast() {
  const cartToastName = useCartStore((s) => s.cartToastName);

  return (
    <AnimatePresence>
      {cartToastName && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#0f2a1a]/95 backdrop-blur-md text-white border border-emerald-500/20 rounded-full px-6 py-3 flex items-center gap-3 shadow-lg shadow-emerald-500/10 max-w-md"
        >
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-white/90 text-center leading-snug">
            <span className="text-emerald-400">Added to cart!</span>{' '}
            <span className="text-white/80">{cartToastName}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}