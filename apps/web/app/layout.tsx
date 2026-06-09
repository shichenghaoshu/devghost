import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "DevGhost / GhostBench",
  description: "Local-first personalized coding agent skill compiler and benchmark"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <nav className="nav" aria-label="Primary">
            <Link className="brand" href="/">
              DevGhost
            </Link>
            <div className="links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/tasks">Tasks</Link>
              <Link href="/report">Report</Link>
              <Link href="/leaderboard">Leaderboard</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
