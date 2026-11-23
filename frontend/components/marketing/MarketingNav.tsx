"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandWordmark } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useWorkspaceAuthed } from "@/lib/useWorkspaceAuth";

const LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#workspace", label: "Workspace" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const authed = useWorkspaceAuthed();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`mkt-nav ${scrolled ? "mkt-nav-scrolled" : ""}`}>
      <div className="mkt-nav-inner">
        <BrandWordmark href="#top" size={40} className="mkt-logo" />
        <nav className="mkt-nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mkt-nav-actions">
          <ThemeToggle compact className="mkt-theme-toggle" />
          {authed ? (
            <Link href="/office" className="mkt-btn mkt-btn-primary">
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/login" className="mkt-btn mkt-btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="mkt-btn mkt-btn-primary">
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="mkt-nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mkt-nav-drawer" role="dialog" aria-label="Mobile navigation">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <ThemeToggle />
          {authed ? (
            <Link href="/office" className="mkt-btn mkt-btn-primary" onClick={() => setOpen(false)}>
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/login" className="mkt-btn mkt-btn-ghost" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className="mkt-btn mkt-btn-primary" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
