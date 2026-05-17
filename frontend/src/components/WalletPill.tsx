"use client";

import { useLaceWallet } from "@/lib/wallet";

import { Icon } from "./Icon";

export function WalletPill() {
  const { state, connect } = useLaceWallet();

  if (state.status === "absent") {
    return (
      <div className="topnav-pill" title="Lace wallet not installed">
        <span className="dot" style={{ background: "var(--fg-3)" }} />
        no wallet
      </div>
    );
  }

  if (state.status === "connecting") {
    return (
      <div className="topnav-pill">
        <span className="dot" style={{ background: "var(--warn)" }} />
        connecting…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <button
        className="topnav-pill"
        onClick={connect}
        type="button"
        title={state.message}
        style={{ cursor: "pointer" }}
      >
        <span className="dot" style={{ background: "var(--danger)" }} />
        retry connect
      </button>
    );
  }

  if (state.status === "available") {
    return (
      <button
        className="topnav-pill"
        onClick={connect}
        type="button"
        style={{ cursor: "pointer" }}
      >
        <Icon name="lock" size={11} />
        connect Lace
      </button>
    );
  }

  // connected
  const short = `${state.address.slice(0, 6)}…${state.address.slice(-4)}`;
  return (
    <div className="topnav-pill" title={state.address}>
      <span className="dot" />
      {short}
    </div>
  );
}
