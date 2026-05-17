"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeBadge } from "./ModeBadge";
import { WalletPill } from "./WalletPill";

type Screen = {
  href: string;
  label: string;
  n: string;
  match?: string;
};

const SCREENS: Screen[] = [
  { href: "/", label: "Landing", n: "01" },
  { href: "/agent/agent_001", label: "Agent dashboard", n: "02", match: "/agent/" },
  { href: "/agent/agent_001/proof", label: "Generate proof", n: "03", match: "/proof" },
  { href: "/verify/agent_001", label: "Verifier", n: "04", match: "/verify/" },
  { href: "/marketplace", label: "Marketplace", n: "05", match: "/marketplace" },
];

export function Topnav() {
  const pathname = usePathname();
  const isActive = (s: Screen): boolean => {
    if (s.href === "/") return pathname === "/";
    if (s.match) {
      if (s.match === "/proof") return pathname.endsWith("/proof");
      if (s.match === "/agent/") {
        return pathname.startsWith("/agent/") && !pathname.endsWith("/proof");
      }
      return pathname.startsWith(s.match);
    }
    return pathname === s.href;
  };

  return (
    <header className="topnav">
      <Link href="/" className="brand">
        <img
          src="/logo/agentproof-mark.svg"
          alt="AgentProof"
          width={26}
          height={26}
          className="brand-mark"
        />
        <div className="brand-name">
          AgentProof<span className="dim"> / Labs</span>
        </div>
      </Link>

      <div className="navtabs" role="tablist">
        {SCREENS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`navtab ${isActive(s) ? "active" : ""}`}
            role="tab"
            aria-selected={isActive(s)}
          >
            <span className="navtab-num">{s.n}</span>
            {s.label}
          </Link>
        ))}
      </div>

      <div className="topnav-right">
        <ModeBadge />
        <WalletPill />
        <div className="topnav-pill" title="version">
          v0.4.2
        </div>
      </div>
    </header>
  );
}
