import { useState } from "react";
import { Wolf, BigButton } from "./ui.jsx";
import { createProfile } from "../lib/profile.js";

export function ProfileSetup({ onCreated }) {
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const profile = await createProfile(trimmed);
      onCreated(profile);
    } catch {
      setError("Could not create profile. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="screen fade-in auth-gate">
      <Wolf face="🐺" mood="happy" size="lg" />
      <h1>Who's learning?</h1>
      <p className="sub">Enter your child's name to get started.</p>
      {error && <p className="auth-error">{error}</p>}
      <form className="auth-form" onSubmit={submit}>
        <input
          className="auth-input"
          type="text"
          placeholder="Child's name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          disabled={loading}
          maxLength={50}
        />
        <BigButton className="primary" type="submit" disabled={loading || !name.trim()}>
          {loading ? "Setting up…" : "Let's go! 🐾"}
        </BigButton>
      </form>
    </div>
  );
}
