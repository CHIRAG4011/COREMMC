'use client';

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltMax?: number;
  glareEnabled?: boolean;
  scaleOnHover?: number;
}

export function TiltCard({
  children,
  className = '',
  tiltMax = 8,
  glareEnabled = true,
  scaleOnHover = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -tiltMax;
        const rotateY = ((x - centerX) / centerX) * tiltMax;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`;

        if (glareEnabled) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          card.style.setProperty('--glare-x', `${glareX}%`);
          card.style.setProperty('--glare-y', `${glareY}%`);
        }
      });
    },
    [tiltMax, glareEnabled, scaleOnHover]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}