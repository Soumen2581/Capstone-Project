"use client";

import type { CSSProperties } from "react";

/**
 * Lightweight CSS Dot Grid — React Bits DotGrid WebGL alternative.
 * Same aesthetic, negligible main-thread cost, safe for live workflow pages.
 */
export function DotGrid({
  className = "",
  color = "rgba(91, 124, 250, 0.22)",
  gap = 28,
  size = 1.25,
  opacity = 0.55,
  style,
}: {
  className?: string;
  color?: string;
  gap?: number;
  size?: number;
  opacity?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`am-dot-grid ${className}`.trim()}
      aria-hidden
      style={
        {
          ...style,
          opacity,
          backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size + 0.5}px)`,
          backgroundSize: `${gap}px ${gap}px`,
        } as CSSProperties
      }
    />
  );
}

export default DotGrid;
