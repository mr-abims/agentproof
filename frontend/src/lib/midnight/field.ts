// Convert a human-readable agent ID (e.g. "agent_001") to the bigint that
// represents a Compact `Field` element. SHA-256(utf8) mod a 254-bit bound;
// deterministic and unique enough for the hackathon demo.

const FIELD_BOUND = BigInt(
  "0x4000000000000000000000000000000000000000000000000000000000000000",
);

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encodeAgentId(agentId: string): Promise<bigint> {
  const hex = await sha256Hex(agentId);
  return BigInt("0x" + hex) % FIELD_BOUND;
}
