"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";

import { CircuitStage } from "@/components/CircuitStage";
import { Icon } from "@/components/Icon";
import {
  Eyebrow,
  HiddenValue,
  PrivacyTag,
  Spinner,
} from "@/components/Shared";
import { demoThresholds } from "@/lib/mockAgentData";
import { useClient, withNotify } from "@/lib/store";

type Phase = "idle" | "gen" | "done" | "failed";

type LogCls = "c" | "k" | "p" | "n";
type LogLine = { at: number; msg: string; cls: LogCls };

type ClaimSpec = {
  id: string;
  field: string;
  op: "≥" | "==" | "≤";
  target: number;
  cur: number;
  unit: string;
  on: boolean;
  passes: boolean;
};

const CLAIM_ORDER: Record<string, number> = {
  c1: 22,
  c2: 34,
  c3: 46,
  c4: 58,
  c5: 70,
};

export default function ProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = useClient();
  const router = useRouter();

  const agent = client.getAgent(id);
  const rep = client.getPrivateReputation(id);
  const thresholds = demoThresholds[id] ?? demoThresholds.agent_001!;

  // Initial claim definitions based on real reputation + thresholds.
  const initialClaims: ClaimSpec[] = useMemo(() => {
    if (!rep) return [];
    const succPct = (rep.successfulTasks * 100) / Math.max(1, rep.completedTasks);
    return [
      {
        id: "c1",
        field: "completedTasks",
        op: "≥",
        target: thresholds.minCompletedTasks,
        cur: rep.completedTasks,
        unit: "",
        on: true,
        passes: rep.completedTasks >= thresholds.minCompletedTasks,
      },
      {
        id: "c2",
        field: "successRate",
        op: "≥",
        target: thresholds.minSuccessRate,
        cur: Math.round(succPct * 10) / 10,
        unit: "%",
        on: true,
        passes:
          rep.successfulTasks * 100 >=
          rep.completedTasks * thresholds.minSuccessRate,
      },
      {
        id: "c3",
        field: "safetyScore",
        op: "≥",
        target: thresholds.minSafetyScore,
        cur: rep.safetyScore,
        unit: "",
        on: true,
        passes: rep.safetyScore >= thresholds.minSafetyScore,
      },
      {
        id: "c4",
        field: "activeSlashes",
        op: "==",
        target: 0,
        cur: rep.activeSlashes,
        unit: "",
        on: true,
        passes: !thresholds.requireNoActiveSlashes || rep.activeSlashes === 0,
      },
      {
        id: "c5",
        field: "avgResponseTime",
        op: "≤",
        target: 5,
        cur: 2.4,
        unit: "s",
        on: false,
        passes: true,
      },
    ];
  }, [rep, thresholds]);

  const [claims, setClaims] = useState<ClaimSpec[]>(initialClaims);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [failedClaimId, setFailedClaimId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setClaims(initialClaims);
  }, [initialClaims]);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  if (!agent || !rep) {
    return (
      <div className="container" style={{ padding: "60px 28px" }}>
        <Eyebrow>Not found</Eyebrow>
        <h2 style={{ marginTop: 12 }}>No agent matches this id.</h2>
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

  const activeClaims = claims.filter((c) => c.on);
  const firstFailingActive = activeClaims.find((c) => !c.passes) ?? null;

  const toggle = (cid: string) => {
    if (phase === "gen") return;
    setClaims((cs) =>
      cs.map((c) => (c.id === cid ? { ...c, on: !c.on } : c)),
    );
  };

  const start = () => {
    if (phase === "gen" || activeClaims.length === 0) return;
    setPhase("gen");
    setProgress(0);
    setLogs([]);
    setFailedClaimId(null);

    const willFail = firstFailingActive;
    const failPoint = willFail ? CLAIM_ORDER[willFail.id] ?? 50 : null;
    const duration = willFail ? 1400 : 2600;

    const baseScript: LogLine[] = [
      { at: 0, msg: "init  · loading enclave attestation", cls: "c" },
      { at: 4, msg: "load  · private vault decrypted (AES-256-GCM)", cls: "c" },
      {
        at: 12,
        msg: `check · ${rep.completedTasks} task records consistent`,
        cls: "k",
      },
      {
        at: 22,
        msg: claims[0]
          ? `pred  · ${claims[0].field} ${claims[0].op} ${claims[0].target}  →  ${claims[0].passes ? "satisfied" : "FAIL"}`
          : "pred  · skipped",
        cls: claims[0]?.passes ? "p" : "n",
      },
      {
        at: 34,
        msg: claims[1]
          ? `pred  · ${claims[1].field} ${claims[1].op} ${claims[1].target}  →  ${claims[1].passes ? "satisfied" : "FAIL"}`
          : "pred  · skipped",
        cls: claims[1]?.passes ? "p" : "n",
      },
      {
        at: 46,
        msg: claims[2]
          ? `pred  · ${claims[2].field} ${claims[2].op} ${claims[2].target}  →  ${claims[2].passes ? "satisfied" : "FAIL"}`
          : "pred  · skipped",
        cls: claims[2]?.passes ? "p" : "n",
      },
      {
        at: 58,
        msg: claims[3]
          ? `pred  · ${claims[3].field} ${claims[3].op} ${claims[3].target}  →  ${claims[3].passes ? "satisfied" : "FAIL"}`
          : "pred  · skipped",
        cls: claims[3]?.passes ? "p" : "n",
      },
      {
        at: 68,
        msg: "circ  · compiling zk-snark over predicates",
        cls: "c",
      },
      { at: 78, msg: "circ  · groth16 witness gen · 32k constraints", cls: "c" },
      { at: 86, msg: "sign  · proof_id 0x7c91f4…a319", cls: "k" },
      { at: 94, msg: "anchor· tx submitted to midnight-testnet", cls: "c" },
      { at: 100, msg: "done  · 1.24s · 2.4 KB", cls: "p" },
    ];

    const failScript: LogLine[] = willFail
      ? [
          ...baseScript.filter((l) => l.at <= (failPoint ?? 0)),
          {
            at: (failPoint ?? 0) + 4,
            msg: `abort · ${willFail.field} ${willFail.op} ${willFail.target} not satisfied — current ${willFail.cur}${willFail.unit}`,
            cls: "n",
          },
          {
            at: (failPoint ?? 0) + 8,
            msg: "abort · no transaction broadcast",
            cls: "n",
          },
        ]
      : [];

    const script = willFail ? failScript : baseScript;
    const cap = willFail ? (failPoint ?? 0) + 10 : 100;

    const startedAt = Date.now();
    timer.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const p = Math.min(cap, (elapsed / duration) * 100);
      setProgress(p);
      setLogs((prev) => {
        const next = script.filter((s) => s.at <= p);
        return next.length === prev.length ? prev : next;
      });

      if (p >= cap) {
        if (timer.current) clearInterval(timer.current);
        if (willFail) {
          setPhase("failed");
          setFailedClaimId(willFail.id);
        } else {
          setPhase("done");
          withNotify(() => client.submitVerification(id, thresholds));
        }
      }
    }, 32);
  };

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setPhase("idle");
    setProgress(0);
    setLogs([]);
    setFailedClaimId(null);
  };

  return (
    <div className="page-fade">
      <div className="container" style={{ padding: "32px 28px 80px" }}>
        <div className="proof-header">
          <Link href={`/agent/${id}`} className="btn btn-ghost">
            <Icon name="arrow-left" size={14} />
            Back to dashboard
          </Link>
          <div className="proof-breadcrumb mono">
            agent / <span style={{ color: "var(--fg-1)" }}>{agent.name}</span> /{" "}
            <span style={{ color: "var(--accent)" }}>generate proof</span>
          </div>
        </div>

        <div className="proof-hero">
          <Eyebrow>Proof generation</Eyebrow>
          <h2 style={{ marginTop: 12, fontSize: 34 }}>
            Bind private data to public thresholds.
          </h2>
          <p
            style={{
              marginTop: 10,
              color: "var(--fg-2)",
              maxWidth: 620,
              fontSize: 14.5,
            }}
          >
            Pick which claims to prove. The circuit compiles locally inside the
            enclave — your raw values never leave this device.
          </p>
        </div>

        <div className="proof-stage">
          {/* LEFT — private inputs */}
          <div className="card proof-col proof-private">
            <div className="card-head">
              <div className="card-title">
                <Icon name="database" size={14} />
                Private inputs
              </div>
              <PrivacyTag kind="private" />
            </div>
            <div className="proof-side-sub">Local · enclave-sealed</div>

            <div className="proof-inputs">
              {INPUT_ROWS({
                completedTasks: rep.completedTasks,
                successfulTasks: rep.successfulTasks,
                successRateDisplay: formatSuccessRate(rep),
                safetyScore: rep.safetyScore,
                activeSlashes: rep.activeSlashes,
                clientsCount: rep.clients.length,
              }).map((row) => {
                const usedByActive =
                  !row.hidden &&
                  row.lit &&
                  row.lit.some((cid) =>
                    claims.find((c) => c.id === cid && c.on),
                  );
                return (
                  <div
                    key={row.k}
                    className={`proof-input ${usedByActive && phase !== "idle" ? "active" : ""}`}
                  >
                    <div className="proof-input-k">
                      <Icon
                        name={row.hidden ? "lock" : "tag"}
                        size={11}
                        style={{
                          color: row.hidden
                            ? "var(--fg-3)"
                            : "var(--accent)",
                        }}
                      />
                      <span className="mono">{row.k}</span>
                    </div>
                    <div className="proof-input-v">
                      {row.hidden ? (
                        <HiddenValue label={row.hiddenLabel} />
                      ) : (
                        <span
                          className="mono"
                          style={{
                            color: usedByActive
                              ? "var(--accent)"
                              : "var(--fg-1)",
                          }}
                        >
                          {row.v}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="enclave-note">
              <Icon name="cpu" size={12} />
              <span>Midnight TEE · session 0x91e2…f4a8</span>
            </div>
          </div>

          {/* CENTER — circuit + action + log */}
          <div className="proof-center">
            <CircuitStage phase={phase} progress={progress} />

            <div className="proof-action">
              {phase === "idle" && (
                <button
                  className="btn btn-accent"
                  onClick={start}
                  disabled={activeClaims.length === 0}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px",
                  }}
                >
                  <Icon name="sparkle" size={14} />
                  Generate proof
                </button>
              )}
              {phase === "gen" && (
                <button
                  className="btn btn-outline"
                  disabled
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px",
                  }}
                >
                  <Spinner />
                  Generating · {Math.floor(progress)}%
                </button>
              )}
              {phase === "done" && (
                <button
                  className="btn btn-accent"
                  onClick={() => router.push(`/verify/${id}`)}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px",
                  }}
                >
                  Submit verification
                  <Icon name="arrow-right" size={14} className="arrow" />
                </button>
              )}
              {phase === "failed" && (
                <button
                  className="btn btn-ghost"
                  onClick={reset}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px",
                  }}
                >
                  <Icon name="arrow-left" size={14} />
                  Try with different claims
                </button>
              )}
            </div>

            <ProofLog logs={logs} />
          </div>

          {/* RIGHT — public claims */}
          <div className="card proof-col proof-public">
            <div className="card-head">
              <div className="card-title">
                <Icon name="broadcast" size={14} />
                Public threshold claims
              </div>
              <PrivacyTag kind="public" />
            </div>
            <div className="proof-side-sub">
              Visible to anyone with proof_id
            </div>

            <div className="proof-claims">
              {claims.map((c) => (
                <ClaimRow
                  key={c.id}
                  c={c}
                  phase={phase}
                  progress={progress}
                  failedClaimId={failedClaimId}
                  toggle={() => toggle(c.id)}
                />
              ))}
            </div>

            {phase === "done" && (
              <div className="proof-done">
                <div className="proof-done-head">
                  <Icon name="check-circle" size={14} />
                  <span>Proof generated</span>
                </div>
                <div className="proof-done-grid">
                  <div>
                    <div className="proof-done-k">proof_id</div>
                    <div className="proof-done-v mono">0x7c91f4…a319</div>
                  </div>
                  <div>
                    <div className="proof-done-k">size</div>
                    <div className="proof-done-v mono">2.4 KB</div>
                  </div>
                  <div>
                    <div className="proof-done-k">duration</div>
                    <div className="proof-done-v mono">1.24s</div>
                  </div>
                  <div>
                    <div className="proof-done-k">anchored</div>
                    <div className="proof-done-v mono">midnight-testnet</div>
                  </div>
                </div>
              </div>
            )}

            {phase === "failed" && failedClaimId && (
              <div
                className="proof-done"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.72 0.18 25 / 0.14), transparent)",
                  borderColor: "oklch(0.72 0.18 25 / 0.4)",
                }}
              >
                <div
                  className="proof-done-head"
                  style={{ color: "var(--danger)" }}
                >
                  <Icon name="x-circle" size={14} />
                  <span>Proof rejected</span>
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--fg-2)",
                    marginTop: 4,
                  }}
                >
                  At least one threshold was not satisfied by the agent&rsquo;s
                  private data. The Compact circuit aborts on failure, so no
                  transaction is broadcast and no record is written on-chain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------

function ClaimRow({
  c,
  phase,
  progress,
  failedClaimId,
  toggle,
}: {
  c: ClaimSpec;
  phase: Phase;
  progress: number;
  failedClaimId: string | null;
  toggle: () => void;
}) {
  const reached = phase !== "idle" && progress >= (CLAIM_ORDER[c.id] ?? 100);
  const proven = phase === "done" && c.on;
  const failedHere = phase === "failed" && c.id === failedClaimId;

  const stateClass = !c.on
    ? "off"
    : failedHere
      ? "unmet"
      : proven
        ? "proven"
        : reached && c.on
          ? "reached"
          : "";

  return (
    <div className={`claim-row ${stateClass}`}>
      <button
        className={`claim-toggle ${c.on ? "on" : ""}`}
        onClick={toggle}
        aria-label="Toggle claim"
        disabled={phase === "gen" || phase === "done"}
        type="button"
      >
        <span className="claim-toggle-knob" />
      </button>
      <div className="claim-row-expr">
        <span className="claim-field mono">{c.field}</span>
        <span className="claim-op mono">{c.op}</span>
        <span className="claim-value mono">
          {c.target}
          {c.unit}
        </span>
      </div>
      <div className="claim-row-status">
        {!c.on && (
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--fg-3)" }}
          >
            SKIPPED
          </span>
        )}
        {c.on && phase === "idle" && (
          c.passes ? (
            <span className="claim-pill ready">
              <Icon name="circle" size={9} />
              READY
            </span>
          ) : (
            <span className="claim-pill no">
              <Icon name="x" size={9} />
              FAILS
            </span>
          )
        )}
        {c.on && phase === "gen" && !reached && (
          <span className="claim-pill pending">
            <Spinner size={9} />
            PROVING
          </span>
        )}
        {c.on && phase === "gen" && reached && (
          <span className="claim-pill ok">
            <Icon name="check" size={9} />
            PROVEN
          </span>
        )}
        {c.on && phase === "done" && (
          <span className="claim-pill ok">
            <Icon name="check" size={9} />
            PROVEN
          </span>
        )}
        {c.on && phase === "failed" && failedHere && (
          <span className="claim-pill no">
            <Icon name="x" size={9} />
            FAILED
          </span>
        )}
        {c.on && phase === "failed" && !failedHere && (
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--fg-3)" }}
          >
            ABORTED
          </span>
        )}
      </div>
    </div>
  );
}

function ProofLog({ logs }: { logs: LogLine[] }) {
  if (logs.length === 0) {
    return (
      <div className="proof-log empty">
        <Icon name="cpu" size={12} />
        <span>Log will stream here when generation starts.</span>
      </div>
    );
  }
  return (
    <div className="proof-log">
      <div className="proof-log-head">
        <span className="mono">runtime.log</span>
        <span
          className="mono"
          style={{ color: "var(--fg-3)", marginLeft: "auto" }}
        >
          tail -f
        </span>
      </div>
      <div className="proof-log-body">
        {logs.map((l, i) => (
          <div key={`${i}-${l.at}`} className="proof-log-line">
            <span
              className="mono"
              style={{ color: "var(--fg-3)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`mono log-${l.cls}`}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Helpers ----------

type InputRow = {
  k: string;
  v?: string;
  hidden?: boolean;
  hiddenLabel?: string;
  lit?: string[];
};

function INPUT_ROWS(args: {
  completedTasks: number;
  successfulTasks: number;
  successRateDisplay: string;
  safetyScore: number;
  activeSlashes: number;
  clientsCount: number;
}): InputRow[] {
  return [
    { k: "completedTasks", v: String(args.completedTasks), lit: ["c1"] },
    { k: "successfulTasks", v: String(args.successfulTasks), lit: ["c2"] },
    { k: "successRate", v: args.successRateDisplay, lit: ["c2"] },
    { k: "safetyScore", v: String(args.safetyScore), lit: ["c3"] },
    { k: "activeSlashes", v: String(args.activeSlashes), lit: ["c4"] },
    { k: "avgResponseTime", v: "2.4s", lit: ["c5"] },
    { k: "clients", hidden: true, hiddenLabel: `${args.clientsCount} hidden` },
    { k: "prompts", hidden: true, hiddenLabel: "124 hidden" },
    { k: "datasets", hidden: true, hiddenLabel: "6 hidden" },
    { k: "earnings", hidden: true, hiddenLabel: "sealed" },
  ];
}

function formatSuccessRate(rep: {
  successfulTasks: number;
  completedTasks: number;
}): string {
  const pct = (rep.successfulTasks * 100) / Math.max(1, rep.completedTasks);
  return `${pct.toFixed(3)}%`;
}
