"use client";
import { useState } from "react";
import { useAccount } from "@/components/Providers";
export default function Login() {
  const { user, db } = useAccount();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function send() {
    if (!db) {
      setMessage("Sign-in is not configured yet.");
      return;
    }
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + "/auth/callback" },
    });
    setMessage(error ? error.message : "Check your email for a sign-in link.");
  }
  return (
    <div className="panel" style={{ maxWidth: 520, margin: "auto" }}>
      <div className="eyebrow">Your account</div>
      <h1>Welcome back.</h1>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <a className="button" href="/">
            Continue learning
          </a>
        </>
      ) : (
        <>
          <p>
            Sign in with a link sent to your email. No password to remember.
          </p>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            className="button"
            onClick={send}
            disabled={!email.includes("@")}
          >
            Send sign-in link
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
