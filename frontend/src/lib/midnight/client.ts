// MidnightContractClient — same shape as MockContractClient, but routes
// calls through midnight-js against a deployed Compact contract.
//
// Status: scaffolding. The provider stack, witness driver, field encoding,
// and method signatures are all in place. The actual `findDeployedContract`
// + `callTx.<circuit>` wiring is bracketed in clearly-marked TODO blocks
// because it requires a running proof server, a funded Lace wallet, and a
// deployed contract address to validate end-to-end. See PHASE4_SETUP.md.

"use client";

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

import { isMidnightConfigured } from "./config";
import { encodeAgentId } from "./field";
import { buildBaseProviders } from "./providers";
import type {
  AgentId,
  AgentProfile,
  PrivateReputationData,
} from "@/types/agent";
import type {
  PublicProofThresholds,
  PublicVerificationResult,
} from "@/types/proof";

export type MidnightClientDeps = {
  wallet: ConnectedAPI;
  coinPublicKey: string;
  password: string;
};

export class MidnightContractClient {
  private readonly base;

  constructor(private readonly deps: MidnightClientDeps) {
    if (!isMidnightConfigured()) {
      throw new Error(
        "Midnight not configured: NEXT_PUBLIC_CONTRACT_ADDRESS, NEXT_PUBLIC_INDEXER_URI, NEXT_PUBLIC_PROOF_SERVER_URI must be set. See PHASE4_SETUP.md.",
      );
    }
    this.base = buildBaseProviders({
      accountId: deps.coinPublicKey,
      password: deps.password,
    });
  }

  // ---- Reads (work without callTx) ---------------------------------------

  async getAgent(agentId: AgentId): Promise<AgentProfile | null> {
    const fieldId = await encodeAgentId(agentId);
    // TODO: call this.base.publicDataProvider.queryContractState(...)
    // then `ledger(state).agents.lookup(fieldId)`.
    void fieldId;
    throw notWired("getAgent");
  }

  async getVerification(
    agentId: AgentId,
  ): Promise<PublicVerificationResult | null> {
    const fieldId = await encodeAgentId(agentId);
    // TODO: same as getAgent, but reading `verifications.lookup(fieldId)`.
    void fieldId;
    throw notWired("getVerification");
  }

  async listAgents(): Promise<AgentProfile[]> {
    // TODO: iterate Ledger.agents via the public data provider.
    throw notWired("listAgents");
  }

  // ---- Writes (need callTx + proof server) ------------------------------

  async registerAgent(profile: AgentProfile): Promise<AgentProfile> {
    const fieldId = await encodeAgentId(profile.agentId);
    // TODO (Phase 4 browser path — not used; CLI handles this in real mode):
    //   const found = await findDeployedContract({
    //     compiledContract: <wrap @agentproof/contracts Contract>,
    //     contractAddress: MIDNIGHT_CONFIG.contractAddress,
    //     ...providers + walletProvider + midnightProvider
    //   });
    //   await found.callTx.registerAgent(fieldId, profile.category);
    // Issuer identity is derived from the witness `issuerSecret`, not passed.
    void fieldId;
    throw notWired("registerAgent");
  }

  async submitVerification(
    agentId: AgentId,
    thresholds: PublicProofThresholds,
  ): Promise<PublicVerificationResult> {
    const fieldId = await encodeAgentId(agentId);
    // TODO: callTx.submitVerification(fieldId, minCompletedTasks, minSuccessRate,
    //   minSafetyScore, requireNoActiveSlashes)
    // Note: contract no longer takes verifiedAt — block timestamp via indexer.
    void fieldId;
    void thresholds;
    throw notWired("submitVerification");
  }

  async revokeVerification(
    agentId: AgentId,
  ): Promise<PublicVerificationResult> {
    const fieldId = await encodeAgentId(agentId);
    void fieldId;
    throw notWired("revokeVerification");
  }

  // ---- Private-state seeding --------------------------------------------

  /**
   * Push a private reputation entry into the wallet's private state. This is
   * what the witness driver reads at proof-generation time.
   */
  async putPrivateReputation(
    agentId: AgentId,
    rep: PrivateReputationData,
  ): Promise<void> {
    const fieldId = await encodeAgentId(agentId);
    void fieldId;
    void rep;
    // TODO: this.base.buildPrivateStateProvider(deps.coinPublicKey, deps.password)
    //   .set(AGENTPROOF_PRIVATE_STATE_ID, { reputation: { [fieldId.toString()]: rep } });
    throw notWired("putPrivateReputation");
  }

  // For interface parity with MockContractClient. Real reads come from the
  // wallet's private store, not from this object.
  getPrivateReputation(_agentId: AgentId): PrivateReputationData | null {
    return null;
  }
}

function notWired(op: string): Error {
  return new Error(
    `Midnight ${op} not yet wired. Finish the integration in lib/midnight/client.ts after running the steps in PHASE4_SETUP.md.`,
  );
}
