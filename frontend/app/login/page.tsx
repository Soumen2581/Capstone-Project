"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import {
  getOperatorId,
  loginWithGoogle,
  loginWithPassword,
  markWorkspaceAuthed,
  setOperatorId,
  setSessionToken,
} from "@/lib/api";
import { BRAND_TAGLINE } from "@/lib/brand";

const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

export default function LoginPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [operator, setOperator] = useState("");
  const [showLocal, setShowLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    setOperator(getOperatorId());
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) {
      return;
    }
    const parent = buttonRef.current;
    let cancelled = false;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (cancelled || !parent.isConnected) {
        return;
      }
      try {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            setBusy(true);
            setError(null);
            void loginWithGoogle(response.credential)
              .then((user) => {
                setOperatorId(user.id);
                markWorkspaceAuthed();
                router.push("/office");
              })
              .catch((cause) => {
                setError(cause instanceof Error ? cause.message : "Google sign-in failed");
              })
              .finally(() => setBusy(false));
          },
        });
        parent.innerHTML = "";
        window.google?.accounts.id.renderButton(parent, {
          theme: "filled_black",
          size: "large",
          width: 320,
        });
        setGoogleReady(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Google button failed to load");
      }
    };
    script.onerror = () => {
      setError("Could not load Google sign-in. Use email and password below.");
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [router]);

  const onPasswordLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await loginWithPassword({
        email: email.trim(),
        password,
      });
      setOperatorId(user.id);
      markWorkspaceAuthed();
      router.push("/office");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const continueAsOperator = (event: FormEvent) => {
    event.preventDefault();
    const value = operator.trim() || "operator";
    setSessionToken(null);
    setOperatorId(value);
    markWorkspaceAuthed();
    router.push("/office");
  };

  return (
    <main className="login-shell" data-testid="login-page">
      <section className="login-card">
        <BrandLogo size={48} variant="mark" />
        <h1>Log in</h1>
        <p className="login-tagline">{BRAND_TAGLINE}</p>

        <form onSubmit={onPasswordLogin} className="stack-gap">
          <label className="field">
            <span>Email</span>
            <input
              data-testid="login-email"
              type="email"
              required
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              data-testid="login-password"
              type="password"
              required
              value={password}
              disabled={busy}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="banner-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="px-btn primary" disabled={busy} data-testid="login-submit">
            {busy ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="login-divider" aria-hidden>
          <span>or Google</span>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <div className="login-google">
            <div ref={buttonRef} data-testid="google-signin" />
            {busy && <p className="meta">Signing in…</p>}
            {!googleReady && <p className="meta">Loading Google button…</p>}
          </div>
        ) : (
          <p className="meta" data-testid="login-google-hint">
            Google sign-in is optional when configured.
          </p>
        )}

        <p className="meta" style={{ marginTop: 16 }}>
          New here? <Link href="/signup">Sign up</Link>
          {" · "}
          <Link href="/">Back to product site</Link>
        </p>

        <button
          type="button"
          className="meta"
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            padding: 0,
            color: "inherit",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => setShowLocal((value) => !value)}
        >
          {showLocal ? "Hide local workspace" : "Continue with a local workspace name"}
        </button>

        {showLocal && (
          <form onSubmit={continueAsOperator} className="stack-gap" style={{ marginTop: 12 }}>
            <label className="field">
              <span>Workspace name</span>
              <input
                data-testid="login-operator"
                value={operator}
                disabled={busy}
                onChange={(event) => setOperator(event.target.value)}
                placeholder="operator"
                autoComplete="username"
              />
            </label>
            <p className="meta" style={{ margin: 0 }}>
              Local-only access is not stored as a registered account.
            </p>
            <button type="submit" className="px-btn" disabled={busy} data-testid="login-continue">
              Continue to workspace
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
