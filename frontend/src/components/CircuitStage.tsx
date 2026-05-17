// Animated zk-circuit visualization. Rotation, hex spokes, progress arc, and
// orbiting satellites — all SMIL/SVG. Ported from proof.jsx.

export function CircuitStage({
  phase,
  progress,
}: {
  phase: "idle" | "gen" | "done" | "failed";
  progress: number;
}) {
  const active = phase !== "idle";
  const baseDashColor =
    phase === "failed"
      ? "oklch(0.72 0.18 25)"
      : "oklch(0.80 0.13 220)";
  return (
    <div className={`circuit-stage ${phase}`}>
      <svg
        viewBox="0 0 320 320"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="cs-glow" cx="50%" cy="50%">
            <stop
              offset="0%"
              stopColor={baseDashColor}
              stopOpacity={active ? 0.55 : 0.18}
            />
            <stop
              offset="60%"
              stopColor={baseDashColor}
              stopOpacity={active ? 0.18 : 0.05}
            />
            <stop offset="100%" stopColor={baseDashColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cs-arc" x1="0" x2="1">
            <stop offset="0%" stopColor={baseDashColor} />
            <stop offset="100%" stopColor="oklch(0.72 0.16 295)" />
          </linearGradient>
        </defs>

        <circle cx="160" cy="160" r="150" fill="url(#cs-glow)" />

        <circle
          cx="160"
          cy="160"
          r="120"
          fill="none"
          stroke={`${baseDashColor} / 0.18`}
          strokeWidth="1"
          strokeDasharray="2 4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 160 160"
            to="360 160 160"
            dur="40s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="160"
          cy="160"
          r="90"
          fill="none"
          stroke="oklch(0.80 0.13 220 / 0.30)"
          strokeWidth="1"
        />
        <circle
          cx="160"
          cy="160"
          r="60"
          fill="none"
          stroke="oklch(0.80 0.13 220 / 0.45)"
          strokeWidth="1"
        />

        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <g key={deg} transform={`rotate(${deg} 160 160)`}>
            <line
              x1="160"
              y1="100"
              x2="160"
              y2="40"
              stroke="oklch(0.80 0.13 220 / 0.25)"
              strokeWidth="1"
            />
            <circle
              cx="160"
              cy="40"
              r="3"
              fill="oklch(0.80 0.13 220)"
              opacity={active ? 0.7 : 0.3}
            >
              {active && (
                <animate
                  attributeName="r"
                  values="2;5;2"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </g>
        ))}

        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="oklch(0.24 0.022 263)"
          strokeWidth="3"
        />
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="url(#cs-arc)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(progress / 100) * 880} 880`}
          transform="rotate(-90 160 160)"
          style={{ transition: "stroke-dasharray 200ms linear" }}
        />

        <g>
          <circle
            cx="160"
            cy="160"
            r="40"
            fill="oklch(0.16 0.02 265)"
            stroke="url(#cs-arc)"
            strokeWidth="1.5"
          />
          <path
            d="M160 130v60M130 160h60M138 138l44 44M182 138l-44 44"
            stroke="oklch(0.80 0.13 220 / 0.5)"
            strokeWidth="1"
          />
          <circle cx="160" cy="160" r="14" fill="url(#cs-arc)" />
          <text
            x="160"
            y="165"
            textAnchor="middle"
            fontSize="13"
            fontFamily="var(--font-mono)"
            fontWeight="700"
            fill="oklch(0.16 0.02 265)"
          >
            zk
          </text>
        </g>

        {active &&
          [0, 0.25, 0.5, 0.75].map((t, i) => (
            <circle
              key={t}
              cx="160"
              cy="20"
              r="2"
              fill="oklch(0.85 0.13 215)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${360 * t} 160 160`}
                to={`${360 + 360 * t} 160 160`}
                dur={`${3 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
      </svg>

      <div className="circuit-label">
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: phase === "failed" ? "var(--danger)" : "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {phase === "idle" && "Ready"}
          {phase === "gen" && "Compiling circuit"}
          {phase === "done" && "Proof complete"}
          {phase === "failed" && "Proof rejected"}
        </div>
      </div>
    </div>
  );
}
