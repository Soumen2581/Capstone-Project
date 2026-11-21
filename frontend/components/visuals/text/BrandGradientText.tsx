"use client";

import type { CSSProperties, ReactNode } from "react";

import { BRAND_GRADIENT } from "@/lib/brand";
import { usePrefersReducedMotion } from "@/components/visuals/hooks/useVisualBudget";

/**
 * Lightweight brand gradient heading — React Bits GradientText aesthetic without
 * a continuous rAF loop. Prefer this for Command / hero titles.
 */
export function BrandGradientText({
  children,
  className = "",
  colors = BRAND_GRADIENT,
  style,
}: {
  children: ReactNode;
  className?: string;
  colors?: readonly string[];
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const stops = colors.join(", ");

  return (
    <span
      className={`brand-gradient-text ${reduced ? "is-static" : ""} ${className}`.trim()}
      style={
        {
          ...style,
          backgroundImage: `linear-gradient(105deg, ${stops})`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}

export default BrandGradientText;
