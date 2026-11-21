"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Landing-only section flow: wheel / keys move one section at a time with smooth
 * scroll. Workspace routes are unaffected. Honors reduced-motion.
 */
export function MarketingFluidScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("mkt-fluid");
    if (reduce) {
      return () => document.documentElement.classList.remove("mkt-fluid");
    }

    const sectionSelector = ".mkt-root .mkt-hero, .mkt-root .mkt-section, .mkt-root .mkt-cta, .mkt-root .mkt-footer";
    let locked = false;
    let unlockTimer = 0;

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(sectionSelector)).filter(
        (el) => el.offsetParent !== null || el.getClientRects().length > 0,
      );

    const currentIndex = () => {
      const list = sections();
      const mid = window.scrollY + window.innerHeight * 0.35;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      list.forEach((el, index) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(top - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      return best;
    };

    const goTo = (index: number) => {
      const list = sections();
      if (!list.length) {
        return;
      }
      const clamped = Math.max(0, Math.min(list.length - 1, index));
      const target = list[clamped]!;
      locked = true;
      window.clearTimeout(unlockTimer);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, 750);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || locked) {
        event.preventDefault();
        return;
      }
      if (Math.abs(event.deltaY) < 8) {
        return;
      }
      event.preventDefault();
      goTo(currentIndex() + (event.deltaY > 0 ? 1 : -1));
    };

    const onKey = (event: KeyboardEvent) => {
      if (locked) {
        return;
      }
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goTo(currentIndex() + 1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goTo(currentIndex() - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(sections().length - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.classList.remove("mkt-fluid");
      window.clearTimeout(unlockTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return <>{children}</>;
}
