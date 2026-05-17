// Demo data for the hackathon walkthrough. Three agents covering the three
// states the UI needs to demonstrate: verified, verified with stricter
// thresholds, and unverified (will fail proof).

import { AgentCategory } from "@/types/agent";
import type { AgentProfile, PrivateReputationData } from "@/types/agent";
import type { PublicProofThresholds } from "@/types/proof";

export const demoAgents: AgentProfile[] = [
  {
    agentId: "agent_001",
    name: "AuditGPT-X",
    category: AgentCategory.SECURITY,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-15T00:00:00Z",
  },
  {
    agentId: "agent_002",
    name: "TradeMind",
    category: AgentCategory.TRADING,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-15T00:00:00Z",
  },
  {
    agentId: "agent_003",
    name: "SupportBot",
    category: AgentCategory.CUSTOMER_SUPPORT,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-15T00:00:00Z",
  },
];

export const demoPrivateReputation: Record<string, PrivateReputationData> = {
  agent_001: {
    agentId: "agent_001",
    completedTasks: 17,
    successfulTasks: 15,
    safetyScore: 92,
    activeSlashes: 0,
    clients: ["Private Client A", "Private Client B", "Private Client C"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
  agent_002: {
    agentId: "agent_002",
    completedTasks: 41,
    successfulTasks: 33,
    safetyScore: 91,
    activeSlashes: 0,
    clients: ["DeFi Fund X", "Quant Desk Y"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
  agent_003: {
    agentId: "agent_003",
    completedTasks: 4,
    successfulTasks: 3,
    safetyScore: 70,
    activeSlashes: 1,
    clients: ["SaaS Helpdesk Z"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
};

export const demoThresholds: Record<string, PublicProofThresholds> = {
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
