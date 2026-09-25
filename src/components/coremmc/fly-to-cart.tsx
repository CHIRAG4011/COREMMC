'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/store/use-cart-store';

export function FlyToCart() {
  const flyAnimation = useCartStore((state) => state.flyAnimation);

  if (!flyAnimation) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={flyAnimation.id}
        initial={{
          x: flyAnimation.startX - 20,
          y: flyAnimation.startY - 20,
          scale: 1,
          rotate: 0,
          opacity: 1,
        }}
        animate={{
          x: flyAnimation.endX - 12,
          y: flyAnimation.endY - 12,
          scale: 0.3,
          rotate: 10,
          opacity: 0.8,
        }}
        exit={{
          opacity: 0,
          scale: 0.1,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
        className="fixed z-[9999] pointer-events-none"
        style={{ width: 40, height: 40 }}
      >
        <div
          className="w-full h-full rounded-lg flex items-center justify-center text-white text-base font-bold"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          {flyAnimation.productName.charAt(0).toUpperCase()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}