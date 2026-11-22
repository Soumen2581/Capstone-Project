"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import {
  markWorkspaceAuthed,
  registerWithPassword,
  setOperatorId,
} from "@/lib/api";
import { BRAND_NAME } from "@/lib/brand";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const user = await registerWithPassword({
        email: email.trim(),
        password,
        display_name: displayName.trim() || undefined,
      });
      setOperatorId(user.id);
      markWorkspaceAuthed();
      router.push("/office");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-shell" data-testid="signup-page">
      <section className="login-card">
        <BrandLogo size={48} variant="mark" />
        <h1>Create your account</h1>
        <p className="login-tagline">
          Register for {BRAND_NAME}. Your details are stored so you can sign back in.
        </p>

        <form onSubmit={onSubmit} className="stack-gap">
          <label className="field">
            <span>Display name</span>
            <input
              data-testid="signup-name"
              value={displayName}
              disabled={busy}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              data-testid="signup-email"
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
              data-testid="signup-password"
              type="password"
              required
              minLength={8}
              value={password}
              disabled={busy}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              data-testid="signup-confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              disabled={busy}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p className="banner-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="px-btn primary" disabled={busy} data-testid="signup-submit">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="meta" style={{ marginTop: 16 }}>
          Already registered? <Link href="/login">Log in</Link>
          {" · "}
          <Link href="/">Back to product site</Link>
        </p>
      </section>
    </main>
  );
}
