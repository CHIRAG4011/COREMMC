import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  style?: React.CSSProperties;
}

// ─── DomainIcon — Globe with cursor pointer ──────────────────────
export function DomainIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      <circle cx="10" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="12" rx="3.5" ry="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" />
      {/* Cursor pointer */}
      <path
        d="M17.5 3.5L21 7L14 20L10 16L17.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="14" y1="13" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ─── MinecraftIntelIcon — CPU chip with pickaxe ──────────────────
export function MinecraftIntelIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* CPU body */}
      <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      {/* Pins top */}
      <line x1="9" y1="6" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="6" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="6" x2="15" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Pins bottom */}
      <line x1="9" y1="18" x2="9" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="18" x2="15" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Pins left */}
      <line x1="6" y1="9" x2="3.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="15" x2="3.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Pins right */}
      <line x1="18" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="12" x2="20.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="15" x2="20.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── MinecraftAmdIcon — AMD-style chip with lightning bolt ───────
export function MinecraftAmdIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Chip body - diamond/rotated square shape for AMD feel */}
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner diamond */}
      <path d="M12 8L16 12L12 16L8 12L12 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Lightning bolt in center */}
      <path
        d="M13 9.5L11 12H13L11 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Corner pins */}
      <line x1="8" y1="5" x2="8" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="5" x2="12" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="5" x2="16" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="19" x2="8" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="19" x2="16" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="16" x2="3" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── ProxyAmdIcon — Shield with arrow (proxy/routing) ────────────
export function ProxyAmdIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Shield */}
      <path
        d="M12 2L4 6V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V6L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Arrow passing through */}
      <path
        d="M8 10H16M16 10L13.5 7.5M16 10L13.5 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14H8M8 14L10.5 11.5M8 14L10.5 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── ProxyIntelIcon — Shield with checkmark ──────────────────────
export function ProxyIntelIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Shield */}
      <path
        d="M12 2L4 6V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V6L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M9 12L11 14L15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── HytaleAmdIcon — Game controller with fire ───────────────────
export function HytaleAmdIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Game controller body */}
      <path
        d="M6 9H18C19.1 9 20 9.9 20 11V14C20 16.2 18.2 18 16 18H15L14 20H10L9 18H8C5.8 18 4 16.2 4 14V11C4 9.9 4.9 9 6 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* D-pad */}
      <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6.5" y1="13.5" x2="9.5" y2="13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* Buttons */}
      <circle cx="16" cy="12" r="0.7" fill="currentColor" />
      <circle cx="17.5" cy="13.5" r="0.7" fill="currentColor" />
      <circle cx="14.5" cy="13.5" r="0.7" fill="currentColor" />
      <circle cx="16" cy="15" r="0.7" fill="currentColor" />
      {/* Fire sparks */}
      <path d="M11.5 5L12 7L12.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 6.5L10.8 8.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M13.2 6.5L13.8 8.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// ─── HytaleIntelIcon — Simplified game pad ───────────────────────
export function HytaleIntelIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Simplified gamepad */}
      <rect x="3" y="8" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Left stick */}
      <circle cx="8" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" />
      {/* Right buttons area */}
      <circle cx="16" cy="11.5" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="13" r="0.8" fill="currentColor" />
      <circle cx="16" cy="14.5" r="0.8" fill="currentColor" />
      <circle cx="14.5" cy="13" r="0.8" fill="currentColor" />
      {/* Center buttons */}
      <rect x="10.5" y="11.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" />
      {/* Triggers */}
      <path d="M6 8V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 8V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── IntelVpsIcon — Server rack ──────────────────────────────────
export function IntelVpsIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Server rack body */}
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Top server unit */}
      <rect x="7" y="4.5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="15" cy="6.5" r="0.8" fill="currentColor" />
      <line x1="8.5" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Middle server unit */}
      <rect x="7" y="10" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="15" cy="12" r="0.8" fill="currentColor" />
      <line x1="8.5" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bottom server unit */}
      <rect x="7" y="15.5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="15" cy="17.5" r="0.8" fill="currentColor" />
      <line x1="8.5" y1="17.5" x2="12" y2="17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── AmdVpsIcon — Server with EPYC/performance feel ──────────────
export function AmdVpsIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Server tower */}
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Drive bays */}
      <rect x="8" y="4.5" width="8" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="8" width="8" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="11.5" width="8" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      {/* Power button */}
      <circle cx="12" cy="16.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="15" x2="12" y2="17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Status indicators */}
      <circle cx="9" cy="20" r="0.6" fill="currentColor" />
      <circle cx="12" cy="20" r="0.6" fill="currentColor" />
      <circle cx="15" cy="20" r="0.6" fill="currentColor" />
    </svg>
  );
}

// ─── WebHostingIcon — Browser window with gear ───────────────────
export function WebHostingIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Browser window */}
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Title bar */}
      <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" />
      {/* Dots */}
      <circle cx="5.5" cy="5.5" r="0.7" fill="currentColor" />
      <circle cx="8" cy="5.5" r="0.7" fill="currentColor" />
      <circle cx="10.5" cy="5.5" r="0.7" fill="currentColor" />
      {/* Gear icon in center */}
      <circle cx="12" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="14.5" r="1" stroke="currentColor" strokeWidth="1.2" />
      {/* Gear teeth */}
      <line x1="12" y1="11" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8.5" y1="14.5" x2="9.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.5" y1="14.5" x2="15.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9.7" y1="12.2" x2="10.4" y2="12.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.6" y1="16.1" x2="14.3" y2="16.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.3" y1="12.2" x2="13.6" y2="12.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.4" y1="16.1" x2="9.7" y2="16.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── DiscordBotIcon — Robot/bot head ─────────────────────────────
export function DiscordBotIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Head */}
      <path
        d="M6 9C6 6.24 8.69 4 12 4C15.31 4 18 6.24 18 9V14C18 16.76 15.31 19 12 19C8.69 19 6 16.76 6 14V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Antenna */}
      <line x1="12" y1="4" x2="12" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="1.5" r="0.8" fill="currentColor" />
      {/* Eyes */}
      <rect x="8.5" y="9" width="3" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="12.5" y="9" width="3" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Mouth/speaker grille */}
      <rect x="9.5" y="13.5" width="5" height="2" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <line x1="11" y1="13.5" x2="11" y2="15.5" stroke="currentColor" strokeWidth="0.8" />
      <line x1="13" y1="13.5" x2="13" y2="15.5" stroke="currentColor" strokeWidth="0.8" />
      {/* Ears */}
      <rect x="3" y="10" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="18" y="10" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// ─── DiscordServicesIcon — Chat bubble with tools ────────────────
export function DiscordServicesIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Chat bubble */}
      <path
        d="M4 4H20C20.55 4 21 4.45 21 5V15C21 15.55 20.55 16 20 16H7L4 19V5C4 4.45 4.45 4 4 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Chat dots */}
      <circle cx="8.5" cy="10" r="0.8" fill="currentColor" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" />
      <circle cx="15.5" cy="10" r="0.8" fill="currentColor" />
      {/* Wrench tool */}
      <path
        d="M17 17.5L20.5 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 19.5C15 18.12 16.12 17 17.5 17C18.88 17 20 18.12 20 19.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Gear */}
      <circle cx="14" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// ─── PaidWorksIcon — Wrench with gears ───────────────────────────
export function PaidWorksIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      {/* Wrench */}
      <path
        d="M14.7 6.3C14.3 6.7 13.5 6.7 13.1 6.3L6.3 13.1C5.9 13.5 5.9 14.3 6.3 14.7L9.3 17.7C9.7 18.1 10.5 18.1 10.9 17.7L17.7 10.9C18.1 10.5 18.1 9.7 17.7 9.3L14.7 6.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Wrench handle end */}
      <path
        d="M6.3 14.7L4 20L9.3 17.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Wrench head end */}
      <path
        d="M14.7 6.3L18 3C19.5 4 20 5.5 20 7L17.7 9.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Small gear */}
      <circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17" cy="17" r="1" stroke="currentColor" strokeWidth="1" />
      {/* Gear teeth */}
      <line x1="17" y1="13.8" x2="17" y2="14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="17" y1="19.5" x2="17" y2="20.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="14.3" y1="14.3" x2="14.8" y2="14.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="19.2" y1="19.2" x2="19.7" y2="19.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="19.7" y1="14.3" x2="19.2" y2="14.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="14.8" y1="19.2" x2="14.3" y2="19.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}