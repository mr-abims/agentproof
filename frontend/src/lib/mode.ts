// Adapter-mode selection. Driven by NEXT_PUBLIC_AGENTPROOF_MODE.
//
//   mock  — in-memory MockContractClient (default; powers the demo)
//   real  — MidnightContractClient against the configured testnet contract
//
// The demo paths (register, submit, revoke) always call through the same
// `useClient()` hook from store.ts, which currently returns the mock. Once
// MidnightContractClient's circuit calls are wired (see PHASE4_SETUP.md),
// store.ts can switch on this flag.

import { isMidnightConfigured } from "./midnight/config";

export type AdapterMode = "mock" | "real";

export function getRequestedMode(): AdapterMode {
  const v = process.env.NEXT_PUBLIC_AGENTPROOF_MODE;
  return v === "real" ? "real" : "mock";
}

/**
 * What actually runs. If the env requested "real" but the Midnight config
 * is incomplete (no contract address, no proof server, etc.), we degrade
 * to mock so the demo doesn't break.
 */
export function getEffectiveMode(): AdapterMode {
  const requested = getRequestedMode();
  if (requested === "real" && !isMidnightConfigured()) return "mock";
  return requested;
}
