// Interactive CLI for AgentProof. Walks through:
//   1) wallet setup (create / restore)
//   2) deploy / join a contract
//   3) register an agent, submit a verification (proof), revoke
//   4) read public ledger state
//
// Modeled on midnightntwrk/example-counter cli.ts.

import { stdin as input, stdout as output } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";
import { type Logger } from "pino";
import {
  type AgentProofProviders,
  type DeployedAgentProofContract,
} from "./common-types.js";
import { type Config } from "./config.js";
import * as api from "./api.js";
import {
  demoAgents,
  demoReputation,
  demoThresholds,
  findAgent,
} from "./demo-data.js";

let logger: Logger;

const BANNER = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              AgentProof on Midnight                          ║
║              ──────────────────────                          ║
║              Privacy-preserving AI agent verification        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

const DIVIDER = "──────────────────────────────────────────────────────────────";

const WALLET_MENU = `
${DIVIDER}
  Wallet Setup
${DIVIDER}
  [1] Create a new wallet
  [2] Restore wallet from seed
  [3] Exit
${DIVIDER}
> `;

const contractMenu = (dust: string) => `
${DIVIDER}
  Contract Actions${dust ? `                    DUST: ${dust}` : ""}
${DIVIDER}
  [1] Deploy a new AgentProof contract
  [2] Join an existing contract by address
  [3] Exit
${DIVIDER}
> `;

const actionMenu = (dust: string) => `
${DIVIDER}
  Demo Actions${dust ? `                        DUST: ${dust}` : ""}
${DIVIDER}
  [1] Register a demo agent
  [2] Submit verification (proof) for a demo agent
  [3] Revoke a verification
  [4] Read ledger state (agents + verifications)
  [5] Run end-to-end demo (register + verify) for one agent
  [6] Exit
${DIVIDER}
> `;

const agentListBlock = () =>
  demoAgents
    .map((a, idx) => {
      const rep = demoReputation[a.agentId];
      const thr = demoThresholds[a.agentId];
      const willPass =
        rep.completedTasks >= thr.minCompletedTasks &&
        rep.successfulTasks * 100 >= rep.completedTasks * thr.minSuccessRate &&
        rep.safetyScore >= thr.minSafetyScore &&
        (!thr.requireNoActiveSlashes || rep.activeSlashes === 0);
      const flag = willPass ? "should PASS" : "expected to FAIL";
      return `  [${idx + 1}] ${a.agentId} — ${a.name.padEnd(14)} (${flag})`;
    })
    .join("\n");

const pickAgent = async (rli: Interface) => {
  console.log(`\n${DIVIDER}\n  Demo agents\n${DIVIDER}\n${agentListBlock()}\n${DIVIDER}`);
  const choice = (await rli.question("Pick an agent (1-3): ")).trim();
  const idx = Number(choice) - 1;
  const agent = demoAgents[idx];
  if (!agent) throw new Error(`Invalid agent choice: ${choice}`);
  return agent;
};

const buildWalletFromSeed = async (config: Config, rli: Interface) => {
  const seed = await rli.question("Enter your wallet seed (hex): ");
  return await api.buildWalletAndWaitForFunds(config, seed.trim());
};

const buildWallet = async (config: Config, rli: Interface) => {
  while (true) {
    const choice = (await rli.question(WALLET_MENU)).trim();
    switch (choice) {
      case "1":
        return await api.buildFreshWallet(config);
      case "2":
        return await buildWalletFromSeed(config, rli);
      case "3":
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

const getDustLabel = async (wallet: api.WalletContext["wallet"]) => {
  try {
    const dust = await api.getDustBalance(wallet);
    return dust.available.toLocaleString();
  } catch {
    return "";
  }
};

const deployOrJoin = async (
  providers: AgentProofProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<DeployedAgentProofContract | null> => {
  while (true) {
    const dust = await getDustLabel(walletCtx.wallet);
    const choice = (await rli.question(contractMenu(dust))).trim();
    switch (choice) {
      case "1":
        try {
          const contract = await api.withStatus(
            "Deploying AgentProof contract",
            () => api.deploy(providers),
          );
          console.log(
            `\n  Contract deployed at: ${contract.deployTxData.public.contractAddress}\n`,
          );
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`\n  ✗ Deploy failed: ${msg}\n`);
        }
        break;
      case "2":
        try {
          const addr = (await rli.question("Contract address (hex): ")).trim();
          return await api.join(providers, addr);
        } catch (e) {
          console.log(
            `  ✗ Join failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      case "3":
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

const printLedger = async (
  config: Config,
  contract: DeployedAgentProofContract,
) => {
  const addr = contract.deployTxData.public.contractAddress;
  const view = await api.readLedger(config.indexer, addr);
  if (view === null) {
    console.log(`  No contract found at ${addr}`);
    return;
  }
  console.log(`\n  ${DIVIDER}`);
  console.log(`  Ledger state @ ${addr}`);
  console.log(`  ${DIVIDER}`);
  const hex = (b: Uint8Array) =>
    Array.from(b)
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  console.log(`  agents (${view.agents.length}):`);
  for (const a of view.agents) {
    console.log(
      `    - 0x${a.agentId.toString(16).slice(0, 16)}... cat=${a.category} ` +
        `issuerPK=0x${hex(a.issuer).slice(0, 16)}...`,
    );
  }
  console.log(`  verifications (${view.verifications.length}):`);
  for (const v of view.verifications) {
    const status = v.revoked
      ? "REVOKED"
      : v.verified
        ? "VERIFIED"
        : "UNVERIFIED";
    console.log(
      `    - 0x${v.agentId.toString(16).slice(0, 16)}... ${status} ` +
        `tasks≥${v.completedTasksGte} success≥${v.successRateGte}% ` +
        `safety≥${v.safetyScoreGte}`,
    );
  }
  console.log("");
};

const mainLoop = async (
  config: Config,
  providers: AgentProofProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<void> => {
  const contract = await deployOrJoin(providers, walletCtx, rli);
  if (contract === null) return;

  while (true) {
    const dust = await getDustLabel(walletCtx.wallet);
    const choice = (await rli.question(actionMenu(dust))).trim();
    try {
      switch (choice) {
        case "1": {
          const agent = await pickAgent(rli);
          await api.withStatus(`Registering ${agent.agentId}`, () =>
            api.registerAgent(contract, agent),
          );
          break;
        }
        case "2": {
          const agent = await pickAgent(rli);
          const rep = demoReputation[agent.agentId];
          const thr = demoThresholds[agent.agentId];
          await api.withStatus(
            `Submitting verification for ${agent.agentId}`,
            () => api.submitVerification(providers, contract, agent, rep, thr),
          );
          break;
        }
        case "3": {
          const agent = await pickAgent(rli);
          await api.withStatus(`Revoking ${agent.agentId}`, () =>
            api.revokeVerification(contract, agent),
          );
          break;
        }
        case "4":
          await printLedger(config, contract);
          break;
        case "5": {
          const agent = await pickAgent(rli);
          await api.withStatus(`Running demo for ${agent.agentId}`, () =>
            api.runDemoLoop(providers, contract, agent.agentId),
          );
          break;
        }
        case "6":
          return;
        default:
          console.log(`  Invalid choice: ${choice}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`\n  ✗ ${msg}\n`);
    }
  }
};

export const run = async (config: Config, _logger: Logger): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);

  console.log(BANNER);

  const rli = createInterface({ input, output, terminal: true });

  try {
    const walletCtx = await buildWallet(config, rli);
    if (walletCtx === null) return;

    try {
      const providers = await api.withStatus("Configuring providers", () =>
        api.configureProviders(walletCtx, config),
      );
      // Bootstrap the issuer secret into LevelDB private state once. Every
      // circuit needs it — `registerAgent` to write the issuer public key,
      // `submit`/`revoke` to prove the caller controls that key.
      await api.ensureIssuerSecret(providers);
      console.log("");
      await mainLoop(config, providers, walletCtx, rli);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Error: ${e.message}`);
        logger.debug(`${e.stack}`);
      } else {
        throw e;
      }
    } finally {
      try {
        await walletCtx.wallet.stop();
      } catch (e) {
        logger.error(`Error stopping wallet: ${e}`);
      }
    }
  } finally {
    rli.close();
    rli.removeAllListeners();
    logger.info("Goodbye.");
  }
};
