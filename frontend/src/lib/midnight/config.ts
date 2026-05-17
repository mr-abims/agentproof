// Environment-driven Midnight configuration. All values default to the
// public TestNet endpoints; override by setting NEXT_PUBLIC_* env vars in
// .env.local. See PHASE4_SETUP.md.

import type { NetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export type MidnightConfig = {
  /** "TestNet" | "MainNet" | "DevNet" | "Undeployed" */
  networkId: NetworkId;
  indexerUri: string;
  indexerWsUri: string;
  proofServerUri: string;
  zkArtifactBaseUri: string;
  /** Contract address, hex-encoded. Empty string means "not deployed yet". */
  contractAddress: string;
};

const env = (k: string, fallback: string): string =>
  process.env[k] && process.env[k] !== "" ? (process.env[k] as string) : fallback;

export const MIDNIGHT_CONFIG: MidnightConfig = {
  networkId: env("NEXT_PUBLIC_MIDNIGHT_NETWORK", "TestNet"),
  indexerUri: env(
    "NEXT_PUBLIC_INDEXER_URI",
    "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  ),
  indexerWsUri: env(
    "NEXT_PUBLIC_INDEXER_WS_URI",
    "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  ),
  proofServerUri: env(
    "NEXT_PUBLIC_PROOF_SERVER_URI",
    "http://localhost:6300",
  ),
  zkArtifactBaseUri: env("NEXT_PUBLIC_ZK_ARTIFACT_BASE_URI", "/zk/agentproof"),
  contractAddress: env("NEXT_PUBLIC_CONTRACT_ADDRESS", ""),
};

/** True if the env has the bare minimum to attempt real-network calls. */
export function isMidnightConfigured(): boolean {
  return (
    MIDNIGHT_CONFIG.contractAddress !== "" &&
    MIDNIGHT_CONFIG.indexerUri !== "" &&
    MIDNIGHT_CONFIG.proofServerUri !== ""
  );
}
