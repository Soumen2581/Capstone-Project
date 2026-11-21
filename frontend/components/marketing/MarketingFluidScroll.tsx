"use client";

import { useEffect, useState, type ReactNode } from "react";

const SECTION_SELECTOR =
  ".mkt-root .mkt-hero, .mkt-root .mkt-section, .mkt-root .mkt-cta";

/**
 * Landing-only section flow via CSS scroll-snap, plus a live progress rail.
 * Workspace routes are unaffected. Honors reduced-motion.
 */
export function MarketingFluidScroll({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduce = () => setReduce(media.matches);
    syncReduce();
    media.addEventListener("change", syncReduce);

    document.documentElement.classList.add("mkt-fluid");
    if (!media.matches) {
      document.documentElement.classList.add("mkt-snap");
    }

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter(
        (el) => el.getClientRects().length > 0,
      );

    const refresh = () => {
      const list = sections();
      setCount(list.length);
      const mid = window.scrollY + window.innerHeight * 0.4;
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
      setActive(best);
    };

    refresh();
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);

    return () => {
      document.documentElement.classList.remove("mkt-fluid", "mkt-snap");
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      media.removeEventListener("change", syncReduce);
    };
  }, []);

  const goTo = (index: number) => {
    const list = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    const target = list[index];
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      {children}
      {count > 1 && (
        <nav className="mkt-flow-rail" aria-label="Page sections">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              className={index === active ? "mkt-flow-dot on" : "mkt-flow-dot"}
              aria-label={`Go to section ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </nav>
      )}
    </>
  );
}
