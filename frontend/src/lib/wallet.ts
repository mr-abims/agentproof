// Lace wallet integration. Reads window.midnight, finds the Lace entry, and
// exposes connect/disconnect + state. Browser-only.

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ConnectedAPI,
  InitialAPI,
} from "@midnight-ntwrk/dapp-connector-api";

import { MIDNIGHT_CONFIG } from "./midnight/config";

export type WalletState =
  | { status: "absent" }
  | { status: "available"; api: InitialAPI }
  | { status: "connecting"; api: InitialAPI }
  | {
      status: "connected";
      api: InitialAPI;
      connected: ConnectedAPI;
      address: string;
      coinPublicKey: string;
    }
  | { status: "error"; api?: InitialAPI; message: string };

const LACE_KEY = "mnLace";

function readInitialApi(): InitialAPI | null {
  if (typeof window === "undefined") return null;
  const root = window.midnight;
  if (!root) return null;
  const lace = root[LACE_KEY];
  if (!lace) return null;
  return lace;
}

export function useLaceWallet(): {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
} {
  const [state, setState] = useState<WalletState>({ status: "absent" });

  useEffect(() => {
    const api = readInitialApi();
    if (api) {
      setState((prev) =>
        prev.status === "connected" ? prev : { status: "available", api },
      );
    } else {
      // Lace can inject after a short delay. Re-check briefly.
      const t = setTimeout(() => {
        const api2 = readInitialApi();
        if (api2) setState({ status: "available", api: api2 });
      }, 500);
      return () => clearTimeout(t);
    }
  }, []);

  const connect = useCallback(async () => {
    const api = readInitialApi();
    if (!api) {
      setState({
        status: "error",
        message:
          "Lace wallet not detected. Install the Lace Beta extension and reload.",
      });
      return;
    }
    setState({ status: "connecting", api });
    try {
      const networkId = MIDNIGHT_CONFIG.networkId.toString().toLowerCase();
      const connected = await api.connect(networkId);
      const { shieldedAddress, shieldedCoinPublicKey } =
        await connected.getShieldedAddresses();
      setState({
        status: "connected",
        api,
        connected,
        address: shieldedAddress,
        coinPublicKey: shieldedCoinPublicKey,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ status: "error", api, message: msg });
    }
  }, []);

  const disconnect = useCallback(() => {
    const api = readInitialApi();
    setState(api ? { status: "available", api } : { status: "absent" });
  }, []);

  return { state, connect, disconnect };
}
