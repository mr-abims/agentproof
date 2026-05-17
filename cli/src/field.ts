import { createHash } from "node:crypto";

// 254-bit prime-ish bound; matches the convention used by the frontend
// (see frontend/src/lib/midnight/field.ts) so an `agent_001` Field id is
// the same value here as it is in the UI.
const FIELD_BOUND = BigInt(
  "0x4000000000000000000000000000000000000000000000000000000000000000",
);

const sha256Hex = (input: string): string =>
  createHash("sha256").update(input, "utf8").digest("hex");

export const encodeAgentId = (agentId: string): bigint =>
  BigInt("0x" + sha256Hex(agentId)) % FIELD_BOUND;
