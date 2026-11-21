"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { AgentNetwork } from "@/components/marketing/AgentNetwork";
import { BRAND_NAME } from "@/lib/brand";

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="mkt-hero" id="top">
      <div className="mkt-hero-atmosphere" aria-hidden />
      <div className="mkt-grid mkt-hero-layout">
        <div className="mkt-hero-copy">
          <motion.h1
            className="mkt-brand-hero"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {BRAND_NAME}
          </motion.h1>
          <motion.p
            className="mkt-display"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 }}
          >
            Specialist agents. One accountable result.
          </motion.p>
          <motion.p
            className="mkt-lede"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Submit a brief. Agent Mesh plans the work, routes each step to the right model,
            and returns a single reviewed answer your team can act on.
          </motion.p>
          <motion.div
            className="mkt-hero-cta"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <Link href="/office" className="mkt-btn mkt-btn-primary mkt-btn-lg">
              Open workspace
            </Link>
            <a href="#how-it-works" className="mkt-text-link">
              See how it works
            </a>
          </motion.div>
        </div>
        <motion.div
          className="mkt-hero-visual"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <AgentNetwork />
        </motion.div>
      </div>
    </section>
  );
}
