import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Topnav } from "@/components/Topnav";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentProof",
  description:
    "Privacy-preserving reputation proofs for AI agents. Built on Midnight.",
  icons: {
    icon: [
      { url: "/logo/agentproof-mark.svg", type: "image/svg+xml" },
      { url: "/logo/png/agentproof-mark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/png/agentproof-mark-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo/png/agentproof-app-icon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="shell">
          <Topnav />
          <div className="page">{children}</div>
          <footer className="footer">
            <div className="footer-left">
              <span>© 2026 AgentProof Labs</span>
              <span className="footer-sep">·</span>
              <span>Trust layer for AI agents</span>
            </div>
            <div className="footer-right">
              <a href="#docs">docs</a>
              <a href="#circuits">circuits</a>
              <a href="#status">status</a>
              <a href="#github">github</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
