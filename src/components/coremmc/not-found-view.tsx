'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';

const floatingCubes = [
  { className: 'animate-float', size: 'w-6 h-6', top: '15%', left: '10%', color: 'from-[#6366f1]/20 to-[#a855f7]/20' },
  { className: 'animate-float-delayed', size: 'w-8 h-8', top: '25%', right: '15%', color: 'from-[#22c55e]/20 to-[#10b981]/20' },
  { className: 'animate-float-slow', size: 'w-5 h-5', bottom: '30%', left: '20%', color: 'from-[#f59e0b]/20 to-[#f97316]/20' },
  { className: 'animate-float', size: 'w-7 h-7', bottom: '20%', right: '25%', color: 'from-[#ec4899]/20 to-[#f43f5e]/20' },
  { className: 'animate-float-delayed', size: 'w-4 h-4', top: '40%', left: '8%', color: 'from-[#6366f1]/15 to-[#3b82f6]/15' },
  { className: 'animate-float-slow', size: 'w-9 h-9', top: '60%', right: '10%', color: 'from-[#a855f7]/15 to-[#6366f1]/15' },
];

export function NotFoundView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Floating Minecraft-style cubes */}
      {floatingCubes.map((cube, i) => (
        <div
          key={i}
          className={`absolute ${cube.className} ${cube.size} rounded-sm bg-gradient-to-br ${cube.color} border border-white/5`}
          style={{
            top: cube.top,
            left: cube.left,
            right: cube.right,
            bottom: cube.bottom,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        {/* 404 Text */}
        <motion.h1
          className="text-8xl md:text-9xl font-extrabold gradient-text leading-none select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 space-y-3"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-8"
        >
          <Button
            onClick={() => navigate('home')}
            className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl h-11 px-8 font-medium gap-2 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
