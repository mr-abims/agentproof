// Import the enum once as a value so TS can use it both as a value and
// (since enums are also types) as a type below.
import { AgentCategory } from "@agentproof/contracts";
export { AgentCategory };

export type AgentId = string;

export type AgentProfile = {
  agentId: AgentId;
  name: string;
  category: AgentCategory;
  issuerId?: string;
  createdAt: string;
};

export type PrivateReputationData = {
  agentId: AgentId;
  completedTasks: number;
  successfulTasks: number;
  safetyScore: number;
  activeSlashes: number;
  clients: string[];
  promptLogsHidden: boolean;
  datasetsHidden: boolean;
  earningsHidden: boolean;
  failureDetailsHidden: boolean;
};
