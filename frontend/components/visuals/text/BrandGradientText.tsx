"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Brand emphasis for titles — solid high-contrast text (no blur, no transparent clip).
 */
export function BrandGradientText({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  colors?: readonly string[];
  style?: CSSProperties;
}) {
  return (
    <span className={`brand-gradient-text ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}

export default BrandGradientText;
