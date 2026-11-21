"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { AmbientBackground } from "@/components/visuals/backgrounds/AmbientBackground";
import { BlurText } from "@/components/visuals/text/BlurText";
import {
  getOperatorId,
  loginWithGoogle,
  markWorkspaceAuthed,
  setOperatorId,
  setSessionToken,
} from "@/lib/api";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
const GOOGLE_CLIENT_HINT = GOOGLE_CLIENT_ID
  ? `${GOOGLE_CLIENT_ID.slice(0, 12)}…${GOOGLE_CLIENT_ID.slice(-20)}`
  : "";

export default function LoginPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [operator, setOperator] = useState("");
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
      setError("Could not load Google sign-in script. Use local operator login below.");
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [router]);

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
      <AmbientBackground variant="threads" />
      <section className="login-card">
        <BrandLogo size={48} variant="mark" />
        <h1>{BRAND_NAME}</h1>
        <p className="login-tagline">
          <BlurText delay={0.04}>{BRAND_TAGLINE}</BlurText>
        </p>

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
            Recommended for Capstone right now. Enter any name and continue.
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

        <div className="login-divider" aria-hidden>
          <span>or Google</span>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <div className="login-google">
            <div ref={buttonRef} data-testid="google-signin" />
            {busy && <p className="meta">Signing in…</p>}
            <p className="meta" style={{ marginTop: 12 }}>
              If Google shows <strong>invalid_client</strong>, the OAuth client was deleted or
              does not match. Create a new Web client in Google Cloud and paste the Client ID
              here in chat. Configured id: <code>{GOOGLE_CLIENT_HINT}</code>
              {googleReady ? "" : " (loading button…)"}
            </p>
            <p className="meta">
              Open the app at <code>http://localhost:3000/login</code> (not 127.0.0.1) after
              origins include both hosts.
            </p>
          </div>
        ) : (
          <p className="meta" data-testid="login-google-hint">
            Google sign-in is not configured. Use local operator login above.
          </p>
        )}

        <p className="meta" style={{ marginTop: 16 }}>
          <Link href="/">Back to product site</Link>
        </p>
      </section>
    </main>
  );
}
