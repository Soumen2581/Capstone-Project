/** Product brand — single source for name, assets, and logo-derived colors. */

export const BRAND_NAME = "Agent Mesh";
export const BRAND_TAGLINE = "Specialist AI agents, coordinated for real work";

/** Square icon (`frontend/public/brand/icon.png`) — navy mesh mark. */
export const BRAND_MARK_SRC = "/brand/icon.png";

/** Horizontal wordmark (`frontend/public/brand/wordmark.png`). */
export const BRAND_WORDMARK_SRC = "/brand/wordmark.png";

/** Vector mark (`frontend/public/brand/logo.svg`) — charcoal + mint variant. */
export const BRAND_LOGO_SVG = "/brand/logo.svg";

/**
 * Colors sampled from the actual logo assets (icon.png + logo.svg).
 * icon.png: navy #101431, periwinkle nodes #5A6ED2/#788CFA, mint #32DCA0
 * logo.svg: charcoal #141412, mint stroke #3DD6B0, forest #1F5C4C, paper #F6F5F2
 */
export const BRAND_COLORS = {
  navy: "#101431",
  navyDeep: "#0a0c1c",
  navyMid: "#151936",
  navySurface: "#1a1f42",
  navyRaised: "#22284f",
  periwinkle: "#5b7cfa",
  periwinkleSoft: "#788cfa",
  periwinkleDeep: "#466efa",
  mint: "#32dca0",
  mintBright: "#3dd6b0",
  forest: "#1f5c4c",
  charcoal: "#141412",
  paper: "#f6f5f2",
  lavender: "#e6e6fa",
} as const;

/** Gradient stops for headings (brand-safe, high contrast on dark). */
export const BRAND_GRADIENT = [
  BRAND_COLORS.periwinkleSoft,
  BRAND_COLORS.mintBright,
  BRAND_COLORS.periwinkle,
] as const;
