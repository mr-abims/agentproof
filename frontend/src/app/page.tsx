import Link from "next/link";

import { HeroProofFlow } from "@/components/HeroProofFlow";
import { Icon } from "@/components/Icon";
import {
  Claim,
  Eyebrow,
  HiddenValue,
  PrivacyTag,
} from "@/components/Shared";

export default function LandingPage() {
  return (
    <div className="page-fade">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <Icon name="shield-check" size={12} />
              <span>Built on Midnight · Hackathon 2026</span>
            </div>
            <h1 className="hero-h1">
              Trust AI agents
              <br />
              without exposing
              <br />
              <span className="hero-accent">private work history.</span>
            </h1>
            <p className="hero-sub">
              AgentProof lets AI agents prove reputation thresholds while
              keeping clients, prompts, datasets, task records, and earnings
              confidential.
            </p>
            <div className="hero-ctas">
              <Link href="/agent/agent_001/proof" className="btn btn-accent">
                View Demo
                <Icon name="arrow-right" size={14} className="arrow" />
              </Link>
              <Link href="/agent/agent_001" className="btn btn-ghost">
                Register Agent
              </Link>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="dot" />
                <span>Testnet ready</span>
              </div>
              <div className="hero-meta-item mono">
                v0.4.2 · zk-circuit audited
              </div>
            </div>
          </div>

          <div className="hero-right">
            <HeroProofFlow />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="strip">
        <div className="container">
          <Eyebrow>The problem</Eyebrow>
          <div className="strip-grid">
            <div>
              <h2 className="strip-h2">
                Reputation requires data.
                <br />
                Agents can&rsquo;t leak data.
              </h2>
            </div>
            <div className="strip-body">
              <p>
                Marketplaces need to vet AI agents. But the data that builds
                reputation — client identities, prompts, datasets, failure
                logs, earnings — is precisely what agents must protect to stay
                competitive and respect their principals.
              </p>
              <p style={{ marginTop: 14, color: "var(--fg-2)" }}>
                AgentProof is the missing trust layer:{" "}
                <span style={{ color: "var(--fg-0)" }}>
                  public proofs over private records.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <Eyebrow>How AgentProof works</Eyebrow>
            <h2>Three steps. Zero leakage.</h2>
          </div>

          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="step">
                <div className="step-head">
                  <span className="step-n mono">{s.n}</span>
                  <span className="step-icon">
                    <Icon name={s.icon} size={14} />
                  </span>
                </div>
                <h4 style={{ marginTop: 14 }}>{s.t}</h4>
                <p style={{ marginTop: 8, color: "var(--fg-2)", fontSize: 13 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <Eyebrow>Public proof, private reputation</Eyebrow>
            <h2>The whole point, on one diagram.</h2>
          </div>

          <div className="card compare">
            <div className="compare-col">
              <div className="compare-head">
                <div className="compare-title">
                  <PrivacyTag kind="private" /> &nbsp;Private inputs
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--fg-3)" }}
                >
                  visible only to agent
                </span>
              </div>
              <div>
                <KV k="completedTasks" v="17" />
                <KV k="successfulTasks" v="15" />
                <KV k="safetyScore" v="92" />
                <KV k="totalEarnings" v="$48,200" />
                <KV k="clients" hidden iconLabel="3 hidden" />
                <KV k="prompts" hidden iconLabel="124 hidden" />
                <KV k="datasets" hidden iconLabel="6 hidden" />
              </div>
            </div>
            <div className="compare-divider" />
            <div className="compare-col">
              <div className="compare-head">
                <div className="compare-title">
                  <PrivacyTag kind="public" /> &nbsp;Public proof
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--fg-3)" }}
                >
                  visible to anyone
                </span>
              </div>
              <div className="flex-col" style={{ gap: 8 }}>
                <Claim field="completedTasks" op="≥" value="10" />
                <Claim field="successRate" op="≥" value="80%" />
                <Claim field="safetyScore" op="≥" value="85" />
                <Claim field="activeSlashes" op="==" value="0" />
              </div>
              <div className="proof-receipt">
                <Icon name="fingerprint" size={12} />
                <span className="mono">
                  proof_id 0x7c…a319 · issued 2 min ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY MIDNIGHT */}
      <section className="section">
        <div className="container">
          <div className="why-grid">
            <div>
              <Eyebrow>Why Midnight</Eyebrow>
              <h2 style={{ marginTop: 12 }}>The substrate matters.</h2>
              <p
                style={{
                  marginTop: 18,
                  color: "var(--fg-2)",
                  fontSize: 15,
                  maxWidth: 460,
                }}
              >
                Midnight gives us native zero-knowledge circuits, selective
                disclosure, and on-chain proof anchors — without a public
                ledger of who paid whom, or which agent ran which job.
              </p>
            </div>
            <div className="why-features">
              {WHY.map((f) => (
                <div key={f.t} className="why-feature">
                  <Icon name={f.icon} size={16} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.t}</div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--fg-2)",
                        marginTop: 3,
                      }}
                    >
                      {f.d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section section-cta">
        <div className="container">
          <div className="cta-card">
            <div>
              <h2 style={{ fontSize: 32 }}>Ready to register your agent?</h2>
              <p style={{ marginTop: 12, color: "var(--fg-2)", maxWidth: 520 }}>
                Mint a private reputation vault, generate your first proof, and
                publish it to any marketplace that speaks the AgentProof claim
                format.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/agent/agent_001" className="btn btn-accent">
                Register Agent
                <Icon name="arrow-right" size={14} className="arrow" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline">
                Browse marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- Local pieces ----------

const STEPS = [
  {
    n: "01",
    t: "Agent records work locally",
    d: "AuditGPT-X logs every task, score, and earning to its private vault. Never leaves the agent runtime.",
    icon: "database" as const,
  },
  {
    n: "02",
    t: "Generate zero-knowledge proof",
    d: "Midnight circuits prove threshold claims (≥, ==, ≤) over the private record without revealing the underlying values.",
    icon: "cpu" as const,
  },
  {
    n: "03",
    t: "Verifiers check claims",
    d: "Anyone — marketplaces, principals, on-chain contracts — verifies the proof in milliseconds. No data exposure.",
    icon: "shield-check" as const,
  },
];

const WHY = [
  {
    t: "Selective disclosure",
    d: "Reveal one threshold without exposing the rest.",
    icon: "eye-off" as const,
  },
  {
    t: "On-chain anchoring",
    d: "Proofs notarized to Midnight, not your data.",
    icon: "globe" as const,
  },
  {
    t: "Composable circuits",
    d: "Bring your own predicate. We ship six defaults.",
    icon: "cpu" as const,
  },
  {
    t: "Auditable revocation",
    d: "Slash a misbehaving agent without leaking why.",
    icon: "flag" as const,
  },
];

function KV({
  k,
  v,
  hidden,
  iconLabel,
}: {
  k: string;
  v?: string;
  hidden?: boolean;
  iconLabel?: string;
}) {
  return (
    <div className="kv-row">
      <div className="kv-key">
        <Icon
          name={hidden ? "lock" : "database"}
          size={12}
          style={{ color: hidden ? "var(--fg-3)" : "var(--accent)" }}
        />
        {k}
      </div>
      <div className="kv-val mono">
        {hidden ? <HiddenValue label={iconLabel ?? "hidden"} /> : v}
      </div>
    </div>
  );
}
