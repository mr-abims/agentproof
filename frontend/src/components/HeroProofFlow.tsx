// Hero proof-flow diagram: private vault → zk-circuit → public proof, with
// animated SVG beams connecting them. Ported from landing.jsx.

import { HiddenValue, PrivacyTag } from "./Shared";
import { Icon } from "./Icon";

export function HeroProofFlow() {
  return (
    <div className="hero-flow card">
      <div className="hero-flow-head">
        <PrivacyTag kind="private" />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--fg-3)",
            marginLeft: "auto",
          }}
        >
          agentproof://AuditGPT-X
        </span>
      </div>

      <div className="hero-flow-stage">
        <div className="flow-node flow-private">
          <div className="flow-node-head">
            <Icon name="database" size={12} />
            <span>private vault</span>
          </div>
          <div className="flow-rows">
            <FlowRow k="tasks" v="17" />
            <FlowRow k="rate" v="88%" />
            <FlowRow k="safety" v="92" />
            <FlowRow k="clients" hidden />
            <FlowRow k="prompts" hidden />
          </div>
        </div>

        <div className="flow-node flow-circuit">
          <CircuitGlyph />
          <div className="flow-circuit-label mono">zk-circuit</div>
        </div>

        <div className="flow-node flow-public">
          <div
            className="flow-node-head"
            style={{ color: "var(--verified)" }}
          >
            <Icon name="shield-check" size={12} />
            <span>public proof</span>
          </div>
          <div className="flow-claims">
            <FlowClaim>tasks ≥ 10</FlowClaim>
            <FlowClaim>rate ≥ 80%</FlowClaim>
            <FlowClaim>safety ≥ 85</FlowClaim>
            <FlowClaim>slashes == 0</FlowClaim>
          </div>
        </div>

        <svg
          className="flow-beams"
          viewBox="0 0 480 320"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="beam-a" x1="0" x2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.80 0.13 220)"
                stopOpacity="0"
              />
              <stop
                offset="50%"
                stopColor="oklch(0.80 0.13 220)"
                stopOpacity="0.8"
              />
              <stop
                offset="100%"
                stopColor="oklch(0.80 0.13 220)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {[60, 110, 160, 210, 260].map((y, i) => (
            <line
              key={`l-${i}`}
              x1="0"
              y1={y}
              x2="240"
              y2="160"
              stroke="url(#beam-a)"
              strokeWidth="1"
              strokeDasharray="3 6"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-18"
                dur={`${3 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
          {[80, 140, 200, 260].map((y, i) => (
            <line
              key={`r-${i}`}
              x1="240"
              y1="160"
              x2="480"
              y2={y}
              stroke="url(#beam-a)"
              strokeWidth="1"
              strokeDasharray="3 6"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-18"
                dur={`${3.5 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </svg>
      </div>

      <div className="hero-flow-foot">
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-3)" }}
        >
          generation_time
        </span>
        <span
          className="mono"
          style={{ fontSize: 11.5, color: "var(--fg-1)" }}
        >
          1.2s
        </span>
        <span
          style={{ flex: 1, height: 1, background: "var(--line-soft)" }}
        />
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-3)" }}
        >
          proof_size
        </span>
        <span
          className="mono"
          style={{ fontSize: 11.5, color: "var(--fg-1)" }}
        >
          2.4 KB
        </span>
      </div>
    </div>
  );
}

function FlowRow({
  k,
  v,
  hidden,
}: {
  k: string;
  v?: string;
  hidden?: boolean;
}) {
  return (
    <div className="flow-row">
      <span
        className="mono"
        style={{ fontSize: 11, color: "var(--fg-2)" }}
      >
        {k}
      </span>
      {hidden ? (
        <HiddenValue label="hidden" />
      ) : (
        <span
          className="mono"
          style={{ fontSize: 11.5, color: "var(--fg-0)" }}
        >
          {v}
        </span>
      )}
    </div>
  );
}

function FlowClaim({ children }: { children: React.ReactNode }) {
  return (
    <div className="flow-claim">
      <Icon name="check" size={10} />
      <span className="mono">{children}</span>
    </div>
  );
}

function CircuitGlyph() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="cgrad" cx="50%" cy="50%">
          <stop
            offset="0%"
            stopColor="oklch(0.80 0.13 220)"
            stopOpacity="0.55"
          />
          <stop
            offset="70%"
            stopColor="oklch(0.80 0.13 220)"
            stopOpacity="0.08"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.80 0.13 220)"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#cgrad)" />
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="oklch(0.80 0.13 220 / 0.5)"
        strokeWidth="1"
        strokeDasharray="2 3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="40"
        cy="40"
        r="20"
        fill="none"
        stroke="oklch(0.80 0.13 220 / 0.7)"
        strokeWidth="1"
      />
      <path
        d="M40 26v28M26 40h28M30 30l20 20M50 30 30 50"
        stroke="oklch(0.80 0.13 220 / 0.4)"
        strokeWidth="0.8"
      />
      <circle cx="40" cy="40" r="6" fill="oklch(0.80 0.13 220)" opacity="0.9" />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="oklch(0.16 0.02 265)"
        fontWeight="700"
      >
        zk
      </text>
    </svg>
  );
}
