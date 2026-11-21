"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { AmbientBackground } from "@/components/visuals/backgrounds/AmbientBackground";
import { BlurText } from "@/components/visuals/text/BlurText";
import { getOperatorId, loginWithGoogle, setOperatorId, setSessionToken } from "@/lib/api";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function LoginPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [operator, setOperator] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOperator(getOperatorId());
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) {
      return;
    }
    const parent = buttonRef.current;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          setBusy(true);
          setError(null);
          void loginWithGoogle(response.credential)
            .then((user) => {
              setOperatorId(user.id);
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
    };
    document.head.appendChild(script);
  }, [router]);

  const continueAsOperator = (event: FormEvent) => {
    event.preventDefault();
    const value = operator.trim() || "operator";
    // Local demo identity uses X-Operator-Id — clear any leftover Google session.
    setSessionToken(null);
    setOperatorId(value);
    router.push("/office");
  };

  return (
    <main className="login-shell" data-testid="login-page">
      <AmbientBackground variant="threads" />
      <section className="login-card">
        <BrandLogo size={48} variant="mark" />
        <h1>{BRAND_NAME}</h1>
        <p className="login-tagline">
          <BlurText delay={0.04}>{BRAND_TAGLINE}</BlurText>
        </p>

        {GOOGLE_CLIENT_ID ? (
          <div className="login-google">
            <p className="meta" style={{ marginBottom: 12 }}>
              Sign in with Google to get a verified workspace session.
            </p>
            <div ref={buttonRef} data-testid="google-signin" />
            {busy && <p className="meta">Signing in…</p>}
          </div>
        ) : (
          <p className="meta" data-testid="login-google-hint">
            Google sign-in is optional. For now, continue with a local operator id below.
            To enable Google later, set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and{" "}
            <code>GOOGLE_CLIENT_ID</code>, then <code>AUTH_MODE=google</code>.
          </p>
        )}

        <div className="login-divider" aria-hidden>
          <span>or</span>
        </div>

        <form onSubmit={continueAsOperator} className="stack-gap">
          <label className="field">
            <span>Local operator id</span>
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
            Used as your workspace identity in demo mode. Any short name works.
          </p>
          {error && (
            <p className="banner-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="px-btn primary" disabled={busy} data-testid="login-continue">
            Continue to workspace
          </button>
        </form>

        <p className="meta" style={{ marginTop: 16 }}>
          <Link href="/office">Skip to office</Link>
          {" · "}
          <Link href="/">Product site</Link>
        </p>
      </section>
    </main>
  );
}
