// Build the MidnightProviders bundle that midnight-js-contracts needs to
// deploy or call a contract. Browser-only — do not import from a server
// component. The wallet pieces come from the connected Lace API.

"use client";

import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";

import { MIDNIGHT_CONFIG } from "./config";
import type { AgentProofPrivateState } from "./witnessDriver";

/**
 * The single private-state slot we use. Maps to the bigint Field agent IDs
 * inside `AgentProofPrivateState.reputation`.
 */
export const AGENTPROOF_PRIVATE_STATE_ID = "agentproof" as const;
export type AgentProofPrivateStateId = typeof AGENTPROOF_PRIVATE_STATE_ID;

export type AgentProofCircuitId =
  | "registerAgent"
  | "submitVerification"
  | "revokeVerification";

export type AgentProofProviders = MidnightProviders<
  AgentProofCircuitId,
  AgentProofPrivateStateId,
  AgentProofPrivateState
>;

/**
 * Build the four non-wallet providers. Wallet + midnight providers attach
 * separately once Lace is connected because they depend on the live wallet
 * API.
 *
 * `password` and `accountId` are needed by the level private-state provider
 * to scope and encrypt the IndexedDB store per Lace account.
 */
export function buildBaseProviders(opts: {
  accountId: string;
  password: string;
}) {
  const zkConfigProvider = new FetchZkConfigProvider<AgentProofCircuitId>(
    MIDNIGHT_CONFIG.zkArtifactBaseUri,
  );

  const proofProvider = httpClientProofProvider<AgentProofCircuitId>(
    MIDNIGHT_CONFIG.proofServerUri,
    zkConfigProvider,
  );

  const publicDataProvider = indexerPublicDataProvider(
    MIDNIGHT_CONFIG.indexerUri,
    MIDNIGHT_CONFIG.indexerWsUri,
  );

  const privateStateProvider = levelPrivateStateProvider<
    AgentProofPrivateStateId,
    AgentProofPrivateState
  >({
    accountId: opts.accountId,
    privateStoragePasswordProvider: async () => opts.password,
  });

  return {
    proofProvider,
    publicDataProvider,
    zkConfigProvider,
    privateStateProvider,
  };
}
