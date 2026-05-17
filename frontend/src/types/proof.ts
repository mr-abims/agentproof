import type { AgentId } from "./agent";

export type PublicProofThresholds = {
  minCompletedTasks: number;
  minSuccessRate: number;
  minSafetyScore: number;
  requireNoActiveSlashes: boolean;
};

export type PublicVerificationResult = {
  agentId: AgentId;
  verified: boolean;
  completedTasksGte: number;
  successRateGte: number;
  safetyScoreGte: number;
  noActiveSlashes: boolean;
  issuerId?: string;
  verifiedAt: string;
  revoked: boolean;
};

export type ProofPreview = {
  verified: boolean;
  checks: {
    completedTasks: boolean;
    successRate: boolean;
    safetyScore: boolean;
    noActiveSlashes: boolean;
  };
};
