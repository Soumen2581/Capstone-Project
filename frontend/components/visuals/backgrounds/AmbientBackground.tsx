"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { DotGrid } from "@/components/visuals/backgrounds/DotGrid";
import {
  useDocumentVisible,
  useLowPowerVisuals,
  usePrefersReducedMotion,
} from "@/components/visuals/hooks/useVisualBudget";
import { BRAND_COLORS } from "@/lib/brand";

const DarkVeil = dynamic(() => import("@/components/visuals/backgrounds/DarkVeil"), {
  ssr: false,
  loading: () => null,
});

const Threads = dynamic(() => import("@/components/visuals/backgrounds/Threads"), {
  ssr: false,
  loading: () => null,
});

export type AmbientVariant = "none" | "veil" | "threads" | "dots" | "static";

/**
 * Single shared ambient layer. Pages pick a variant; heavy WebGL loads once via dynamic import.
 * Falls back to CSS dots / static gradient on reduced-motion or low-power devices.
 */
export function AmbientBackground({
  variant = "veil",
  className = "",
}: {
  variant?: AmbientVariant;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const lowPower = useLowPowerVisuals();
  const visible = useDocumentVisible();

  const resolved = useMemo<AmbientVariant>(() => {
    if (variant === "none") return "none";
    if (reduced || lowPower) {
      if (variant === "threads" || variant === "veil") return "static";
      return variant === "dots" ? "dots" : "static";
    }
    return variant;
  }, [variant, reduced, lowPower]);

  if (resolved === "none") return null;

  return (
    <div className={`am-ambient ${className}`.trim()} aria-hidden>
      {resolved === "veil" && (
        <DarkVeil
          color={BRAND_COLORS.periwinkle}
          speed={0.35}
          brightness={0.45}
          glow={0.35}
          opacity={0.55}
          mouseInteraction={false}
          paused={!visible}
          quality={0.55}
          className="am-ambient-canvas"
        />
      )}
      {resolved === "threads" && (
        <Threads
          color={BRAND_COLORS.periwinkle}
          accentColor={BRAND_COLORS.mintBright}
          amplitude={0.55}
          distance={0.25}
          enableMouseInteraction={false}
          speed={0.4}
          opacity={0.45}
          brightness={0.7}
          lineCount={28}
          paused={!visible}
          className="am-ambient-canvas"
        />
      )}
      {resolved === "dots" && (
        <DotGrid color="rgba(91, 124, 250, 0.28)" gap={26} opacity={0.5} className="am-ambient-canvas" />
      )}
      {resolved === "static" && <div className="am-ambient-static" />}
      <div className="am-ambient-veil" />
    </div>
  );
}
