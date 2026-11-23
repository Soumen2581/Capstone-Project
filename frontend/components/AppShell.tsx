"use client";

import {
  Bot,
  Hammer,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export type NavTab = "home" | "agents" | "build" | "work" | "messages" | "settings";

const NAV: {
  id: NavTab;
  label: string;
  testId: string;
  icon: typeof Sparkles;
}[] = [
  { id: "home", label: "Command", testId: "tab-command", icon: Sparkles },
  { id: "agents", label: "Agents", testId: "tab-agents", icon: Bot },
  { id: "build", label: "Build", testId: "tab-build", icon: Hammer },
  { id: "work", label: "Work", testId: "tab-work", icon: Workflow },
  { id: "messages", label: "Messages", testId: "tab-activity", icon: MessageSquare },
  { id: "settings", label: "Settings", testId: "tab-settings", icon: Settings },
];

export function AppShell({
  tab,
  onTab,
  onNewTask,
  children,
}: {
  tab: NavTab;
  onTab: (tab: NavTab) => void;
  onNewTask: () => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = NAV.find((item) => item.id === tab) ?? NAV[0]!;

  return (
    <div className={`app-shell${collapsed ? " collapsed" : ""}`}>
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <div className="app-sidebar-head">
          <Link href="/" className="app-sidebar-brand" aria-label={`${BRAND_NAME} marketing site`}>
            <BrandLogo size={34} variant="mark" />
            <span className="app-sidebar-brand-text">
              <strong>{BRAND_NAME}</strong>
              <span>{BRAND_TAGLINE}</span>
            </span>
          </Link>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="app-nav" aria-label="Office sections" data-testid="office-tabs">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? "app-nav-btn on" : "app-nav-btn"}
                data-testid={item.testId}
                onClick={() => onTab(item.id)}
              >
                <Icon className="app-nav-icon" aria-hidden />
                <span className="app-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="app-sidebar-foot">
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="brand-row">
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="brand-block">
              <h1 className="brand" data-testid="brand">
                {active.label}
              </h1>
              <p className="tagline">{BRAND_NAME} workspace</p>
            </div>
          </div>
          <div className="app-topbar-actions">
            <ThemeToggle compact />
            <Link href="/" className="px-btn ghost topbar-site-link">
              Product site
            </Link>
            <button type="button" className="px-btn primary" onClick={onNewTask}>
              New request
            </button>
          </div>
        </header>

        {mobileOpen && (
          <nav className="mobile-nav-drawer" aria-label="Mobile sections">
            <div className="mobile-nav-grid">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={tab === item.id ? "mobile-nav-item on" : "mobile-nav-item"}
                    onClick={() => {
                      onTab(item.id);
                      setMobileOpen(false);
                    }}
                  >
                    <Icon size={18} aria-hidden />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mobile-nav-foot">
              <ThemeToggle compact />
            </div>
          </nav>
        )}

        {children}
      </div>
    </div>
  );
}
