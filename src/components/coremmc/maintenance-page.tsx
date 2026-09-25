'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';

interface MaintenancePageProps {
  message: string;
}

export function MaintenancePage({ message }: MaintenancePageProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 max-w-[100vw] rounded-full bg-[#6366f1]/10 blur-[120px] animate-float-1" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#8b5cf6]/8 blur-[100px] animate-float-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] max-w-[100vw] rounded-full bg-[#6366f1]/5 blur-[150px] animate-pulse-slow" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#6366f1]/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated gear icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Server className="w-20 h-20 text-[#6366f1]" strokeWidth={1.2} />
          </motion.div>
          {/* Pulsing ring behind the icon */}
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border border-[#6366f1]/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 -m-10 rounded-full border border-[#6366f1]/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent"
        >
          Under Maintenance
        </motion.h1>

        {/* Animated pulse dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5 mb-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#6366f1]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Maintenance message */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/70 text-base sm:text-lg leading-relaxed mb-6"
        >
          {message}
        </motion.p>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-white/50 text-sm">
            We&apos;ll be back soon
          </p>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Check back in a while
          </div>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 w-32 h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent"
        />
      </div>
    </div>
  );
}