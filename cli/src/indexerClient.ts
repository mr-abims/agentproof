// Workaround for the `offset: null` bug on hosted preprod/preview indexers.
// The SDK's `providers.publicDataProvider.queryContractState(address)` resolves
// to a GraphQL query that includes a null offset, which hosted indexers reject
// with an internal error. We hand-roll a query without the offset field at all.
//
// Source: .claude/skills/midnightskill/indexer/SKILL.md §2-3.

import { ContractState } from "@midnight-ntwrk/compact-runtime";

const fromHex = (hex: string): Uint8Array => {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
};

/**
 * Fetch the latest ContractState for a contract address. Returns null if the
 * indexer has never seen the contract. Throws on transport/GraphQL errors.
 */
export const queryLatestContractState = async (
  indexerUrl: string,
  contractAddress: string,
): Promise<ContractState | null> => {
  const res = await fetch(indexerUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `
        query LATEST_STATE($address: HexEncoded!) {
          contractAction(address: $address) {
            state
          }
        }
      `,
      variables: { address: contractAddress },
    }),
  });

  const payload = (await res.json()) as {
    data?: { contractAction?: { state: string } | null };
    errors?: { message: string }[];
  };

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(
      `indexer error: ${payload.errors.map((e) => e.message).join("; ")}`,
    );
  }

  const action = payload.data?.contractAction;
  if (!action) return null;
  return ContractState.deserialize(fromHex(action.state));
};
