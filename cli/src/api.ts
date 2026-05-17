// AgentProof CLI — wallet, providers, deploy, and circuit-call helpers.
//
// Modeled on the official midnightntwrk/example-counter api.ts, retargeted at
// the three AgentProof circuits (registerAgent / submitVerification /
// revokeVerification) and the ReputationData witness.

import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { AgentProof, AgentCategory } from "@agentproof/contracts";
import { witnesses, type PrivateState } from "@agentproof/contracts/witnesses";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { unshieldedToken } from "@midnight-ntwrk/ledger-v8";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import {
  type FinalizedTxData,
  type MidnightProvider,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import {
  HDWallet,
  Roles,
  generateRandomSeed,
} from "@midnight-ntwrk/wallet-sdk-hd";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import { type Logger } from "pino";
import * as Rx from "rxjs";
import { WebSocket } from "ws";
import { Buffer } from "node:buffer";
import {
  type AgentProofCircuits,
  type AgentProofContract,
  AgentProofPrivateStateId,
  type AgentProofProviders,
  type DeployedAgentProofContract,
} from "./common-types.js";
import { type Config, contractConfig } from "./config.js";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  assertIsContractAddress,
  toHex,
} from "@midnight-ntwrk/midnight-js-utils";
import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import {
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from "@midnight-ntwrk/wallet-sdk-address-format";
import { encodeAgentId } from "./field.js";
import { queryLatestContractState } from "./indexerClient.js";
import {
  demoIssuerSecret,
  demoReputation,
  demoThresholds,
  findAgent,
  type DemoAgent,
  type DemoReputation,
  type DemoThresholds,
} from "./demo-data.js";

let logger: Logger;

// Required for GraphQL subscriptions (wallet sync) in Node.js.
globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

// Pre-compile once at module load — loading ZK keys is slow.
const agentProofCompiledContract = CompiledContract.make(
  "agentproof",
  AgentProof.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(contractConfig.zkConfigPath),
);

export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

// --------------------------------------------------------------------------
// Ledger reads
// --------------------------------------------------------------------------

export interface AgentLedgerView {
  agentId: bigint;
  category: AgentCategory;
  /** 32-byte hash-based issuer public key. Hex-encoded for display. */
  issuer: Uint8Array;
}

export interface VerificationLedgerView {
  agentId: bigint;
  verified: boolean;
  revoked: boolean;
  completedTasksGte: bigint;
  successRateGte: bigint;
  safetyScoreGte: bigint;
  noActiveSlashes: boolean;
}

export const readLedger = async (
  indexerUrl: string,
  contractAddress: ContractAddress,
): Promise<{
  agents: AgentLedgerView[];
  verifications: VerificationLedgerView[];
} | null> => {
  assertIsContractAddress(contractAddress);
  // Hand-rolled GraphQL — works around the `offset: null` bug in hosted
  // indexers that breaks the SDK's default `queryContractState` path.
  // See indexer/SKILL.md §2 and ./indexerClient.ts.
  const contractState = await queryLatestContractState(
    indexerUrl,
    contractAddress,
  );
  if (contractState === null) return null;

  const state = AgentProof.ledger(contractState.data);
  const agents: AgentLedgerView[] = [];
  for (const [agentId, a] of state.agents) {
    agents.push({ agentId, category: a.category, issuer: a.issuer });
  }
  const verifications: VerificationLedgerView[] = [];
  for (const [agentId, v] of state.verifications) {
    verifications.push({
      agentId,
      verified: v.verified,
      revoked: v.revoked,
      completedTasksGte: v.completedTasksGte,
      successRateGte: v.successRateGte,
      safetyScoreGte: v.safetyScoreGte,
      noActiveSlashes: v.noActiveSlashes,
    });
  }
  return { agents, verifications };
};

// --------------------------------------------------------------------------
// Deploy / Join
// --------------------------------------------------------------------------

// The CLI is the AgentProof Labs issuer for demo purposes. Anyone who clones
// this repo can play that role locally; in production each issuer would hold
// its own secret in an HSM or wallet-derived keystore. See SESSION_HANDOFF.md.
const initialPrivateState: PrivateState = {
  reputation: {},
  issuerSecret: demoIssuerSecret(),
};

export const agentProofContractInstance: AgentProofContract =
  new AgentProof.Contract(witnesses);

export const deploy = async (
  providers: AgentProofProviders,
): Promise<DeployedAgentProofContract> => {
  logger.info("Deploying AgentProof contract...");
  const deployed = await deployContract(providers, {
    compiledContract: agentProofCompiledContract,
    privateStateId: AgentProofPrivateStateId,
    initialPrivateState,
  });
  logger.info(
    `Deployed at: ${deployed.deployTxData.public.contractAddress}`,
  );
  return deployed;
};

export const join = async (
  providers: AgentProofProviders,
  contractAddress: string,
): Promise<DeployedAgentProofContract> => {
  const found = await findDeployedContract(providers, {
    contractAddress,
    compiledContract: agentProofCompiledContract,
    privateStateId: AgentProofPrivateStateId,
    initialPrivateState,
  });
  logger.info(`Joined ${found.deployTxData.public.contractAddress}`);
  return found;
};

// --------------------------------------------------------------------------
// Private-state injection
// --------------------------------------------------------------------------

/**
 * Insert a single agent's reputation data into the LevelDB-backed private
 * state. submitVerification() will read this through the getReputation
 * witness when it runs inside the proof.
 */
export const setReputation = async (
  providers: AgentProofProviders,
  agentIdField: bigint,
  rep: DemoReputation,
): Promise<void> => {
  const previous =
    (await providers.privateStateProvider.get(AgentProofPrivateStateId)) ??
    initialPrivateState;
  const next: PrivateState = {
    issuerSecret: previous.issuerSecret ?? demoIssuerSecret(),
    reputation: {
      ...previous.reputation,
      [agentIdField.toString()]: {
        completedTasks: BigInt(rep.completedTasks),
        successfulTasks: BigInt(rep.successfulTasks),
        safetyScore: BigInt(rep.safetyScore),
        activeSlashes: BigInt(rep.activeSlashes),
      },
    },
  };
  await providers.privateStateProvider.set(AgentProofPrivateStateId, next);
};

/**
 * Ensure the LevelDB private state has an issuer secret. Called by the CLI
 * after providers are configured — needed before any circuit call because
 * every circuit either reads (`submit`/`revoke`) or writes (`register`) the
 * issuer public key, and the witness throws on a missing secret.
 */
export const ensureIssuerSecret = async (
  providers: AgentProofProviders,
): Promise<void> => {
  const previous = await providers.privateStateProvider.get(
    AgentProofPrivateStateId,
  );
  if (previous && previous.issuerSecret && previous.issuerSecret.length === 32) {
    return;
  }
  await providers.privateStateProvider.set(AgentProofPrivateStateId, {
    reputation: previous?.reputation ?? {},
    issuerSecret: demoIssuerSecret(),
  });
};

// --------------------------------------------------------------------------
// Circuit calls
// --------------------------------------------------------------------------

export const registerAgent = async (
  contract: DeployedAgentProofContract,
  agent: DemoAgent,
): Promise<FinalizedTxData> => {
  const agentIdField = encodeAgentId(agent.agentId);
  logger.info(
    `registerAgent(${agent.agentId} → 0x${agentIdField.toString(16).slice(0, 16)}...) ` +
      `as issuer "${agent.issuerId}"`,
  );
  // Issuer identity is derived from the witness `issuerSecret` inside the
  // circuit — there is no explicit issuer parameter. Whoever holds the
  // matching secret is the only party that can later verify or revoke.
  const result = await contract.callTx.registerAgent(
    agentIdField,
    agent.category,
  );
  logger.info(
    `  tx ${result.public.txId} in block ${result.public.blockHeight}`,
  );
  return result.public;
};

export const submitVerification = async (
  providers: AgentProofProviders,
  contract: DeployedAgentProofContract,
  agent: DemoAgent,
  rep: DemoReputation,
  thresholds: DemoThresholds,
): Promise<FinalizedTxData> => {
  const agentIdField = encodeAgentId(agent.agentId);
  await setReputation(providers, agentIdField, rep);

  logger.info(
    `submitVerification(${agent.agentId}) thresholds: ` +
      `tasks≥${thresholds.minCompletedTasks}, ` +
      `success≥${thresholds.minSuccessRate}%, ` +
      `safety≥${thresholds.minSafetyScore}, ` +
      `noSlashes=${thresholds.requireNoActiveSlashes}`,
  );

  // verifiedAt is no longer a circuit argument — the indexer records the
  // containing tx's block timestamp, which is the trustworthy source.
  const result = await contract.callTx.submitVerification(
    agentIdField,
    BigInt(thresholds.minCompletedTasks),
    BigInt(thresholds.minSuccessRate),
    BigInt(thresholds.minSafetyScore),
    thresholds.requireNoActiveSlashes,
  );
  logger.info(
    `  tx ${result.public.txId} in block ${result.public.blockHeight}`,
  );
  return result.public;
};

export const revokeVerification = async (
  contract: DeployedAgentProofContract,
  agent: DemoAgent,
): Promise<FinalizedTxData> => {
  const agentIdField = encodeAgentId(agent.agentId);
  logger.info(`revokeVerification(${agent.agentId})`);
  const result = await contract.callTx.revokeVerification(agentIdField);
  logger.info(
    `  tx ${result.public.txId} in block ${result.public.blockHeight}`,
  );
  return result.public;
};

// --------------------------------------------------------------------------
// Wallet SDK bug workaround
// --------------------------------------------------------------------------

/**
 * Sign every unshielded offer in the transaction's intents using the correct
 * proof marker. Works around a wallet-SDK bug where signRecipe hardcodes
 * 'pre-proof', which fails for proven (UnboundTransaction) intents that
 * contain 'proof' data. (Documented in midnight-js/SKILL.md.)
 */
const signTransactionIntents = (
  tx: { intents?: Map<number, any> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: "proof" | "pre-proof",
): void => {
  if (!tx.intents || tx.intents.size === 0) return;

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;

    const cloned = ledger.Intent.deserialize<
      ledger.SignatureEnabled,
      ledger.Proofish,
      ledger.PreBinding
    >("signature", proofMarker, "pre-binding", intent.serialize());

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer =
        cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer =
        cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }

    tx.intents.set(segment, cloned);
  }
};

// --------------------------------------------------------------------------
// Wallet + Midnight provider bridge
// --------------------------------------------------------------------------

export const createWalletAndMidnightProvider = async (
  ctx: WalletContext,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx, ttl?) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: ctx.shieldedSecretKeys,
          dustSecretKey: ctx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      const signFn = (payload: Uint8Array) =>
        ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, "proof");
      if (recipe.balancingTransaction) {
        signTransactionIntents(
          recipe.balancingTransaction,
          signFn,
          "pre-proof",
        );
      }

      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) {
      return ctx.wallet.submitTransaction(tx) as any;
    },
  };
};

// --------------------------------------------------------------------------
// Wallet construction + sync helpers
// --------------------------------------------------------------------------

export const waitForSync = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
    ),
  );

export const waitForFunds = (wallet: WalletFacade): Promise<bigint> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((s) => s.isSynced),
      Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

const buildShieldedConfig = ({
  indexer,
  indexerWS,
  node,
  proofServer,
}: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

const buildUnshieldedConfig = ({ indexer, indexerWS }: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  txHistoryStorage: new InMemoryTransactionHistoryStorage(),
});

const buildDustConfig = ({ indexer, indexerWS, node, proofServer }: Config) => ({
  networkId: getNetworkId(),
  costParameters: {
    additionalFeeOverhead: 300_000_000_000_000n,
    feeBlocksMargin: 5,
  },
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

const deriveKeysFromSeed = (seed: string) => {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") {
    throw new Error("Failed to initialize HDWallet from seed");
  }
  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivationResult.type !== "keysDerived") {
    throw new Error("Failed to derive keys");
  }
  hdWallet.hdWallet.clear();
  return derivationResult.keys;
};

const formatBalance = (b: bigint): string => b.toLocaleString();

export const withStatus = async <T>(
  message: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
  }, 80);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✓ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ✗ ${message}\n`);
    throw e;
  }
};

const registerForDustGeneration = async (
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<void> => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  if (state.dust.availableCoins.length > 0) {
    const dustBal = state.dust.balance(new Date());
    console.log(
      `  ✓ Dust tokens already available (${formatBalance(dustBal)} DUST)`,
    );
    return;
  }

  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin: any) => coin.meta?.registeredForDustGeneration !== true,
  );
  if (nightUtxos.length === 0) {
    await withStatus("Waiting for dust tokens to generate", () =>
      Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.throttleTime(5_000),
          Rx.filter((s) => s.isSynced),
          Rx.filter((s) => s.dust.balance(new Date()) > 0n),
        ),
      ),
    );
    return;
  }

  await withStatus(
    `Registering ${nightUtxos.length} NIGHT UTXO(s) for dust generation`,
    async () => {
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        unshieldedKeystore.getPublicKey(),
        (payload) => unshieldedKeystore.signData(payload),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
    },
  );

  await withStatus("Waiting for dust tokens to generate", () =>
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    ),
  );
};

const printWalletSummary = (state: any, unshieldedKeystore: UnshieldedKeystore) => {
  const networkId = getNetworkId();
  const unshieldedBalance =
    state.unshielded.balances[unshieldedToken().raw] ?? 0n;

  const coinPubKey = ShieldedCoinPublicKey.fromHexString(
    state.shielded.coinPublicKey.toHexString(),
  );
  const encPubKey = ShieldedEncryptionPublicKey.fromHexString(
    state.shielded.encryptionPublicKey.toHexString(),
  );
  const shieldedAddress = MidnightBech32m.encode(
    networkId,
    new ShieldedAddress(coinPubKey, encPubKey),
  ).toString();

  const DIV = "──────────────────────────────────────────────────────────────";
  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}

  Shielded (ZSwap)
  └─ Address: ${shieldedAddress}

  Unshielded
  ├─ Address: ${unshieldedKeystore.getBech32Address()}
  └─ Balance: ${formatBalance(unshieldedBalance)} tNight

  Dust
  └─ Address: ${MidnightBech32m.encode(networkId, state.dust.address).toString()}

${DIV}`);
};

export const buildWalletAndWaitForFunds = async (
  config: Config,
  seed: string,
): Promise<WalletContext> => {
  console.log("");

  const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } =
    await withStatus("Building wallet", async () => {
      const keys = deriveKeysFromSeed(seed);
      const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(
        keys[Roles.Zswap],
      );
      const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
      const unshieldedKeystore = createKeystore(
        keys[Roles.NightExternal],
        getNetworkId(),
      );

      const walletConfig = {
        ...buildShieldedConfig(config),
        ...buildUnshieldedConfig(config),
        ...buildDustConfig(config),
      };
      const wallet = await WalletFacade.init({
        configuration: walletConfig,
        shielded: (cfg) =>
          ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
        unshielded: (cfg) =>
          UnshieldedWallet(cfg).startWithPublicKey(
            PublicKey.fromKeyStore(unshieldedKeystore),
          ),
        dust: (cfg) =>
          DustWallet(cfg).startWithSecretKey(
            dustSecretKey,
            ledger.LedgerParameters.initialParameters().dust,
          ),
      });
      await wallet.start(shieldedSecretKeys, dustSecretKey);

      return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
    });

  const networkId = getNetworkId();
  const DIV = "──────────────────────────────────────────────────────────────";
  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}
  Unshielded Address (send tNight here):
  ${unshieldedKeystore.getBech32Address()}

  Fund your wallet with tNight from the Preprod faucet:
  https://faucet.preprod.midnight.network/
${DIV}
`);

  const syncedState = await withStatus("Syncing with network", () =>
    waitForSync(wallet),
  );
  printWalletSummary(syncedState, unshieldedKeystore);

  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  if (balance === 0n) {
    const fundedBalance = await withStatus("Waiting for incoming tokens", () =>
      waitForFunds(wallet),
    );
    console.log(`    Balance: ${formatBalance(fundedBalance)} tNight\n`);
  }

  await registerForDustGeneration(wallet, unshieldedKeystore);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
};

export const buildFreshWallet = async (config: Config): Promise<WalletContext> => {
  const seed = toHex(Buffer.from(generateRandomSeed()));
  const DIV = "──────────────────────────────────────────────────────────────";
  console.log(`
${DIV}
  New Wallet Seed — save this before continuing
${DIV}
  ${seed}
${DIV}
`);
  return await buildWalletAndWaitForFunds(config, seed);
};

export const configureProviders = async (
  ctx: WalletContext,
  config: Config,
): Promise<AgentProofProviders> => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(ctx);
  const zkConfigProvider = new NodeZkConfigProvider<AgentProofCircuits>(
    contractConfig.zkConfigPath,
  );
  const accountId = walletAndMidnightProvider.getCoinPublicKey();
  const storagePassword = `${Buffer.from(accountId, "hex").toString("base64")}!`;
  return {
    privateStateProvider: levelPrivateStateProvider<AgentProofPrivateStateId>({
      privateStateStoreName: contractConfig.privateStateStoreName,
      accountId,
      privateStoragePasswordProvider: () => storagePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

export const getDustBalance = async (
  wallet: WalletFacade,
): Promise<{
  available: bigint;
  pending: bigint;
  availableCoins: number;
  pendingCoins: number;
}> => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  return {
    available: state.dust.balance(new Date()),
    pending: state.dust.pendingCoins.reduce(
      (sum, c) => sum + c.initialValue,
      0n,
    ),
    availableCoins: state.dust.availableCoins.length,
    pendingCoins: state.dust.pendingCoins.length,
  };
};

// Convenience: drive the full demo loop end-to-end in a single shot.
// Useful for the README + non-interactive demo runs.
export const runDemoLoop = async (
  providers: AgentProofProviders,
  contract: DeployedAgentProofContract,
  agentId: string,
): Promise<{ register: FinalizedTxData; verify: FinalizedTxData }> => {
  const agent = findAgent(agentId);
  const rep = demoReputation[agentId];
  const thresholds = demoThresholds[agentId];
  if (!rep || !thresholds) {
    throw new Error(`Missing demo data for ${agentId}`);
  }
  const register = await registerAgent(contract, agent);
  const verify = await submitVerification(
    providers,
    contract,
    agent,
    rep,
    thresholds,
  );
  return { register, verify };
};

export function setLogger(_logger: Logger) {
  logger = _logger;
}
