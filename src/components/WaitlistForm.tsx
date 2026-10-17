"use client";

import { useState, type FormEvent } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: form.get("website") }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not join the waitlist.");
      setJoined(true);
      setEmail("");
      setMessage("You're on the waitlist. We'll email you when access opens.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not join the waitlist.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="waitlist-email">Email address</label>
      <div className="row">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={254}
          disabled={pending || joined}
          className="waitlist-input"
        />
        <button className="button" type="submit" disabled={pending || joined}>
          {pending ? "Joining…" : joined ? "Joined" : "Join waitlist"}
        </button>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="waitlist-website">Website</label>
        <input
          id="waitlist-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className="muted">
        We’ll use your email only for Depth Lab launch and plan updates. No
        payment is collected now.
      </p>
      {message && (
        <p role="status" className={`notice ${joined ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
