<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/png/agentproof-lockup-dark-640.png">
    <img src="logo/png/agentproof-lockup-light-640.png" alt="AgentProof" width="380">
  </picture>
</p>

<p align="center">
  <strong>Privacy-preserving reputation proofs for AI agents, on Midnight.</strong>
</p>

<p align="center">
  <a href="AGENTPROOF_V1_SPEC.md">Spec</a> ·
  <a href="PHASE4_SETUP.md">CLI run guide</a> ·
  <a href="SESSION_HANDOFF.md">Project state</a>
</p>

---

## What it is

AI agents are becoming workers — writing code, reviewing contracts, executing trades, automating workflows. Before we trust an agent we need reputation. But raw reputation data is sensitive: it leaks clients, prompts, datasets, earnings, and failure logs.

AgentProof lets an agent prove threshold claims about its reputation — "completed ≥ 10 tasks," "success rate ≥ 80%," "safety score ≥ 85," "no active slashes" — **without revealing the underlying numbers.** The proof is a Midnight zero-knowledge circuit; the chain stores only the thresholds met and a hash-based issuer identity.

## What stays private

- Exact completed / successful task counts
- Exact success rate and safety score
- Active slash count
- Client names, prompt logs, datasets, earnings, failure details
- The issuer's signing secret

## What becomes public

- Agent ID + category (`SECURITY`, `TRADING`, ...)
- The thresholds met: `completedTasksGte ≥ N`, `successRateGte ≥ N%`, etc.
- Verification status (verified / revoked)
- The issuer's hash-based public key

## Architecture

Three workspaces, one repository:

```
agentproof/
├── contracts/    Compact contract (3 ZK circuits) + witness driver
├── cli/          Node CLI — deploys + interacts with the deployed contract
└── frontend/     Next.js app — visual demo against a mock client
```

Two ways to interact:

- **`npm run dev`** boots the Next.js frontend with a mock `ContractClient`. Visual story for the demo video — landing → marketplace → agent dashboard → animated proof → verifier certificate.
- **`npm run cli:preprod`** runs a Node CLI that deploys the real contract to Midnight preprod and submits real proofs. This is the verifiability path — every action lands as an indexed transaction.

## The contract in one read

The full Compact source is at [`contracts/src/agentproof.compact`](contracts/src/agentproof.compact). Three exported circuits, all enforcing the same two privacy invariants — *no raw values on chain* and *only the registering issuer can verify or revoke*:

| Circuit | What it proves | What lands on chain |
|---|---|---|
| `registerAgent(agentId, category)` | The caller controls some issuer secret. | `agents[agentId] = { category, issuer: hash(secret) }` |
| `submitVerification(agentId, ...thresholds)` | Caller is the registered issuer AND the private reputation passes all thresholds. | Only the thresholds met. The raw reputation never leaves the proof transcript. |
| `revokeVerification(agentId)` | Caller is the registered issuer. | `verifications[agentId].revoked = true` |

Auth uses Midnight's hash-based authentication pattern: `issuerPublicKey = persistentHash("agentproof:issuer:v1", issuerSecret)`. Only the secret-holder can re-derive the matching public key, so the assert inside `submitVerification` / `revokeVerification` cannot be satisfied without it. The audit table — what a judge can verify and how — is in [spec §16.3](AGENTPROOF_V1_SPEC.md#163-threat-model-and-what-a-judge-can-verify).

## Run the demo

### Quick: visual mock

```sh
npm install
npm run dev
# open http://localhost:3000
```

Walk through landing → marketplace → agent dashboard → click "Generate AgentProof" → certificate page.

### Full: real proofs on Midnight preprod

Requires Docker (for the local proof server) and a Midnight preprod faucet drip.

```sh
# one-time
docker run -d --name midnight-proof -p 6300:6300 \
  midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
npm install
npm run --workspace=@agentproof/contracts compile:compact

# interactive
npm run cli:preprod
```

Full step-by-step (wallet setup, faucet, DUST accrual, deploy, register, verify, revoke) is in [`PHASE4_SETUP.md`](PHASE4_SETUP.md).

## Tech stack

- **Smart contract** — Compact (compactc 0.31.0 / language 0.23), 3 circuits, ~135 lines.
- **CLI** — Node 22+, `@midnight-ntwrk/midnight-js-*@4.0.4`, `@midnight-ntwrk/wallet-sdk-*`. Headless HD wallet, no browser dep.
- **Frontend** — Next.js 16 (App Router), Tailwind v4, custom OKLCH design tokens, Geist sans/mono. Mock-mode demo client.
- **Network** — Midnight preprod testnet. Indexer GraphQL v4. Mainnet not targeted for v1.

Versions pinned exact (no carets) per the Midnight compatibility matrix. Root `package.json` uses npm `overrides` to align `compact-runtime` across transitive deps.

## Why Midnight

Midnight is a public blockchain with first-class private state. It does what no Layer-1 prior to it does well: lets you put threshold claims on a public ledger while keeping the data that *backs* those claims locally private — proven correct in zero knowledge. AgentProof is a direct fit for that model: the reputation claim is verifiable by anyone, but the agent's working history stays the agent's.

## Documentation

- [`AGENTPROOF_V1_SPEC.md`](AGENTPROOF_V1_SPEC.md) — full spec. §16 has the verified Compact source; §16.3 is the threat model; §27 is the demo script.
- [`PHASE4_SETUP.md`](PHASE4_SETUP.md) — CLI run recipe with faucet + DUST steps.
- [`DEPLOY-VERCEL.md`](DEPLOY-VERCEL.md) — one-page guide to deploying the frontend on Vercel.
- [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md) — current project state, what's verified, what's pending.
- [`contracts/README.md`](contracts/README.md) — circuit signatures + privacy property.
- [`cli/README.md`](cli/README.md) — CLI menu + prereqs.

## Status (hackathon submission)

- **Compact contract** — written, audited against Midnight's official security guidance and Compact language reference, compiles cleanly with `compactc 0.31.0` / language 0.23. Three circuits, hash-based issuer auth, witness sanity asserts. See [spec §16](AGENTPROOF_V1_SPEC.md#16-compact-contract).
- **Frontend (mock mode)** — fully working. `npm run dev` walks the complete demo flow without needing a wallet, proof server, or network.
- **CLI (real mode)** — built on the official example-counter pattern, typechecked, smoke-tested for module load + witness wiring. Ready to deploy; the actual preprod deploy + tx-hash capture is post-submission work (faucet + DUST accrual didn't fit the deadline window).

What a judge can verify today:
- Read [spec §16.3](AGENTPROOF_V1_SPEC.md#163-threat-model-and-what-a-judge-can-verify) — a table of seven enforced security properties and exactly how to test each one.
- Run `npm run dev` for the visual story.
- Read [`contracts/src/agentproof.compact`](contracts/src/agentproof.compact) for the 135-line contract that backs it.

## License

MIT — see [`LICENSE`](LICENSE).
