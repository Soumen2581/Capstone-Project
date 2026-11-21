"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Lightweight BlurText (React Bits-inspired). Uses framer-motion already in the project
 * instead of the `motion/react` import from upstream BlurText.
 */
export function BlurText({
  text,
  children,
  className = "",
  delay = 0,
  style,
}: {
  text?: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const content = text ?? children;

  if (reduce) {
    return (
      <span className={className} style={style}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={style}
      initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.span>
  );
}

export default BlurText;
