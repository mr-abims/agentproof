"use client";

import Link from "next/link";
import { use } from "react";

import { Icon } from "@/components/Icon";
import {
  AgentAvatar,
  Eyebrow,
  HiddenValue,
  PrivacyTag,
  Stat,
} from "@/components/Shared";
import { evaluateProofPreview } from "@/lib/proofLogic";
import { demoThresholds } from "@/lib/mockAgentData";
import { useClient } from "@/lib/store";
import { AgentCategory } from "@/types/agent";

const CAT_LABEL: Record<AgentCategory, string> = {
  [AgentCategory.SECURITY]: "Smart Contract Security Agent",
  [AgentCategory.RESEARCH]: "Research Agent",
  [AgentCategory.TRADING]: "DeFi Research Agent",
  [AgentCategory.CUSTOMER_SUPPORT]: "Customer Support Agent",
  [AgentCategory.CODING]: "Coding Agent",
  [AgentCategory.GENERAL]: "General Agent",
};

type ProvableSpec = {
  field: string;
  op: "≥" | "==" | "≤";
  target: number;
  cur: number | string;
  unit?: string;
};

// Stretch claims that pad out the "what you can prove" grid for the demo.
const STRETCH_CLAIMS: ProvableSpec[] = [
  { field: "avgResponseTime", op: "≤", target: 5, cur: 2.4, unit: "s" },
  { field: "completedTasks", op: "≥", target: 50, cur: 0 }, // cur replaced per agent
];

export default function AgentDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = useClient();

  const agent = client.getAgent(id);
  const rep = client.getPrivateReputation(id);
  const verification = client.getVerification(id);
  const thresholds = demoThresholds[id] ?? demoThresholds.agent_001!;

  if (!agent || !rep) {
    return (
      <div className="container" style={{ padding: "60px 28px" }}>
        <Eyebrow>Not found</Eyebrow>
        <h2 style={{ marginTop: 12 }}>No agent matches this id.</h2>
        <p style={{ marginTop: 10, color: "var(--fg-2)" }}>
          <code className="mono">{id}</code> is not in the demo store.
        </p>
        <Link
          href="/marketplace"
          className="btn btn-ghost"
          style={{ marginTop: 20 }}
        >
          <Icon name="arrow-left" size={14} />
          Back to marketplace
        </Link>
      </div>
    );
  }

  const successRatePct = (rep.successfulTasks * 100) / Math.max(1, rep.completedTasks);
  const successRateDisplay = `${successRatePct.toFixed(1)}%`;

  const preview = evaluateProofPreview(rep, thresholds);

  const baseProvable: ProvableSpec[] = [
    { field: "completedTasks", op: "≥", target: thresholds.minCompletedTasks, cur: rep.completedTasks },
    { field: "successRate", op: "≥", target: thresholds.minSuccessRate, cur: Math.round(successRatePct * 10) / 10, unit: "%" },
    { field: "safetyScore", op: "≥", target: thresholds.minSafetyScore, cur: rep.safetyScore },
    { field: "activeSlashes", op: "==", target: 0, cur: rep.activeSlashes },
  ];
  const stretch = STRETCH_CLAIMS.map((c) =>
    c.field === "completedTasks" ? { ...c, cur: rep.completedTasks } : c,
  );
  const provables = [...baseProvable, ...stretch];

  const passes = (p: ProvableSpec): boolean => {
    const target = Number(p.target);
    const cur = Number(p.cur);
    if (p.op === "≥") return cur >= target;
    if (p.op === "≤") return cur <= target;
    return cur === target;
  };

  const verifiedTag = verification && !verification.revoked
    ? "verified"
    : verification?.revoked
      ? "warn"
      : "unverified";

  return (
    <div className="page-fade">
      <div
        className="container-wide"
        style={{ padding: "32px 28px 80px" }}
      >
        {/* Scope banner */}
        <div className="scope-banner">
          <div className="scope-banner-left">
            <div className="scope-eye">
              <Icon name="eye-off" size={14} />
            </div>
            <div>
              <div className="scope-title">Visible only to agent</div>
              <div className="scope-sub">
                This view shows raw reputation data. Nothing on this screen is
                exposed to verifiers, marketplaces, or principals.
              </div>
            </div>
          </div>
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--fg-3)" }}
          >
            session · 0x91e2…f4a8 · expires in 14:32
          </div>
        </div>

        <div className="dash-grid">
          {/* LEFT — profile + sidebar */}
          <aside className="dash-side">
            <div className="agent-profile-card">
              <div className="agent-profile-head">
                <AgentAvatar
                  seed={agent.name}
                  size={64}
                  status={verifiedTag === "verified" ? "verified" : "unverified"}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="agent-name">
                    {agent.name}
                    <PrivacyTag kind={verifiedTag} />
                  </div>
                  <div className="agent-cat">{CAT_LABEL[agent.category]}</div>
                  <div className="mono agent-id">agent_did:mn:{agent.agentId}</div>
                </div>
              </div>

              <div className="agent-profile-meta">
                <div>
                  <div className="meta-k">Registered</div>
                  <div className="meta-v mono">182 days ago</div>
                </div>
                <div>
                  <div className="meta-k">Runtime</div>
                  <div className="meta-v">Midnight TEE v3.1</div>
                </div>
                <div>
                  <div className="meta-k">Active proofs</div>
                  <div className="meta-v">
                    <span className="mono">
                      {verification && !verification.revoked ? 1 : 0}
                    </span>{" "}
                    · valid
                  </div>
                </div>
              </div>
            </div>

            <nav className="dash-nav">
              {SIDE_NAV.map((n) => (
                <button
                  key={n.k}
                  className={`dash-nav-item ${n.active ? "active" : ""}`}
                  type="button"
                >
                  <Icon name={n.icon} size={14} />
                  <span style={{ flex: 1, textAlign: "left" }}>{n.label}</span>
                  {n.count != null && (
                    <span className="dash-nav-count mono">{n.count}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="dash-side-foot">
              <Icon name="lock" size={12} />
              <span>
                End-to-end encrypted vault. Sealed by enclave attestation.
              </span>
            </div>
          </aside>

          {/* RIGHT — main */}
          <main className="dash-main">
            <div className="dash-header">
              <div>
                <Eyebrow>Private reputation</Eyebrow>
                <h2 style={{ marginTop: 10, fontSize: 30 }}>
                  Your work, your data.
                </h2>
                <p
                  style={{
                    marginTop: 8,
                    color: "var(--fg-2)",
                    fontSize: 14,
                    maxWidth: 580,
                  }}
                >
                  Below are the raw values your reputation is computed from.
                  Generate a proof to prove a threshold without revealing them.
                </p>
              </div>
              <Link
                href={`/agent/${id}/proof`}
                className="btn btn-accent"
              >
                <Icon name="sparkle" size={14} />
                Generate AgentProof
              </Link>
            </div>

            <div className="dash-stats">
              <div className="stat-card">
                <Stat
                  label="Completed tasks"
                  value={rep.completedTasks}
                  sub="↑ 4 last 30d"
                />
              </div>
              <div className="stat-card">
                <Stat
                  label="Success rate"
                  value={successRateDisplay}
                  sub={`${rep.successfulTasks} of ${rep.completedTasks} successful`}
                  accent={preview.checks.successRate ? "var(--verified)" : undefined}
                />
              </div>
              <div className="stat-card">
                <Stat
                  label="Safety score"
                  value={rep.safetyScore}
                  sub="Midnight Labs audit"
                  accent={preview.checks.safetyScore ? "var(--verified)" : undefined}
                />
              </div>
              <div className="stat-card">
                <Stat
                  label="Active slashes"
                  value={rep.activeSlashes}
                  sub={rep.activeSlashes === 0 ? "clean record" : "review required"}
                  accent={rep.activeSlashes === 0 ? "var(--verified)" : "var(--warn)"}
                />
              </div>
            </div>

            {/* Detailed records */}
            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-head">
                <div className="card-title">
                  <Icon name="database" size={14} />
                  Detailed records
                </div>
                <PrivacyTag kind="private" />
              </div>

              <div className="dash-detail-grid">
                <div>
                  <div className="dash-detail-h">Numerical reputation</div>
                  <div>
                    <KVRow k="completedTasks" v={String(rep.completedTasks)} mono />
                    <KVRow k="successfulTasks" v={String(rep.successfulTasks)} mono />
                    <KVRow
                      k="failedTasks"
                      v={String(rep.completedTasks - rep.successfulTasks)}
                      mono
                      dim
                    />
                    <KVRow
                      k="successRate"
                      v={successRateDisplay}
                      mono
                      verified={preview.checks.successRate}
                    />
                    <KVRow
                      k="safetyScore"
                      v={`${rep.safetyScore} / 100`}
                      mono
                      verified={preview.checks.safetyScore}
                    />
                    <KVRow
                      k="activeSlashes"
                      v={String(rep.activeSlashes)}
                      mono
                      verified={rep.activeSlashes === 0}
                    />
                  </div>
                </div>
                <div>
                  <div className="dash-detail-h">Sensitive associations</div>
                  <div>
                    <KVRow
                      k="clients"
                      hidden
                      hiddenLabel={`${rep.clients.length} hidden — encrypted at rest`}
                    />
                    <KVRow k="prompts" hidden hiddenLabel="124 entries" />
                    <KVRow k="datasets" hidden hiddenLabel="6 hidden" />
                    <KVRow
                      k="earningsBreakdown"
                      hidden
                      hiddenLabel="per-client encrypted"
                    />
                    <KVRow
                      k="failureDetails"
                      hidden
                      hiddenLabel={`${rep.completedTasks - rep.successfulTasks} entries · sealed`}
                    />
                    <KVRow k="signedReviews" hidden hiddenLabel="11 reviews" />
                  </div>
                </div>
              </div>
            </div>

            {/* Task history */}
            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-head">
                <div className="card-title">
                  <Icon name="file" size={14} />
                  Task history
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--fg-3)",
                      marginLeft: 6,
                    }}
                  >
                    (last 6 of {rep.completedTasks})
                  </span>
                </div>
                <PrivacyTag kind="private" />
              </div>

              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Client</th>
                    <th>Outcome</th>
                    <th>Safety</th>
                    <th>Earned</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {TASK_ROWS.map((r) => (
                    <tr key={r.id}>
                      <td className="mono" style={{ color: "var(--fg-1)" }}>
                        {r.id}
                      </td>
                      <td>
                        <span className="task-client">
                          <span className="client-dot" />
                          {r.client}
                        </span>
                      </td>
                      <td>
                        {r.out === "success" ? (
                          <span className="task-out success">
                            <Icon name="check" size={11} /> success
                          </span>
                        ) : (
                          <span className="task-out fail">
                            <Icon name="x" size={11} /> failed
                          </span>
                        )}
                      </td>
                      <td className="mono">{r.safety}</td>
                      <td className="mono">{r.paid}</td>
                      <td className="mono dim">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="dash-hidden-foot">
                <Icon name="lock" size={12} />
                <span className="mono">
                  {Math.max(0, rep.completedTasks - 6)} more rows · stays inside
                  the agent enclave
                </span>
              </div>
            </div>

            {/* What you can prove */}
            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-head">
                <div className="card-title">
                  <Icon name="shield-check" size={14} />
                  Claims you can prove right now
                </div>
                <PrivacyTag kind="public" />
              </div>

              <div className="prove-grid">
                {provables.map((p, i) => {
                  const ok = passes(p);
                  return (
                    <div
                      key={`${p.field}-${p.target}-${i}`}
                      className={`provable ${ok ? "ok" : "no"}`}
                    >
                      <div className="provable-expr mono">
                        <span>{p.field}</span>{" "}
                        <span className="op">{p.op}</span>{" "}
                        <span>
                          {p.target}
                          {p.unit ?? ""}
                        </span>
                      </div>
                      <div className="provable-side">
                        <span className="provable-cur mono">
                          your value · {p.cur}
                          {p.unit ?? ""}
                        </span>
                        {ok ? (
                          <span className="tag tag-verified">
                            <Icon name="check" size={10} />
                            READY
                          </span>
                        ) : (
                          <span className="tag tag-warn">
                            <Icon name="x" size={10} />
                            TOO LOW
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button className="btn btn-ghost" type="button">
                  Customize claims
                </button>
                <Link
                  href={`/agent/${id}/proof`}
                  className="btn btn-accent"
                >
                  Generate proof
                  <Icon name="arrow-right" size={14} className="arrow" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const SIDE_NAV: {
  k: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  active?: boolean;
  count?: number;
}[] = [
  { k: "overview", label: "Overview", icon: "home", active: true },
  { k: "history", label: "Task history", icon: "file", count: 17 },
  { k: "clients", label: "Clients", icon: "users", count: 3 },
  { k: "prompts", label: "Prompts & datasets", icon: "database", count: 130 },
  { k: "earnings", label: "Earnings", icon: "coin" },
  { k: "proofs", label: "Issued proofs", icon: "shield-check", count: 3 },
];

const TASK_ROWS = [
  { id: "#TX-0291", client: "Aurora Labs", out: "success", safety: 96, paid: "$4,800", date: "May 12" },
  { id: "#TX-0290", client: "Nexus DAO", out: "success", safety: 94, paid: "$3,200", date: "May 09" },
  { id: "#TX-0288", client: "Aurora Labs", out: "success", safety: 91, paid: "$5,600", date: "May 05" },
  { id: "#TX-0287", client: "Riftworks", out: "failed", safety: 78, paid: "$0", date: "Apr 28" },
  { id: "#TX-0285", client: "Nexus DAO", out: "success", safety: 95, paid: "$2,800", date: "Apr 22" },
  { id: "#TX-0283", client: "Aurora Labs", out: "success", safety: 93, paid: "$4,400", date: "Apr 18" },
] as const;

function KVRow({
  k,
  v,
  hidden,
  hiddenLabel,
  mono,
  dim,
  verified,
}: {
  k: string;
  v?: string;
  hidden?: boolean;
  hiddenLabel?: string;
  mono?: boolean;
  dim?: boolean;
  verified?: boolean;
}) {
  return (
    <div className="kv-row">
      <div className="kv-key">
        <Icon
          name={hidden ? "lock" : "tag"}
          size={11}
          style={{ color: hidden ? "var(--fg-3)" : "var(--accent)" }}
        />
        {k}
      </div>
      <div
        className={`kv-val ${mono ? "mono" : ""} ${dim ? "dim" : ""} ${verified ? "verified" : ""}`}
      >
        {hidden ? <HiddenValue label={hiddenLabel ?? "hidden"} /> : v}
      </div>
    </div>
  );
}
