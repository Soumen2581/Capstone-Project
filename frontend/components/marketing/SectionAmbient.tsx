"use client";

import { useEffect, useRef, useState } from "react";

import {
  AmbientBackground,
  type AmbientVariant,
} from "@/components/visuals/backgrounds/AmbientBackground";
import FadeContent from "@/components/react-bits/FadeContent";

/**
 * Subtle React Bits ambient layer for a marketing section.
 * Fades / flows in when the section enters the viewport; pauses when it leaves.
 */
export function SectionAmbient({
  variant = "dots",
}: {
  variant?: Exclude<AmbientVariant, "none">;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const section = host?.closest("section");
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(Boolean(entry?.isIntersecting && (entry.intersectionRatio ?? 0) > 0.2));
      },
      { threshold: [0, 0.2, 0.45, 0.7], rootMargin: "-8% 0px -8% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`mkt-section-ambient${active ? " on" : ""}`}
      aria-hidden
    >
      <FadeContent
        trigger="scroll"
        effect="fade"
        blur={false}
        duration={1.05}
        threshold={0.2}
        once={false}
        className="mkt-section-ambient-fade"
      >
        <AmbientBackground
          variant={variant}
          active={active}
          intensity="subtle"
          className="mkt-section-ambient-layer"
        />
      </FadeContent>
    </div>
  );
}
