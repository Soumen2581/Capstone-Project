"use client";

import { useEffect, useState } from "react";

/** Prefer static / CSS visuals when the user asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * Heuristic for constrained devices — skip WebGL ambient backgrounds.
 * Saves battery and keeps the workflow monitor responsive.
 */
export function useLowPowerVisuals(): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    const narrow = window.matchMedia("(max-width: 720px)").matches;
    setLow(Boolean(saveData) || cores <= 4 || (typeof memory === "number" && memory <= 4) || narrow);
  }, []);

  return low;
}

/** Pause rAF-driven effects while the document is hidden. */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}
