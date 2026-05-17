// 24px stroke-based icon library ported from the design handoff.
// Stroke weight 1.6; sizes 12/14/16/20/24 used across the UI.

import type { CSSProperties } from "react";

export type IconName =
  | "shield"
  | "shield-check"
  | "lock"
  | "lock-open"
  | "eye-off"
  | "check"
  | "check-circle"
  | "x"
  | "x-circle"
  | "arrow-right"
  | "arrow-left"
  | "spark"
  | "cpu"
  | "database"
  | "file"
  | "users"
  | "message"
  | "coin"
  | "circle"
  | "plus"
  | "menu"
  | "play"
  | "home"
  | "sparkle"
  | "flag"
  | "tag"
  | "globe"
  | "broadcast"
  | "fingerprint";

export function Icon({
  name,
  size = 16,
  className = "",
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 4 6v6c0 4.5 3.2 8.4 8 9 4.8-.6 8-4.5 8-9V6l-8-3z" />
        </svg>
      );
    case "shield-check":
      return (
        <svg {...props}>
          <path d="M12 3 4 6v6c0 4.5 3.2 8.4 8 9 4.8-.6 8-4.5 8-9V6l-8-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "lock-open":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 7.5-2" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...props}>
          <path d="M9.9 5a8.5 8.5 0 0 1 2.1-.3c4.5 0 8 4.3 9 7.3-.3.9-.9 2.1-1.9 3.3" />
          <path d="M6.3 7.3C4 8.8 2.7 11 2 12c1 3 4.5 7.3 9 7.3 2 0 3.7-.8 5.2-2" />
          <path d="m3 3 18 18" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m4 12 5 5L20 6" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "x-circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...props}>
          <path d="M19 12H5M11 5 4 12l7 7" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...props}>
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      );
    case "database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "file":
      return (
        <svg {...props}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c.6-3 3-5 6-5s5.4 2 6 5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14c2.5 0 4.4 1.4 5 4" />
        </svg>
      );
    case "message":
      return (
        <svg {...props}>
          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4 4v-4H6a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "coin":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9.5c0-1 1.3-1.5 3-1.5s3 .5 3 1.5-1.3 1.5-3 1.5-3 .5-3 1.5 1.3 1.5 3 1.5 3-.5 3-1.5M12 7v2M12 15v2" />
        </svg>
      );
    case "circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <path d="M7 5v14l12-7z" fill="currentColor" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="m3 11 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...props}>
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...props}>
          <path d="M4 4v17M4 4h12l-2 4 2 4H4" />
        </svg>
      );
    case "tag":
      return (
        <svg {...props}>
          <path d="m13 3 8 8-9 9-9-9V4a1 1 0 0 1 1-1z" />
          <circle cx="8" cy="8" r="1.5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9z" />
        </svg>
      );
    case "broadcast":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
          <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "fingerprint":
      return (
        <svg {...props}>
          <path d="M5 12a7 7 0 0 1 14 0v3" />
          <path d="M8 12a4 4 0 0 1 8 0v4" />
          <path d="M11 12v5" />
          <path d="M19 17v.5M5 16v.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
