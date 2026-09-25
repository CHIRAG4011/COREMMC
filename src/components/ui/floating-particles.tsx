'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacitySpeed: number;
}

const PARTICLE_COUNT = 20;

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const createParticle = useCallback((width: number, height: number): Particle => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    opacitySpeed: (Math.random() - 0.5) * 0.004,
  }), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches) cancelAnimationFrame(rafRef.current);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(width, height));
      }
    };

    const animate = () => {
      if (prefersReducedMotion.current) return;
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Twinkle
        p.opacity += p.opacitySpeed;
        if (p.opacity >= 0.5 || p.opacity <= 0.05) p.opacitySpeed *= -1;
        p.opacity = Math.max(0.05, Math.min(0.5, p.opacity));

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw single dot (no glow pass)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      }

      // Lightweight connection lines — only check every other pair
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          // Skip sqrt — compare squared distance
          const distSq = dx * dx + dy * dy;
          const threshold = 6400; // 80px squared
          if (distSq < threshold) {
            const lineOpacity = (1 - distSq / threshold) * 0.06;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineOpacity})`;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(() => {
      resize();
      initParticles();
    });

    observer.observe(canvas.parentElement!);
    resize();
    initParticles();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ touchAction: 'none' }}
    />
  );
}