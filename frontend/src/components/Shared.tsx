// Shared UI atoms ported from design_handoff_agentproof/reference/shared.jsx.
// HiddenValue (scanline chip), PrivacyTag, Eyebrow, Stat, Claim, Seal,
// VerifiedBadge (rotating seal), AgentAvatar (geometric identicon), Spinner.

import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

import { Icon, type IconName } from "./Icon";

// ---------- HiddenValue: the scanline-shimmer chip ----------

export function HiddenValue({
  label = "private",
  icon = "lock",
  width,
}: {
  label?: string;
  icon?: IconName;
  width?: number | string;
}) {
  return (
    <span className="hidden-chip" style={{ width }}>
      <Icon name={icon} size={12} />
      <span>{label}</span>
    </span>
  );
}

// ---------- PrivacyTag: uppercase mono pill ----------

type TagKind = "private" | "public" | "verified" | "unverified" | "warn";

const TAG_MAP: Record<TagKind, { cls: string; icon: IconName; label: string }> = {
  private: { cls: "tag-private", icon: "lock", label: "PRIVATE" },
  public: { cls: "tag-public", icon: "broadcast", label: "PUBLIC" },
  verified: { cls: "tag-verified", icon: "check", label: "VERIFIED" },
  unverified: { cls: "tag-unverified", icon: "circle", label: "UNVERIFIED" },
  warn: { cls: "tag-warn", icon: "flag", label: "AT RISK" },
};

export function PrivacyTag({
  kind = "private",
  children,
}: {
  kind?: TagKind;
  children?: ReactNode;
}) {
  const m = TAG_MAP[kind];
  return (
    <span className={`tag ${m.cls}`}>
      <Icon name={m.icon} size={10} />
      {children ?? m.label}
    </span>
  );
}

// ---------- Eyebrow: cyan section-heading prefix ----------

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="section-eyebrow">{children}</div>;
}

// ---------- Stat: label + big mono value + sub ----------

export function Stat({
  label,
  value,
  sub,
  accent,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
  mono?: boolean;
}) {
  const style: CSSProperties = accent ? { color: accent } : {};
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${mono ? "mono" : ""}`} style={style}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ---------- Claim: tokenized threshold expression ----------

export function Claim({
  field,
  op = "≥",
  value,
  met = true,
  animated = false,
}: {
  field: string;
  op?: string;
  value: ReactNode;
  met?: boolean;
  animated?: boolean;
}) {
  return (
    <div className={`claim ${met ? "met" : "unmet"} ${animated ? "anim" : ""}`}>
      <div className="claim-icon">
        <Icon name={met ? "check" : "x"} size={12} />
      </div>
      <div className="claim-expr">
        <span className="claim-field mono">{field}</span>
        <span className="claim-op mono">{op}</span>
        <span className="claim-value mono">{value}</span>
      </div>
      {met && <div className="claim-status mono">satisfied</div>}
    </div>
  );
}

// ---------- Seal: small inline verification seal ----------

export function Seal({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.18" />
      <path
        d="m8 12 3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------- VerifiedBadge: rotating dashed seal ----------

export function VerifiedBadge({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const s = size === "sm" ? 56 : size === "md" ? 88 : 124;
  const markSize = Math.round(s * 0.62);
  return (
    <div style={{ width: s, height: s, position: "relative" }}>
      <svg
        viewBox="0 0 100 100"
        width={s}
        height={s}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="vbg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.18 155)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 175)" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#vbg)"
          strokeWidth="2"
          strokeDasharray="3 4"
          opacity="0.65"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="40s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="url(#vbg)"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </svg>
      <img
        src="/logo/agentproof-mark-verified.svg"
        alt="AgentProof verified"
        width={markSize}
        height={markSize}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "block",
        }}
      />
    </div>
  );
}

// ---------- AgentAvatar: deterministic geometric identicon ----------

export function AgentAvatar({
  seed = "agent",
  size = 44,
  status = "verified",
}: {
  seed?: string;
  size?: number;
  status?: "verified" | "unverified" | "warn";
}) {
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }, [seed]);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60) % 360;
  const shape = hash % 4; // 0 hex 1 tri 2 sq 3 dia
  const ring =
    status === "verified"
      ? "oklch(0.82 0.18 155)"
      : status === "unverified"
        ? "oklch(0.46 0.018 252)"
        : "oklch(0.82 0.15 75)";
  const gradId = `av-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={`oklch(0.72 0.16 ${hue1})`} />
            <stop offset="100%" stopColor={`oklch(0.62 0.16 ${hue2})`} />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="12"
          fill="oklch(0.20 0.025 263)"
          stroke={ring}
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />
        {shape === 0 && (
          <polygon
            points="24,8 38,16 38,32 24,40 10,32 10,16"
            fill={`url(#${gradId})`}
            opacity="0.95"
          />
        )}
        {shape === 1 && (
          <polygon
            points="24,8 40,38 8,38"
            fill={`url(#${gradId})`}
            opacity="0.95"
          />
        )}
        {shape === 2 && (
          <rect
            x="10"
            y="10"
            width="28"
            height="28"
            rx="4"
            fill={`url(#${gradId})`}
            opacity="0.95"
          />
        )}
        {shape === 3 && (
          <polygon
            points="24,7 41,24 24,41 7,24"
            fill={`url(#${gradId})`}
            opacity="0.95"
          />
        )}
        <circle
          cx="24"
          cy="24"
          r={shape === 1 ? 5 : 6}
          fill="oklch(0.20 0.025 263)"
        />
        <circle
          cx="24"
          cy="24"
          r={shape === 1 ? 2.5 : 3}
          fill={ring}
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

// ---------- Spinner: in-button loading indicator ----------

export function Spinner({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="14 40"
        strokeLinecap="round"
      />
    </svg>
  );
}
