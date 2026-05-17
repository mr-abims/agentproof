// Mirror of frontend/src/lib/mockAgentData.ts so the CLI demonstrates the
// same three states the UI showcases:
//   - agent_001 passes a reasonable threshold (verified)
//   - agent_002 passes a stricter trading-grade threshold (verified)
//   - agent_003 fails the threshold (no transaction submitted)

import { createHash } from "node:crypto";
import { AgentCategory } from "@agentproof/contracts";

/**
 * Deterministic 32-byte secret representing the demo issuer ("AgentProof
 * Labs"). Anyone who runs this CLI binary derives the same secret, so the
 * issuer public key on chain is consistent across machines. The contract
 * enforces that only holders of this secret can verify/revoke agents they
 * registered — so the auth check is meaningful even though the secret is
 * itself committed to the repo. In production each issuer would generate
 * a fresh secret stored in an HSM or wallet-derived keystore.
 */
const DEMO_ISSUER_DOMAIN = "agentproof:demo-issuer:agentproof_labs:v1";

export const demoIssuerSecret = (): Uint8Array =>
  new Uint8Array(createHash("sha256").update(DEMO_ISSUER_DOMAIN).digest());

export interface DemoAgent {
  agentId: string;
  name: string;
  category: AgentCategory;
  issuerId: string;
}

export interface DemoReputation {
  completedTasks: number;
  successfulTasks: number;
  safetyScore: number;
  activeSlashes: number;
}

export interface DemoThresholds {
  minCompletedTasks: number;
  minSuccessRate: number;
  minSafetyScore: number;
  requireNoActiveSlashes: boolean;
}

export const demoAgents: DemoAgent[] = [
  {
    agentId: "agent_001",
    name: "AuditGPT-X",
    category: AgentCategory.SECURITY,
    issuerId: "agentproof_labs",
  },
  {
    agentId: "agent_002",
    name: "TradeMind",
    category: AgentCategory.TRADING,
    issuerId: "agentproof_labs",
  },
  {
    agentId: "agent_003",
    name: "SupportBot",
    category: AgentCategory.CUSTOMER_SUPPORT,
    issuerId: "agentproof_labs",
  },
];

export const demoReputation: Record<string, DemoReputation> = {
  agent_001: {
    completedTasks: 17,
    successfulTasks: 15,
    safetyScore: 92,
    activeSlashes: 0,
  },
  agent_002: {
    completedTasks: 41,
    successfulTasks: 33,
    safetyScore: 91,
    activeSlashes: 0,
  },
  agent_003: {
    completedTasks: 4,
    successfulTasks: 3,
    safetyScore: 70,
    activeSlashes: 1,
  },
};

export const demoThresholds: Record<string, DemoThresholds> = {
  agent_001: {
    minCompletedTasks: 10,
    minSuccessRate: 80,
    minSafetyScore: 85,
    requireNoActiveSlashes: true,
  },
  agent_002: {
    minCompletedTasks: 25,
    minSuccessRate: 75,
    minSafetyScore: 90,
    requireNoActiveSlashes: true,
  },
  agent_003: {
    minCompletedTasks: 100,
    minSuccessRate: 90,
    minSafetyScore: 90,
    requireNoActiveSlashes: true,
  },
};

export const findAgent = (agentId: string): DemoAgent => {
  const found = demoAgents.find((a) => a.agentId === agentId);
  if (!found) throw new Error(`Unknown demo agent: ${agentId}`);
  return found;
};
