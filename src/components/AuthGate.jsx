import { useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { supabase } from "../lib/supabase.js";

export function AuthGate() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function sendLink(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (err) { setError("Something went wrong. Check the email and try again."); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="screen fade-in auth-gate">
        <Wolf face="🐺" mood="happy" size="lg" />
        <h1>Check your email ✉️</h1>
        <p className="sub">We sent a sign-in link to</p>
        <p className="sub" style={{ fontWeight: 700, color: "var(--ink)" }}>{email}</p>
        <p className="sub" style={{ marginTop: 12, fontSize: 14 }}>
          Click the link in the email to continue.
        </p>
        <button
          onClick={() => setSent(false)}
          style={{ marginTop: 20, background: "none", border: "none", color: "var(--soft)", cursor: "pointer", fontSize: 14, textDecoration: "underline" }}
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="screen fade-in auth-gate">
      <Wolf face="🐺" mood="idle" size="lg" />
      <h1>Parent sign-in</h1>
      <p className="sub">Save stories and progress across devices.</p>
      {error && <p className="auth-error">{error}</p>}
      <form className="auth-form" onSubmit={sendLink}>
        <input
          className="auth-input"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
          disabled={loading}
        />
        <BigButton className="primary" type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send magic link"}
        </BigButton>
      </form>
    </div>
  );
}
