import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HostingNavIcon — Game server / hosting icon
 * A server tower with a play-button element, representing game server hosting.
 */
export function HostingNavIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      {/* Server body */}
      <rect x="2" y="2" width="11" height="20" rx="2" />
      {/* Drive bay dividers */}
      <line x1="2" y1="9" x2="13" y2="9" />
      <line x1="2" y1="15" x2="13" y2="15" />
      {/* Status LEDs */}
      <circle cx="5" cy="5.5" r="0.8" />
      <circle cx="5" cy="12" r="0.8" />
      {/* Drive bay slots */}
      <rect x="8" y="4.5" width="3.5" height="2" rx="0.5" />
      <rect x="8" y="11" width="3.5" height="2" rx="0.5" />
      {/* Power button */}
      <circle cx="7.5" cy="17.5" r="1" />
      {/* Game / play button element */}
      <polygon points="16,7 16,15 22,11" />
    </svg>
  );
}

/**
 * VpsNavIcon — Cloud / VPS icon
 * A server box with network lines radiating to remote nodes,
 * representing a distributed / cloud virtual private server.
 */
export function VpsNavIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      {/* Server body */}
      <rect x="2" y="7" width="10" height="10" rx="1.5" />
      {/* Internal dividers */}
      <line x1="2" y1="10.3" x2="12" y2="10.3" />
      <line x1="2" y1="13.7" x2="12" y2="13.7" />
      {/* Status LED */}
      <circle cx="4.5" cy="8.6" r="0.7" />
      {/* Network lines radiating outward */}
      <line x1="13" y1="9" x2="19" y2="5" />
      <line x1="13" y1="12" x2="20" y2="12" />
      <line x1="13" y1="15" x2="19" y2="19" />
      {/* Remote endpoint nodes */}
      <circle cx="19" cy="5" r="1.2" />
      <circle cx="20" cy="12" r="1.2" />
      <circle cx="19" cy="19" r="1.2" />
    </svg>
  );
}

/**
 * DomainsNavIcon — Domain / globe icon
 * A globe with latitude/longitude lines and a mini URL bar,
 * representing domain registration and web presence.
 */
export function DomainsNavIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      {/* Globe outline */}
      <circle cx="9" cy="10" r="7" />
      {/* Vertical meridian */}
      <ellipse cx="9" cy="10" rx="2.5" ry="7" />
      {/* Equator line */}
      <line x1="2" y1="10" x2="16" y2="10" />
      {/* Northern latitude arc */}
      <path d="M3.5 7 Q9 3.5 14.5 7" />
      {/* Southern latitude arc */}
      <path d="M3.5 13 Q9 16.5 14.5 13" />
      {/* Mini URL bar */}
      <rect x="15" y="18" width="7" height="4" rx="1" />
      {/* Protocol dot */}
      <circle cx="17" cy="20" r="0.7" />
      {/* URL path line */}
      <line x1="18.5" y1="20" x2="20.5" y2="20" />
    </svg>
  );
}

/**
 * ServicesNavIcon — Services / tools icon
 * A 2×2 grid of tool squares (gear, list, checkmark, plus),
 * representing the variety of available services.
 */
export function ServicesNavIcon({ className, style, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      {/* Grid cells */}
      <rect x="2" y="2" width="9" height="9" rx="1.5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" />
      {/* Top-left: gear */}
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="6.5" r="0.8" />
      {/* Top-right: list / menu */}
      <line x1="15" y1="5.5" x2="21" y2="5.5" />
      <line x1="15" y1="8" x2="21" y2="8" />
      {/* Bottom-left: checkmark / setup */}
      <polyline points="4.5,16.5 6.5,18.5 8.5,15" />
      {/* Bottom-right: plus / add */}
      <line x1="17.5" y1="15.5" x2="17.5" y2="19.5" />
      <line x1="15.5" y1="17.5" x2="19.5" y2="17.5" />
    </svg>
  );
}