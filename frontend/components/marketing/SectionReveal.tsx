"use client";

import type { ReactNode } from "react";

import AnimatedContent from "@/components/visuals/interactions/AnimatedContent";

/** Shared landing reveal: rise + fade as the section enters view. */
export function SectionReveal({
  children,
  delay = 0,
  distance = 36,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
}) {
  return (
    <AnimatedContent
      trigger="scroll"
      direction="vertical"
      distance={distance}
      duration={0.85}
      delay={delay}
      threshold={0.18}
      blur={0}
      once
    >
      {children}
    </AnimatedContent>
  );
}
