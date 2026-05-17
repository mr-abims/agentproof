"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Icon } from "@/components/Icon";
import {
  AgentAvatar,
  Claim,
  Eyebrow,
  HiddenValue,
  PrivacyTag,
} from "@/components/Shared";
import { demoThresholds } from "@/lib/mockAgentData";
import { useClient } from "@/lib/store";
import { AgentCategory, type AgentProfile } from "@/types/agent";
import type { PublicVerificationResult } from "@/types/proof";

const CAT_LABEL: Record<AgentCategory, string> = {
  [AgentCategory.SECURITY]: "Smart Contract Security",
  [AgentCategory.RESEARCH]: "Research",
  [AgentCategory.TRADING]: "DeFi Research",
  [AgentCategory.CUSTOMER_SUPPORT]: "Customer Support",
  [AgentCategory.CODING]: "Coding",
  [AgentCategory.GENERAL]: "General",
};

const TAGLINE: Record<string, string> = {
  agent_001:
    "Adversarial review of Solidity / Move contracts before mainnet.",
  agent_002:
    "Market microstructure analysis with on-chain risk modeling.",
  agent_003:
    "Tier-1 triage with attached escalation policy + tone control.",
};

const PRICING: Record<string, string> = {
  agent_001: "$2.40 / 1k tokens",
  agent_002: "$0.90 / 1k tokens",
  agent_003: "$0.30 / 1k tokens",
};

type Filter = "all" | "verified" | "unverified";

type Row = {
  agent: AgentProfile;
  verification: PublicVerificationResult | null;
  status: "verified" | "unverified";
};

export default function MarketplacePage() {
  const client = useClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string>("agent_001");

  const rows: Row[] = useMemo(() => {
    return client.listAgents().map((agent) => {
      const v = client.getVerification(agent.agentId);
      const status: "verified" | "unverified" =
        v && !v.revoked ? "verified" : "unverified";
      return { agent, verification: v, status };
    });
  }, [client]);

  const verifiedCount = rows.filter((r) => r.status === "verified").length;
  const unverifiedCount = rows.length - verifiedCount;

  const visible = rows.filter((r) =>
    filter === "all" ? true : r.status === filter,
  );

  const active = rows.find((r) => r.agent.agentId === selected) ?? rows[0];

  return (
    <div className="page-fade">
      <div className="container-wide" style={{ padding: "32px 28px 80px" }}>
        <div className="market-hero">
          <div>
            <Eyebrow>Marketplace</Eyebrow>
            <h2 style={{ marginTop: 12, fontSize: 38 }}>
              Hire agents you can verify.
            </h2>
            <p
              style={{
                marginTop: 10,
                color: "var(--fg-2)",
                maxWidth: 580,
                fontSize: 14.5,
              }}
            >
              Every listing shows only the threshold claims an agent has
              proven. Browse without seeing private task records, prompts, or
              earnings.
            </p>
          </div>
          <div className="market-summary">
            <SummaryStat label="verified_agents" value={verifiedCount} />
            <SummaryStat label="proofs_this_week" value="14,302" />
            <SummaryStat label="active_slashes" value="3" />
          </div>
        </div>

        <div className="market-toolbar">
          <div className="market-tabs">
            {(
              [
                { k: "all" as const, label: "All agents", c: rows.length },
                { k: "verified" as const, label: "Verified", c: verifiedCount },
                {
                  k: "unverified" as const,
                  label: "Unverified",
                  c: unverifiedCount,
                },
              ] satisfies { k: Filter; label: string; c: number }[]
            ).map((t) => (
              <button
                key={t.k}
                className={`market-tab ${filter === t.k ? "active" : ""}`}
                onClick={() => setFilter(t.k)}
                type="button"
              >
                {t.label}
                <span className="mono">{t.c}</span>
              </button>
            ))}
          </div>
          <div className="market-tools">
            <div className="market-search">
              <Icon name="circle" size={12} />
              <input placeholder="Search agents, categories, claims…" />
              <span className="kbd">⌘K</span>
            </div>
            <select className="market-select mono" defaultValue="verified">
              <option value="verified">Sort: verification</option>
              <option value="name">Sort: name</option>
            </select>
          </div>
        </div>

        <div className="market-grid">
          <div className="market-cards">
            {visible.map((row, idx) => (
              <AgentCard
                key={row.agent.agentId}
                row={row}
                featured={idx === 0 && row.status === "verified"}
                selected={selected === row.agent.agentId}
                onSelect={() => setSelected(row.agent.agentId)}
              />
            ))}
            {visible.length === 0 && (
              <div className="card" style={{ color: "var(--fg-2)" }}>
                No agents match this filter.
              </div>
            )}
          </div>

          <aside className="market-detail">
            {active && <AgentDetail row={active} />}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---------- Pieces ----------

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="market-summary-stat">
      <div className="mono market-k">{label}</div>
      <div className="market-v">{value}</div>
    </div>
  );
}

function AgentCard({
  row,
  featured,
  selected,
  onSelect,
}: {
  row: Row;
  featured?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const verified = row.status === "verified";
  const v = row.verification;
  return (
    <button
      className={`agent-card ${selected ? "selected" : ""} ${verified ? "" : "unverified"}`}
      onClick={onSelect}
      type="button"
    >
      {featured && <div className="agent-featured mono">FEATURED</div>}
      <div className="agent-card-head">
        <AgentAvatar
          seed={row.agent.name}
          size={52}
          status={verified ? "verified" : "unverified"}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="agent-card-name">
            {row.agent.name}
            <PrivacyTag kind={verified ? "verified" : "unverified"} />
          </div>
          <div className="agent-card-cat">{CAT_LABEL[row.agent.category]}</div>
        </div>
      </div>
      <div className="agent-card-tag">
        {TAGLINE[row.agent.agentId] ?? "—"}
      </div>

      {verified && v ? (
        <div className="agent-card-claims">
          <div className="agent-card-claims-h mono">PROVEN CLAIMS</div>
          <div className="agent-card-claim-grid">
            <CardClaim>
              completedTasks ≥ {v.completedTasksGte}
            </CardClaim>
            <CardClaim>
              successRate ≥ {v.successRateGte}%
            </CardClaim>
            <CardClaim>
              safetyScore ≥ {v.safetyScoreGte}
            </CardClaim>
            <CardClaim>
              activeSlashes == {v.noActiveSlashes ? "0" : "any"}
            </CardClaim>
          </div>
        </div>
      ) : (
        <div className="agent-card-unverified-note">
          <Icon name="x-circle" size={14} />
          <div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--fg-1)",
                fontWeight: 500,
              }}
            >
              No AgentProof issued
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--fg-3)",
                marginTop: 2,
              }}
            >
              Hire at your own risk. Reputation unverified.
            </div>
          </div>
        </div>
      )}

      <div className="agent-card-foot">
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-2)" }}
        >
          {PRICING[row.agent.agentId] ?? "—"}
        </span>
        {verified && (
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--fg-3)" }}
          >
            proof · just now
          </span>
        )}
      </div>
    </button>
  );
}

function CardClaim({ children }: { children: React.ReactNode }) {
  return (
    <div className="agent-card-claim">
      <Icon name="check" size={10} />
      <span className="mono">{children}</span>
    </div>
  );
}

function AgentDetail({ row }: { row: Row }) {
  const verified = row.status === "verified";
  const v = row.verification;
  const t = demoThresholds[row.agent.agentId];

  return (
    <div className="card detail-card">
      <div className="detail-head">
        <AgentAvatar
          seed={row.agent.name}
          size={56}
          status={verified ? "verified" : "unverified"}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="detail-name">{row.agent.name}</div>
          <div className="detail-cat">{CAT_LABEL[row.agent.category]}</div>
        </div>
        <PrivacyTag kind={verified ? "verified" : "unverified"} />
      </div>

      <p className="detail-tagline">{TAGLINE[row.agent.agentId] ?? "—"}</p>

      {verified && v ? (
        <>
          <div className="detail-section">
            <div className="detail-h">
              <Icon name="shield-check" size={12} />
              <span>AgentProof certificate</span>
            </div>
            <div className="flex-col" style={{ gap: 6, marginTop: 10 }}>
              <Claim field="completedTasks" op="≥" value={v.completedTasksGte} />
              <Claim field="successRate" op="≥" value={`${v.successRateGte}%`} />
              <Claim field="safetyScore" op="≥" value={v.safetyScoreGte} />
              <Claim
                field="activeSlashes"
                op="=="
                value={v.noActiveSlashes ? "0" : "any"}
              />
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-h">
              <Icon name="eye-off" size={12} />
              <span>Not revealed</span>
            </div>
            <div className="detail-hidden">
              {[
                "exact_task_count",
                "client_identities",
                "prompt_logs",
                "earnings",
                "failure_details",
              ].map((k) => (
                <HiddenValue key={k} label={k} icon="lock" />
              ))}
            </div>
          </div>

          <div className="detail-section detail-meta">
            <div>
              <div className="detail-k mono">proof_id</div>
              <div className="detail-v mono">0x7c91…6d319</div>
            </div>
            <div>
              <div className="detail-k mono">issued</div>
              <div className="detail-v mono">just now</div>
            </div>
            <div>
              <div className="detail-k mono">pricing</div>
              <div className="detail-v mono">
                {PRICING[row.agent.agentId] ?? "—"}
              </div>
            </div>
            <div>
              <div className="detail-k mono">issuer</div>
              <div className="detail-v mono">
                {row.agent.issuerId ?? "—"}
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <Link
              href={`/verify/${row.agent.agentId}`}
              className="btn btn-accent"
            >
              <Icon name="shield-check" size={14} />
              View full certificate
            </Link>
            <button className="btn btn-outline" type="button">
              <Icon name="message" size={14} />
              Hire agent
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="detail-section unverified-warn">
            <div className="detail-h" style={{ color: "var(--warn)" }}>
              <Icon name="flag" size={12} />
              <span>No AgentProof issued</span>
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "var(--fg-2)",
              }}
            >
              This agent has not published any threshold proofs. Marketplaces
              typically restrict unverified agents to lower-stakes work.
            </p>
            {t && (
              <div
                style={{ marginTop: 14 }}
                className="flex items-center row-gap-2"
              >
                <PrivacyTag kind="warn">VERIFICATION RECOMMENDED</PrivacyTag>
              </div>
            )}
          </div>
          <div className="detail-actions">
            <button className="btn btn-outline" type="button">
              <Icon name="message" size={14} />
              Hire anyway
            </button>
            <Link
              href={`/agent/${row.agent.agentId}`}
              className="btn btn-ghost"
            >
              <Icon name="shield" size={14} />
              Get verified
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
