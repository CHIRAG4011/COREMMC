'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MaintenanceViewProps {
  message?: string;
}

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 10,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.15 + 0.05,
}));

export default function MaintenanceView({ message = "We'll be back soon!" }: MaintenanceViewProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Floating particles background */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Subtle radial glow behind the icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] max-w-[100vw] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <motion.img
          src="/coremmc-icon.png"
          alt="CoreMMC"
          className="w-16 h-16 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Animated Gear Icon */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#gearGradient)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            {/* Gear/cog shape */}
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>

          {/* Smaller counter-rotating gear */}
          <motion.div
            className="absolute -bottom-3 -right-3"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#gearGradient2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="gearGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Heading with gradient */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Under Maintenance
        </motion.h1>

        {/* Maintenance message */}
        <motion.p
          className="text-base sm:text-lg text-white/50 max-w-md leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {message}
        </motion.p>

        {/* Pulsing indicator */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <span className="relative flex h-3 w-3">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"
              animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
          </span>
          <span className="text-sm text-white/40 tracking-wide">We&apos;re working on it</span>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-6 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <p className="text-xs text-white/20">
          &copy; 2025 CoreMMC. All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
}