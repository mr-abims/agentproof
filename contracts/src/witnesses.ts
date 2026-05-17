// TypeScript implementation of the witnesses declared in
// agentproof.compact. The Compact compiler emits typed bindings under
// src/managed/agentproof/contract/ when you run `npm run compile:compact`;
// only after that step does the import below resolve and this file typecheck.

import type {
  Ledger,
  ReputationData,
  Witnesses,
} from "./managed/agentproof/contract/index.js";
import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";

export type AgentId = string;

export type PrivateState = {
  reputation: Record<AgentId, ReputationData>;
  /**
   * 32-byte secret that authorises this DApp instance as a specific issuer.
   * The contract derives `persistentHash("agentproof:issuer:v1", secret)`
   * inside the proof and compares it to the public key stored at register
   * time. Without the matching secret no proof can be produced.
   */
  issuerSecret: Uint8Array;
};

const ZERO_ISSUER_SECRET = new Uint8Array(32);

export const emptyPrivateState: PrivateState = {
  reputation: {},
  issuerSecret: ZERO_ISSUER_SECRET,
};

export const witnesses: Witnesses<PrivateState> = {
  getReputation: (
    ctx: WitnessContext<Ledger, PrivateState>,
    agentId: bigint,
  ): [PrivateState, ReputationData] => {
    const key = agentId.toString();
    const rep = ctx.privateState.reputation[key];
    if (!rep) {
      throw new Error(
        `agentproof: no private reputation data for agent ${key}`,
      );
    }
    return [ctx.privateState, rep];
  },

  issuerSecret: (
    ctx: WitnessContext<Ledger, PrivateState>,
  ): [PrivateState, Uint8Array] => {
    const secret = ctx.privateState.issuerSecret;
    if (!secret || secret.length !== 32) {
      throw new Error(
        "agentproof: issuerSecret must be a 32-byte Uint8Array — " +
          "initialise it before deploying or calling any circuit.",
      );
    }
    return [ctx.privateState, secret];
  },
};
