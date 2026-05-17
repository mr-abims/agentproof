import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum AgentCategory { SECURITY = 0,
                            RESEARCH = 1,
                            TRADING = 2,
                            CUSTOMER_SUPPORT = 3,
                            CODING = 4,
                            GENERAL = 5
}

export type Agent = { category: AgentCategory; issuer: Uint8Array };

export type Verification = { verified: boolean;
                             completedTasksGte: bigint;
                             successRateGte: bigint;
                             safetyScoreGte: bigint;
                             noActiveSlashes: boolean;
                             revoked: boolean
                           };

export type ReputationData = { completedTasks: bigint;
                               successfulTasks: bigint;
                               safetyScore: bigint;
                               activeSlashes: bigint
                             };

export type Witnesses<PS> = {
  getReputation(context: __compactRuntime.WitnessContext<Ledger, PS>,
                agentId_0: bigint): [PS, ReputationData];
  issuerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerAgent(context: __compactRuntime.CircuitContext<PS>,
                agentId_0: bigint,
                category_0: AgentCategory): __compactRuntime.CircuitResults<PS, []>;
  submitVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint,
                     minCompletedTasks_0: bigint,
                     minSuccessRate_0: bigint,
                     minSafetyScore_0: bigint,
                     requireNoActiveSlashes_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  revokeVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerAgent(context: __compactRuntime.CircuitContext<PS>,
                agentId_0: bigint,
                category_0: AgentCategory): __compactRuntime.CircuitResults<PS, []>;
  submitVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint,
                     minCompletedTasks_0: bigint,
                     minSuccessRate_0: bigint,
                     minSafetyScore_0: bigint,
                     requireNoActiveSlashes_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  revokeVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerAgent(context: __compactRuntime.CircuitContext<PS>,
                agentId_0: bigint,
                category_0: AgentCategory): __compactRuntime.CircuitResults<PS, []>;
  submitVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint,
                     minCompletedTasks_0: bigint,
                     minSuccessRate_0: bigint,
                     minSafetyScore_0: bigint,
                     requireNoActiveSlashes_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  revokeVerification(context: __compactRuntime.CircuitContext<PS>,
                     agentId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  agents: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Agent;
    [Symbol.iterator](): Iterator<[bigint, Agent]>
  };
  verifications: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Verification;
    [Symbol.iterator](): Iterator<[bigint, Verification]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
