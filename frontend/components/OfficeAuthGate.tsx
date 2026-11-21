"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { isWorkspaceAuthed } from "@/lib/api";

/**
 * Sends visitors to /login before the workspace mounts.
 * Auth is granted on the login page (Google session or local operator continue).
 */
export function OfficeAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isWorkspaceAuthed()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="login-shell" data-testid="office-auth-gate">
        <section className="login-card">
          <p className="meta" style={{ margin: 0 }}>
            Checking workspace access…
          </p>
          <p className="meta">
            If this stays here, open <a href="/login">sign in</a> and continue to the workspace.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
