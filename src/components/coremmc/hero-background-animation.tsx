'use client';

import { useRef, useEffect } from 'react';

const FRAME_COUNT = 10;
const FPS = 30;
const FRAME_INTERVAL_MS = 1000 / FPS;
const BLUR_SCALE = 1.05; // Upscale 105% to hide blur edges

function getFramePath(index: number): string {
  const padded = String(index).padStart(6, '0');
  return `/header/frames/frame_${padded}.png`;
}

export function HeroBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const rafIdRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });
  const dprRef = useRef(1);
  const loadedCountRef = useRef(0);
  const readyRef = useRef(false);

  // Animation loop stored as ref to avoid hoisting / dependency issues
  const animateRef = useRef<(timestamp: number) => void>(null);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    const dpr = dprRef.current;
    const cw = width * dpr;
    const ch = height * dpr;
    if (cw === 0 || ch === 0) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // object-fit: cover with 105% scale
    const containerAspect = cw / ch;
    const imgAspect = iw / ih;

    let drawW: number;
    let drawH: number;
    if (imgAspect > containerAspect) {
      drawH = ch * BLUR_SCALE;
      drawW = drawH * imgAspect;
    } else {
      drawW = cw * BLUR_SCALE;
      drawH = drawW / imgAspect;
    }

    const dx = (cw - drawW) / 2;
    const dy = (ch - drawH) / 2;

    ctx.drawImage(img, dx, dy, drawW, drawH);
  };

  const startAnimation = () => {
    lastFrameTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(animateRef.current!);
  };

  const stopAnimation = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
  };

  // Set up the animation loop function (uses refs, no closures over state)
  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed >= FRAME_INTERVAL_MS) {
        const framesToAdvance = Math.floor(elapsed / FRAME_INTERVAL_MS);
        currentFrameRef.current = (currentFrameRef.current + framesToAdvance) % FRAME_COUNT;
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL_MS);
        drawFrame(currentFrameRef.current);
      }
      if (!prefersReducedMotionRef.current) {
        rafIdRef.current = requestAnimationFrame(animateRef.current!);
      }
    };
  }, []);

  // Preload all frames
  useEffect(() => {
    loadedCountRef.current = 0;
    readyRef.current = false;

    const frames: HTMLImageElement[] = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFramePath(i);
      img.onload = img.onerror = () => {
        loadedCountRef.current++;
        if (loadedCountRef.current >= FRAME_COUNT) {
          readyRef.current = true;
          requestAnimationFrame(() => {
            drawFrame(0);
            if (!prefersReducedMotionRef.current) {
              startAnimation();
            }
          });
        }
      };
      frames[i] = img;
    }

    framesRef.current = frames;

    return () => {
      stopAnimation();
      framesRef.current = [];
      readyRef.current = false;
    };
  }, []);

  // Resize handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { width: rect.width, height: rect.height };

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = dprRef.current;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        if (readyRef.current) {
          drawFrame(currentFrameRef.current);
        }
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mq.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) {
        stopAnimation();
        if (readyRef.current) drawFrame(0);
      } else if (readyRef.current) {
        startAnimation();
      }
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Canvas layer - 105% scaled + blur(4px) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
          transformOrigin: 'center center',
          willChange: 'contents',
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/28" aria-hidden="true" />
    </div>
  );
}