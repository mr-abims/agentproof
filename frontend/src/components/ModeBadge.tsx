"use client";

import { useEffect, useState } from "react";

import {
  type AdapterMode,
  getEffectiveMode,
  getRequestedMode,
} from "@/lib/mode";

export function ModeBadge() {
  // Hydrate from client-only env reads so SSR + CSR agree.
  const [mode, setMode] = useState<AdapterMode>("mock");
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const requested = getRequestedMode();
    const effective = getEffectiveMode();
    setMode(effective);
    setDegraded(requested === "real" && effective === "mock");
  }, []);

  const label =
    mode === "real" ? "midnight-testnet" : "mock · demo";
  const dotColor = mode === "real" ? "var(--verified)" : "var(--accent)";

  return (
    <div
      className="topnav-pill"
      title={
        degraded
          ? "Requested real mode but NEXT_PUBLIC_CONTRACT_ADDRESS / proof server not configured. See PHASE4_SETUP.md."
          : mode === "real"
            ? "Talking to deployed contract via Midnight testnet"
            : "In-memory demo. Set NEXT_PUBLIC_AGENTPROOF_MODE=real after wiring Phase 4."
      }
    >
      <span className="dot" style={{ background: dotColor }} />
      {label}
      {degraded && (
        <span style={{ color: "var(--warn)", marginLeft: 4 }}>·degraded</span>
      )}
    </div>
  );
}
