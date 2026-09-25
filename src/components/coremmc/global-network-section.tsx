'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, MapPin, Server } from 'lucide-react';

const FLAG_BASE = 'https://flagcdn.com/w40';

const locations = [
  { city: 'Mumbai', country: 'India', code: 'in', lat: 19.076, lng: 72.877, latency: '< 10ms', uptime: '99.99%', barWidth: '98%' },
  { city: 'Noida', country: 'India', code: 'in', lat: 28.6139, lng: 77.209, latency: '< 8ms', uptime: '99.99%', barWidth: '99%' },
  { city: 'Delhi', country: 'India', code: 'in', lat: 28.7041, lng: 77.1025, latency: '< 8ms', uptime: '99.99%', barWidth: '99%' },
  { city: 'Hyderabad', country: 'India', code: 'in', lat: 17.385, lng: 78.4867, latency: '< 12ms', uptime: '99.98%', barWidth: '96%' },
  { city: 'Frankfurt', country: 'Germany', code: 'de', lat: 50.1109, lng: 8.6821, latency: '< 150ms', uptime: '99.95%', barWidth: '90%' },
  { city: 'Dubai', country: 'UAE', code: 'ae', lat: 25.2048, lng: 55.2708, latency: '< 120ms', uptime: '99.97%', barWidth: '94%' },
  { city: 'Singapore', country: 'Singapore', code: 'sg', lat: 1.3521, lng: 103.8198, latency: '< 55ms', uptime: '99.97%', barWidth: '93%' },
  { city: 'Tokyo', country: 'Japan', code: 'jp', lat: 35.6762, lng: 139.6503, latency: '< 80ms', uptime: '99.96%', barWidth: '91%' },
  { city: 'Virginia', country: 'United States', code: 'us', lat: 37.4131, lng: -79.4227, latency: '< 200ms', uptime: '99.99%', barWidth: '97%' },
];

// ── Land mass generation (more regions, more dots for realistic look) ─────
function generateLandDots(): { lat: number; lng: number; size: number }[] {
  const dots: { lat: number; lng: number; size: number }[] = [];
  const landRegions = [
    // India / South Asia
    { latCenter: 22, lngCenter: 80, spreadLat: 18, spreadLng: 22, count: 40 },
    { latCenter: 10, lngCenter: 78, spreadLat: 8, spreadLng: 10, count: 15 },
    // Southeast Asia
    { latCenter: 10, lngCenter: 105, spreadLat: 15, spreadLng: 18, count: 25 },
    // East Asia
    { latCenter: 35, lngCenter: 110, spreadLat: 18, spreadLng: 22, count: 30 },
    { latCenter: 40, lngCenter: 130, spreadLat: 8, spreadLng: 10, count: 12 },
    // Europe
    { latCenter: 50, lngCenter: 10, spreadLat: 12, spreadLng: 25, count: 35 },
    { latCenter: 42, lngCenter: 25, spreadLat: 8, spreadLng: 12, count: 12 },
    // North America
    { latCenter: 40, lngCenter: -100, spreadLat: 20, spreadLng: 28, count: 40 },
    { latCenter: 55, lngCenter: -105, spreadLat: 10, spreadLng: 20, count: 15 },
    // South America
    { latCenter: -15, lngCenter: -55, spreadLat: 18, spreadLng: 15, count: 25 },
    { latCenter: -35, lngCenter: -65, spreadLat: 10, spreadLng: 8, count: 10 },
    // Africa
    { latCenter: 5, lngCenter: 20, spreadLat: 22, spreadLng: 22, count: 30 },
    { latCenter: -20, lngCenter: 30, spreadLat: 10, spreadLng: 12, count: 10 },
    // Australia
    { latCenter: -25, lngCenter: 135, spreadLat: 12, spreadLng: 18, count: 20 },
    // Middle East
    { latCenter: 28, lngCenter: 45, spreadLat: 10, spreadLng: 15, count: 12 },
    // Central America
    { latCenter: 15, lngCenter: -90, spreadLat: 8, spreadLng: 10, count: 8 },
  ];
  for (const region of landRegions) {
    for (let i = 0; i < region.count; i++) {
      const lat = region.latCenter + (Math.random() - 0.5) * (region.spreadLat || region.spread);
      const lng = region.lngCenter + (Math.random() - 0.5) * (region.spreadLng || region.spread);
      // Skip oceans rough check
      if (lat > -5 && lat < 5 && (lng < -45 || lng > -30)) continue;
      dots.push({
        lat,
        lng,
        size: 0.5 + Math.random() * 1.2,
      });
    }
  }
  return dots;
}

// ── Background stars ──────────────────────────────────────────────────────
function generateStars(count: number): { x: number; y: number; size: number; alpha: number }[] {
  const stars: { x: number; y: number; size: number; alpha: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.3 + Math.random() * 0.8,
      alpha: 0.1 + Math.random() * 0.3,
    });
  }
  return stars;
}

const landDots = generateLandDots();
const stars = generateStars(60);

const locationDots = locations.map((l, i) => ({
  lat: l.lat,
  lng: l.lng,
  phase: i * Math.PI,
}));

function RotatingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const animIdRef = useRef(0);
  const angleRef = useRef(0);
  const tiltRef = useRef(0); // vertical tilt from mouse

  // Drag interaction state
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const velocityX = useRef(0); // horizontal rotation velocity (inertia)
  const velocityY = useRef(0); // vertical tilt velocity
  const autoRotateSpeed = useRef(0.003); // degrees per frame
  const autoRotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorStyle = useRef('grab');

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
    velocityX.current = 0;
    velocityY.current = 0;
    cursorStyle.current = 'grabbing';
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    // Pause auto-rotation
    autoRotateSpeed.current = 0;
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouseX.current;
    const dy = e.clientY - lastMouseY.current;
    velocityX.current = dx * 0.35;
    velocityY.current = dy * 0.15;
    angleRef.current += dx * 0.35;
    tiltRef.current = Math.max(-0.5, Math.min(0.5, tiltRef.current + dy * 0.002));
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    cursorStyle.current = 'grab';
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    // Resume auto-rotation after 3s of inactivity
    autoRotateTimer.current = setTimeout(() => {
      autoRotateSpeed.current = 0.003;
    }, 3000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const size = rect.width;

      const cw = Math.round(size * dpr);
      const ch = Math.round(size * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.38;
      const angleDeg = (angleRef.current * 180) / Math.PI;
      const tiltRad = tiltRef.current;

      // ── Background stars ──────────────────────────────────────
      for (const star of stars) {
        const twinkle = star.alpha + Math.sin(Date.now() * 0.001 + star.x * 50) * 0.1;
        ctx.beginPath();
        ctx.arc(star.x * size, star.y * size, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${Math.max(0.05, twinkle)})`;
        ctx.fill();
      }

      // ── Outer atmosphere glow (layered) ───────────────────────
      const atmosGlow2 = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.8);
      atmosGlow2.addColorStop(0, 'rgba(59,130,246,0.06)');
      atmosGlow2.addColorStop(0.5, 'rgba(99,102,241,0.03)');
      atmosGlow2.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGlow2;
      ctx.fillRect(0, 0, size, size);

      const atmosGlow = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.35);
      atmosGlow.addColorStop(0, 'rgba(59,130,246,0.12)');
      atmosGlow.addColorStop(0.6, 'rgba(59,130,246,0.04)');
      atmosGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGlow;
      ctx.fillRect(0, 0, size, size);

      // ── Globe sphere fill with tilt offset ────────────────────
      const tiltOffsetY = Math.sin(tiltRad) * radius * 0.08;
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25 + tiltOffsetY, radius * 0.05,
        cx, cy, radius
      );
      sphereGrad.addColorStop(0, 'rgba(59,130,246,0.1)');
      sphereGrad.addColorStop(0.5, 'rgba(30,58,138,0.07)');
      sphereGrad.addColorStop(0.85, 'rgba(15,23,42,0.12)');
      sphereGrad.addColorStop(1, 'rgba(10,20,40,0.18)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // ── Globe outline with gradient stroke ────────────────────
      const outlineGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      outlineGrad.addColorStop(0, 'rgba(96,165,250,0.3)');
      outlineGrad.addColorStop(0.5, 'rgba(59,130,246,0.15)');
      outlineGrad.addColorStop(1, 'rgba(99,102,241,0.25)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = outlineGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59,130,246,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ── Projection with tilt ──────────────────────────────────
      const project = (lat: number, lng: number) => {
        const phi = (lat * Math.PI) / 180;
        const theta = ((lng - angleDeg) * Math.PI) / 180;
        let x = Math.cos(phi) * Math.sin(theta);
        let y = -Math.sin(phi);
        let z = Math.cos(phi) * Math.cos(theta);
        // Apply tilt (rotate around X axis)
        const cosT = Math.cos(tiltRad);
        const sinT = Math.sin(tiltRad);
        const y2 = y * cosT - z * sinT;
        const z2 = y * sinT + z * cosT;
        if (z2 < 0.05) return null;
        return { x: cx + x * radius, y: cy + y2 * radius, z: z2 };
      };

      // ── Meridians ─────────────────────────────────────────────
      for (let i = 0; i < 12; i++) {
        const meridian = i * 30 - 90;
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, meridian);
          if (p) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else { started = false; }
        }
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.04)';
        ctx.lineWidth = i % 3 === 0 ? 0.6 : 0.4;
        ctx.stroke();
      }

      // ── Parallels ─────────────────────────────────────────────
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 2) {
          const p = project(lat, lng);
          if (p) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else { started = false; }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.04)';
        ctx.lineWidth = lat === 0 ? 0.8 : 0.4;
        ctx.stroke();
      }

      // ── Land mass dots ────────────────────────────────────────
      for (const dot of landDots) {
        const p = project(dot.lat, dot.lng);
        if (p) {
          const alpha = 0.08 + p.z * 0.3;
          const dotSize = dot.size * (0.4 + p.z * 0.6);
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${alpha})`;
          ctx.fill();
          // Glow on front-facing dots
          if (p.z > 0.7 && dotSize > 0.8) {
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dotSize * 3);
            glow.addColorStop(0, `rgba(96,165,250,${alpha * 0.15})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, dotSize * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ── Connection arcs between location pairs ─────────────────
      const arcPairs = [
        [0, 1], [0, 3], [1, 2], [2, 3], // India mesh
        [0, 6], [3, 6], // India ↔ Singapore
        [6, 7], // Singapore ↔ Tokyo
        [1, 4], // Noida ↔ Frankfurt
        [4, 6], // Frankfurt ↔ Singapore
        [3, 5], [0, 5], // India ↔ Dubai
        [5, 6], // Dubai ↔ Singapore
        [4, 8], [6, 8], // Frankfurt/Singapore ↔ Virginia
      ];
      const dashOffset = (Date.now() * 0.02) % 20;
      for (const [i, j] of arcPairs) {
        if (i >= locationDots.length || j >= locationDots.length) continue;
        const p0 = project(locationDots[i].lat, locationDots[i].lng);
        const p1 = project(locationDots[j].lat, locationDots[j].lng);
        if (p0 && p1) {
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -dashOffset;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          const midX = (p0.x + p1.x) / 2;
          const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          const midY = (p0.y + p1.y) / 2 - Math.min(dist * 0.25, 40);
          ctx.quadraticCurveTo(midX, midY, p1.x, p1.y);
          ctx.strokeStyle = 'rgba(34,197,94,0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── Location dots (pulsing) ───────────────────────────────
      const now = Date.now();
      for (const loc of locationDots) {
        const p = project(loc.lat, loc.lng);
        if (p) {
          const pulsePhase = (now * 0.003 + loc.phase) % (Math.PI * 2);
          const pulseR = 6 + Math.sin(pulsePhase) * 3;
          const pulseAlpha = 0.15 + Math.sin(pulsePhase) * 0.1;

          // Outer pulse ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,197,94,${pulseAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Second pulse ring (offset phase)
          const pulseR2 = 9 + Math.sin(pulsePhase + 1.5) * 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,197,94,${pulseAlpha * 0.3})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Center glow
          const dotGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
          dotGlow.addColorStop(0, 'rgba(34,197,94,0.4)');
          dotGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = dotGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Center dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        }
      }

      // ── Physics: inertia + auto-rotate ────────────────────────
      if (!isDragging.current) {
        angleRef.current += autoRotateSpeed.current;
        // Apply inertia decay
        angleRef.current += velocityX.current;
        velocityX.current *= 0.95; // friction
        tiltRef.current += velocityY.current;
        velocityY.current *= 0.93;
        // Clamp tilt
        tiltRef.current = Math.max(-0.5, Math.min(0.5, tiltRef.current));
        // Stop tiny velocities
        if (Math.abs(velocityX.current) < 0.0005) velocityX.current = 0;
        if (Math.abs(velocityY.current) < 0.0002) velocityY.current = 0;
      }

      animIdRef.current = requestAnimationFrame(draw);
    };

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    });
    resizeObserver.observe(container);

    // Start after delay for fade-in
    const startTimeout = setTimeout(() => {
      setVisible(true);
      animIdRef.current = requestAnimationFrame(draw);
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
      if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ paddingBottom: '100%', maxWidth: 400, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}

export function GlobalNetworkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });

  return (
    <section id="global-network" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] max-w-[100vw] rounded-full bg-[#3b82f6]/[0.03] blur-[150px]" />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 mb-4">
            <Globe className="size-3.5 text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">Global Network</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Explore Our <span className="gradient-text">Global Network</span>
          </h2>
          <p className="mt-3 text-white/50 text-lg max-w-lg mx-auto">
            Strategically placed data centers for the lowest latency
          </p>
          <p className="mt-1.5 text-white/25 text-sm">Click & drag to rotate the globe</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 w-full max-w-[400px] lg:w-[400px]"
          >
            <RotatingGlobe />
          </motion.div>

          {/* Location cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0 w-full">
            {locations.map((loc, index) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                className="glass glass-hover rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-[#22c55e]/10">
                    <Server className="size-3.5 text-[#22c55e]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`${FLAG_BASE}/${loc.code}.png`}
                        alt={`${loc.country} flag`}
                        className="size-5 rounded-sm object-cover shadow-sm"
                        loading="lazy"
                        width={20}
                        height={14}
                      />
                      <h3 className="text-sm font-semibold text-white truncate">{loc.city}</h3>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="size-2.5 text-white/40" />
                      <span className="text-[11px] text-white/50 truncate">{loc.country}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/40">Latency</span>
                    <span className="text-[#22c55e] font-medium">{loc.latency}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#06b6d4]" style={{ width: loc.barWidth }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/40">Uptime</span>
                    <span className="text-[#22c55e] font-medium">{loc.uptime}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Network stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="glass rounded-xl p-4 border border-white/[0.06] sm:col-span-2 lg:col-span-3"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-lg bg-[#3b82f6]/10">
                  <Globe className="size-3.5 text-[#3b82f6]" />
                </div>
                <h3 className="text-sm font-semibold text-white">Network Performance</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-white">9</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Data Centers</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">1 Gbps</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Port Speed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">24/7</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Monitoring</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}