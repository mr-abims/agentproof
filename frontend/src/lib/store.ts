// Single MockContractClient instance for the demo, with a tiny pub/sub so
// client components re-render after register/submit/revoke. Module state
// persists across client-side navigations within one browser session.

import { useSyncExternalStore } from "react";

import { MockContractClient } from "./contractClient";
import { demoAgents, demoPrivateReputation } from "./mockAgentData";

let _client: MockContractClient | null = null;
const listeners = new Set<() => void>();
let version = 0;

function getClient(): MockContractClient {
  if (_client) return _client;
  const c = new MockContractClient();
  c.seed(demoAgents, demoPrivateReputation);
  _client = c;
  return c;
}

function notify(): void {
  version++;
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useClient(): MockContractClient {
  // useSyncExternalStore drives re-renders when state mutates.
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  return getClient();
}

/** Wrap a state-mutating call so subscribers re-render after it. */
export function withNotify<T>(fn: () => T): T {
  const out = fn();
  notify();
  return out;
}
