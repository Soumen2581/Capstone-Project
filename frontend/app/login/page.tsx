"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import {
  getOperatorId,
  loginWithGoogle,
  markWorkspaceAuthed,
  setOperatorId,
  setSessionToken,
} from "@/lib/api";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
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
          text: isSignup ? "signup_with" : "signin_with",
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
  }, [router, isSignup]);

  const continueAsOperator = (event: FormEvent) => {
    event.preventDefault();
    const value = operator.trim() || "operator";
    setSessionToken(null);
    setOperatorId(value);
    markWorkspaceAuthed();
    router.push("/office");
  };

  return (
    <main className="login-shell" data-testid={isSignup ? "signup-page" : "login-page"}>
      <section className="login-card">
        <BrandLogo size={48} variant="mark" />
        <h1>{isSignup ? "Create your workspace" : BRAND_NAME}</h1>
        <p className="login-tagline">
          {isSignup
            ? "Register with Google, or pick a workspace name to get started."
            : BRAND_TAGLINE}
        </p>

        <form onSubmit={continueAsOperator} className="stack-gap">
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
            {isSignup
              ? "Choose a name for local access, or continue with Google to register."
              : "Enter a name to continue, or sign in with Google below."}
          </p>
          {error && (
            <p className="banner-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="px-btn primary" disabled={busy} data-testid="login-continue">
            {isSignup ? "Create workspace" : "Continue to workspace"}
          </button>
        </form>

        <div className="login-divider" aria-hidden>
          <span>or Google</span>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <div className="login-google">
            <div ref={buttonRef} data-testid="google-signin" />
            {busy && <p className="meta">{isSignup ? "Creating account…" : "Signing in…"}</p>}
            {!googleReady && <p className="meta">Loading Google button…</p>}
          </div>
        ) : (
          <p className="meta" data-testid="login-google-hint">
            Google sign-in is optional. Use a workspace name above.
          </p>
        )}

        <p className="meta" style={{ marginTop: 16 }}>
          {isSignup ? (
            <>
              Already registered? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link href="/signup">Sign up</Link>
            </>
          )}
          {" · "}
          <Link href="/">Back to product site</Link>
        </p>
      </section>
    </main>
  );
}
