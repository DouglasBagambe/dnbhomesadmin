"use client";
import { Brand, ThemeControl } from "../../components/ThemeControl";
import { safeNext } from "../../lib/presentation.mjs";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many attempts. Please try again shortly."
            : "Unable to sign in. Check your account details and try again.",
        );
        setLoading(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(safeNext(next));
      router.refresh();
    } catch {
      setError("The API is unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="login-page">
      <div className="login-tools">
        <ThemeControl />
      </div>
      <form className="login-card" onSubmit={submit}>
        <Brand />
        <p className="eyebrow">Authorized access</p>
        <h1>Sign in</h1>
        <p>Use your authorized administrator account.</p>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="login-note">Homes operations · dnb</p>
      </form>
    </main>
  );
}
