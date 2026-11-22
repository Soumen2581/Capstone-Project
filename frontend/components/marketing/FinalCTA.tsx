"use client";

import Link from "next/link";

import { SectionAmbient } from "@/components/marketing/SectionAmbient";
import { SectionReveal } from "@/components/marketing/SectionReveal";

export function FinalCTA() {
  return (
    <section className="mkt-section mkt-cta">
      <SectionAmbient variant="veil" />
      <div className="mkt-grid mkt-section-narrow">
        <SectionReveal>
          <p className="mkt-kicker">08 · Begin</p>
          <h2 className="mkt-title">Give your AI team a task.</h2>
          <p className="mkt-body">Open the office, describe the brief, and watch specialists collaborate.</p>
          <div className="mkt-hero-cta">
            <Link href="/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Sign up
            </Link>
            <Link href="/login" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
              Log in
            </Link>
          </div>
        </SectionReveal>
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
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </nav>
      </div>
    </footer>
  );
}
