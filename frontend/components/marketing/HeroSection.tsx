"use client";

import Link from "next/link";

import { AgentNetwork } from "@/components/marketing/AgentNetwork";
import FadeContent from "@/components/react-bits/FadeContent";
import AnimatedContent from "@/components/visuals/interactions/AnimatedContent";
import { AmbientBackground } from "@/components/visuals/backgrounds/AmbientBackground";
import { BrandGradientText } from "@/components/visuals/text/BrandGradientText";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { useWorkspaceAuthed } from "@/lib/useWorkspaceAuth";

export function HeroSection() {
  const authed = useWorkspaceAuthed();

  return (
    <section className="mkt-hero" id="top">
      <AmbientBackground variant="threads" className="mkt-hero-ambient" />
      <div className="mkt-hero-atmosphere" aria-hidden />

      <div className="mkt-hero-stage">
        <div className="mkt-hero-copy">
          <FadeContent trigger="mount" effect="fade" blur={false} duration={0.9} delay={0.05}>
            <h1 className="mkt-brand-hero">
              <BrandGradientText>{BRAND_NAME}</BrandGradientText>
            </h1>
          </FadeContent>

          <AnimatedContent
            trigger="mount"
            direction="vertical"
            distance={28}
            duration={0.85}
            delay={0.18}
            blur={0}
          >
            <p className="mkt-display">Specialist agents. One accountable result.</p>
          </AnimatedContent>

          <AnimatedContent
            trigger="mount"
            direction="vertical"
            distance={22}
            duration={0.8}
            delay={0.32}
            blur={0}
          >
            <p className="mkt-lede">{BRAND_TAGLINE}</p>
          </AnimatedContent>

          <AnimatedContent
            trigger="mount"
            direction="vertical"
            distance={18}
            duration={0.75}
            delay={0.46}
            blur={0}
          >
            <div className="mkt-hero-cta">
              {authed ? (
                <Link href="/office" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                  Open workspace
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                    Sign up
                  </Link>
                  <Link href="/login" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </AnimatedContent>
        </div>

        <FadeContent
          trigger="mount"
          effect="fade"
          blur={false}
          duration={1.1}
          delay={0.28}
          className="mkt-hero-visual"
        >
          <AgentNetwork className="mkt-hero-network" />
        </FadeContent>
      </div>

      <a href="#idea" className="mkt-scroll-cue" aria-label="Scroll to next section">
        <span className="mkt-scroll-cue-line" aria-hidden />
        <span>Scroll</span>
      </a>
    </section>
  );
}
