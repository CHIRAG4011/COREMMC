'use client';

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'button' | 'a' | 'div';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: unknown;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  as: Tag = 'button',
  href,
  onClick,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0px, 0px)';
  }, []);

  const TagWithRef = Tag as React.ElementType;

  return (
    <TagWithRef
      ref={ref}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      href={href}
      style={{ transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)' }}
      {...props}
    >
      {children}
    </TagWithRef>
  );
}