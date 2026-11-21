"use client";

import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="mkt-section mkt-cta">
      <div className="mkt-grid mkt-section-narrow">
        <div>
          <p className="mkt-kicker">08 · Begin</p>
          <h2 className="mkt-title">Give your AI team a task.</h2>
          <p className="mkt-body">Open the office, describe the brief, and watch specialists collaborate.</p>
          <Link href="/login" className="mkt-btn mkt-btn-primary mkt-btn-lg">
            Start a task
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-grid mkt-footer-inner">
        <div>
          <strong>Agent Mesh</strong>
          <p>An operating system for autonomous AI teams.</p>
        </div>
        <nav aria-label="Footer">
          <a href="#agents">Agents</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/login">Workspace</Link>
        </nav>
      </div>
    </footer>
  );
}
