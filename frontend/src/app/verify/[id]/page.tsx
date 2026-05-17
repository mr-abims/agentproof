"use client";

import Link from "next/link";
import { use } from "react";

import { Icon } from "@/components/Icon";
import {
  Claim,
  Eyebrow,
  HiddenValue,
  PrivacyTag,
  VerifiedBadge,
} from "@/components/Shared";
import { withNotify, useClient } from "@/lib/store";

const AGENT_CATEGORIES_LABEL: Record<number, string> = {
  0: "Smart Contract Security Agent",
  1: "Research Agent",
  2: "DeFi Research Agent",
  3: "Customer Support Agent",
  4: "Coding Agent",
  5: "General Agent",
};

export default function VerifierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = useClient();

  const agent = client.getAgent(id);
  const verification = client.getVerification(id);

  if (!agent) {
    return (
      <div className="container" style={{ padding: "60px 28px" }}>
        <Eyebrow>Not found</Eyebrow>
        <h2 style={{ marginTop: 12 }}>No agent matches this id.</h2>
        <Link href="/marketplace" className="btn btn-ghost" style={{ marginTop: 20 }}>
          <Icon name="arrow-left" size={14} />
          Back to marketplace
        </Link>
      </div>
    );
  }

  const onRevoke = () => {
    withNotify(() => client.revokeVerification(id));
  };

  // If no verification, surface that clearly.
  if (!verification) {
    return (
      <div className="page-fade">
        <div className="container" style={{ padding: "32px 28px 80px" }}>
          <div className="scope-banner">
            <div className="scope-banner-left">
              <div className="scope-eye">
                <Icon name="globe" size={14} />
              </div>
              <div>
                <div className="scope-title">Public verifier view</div>
                <div className="scope-sub">
                  This is exactly what marketplaces, principals, and on-chain
                  contracts see for this agent.
                </div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>
              verifier · marketplace.aurora.xyz
            </div>
          </div>

          <div className="verifier-hero">
            <Eyebrow>AgentProof certificate</Eyebrow>
            <h2 style={{ marginTop: 12, fontSize: 34 }}>
              No proof submitted yet.
            </h2>
            <p
              style={{
                marginTop: 10,
                color: "var(--fg-2)",
                maxWidth: 620,
                fontSize: 14.5,
              }}
            >
              {agent.name} has not generated an AgentProof. There is nothing on
              the public ledger to verify.
            </p>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Icon name="shield" size={14} />
                {agent.name}
              </div>
              <PrivacyTag kind="unverified" />
            </div>
            <p style={{ color: "var(--fg-2)" }}>
              The agent owner can submit a proof from the dashboard.
            </p>
            <div className="verifier-actions" style={{ marginTop: 18 }}>
              <div />
              <div className="flex" style={{ gap: 10 }}>
                <Link href={`/agent/${id}`} className="btn btn-ghost">
                  <Icon name="arrow-left" size={14} />
                  Open agent dashboard
                </Link>
                <Link href={`/agent/${id}/proof`} className="btn btn-accent">
                  Generate proof
                  <Icon name="arrow-right" size={14} className="arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const revoked = verification.revoked;
  const issuedAt = new Date(verification.verifiedAt);
  const expiresAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const issuedStr = `${issuedAt.toISOString().slice(0, 10)} · ${issuedAt
    .toISOString()
    .slice(11, 16)} UTC`;
  const expiresStr = `${expiresAt.toISOString().slice(0, 10)} · ${expiresAt
    .toISOString()
    .slice(11, 16)} UTC`;

  return (
    <div className="page-fade">
      <div className="container" style={{ padding: "32px 28px 80px" }}>
        <div
          className="scope-banner verifier-banner"
          style={{ borderLeftColor: "var(--verified)" }}
        >
          <div className="scope-banner-left">
            <div
              className="scope-eye"
              style={{
                background: "var(--verified-soft)",
                color: "var(--verified)",
                borderColor: "var(--verified-line)",
              }}
            >
              <Icon name="globe" size={14} />
            </div>
            <div>
              <div className="scope-title">Public verifier view</div>
              <div className="scope-sub">
                This is exactly what marketplaces, principals, and on-chain
                contracts see. Nothing more.
              </div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>
            verifier · marketplace.aurora.xyz
          </div>
        </div>

        <div className="verifier-hero">
          <Eyebrow>AgentProof certificate</Eyebrow>
          <h2 style={{ marginTop: 12, fontSize: 34 }}>
            Verified claims, hidden data.
          </h2>
          <p
            style={{
              marginTop: 10,
              color: "var(--fg-2)",
              maxWidth: 620,
              fontSize: 14.5,
            }}
          >
            A signed bundle of public thresholds proven over a private agent
            vault. Sensitive fields are not present — not encrypted, just{" "}
            <em style={{ color: "var(--fg-1)", fontStyle: "normal" }}>
              not there.
            </em>
          </p>
        </div>

        <div className="cert">
          <div className="cert-band">
            <div className="cert-band-left">
              <VerifiedBadge size="md" />
              <div>
                <div className="cert-band-eyebrow mono">
                  AGENTPROOF · {revoked ? "REVOKED" : "VERIFIED"}
                </div>
                <div className="cert-band-name">{agent.name}</div>
                <div className="cert-band-cat">
                  {AGENT_CATEGORIES_LABEL[agent.category] ?? ""}
                </div>
              </div>
            </div>
            <div className="cert-band-right">
              <div className="cert-meta-row">
                <span className="cert-meta-k mono">issued</span>
                <span className="cert-meta-v mono">{issuedStr}</span>
              </div>
              <div className="cert-meta-row">
                <span className="cert-meta-k mono">expires</span>
                <span className="cert-meta-v mono">{expiresStr}</span>
              </div>
              <div className="cert-meta-row">
                <span className="cert-meta-k mono">issuer</span>
                <span className="cert-meta-v mono">
                  {verification.issuerId ?? "—"}
                </span>
              </div>
              <div className="cert-meta-row">
                <span className="cert-meta-k mono">circuit</span>
                <span className="cert-meta-v mono">groth16 · rev-04</span>
              </div>
            </div>
          </div>

          <div className="cert-body">
            <div>
              <div className="cert-h">
                <Icon name="check-circle" size={14} />
                <span>Proven claims</span>
                <PrivacyTag kind="public" />
              </div>
              <div className="flex-col" style={{ gap: 8 }}>
                <Claim
                  field="completedTasks"
                  op="≥"
                  value={verification.completedTasksGte}
                />
                <Claim
                  field="successRate"
                  op="≥"
                  value={`${verification.successRateGte}%`}
                />
                <Claim
                  field="safetyScore"
                  op="≥"
                  value={verification.safetyScoreGte}
                />
                <Claim
                  field="activeSlashes"
                  op="=="
                  value={verification.noActiveSlashes ? "0" : "any"}
                />
              </div>
              {revoked && (
                <div
                  className="proof-receipt"
                  style={{
                    marginTop: 14,
                    background: "oklch(0.30 0.06 25 / 0.18)",
                    borderColor: "oklch(0.72 0.18 25 / 0.4)",
                    color: "var(--danger)",
                  }}
                >
                  <Icon name="flag" size={12} />
                  <span className="mono">
                    Verification revoked — claims no longer valid.
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="cert-h">
                <Icon name="eye-off" size={14} />
                <span>Not revealed</span>
                <PrivacyTag kind="private" />
              </div>
              <div className="cert-hidden-list">
                {[
                  { k: "completedTasks", l: "exact value sealed" },
                  { k: "successfulTasks", l: "exact value sealed" },
                  { k: "safetyScore", l: "exact value sealed" },
                  { k: "clients", l: "identities not disclosed" },
                  { k: "prompts", l: "logs withheld" },
                  { k: "datasets", l: "not disclosed" },
                  { k: "earnings", l: "amounts withheld" },
                  { k: "failureDetails", l: "not disclosed" },
                ].map((row) => (
                  <div key={row.k} className="cert-hidden-row">
                    <span className="mono">{row.k}</span>
                    <HiddenValue label={row.l} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cert-foot">
            <div>
              <div className="cert-foot-k mono">proof_id</div>
              <div className="cert-foot-v mono">0x7c91f4a8b2…6d319</div>
            </div>
            <div>
              <div className="cert-foot-k mono">anchored_tx</div>
              <div className="cert-foot-v mono">
                midnight-testnet:0xae72…91c4
              </div>
            </div>
            <div>
              <div className="cert-foot-k mono">signature</div>
              <div className="cert-foot-v mono">ed25519:0x39bc…f02a</div>
            </div>
            <div>
              <div className="cert-foot-k mono">size · time</div>
              <div className="cert-foot-v mono">2.4 KB · 1.24s</div>
            </div>
          </div>

          <div className="cert-watermark" aria-hidden>
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              <circle
                cx="110"
                cy="110"
                r="100"
                stroke="var(--verified)"
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle
                cx="110"
                cy="110"
                r="80"
                stroke="var(--verified)"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
              <defs>
                <path
                  id="wmpath"
                  d="M 110,110 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0"
                />
              </defs>
              <text>
                <textPath
                  href="#wmpath"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--verified)"
                  fillOpacity="0.32"
                  letterSpacing="3"
                >
                  AGENTPROOF · VERIFIED · MIDNIGHT · AGENTPROOF · VERIFIED · MIDNIGHT ·
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="verifier-actions card">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Independently verify on-chain
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4 }}>
              Anyone can run{" "}
              <span className="mono" style={{ color: "var(--accent)" }}>
                agentproof verify 0x7c91…6d319
              </span>{" "}
              to reproduce the check.
            </div>
          </div>
          <div className="flex" style={{ gap: 10 }}>
            <Link href={`/agent/${id}/proof`} className="btn btn-ghost">
              <Icon name="arrow-left" size={14} />
              Back to proof
            </Link>
            {!revoked && (
              <button
                className="btn btn-outline"
                style={{ borderColor: "oklch(0.72 0.18 25 / 0.4)", color: "var(--danger)" }}
                onClick={onRevoke}
                type="button"
              >
                <Icon name="flag" size={14} />
                Revoke
              </button>
            )}
            <Link href="/marketplace" className="btn btn-accent">
              Open marketplace
              <Icon name="arrow-right" size={14} className="arrow" />
            </Link>
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-head">
            <div className="card-title">
              <Icon name="file" size={14} />
              Recent verifications of this proof
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>
              public log
            </span>
          </div>
          <table className="task-table">
            <thead>
              <tr>
                <th>Verifier</th>
                <th>Outcome</th>
                <th>Claims checked</th>
                <th>Latency</th>
                <th>At</th>
              </tr>
            </thead>
            <tbody>
              {[
                { v: "marketplace.aurora.xyz", o: "pass", c: "4 / 4", l: "38 ms", t: "just now" },
                { v: "principal.nexus.dao", o: "pass", c: "4 / 4", l: "42 ms", t: "2 min ago" },
                { v: "audit-router.midnight", o: "pass", c: "4 / 4", l: "31 ms", t: "14 min ago" },
                { v: "verifier.riftworks.io", o: "pass", c: "3 / 4", l: "40 ms", t: "1 hr ago" },
                { v: "principal.tradesync", o: "pass", c: "2 / 4", l: "29 ms", t: "4 hr ago" },
              ].map((r) => (
                <tr key={r.v}>
                  <td className="mono">{r.v}</td>
                  <td>
                    <span className="task-out success">
                      <Icon name="check" size={11} /> {r.o}
                    </span>
                  </td>
                  <td className="mono">{r.c}</td>
                  <td className="mono">{r.l}</td>
                  <td className="mono dim">{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
