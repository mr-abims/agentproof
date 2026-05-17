# @agentproof/cli

Headless Node CLI that deploys the AgentProof Compact contract to Midnight preprod and walks the full register / verify / revoke loop. This is the verifiability surface — every menu action produces an indexed on-chain transaction.

> **Not a browser dApp.** This CLI uses an HD-wallet seed it prints on first run, *not* Lace or any browser wallet. See [`PHASE4_SETUP.md`](../PHASE4_SETUP.md) for the rationale (Option C from the project's Phase-4 decision).

## Prerequisites

- Node 22+ (`node --version`).
- Docker, with `midnightntwrk/proof-server:8.0.3` running on port 6300:
  ```sh
  docker run -d --name midnight-proof -p 6300:6300 \
    midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
  curl http://localhost:6300/health    # → 200
  ```
- The Compact contract compiled:
  ```sh
  npm run --workspace=@agentproof/contracts compile:compact
  ```
- Preprod tNIGHT — the CLI prints its unshielded address on startup; send tokens to it from [the faucet](https://faucet.preprod.midnight.network/) or any preprod wallet.

## Run

From the repo root:

```sh
npm run cli:preprod        # interactive, preprod network
```

Or directly:

```sh
npm run --workspace=@agentproof/cli preprod
npm run --workspace=@agentproof/cli preview    # preview network (if you have access)
```

## What the menu does

```
[1] Wallet setup        → create or restore an HD wallet
                           (CRITICAL: save the printed seed)
[2] Sync + fund + DUST  → automatic once funded; takes a few minutes for DUST
[3] Contract menu       → [1] Deploy new contract / [2] Join by address
[4] Demo actions        → [1] register / [2] verify / [3] revoke /
                          [4] read ledger / [5] run full demo loop
```

Picking an agent on any action shows whether it's expected to pass or fail against its bundled thresholds:

```
[1] agent_001 — AuditGPT-X      (should PASS)
[2] agent_002 — TradeMind       (should PASS)
[3] agent_003 — SupportBot      (expected to FAIL)
```

`agent_003` is the privacy-preserving "no transaction" demo: thresholds aren't met, proof generation aborts at the assert, nothing lands on chain.

## Source layout

```
cli/
├── src/
│   ├── preprod.ts            entry: npm run cli:preprod
│   ├── preview.ts            entry: npm run cli:preview
│   ├── cli.ts                interactive readline menu
│   ├── api.ts                wallet + providers + circuit-call helpers
│   ├── common-types.ts       AgentProofProviders, DeployedAgentProofContract
│   ├── config.ts             Preprod/Preview/Standalone (indexer v4 / v3)
│   ├── demo-data.ts          demoAgents + demoIssuerSecret
│   ├── field.ts              SHA-256 → Field bigint
│   ├── indexerClient.ts      hand-rolled GraphQL (offset:null bug workaround)
│   └── logger-utils.ts       pino + pino-pretty
├── package.json
└── tsconfig.json
```

## Design notes

- **Wallet** — `WalletFacade.init()` static factory wraps `ShieldedWallet` + `UnshieldedWallet` + `DustWallet`, all driven from a single 64-char hex seed via `HDWallet.fromSeed`. `globalThis.WebSocket = WebSocket` is set at module top so GraphQL subscriptions work in Node.
- **Providers** — `levelPrivateStateProvider` (LevelDB-backed, accountId-scoped), `indexerPublicDataProvider`, `httpClientProofProvider`, `NodeZkConfigProvider`. All pinned to `4.0.4`.
- **Indexer** — hosted preprod uses GraphQL v4; only local `undeployed` is v3. `readLedger()` uses a hand-rolled query in `indexerClient.ts` to dodge the `offset: null` bug in the SDK's default `queryContractState` path.
- **Wallet SDK bug workaround** — `signTransactionIntents` in `api.ts` works around a known wallet-SDK bug where `signRecipe` hardcodes `'pre-proof'`, breaking signing of proven (`UnboundTransaction`) intents. Apply `'proof'` for `baseTransaction` and `'pre-proof'` for `balancingTransaction`.
- **Issuer secret** — deterministic SHA-256 of `"agentproof:demo-issuer:agentproof_labs:v1"`. Same binary → same secret → same issuer public key on chain across reruns. The contract enforces the auth; the secret being in the repo doesn't weaken that (a judge with a *different* secret cannot revoke an agent we registered — see [spec §16.3](../AGENTPROOF_V1_SPEC.md#163-threat-model-and-what-a-judge-can-verify)).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `DUST = 0` after a failed deploy | Coins locked by the failed tx. Ctrl-C, restart CLI, `[2] Restore from seed`, paste your seed. They unlock on next sync. |
| Proof generation hangs >5 min | `docker ps` to check the proof server; `docker start midnight-proof` if it died. Wallet keeps running. |
| `ECONNREFUSED 127.0.0.1:6300` | Proof server isn't up. See Prerequisites. |
| `Failed to clone intent` | Should not occur — already worked around. If it does, paste the full stack and we'll diagnose. |
| `caller is not the registered issuer` | Expected when running against an agent registered by a CLI with a different `demoIssuerSecret` constant. This is the security property working as intended. |
| Indexer GraphQL `offset: null` errors | Should not occur — already worked around in `indexerClient.ts`. If you see it on a path other than `readLedger`, paste the stack. |

## References

- [`PHASE4_SETUP.md`](../PHASE4_SETUP.md) — full setup walkthrough.
- [`AGENTPROOF_V1_SPEC.md`](../AGENTPROOF_V1_SPEC.md) — full spec; §16 contract source, §16.3 threat model, §27 demo script.
- [`midnightntwrk/example-counter`](https://github.com/midnightntwrk/example-counter) — the official reference dApp this CLI is modeled on (wallet wiring, provider setup, signing workarounds).
- [Midnight Network docs](https://docs.midnight.network/) — Compact language, JS SDK, indexer GraphQL reference.
