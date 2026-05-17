// In-memory client that simulates the AgentProof Compact contract.
// Mirrors the state transitions and threshold checks from
// contracts/src/agentproof.compact so the UI can demo end-to-end without
// the proof server. Swap this for a real Midnight client in Phase 4.

import { evaluateProofPreview } from "./proofLogic";

import type {
  AgentId,
  AgentProfile,
  PrivateReputationData,
} from "@/types/agent";
import type {
  PublicProofThresholds,
  PublicVerificationResult,
} from "@/types/proof";

export type VerificationFailure = {
  ok: false;
  failedCheck:
    | "completedTasks"
    | "successRate"
    | "safetyScore"
    | "noActiveSlashes";
};

export type VerificationSuccess = {
  ok: true;
  result: PublicVerificationResult;
};

export type SubmitVerificationOutcome =
  | VerificationSuccess
  | VerificationFailure;

const firstFailingCheck = (
  checks: ReturnType<typeof evaluateProofPreview>["checks"],
): VerificationFailure["failedCheck"] | null => {
  if (!checks.completedTasks) return "completedTasks";
  if (!checks.successRate) return "successRate";
  if (!checks.safetyScore) return "safetyScore";
  if (!checks.noActiveSlashes) return "noActiveSlashes";
  return null;
};

export class MockContractClient {
  private readonly agents = new Map<AgentId, AgentProfile>();
  private readonly verifications = new Map<AgentId, PublicVerificationResult>();
  private readonly privateState = new Map<AgentId, PrivateReputationData>();

  seed(
    profiles: AgentProfile[],
    privateData: Record<AgentId, PrivateReputationData>,
  ): void {
    for (const p of profiles) this.agents.set(p.agentId, p);
    for (const [id, rep] of Object.entries(privateData)) {
      this.privateState.set(id, rep);
    }
  }

  registerAgent(profile: AgentProfile): AgentProfile {
    if (this.agents.has(profile.agentId)) {
      throw new Error(`agent already registered: ${profile.agentId}`);
    }
    this.agents.set(profile.agentId, profile);
    return profile;
  }

  submitVerification(
    agentId: AgentId,
    thresholds: PublicProofThresholds,
  ): SubmitVerificationOutcome {
    const profile = this.agents.get(agentId);
    if (!profile) throw new Error(`agent not registered: ${agentId}`);
    const rep = this.privateState.get(agentId);
    if (!rep) throw new Error(`no private reputation for ${agentId}`);

    const preview = evaluateProofPreview(rep, thresholds);
    const failed = firstFailingCheck(preview.checks);
    if (failed) return { ok: false, failedCheck: failed };

    const result: PublicVerificationResult = {
      agentId,
      verified: true,
      completedTasksGte: thresholds.minCompletedTasks,
      successRateGte: thresholds.minSuccessRate,
      safetyScoreGte: thresholds.minSafetyScore,
      noActiveSlashes: thresholds.requireNoActiveSlashes,
      issuerId: profile.issuerId,
      verifiedAt: new Date().toISOString(),
      revoked: false,
    };
    this.verifications.set(agentId, result);
    return { ok: true, result };
  }

  revokeVerification(agentId: AgentId): PublicVerificationResult {
    const v = this.verifications.get(agentId);
    if (!v) throw new Error(`no verification to revoke for ${agentId}`);
    const revoked = { ...v, verified: false, revoked: true };
    this.verifications.set(agentId, revoked);
    return revoked;
  }

  getAgent(agentId: AgentId): AgentProfile | null {
    return this.agents.get(agentId) ?? null;
  }

  getVerification(agentId: AgentId): PublicVerificationResult | null {
    return this.verifications.get(agentId) ?? null;
  }

  getPrivateReputation(agentId: AgentId): PrivateReputationData | null {
    return this.privateState.get(agentId) ?? null;
  }

  listAgents(): AgentProfile[] {
    return [...this.agents.values()];
  }
}
