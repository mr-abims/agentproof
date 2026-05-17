// TypeScript implementation of the witnesses declared in
// contracts/src/agentproof.compact. Mirrors contracts/src/witnesses.ts but
// lives in the frontend so the private state can come from in-memory or
// IndexedDB rather than the contracts-package stub.

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type {
  Ledger,
  ReputationData,
  Witnesses,
} from "@agentproof/contracts";

/** Keyed by the bigint Field representation of the agent ID. */
export type AgentIdKey = string;

export type AgentProofPrivateState = {
  reputation: Record<AgentIdKey, ReputationData>;
  /** 32-byte issuer secret. See contracts/src/witnesses.ts. */
  issuerSecret: Uint8Array;
};

export const emptyPrivateState: AgentProofPrivateState = {
  reputation: {},
  issuerSecret: new Uint8Array(32),
};

export const witnesses: Witnesses<AgentProofPrivateState> = {
  getReputation: (
    ctx: WitnessContext<Ledger, AgentProofPrivateState>,
    agentId: bigint,
  ): [AgentProofPrivateState, ReputationData] => {
    const key = agentId.toString();
    const rep = ctx.privateState.reputation[key];
    if (!rep) {
      throw new Error(
        `agentproof witness: no private reputation data for agent ${key}`,
      );
    }
    return [ctx.privateState, rep];
  },

  issuerSecret: (
    ctx: WitnessContext<Ledger, AgentProofPrivateState>,
  ): [AgentProofPrivateState, Uint8Array] => {
    const secret = ctx.privateState.issuerSecret;
    if (!secret || secret.length !== 32) {
      throw new Error(
        "agentproof witness: issuerSecret must be a 32-byte Uint8Array",
      );
    }
    return [ctx.privateState, secret];
  },
};
