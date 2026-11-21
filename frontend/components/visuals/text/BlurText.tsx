"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Clear text renderer (no blur / filter animations).
 * Kept as a named export so existing call sites stay stable.
 */
export function BlurText({
  text,
  children,
  className = "",
  style,
}: {
  text?: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={style}>
      {text ?? children}
    </span>
  );
}

export default BlurText;
