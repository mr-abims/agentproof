import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import type {
  DeployedContract,
  FoundContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import type { ProvableCircuitId } from "@midnight-ntwrk/compact-js";
import { AgentProof } from "@agentproof/contracts";
import type { PrivateState } from "@agentproof/contracts/witnesses";

export type AgentProofCircuits = ProvableCircuitId<
  AgentProof.Contract<PrivateState>
>;

export const AgentProofPrivateStateId = "agentproofPrivateState" as const;
export type AgentProofPrivateStateId = typeof AgentProofPrivateStateId;

export type AgentProofProviders = MidnightProviders<
  AgentProofCircuits,
  AgentProofPrivateStateId,
  PrivateState
>;

export type AgentProofContract = AgentProof.Contract<PrivateState>;

export type DeployedAgentProofContract =
  | DeployedContract<AgentProofContract>
  | FoundContract<AgentProofContract>;
