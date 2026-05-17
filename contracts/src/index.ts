// Public entry point for @agentproof/contracts.
//
// Re-exports the Compact-generated bindings (Ledger types, circuit signatures,
// the Contract class, ledger() helper) so the frontend and CLI can do:
//   import { Contract, Ledger, AgentCategory } from "@agentproof/contracts";
//
// Also exposes the bindings under an `AgentProof` namespace for the
// MidnightProviders typing pattern used in the CLI:
//   import { AgentProof } from "@agentproof/contracts";
//
// The TS witness driver lives at "@agentproof/contracts/witnesses" — it is
// intentionally NOT re-exported from this top-level entry because Turbopack
// (Next.js frontend) does not rewrite the .ts→.js import extension trick
// for workspace-source packages, while the CLI's tsx loader does. Splitting
// the entry points keeps the frontend bundler happy without breaking the CLI.

export * from "./managed/agentproof/contract/index.js";
export * as AgentProof from "./managed/agentproof/contract/index.js";
