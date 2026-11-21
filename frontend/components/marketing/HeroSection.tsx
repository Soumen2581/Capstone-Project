"use client";

import Link from "next/link";

import { AgentNetwork } from "@/components/marketing/AgentNetwork";
import { AmbientBackground } from "@/components/visuals/backgrounds/AmbientBackground";
import { BrandGradientText } from "@/components/visuals/text/BrandGradientText";
import { BRAND_NAME } from "@/lib/brand";

export function HeroSection() {
  return (
    <section className="mkt-hero" id="top">
      <AmbientBackground variant="static" className="mkt-hero-ambient" />
      <div className="mkt-hero-atmosphere" aria-hidden />
      <div className="mkt-grid mkt-hero-layout">
        <div className="mkt-hero-copy">
          <h1 className="mkt-brand-hero">
            <BrandGradientText>{BRAND_NAME}</BrandGradientText>
          </h1>
          <p className="mkt-display">Specialist agents. One accountable result.</p>
          <p className="mkt-lede">
            Submit a brief. Agent Mesh plans the work, routes each step to the right model,
            and returns a single reviewed answer your team can act on.
          </p>
          <div className="mkt-hero-cta">
            <Link href="/login" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Open workspace
            </Link>
            <a href="#how-it-works" className="mkt-text-link">
              See how it works
            </a>
          </div>
        </div>
        <div className="mkt-hero-visual">
          <AgentNetwork />
        </div>
      </div>
    </section>
  );
}
