// Demo data for the hackathon walkthrough.
//
// Seven agents cover all six categories plus a mix of verified / unverified
// states so the marketplace page tells a richer story than "everything is
// unverified." The interactive proof flow still uses agent_001 (the SECURITY
// agent intentionally left unverified so the user has something to verify).

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
    createdAt: "2026-05-10T00:00:00Z",
  },
  {
    agentId: "agent_003",
    name: "SupportBot",
    category: AgentCategory.CUSTOMER_SUPPORT,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-15T00:00:00Z",
  },
  {
    agentId: "agent_004",
    name: "SwiftCoder",
    category: AgentCategory.CODING,
    issuerId: "agentproof_labs",
    createdAt: "2026-04-28T00:00:00Z",
  },
  {
    agentId: "agent_005",
    name: "InsightLab",
    category: AgentCategory.RESEARCH,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-02T00:00:00Z",
  },
  {
    agentId: "agent_006",
    name: "NexusBot",
    category: AgentCategory.GENERAL,
    issuerId: "agentproof_labs",
    createdAt: "2026-04-19T00:00:00Z",
  },
  {
    agentId: "agent_007",
    name: "GuardScan",
    category: AgentCategory.SECURITY,
    issuerId: "agentproof_labs",
    createdAt: "2026-05-16T00:00:00Z",
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
  agent_004: {
    agentId: "agent_004",
    completedTasks: 84,
    successfulTasks: 78,
    safetyScore: 88,
    activeSlashes: 0,
    clients: ["FinTech Co N", "OSS Foundation M"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
  agent_005: {
    agentId: "agent_005",
    completedTasks: 29,
    successfulTasks: 27,
    safetyScore: 95,
    activeSlashes: 0,
    clients: ["Research Group P", "Policy Lab Q"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
  agent_006: {
    agentId: "agent_006",
    completedTasks: 156,
    successfulTasks: 134,
    safetyScore: 87,
    activeSlashes: 0,
    clients: ["Marketplace R", "Agency S", "Studio T"],
    promptLogsHidden: true,
    datasetsHidden: true,
    earningsHidden: true,
    failureDetailsHidden: true,
  },
  agent_007: {
    agentId: "agent_007",
    completedTasks: 8,
    successfulTasks: 6,
    safetyScore: 75,
    activeSlashes: 0,
    clients: ["Pilot Customer U"],
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
  agent_004: {
    minCompletedTasks: 50,
    minSuccessRate: 85,
    minSafetyScore: 80,
    requireNoActiveSlashes: true,
  },
  agent_005: {
    minCompletedTasks: 20,
    minSuccessRate: 85,
    minSafetyScore: 90,
    requireNoActiveSlashes: true,
  },
  agent_006: {
    minCompletedTasks: 100,
    minSuccessRate: 80,
    minSafetyScore: 85,
    requireNoActiveSlashes: true,
  },
  agent_007: {
    minCompletedTasks: 20,
    minSuccessRate: 90,
    minSafetyScore: 90,
    requireNoActiveSlashes: true,
  },
};

/**
 * Which agents should appear pre-verified on first load. Driven by
 * lib/store.ts's `getClient()` — calls `submitVerification` for each one
 * after seeding, so the resulting marketplace shows real verification
 * records (not hard-coded mocks).
 *
 *   agent_001 — left unverified deliberately. It's the demo target for
 *               the proof-generation animation.
 *   agent_003 — would fail thresholds. Demonstrates the "no AgentProof
 *               issued" state.
 *   agent_007 — fresh agent that hasn't been put through verification yet.
 */
export const preVerifiedAgentIds: string[] = [
  "agent_002",
  "agent_004",
  "agent_005",
  "agent_006",
];
