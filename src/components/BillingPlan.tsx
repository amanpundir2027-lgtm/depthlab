"use client";

import { useEffect, useState } from "react";
import { authHeader, useAccount } from "@/components/Providers";

type BillingStatus = {
  enabled: boolean;
  subscription: null | {
    status: string;
    paid_count: number;
    total_count: number;
    current_end: string | null;
    cancel_at_cycle_end: boolean;
  };
};

export function BillingPlan() {
  const { user, db, ready } = useAccount();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const headers = db && user ? await authHeader(db) : {};
      const response = await fetch("/api/billing", { headers, cache: "no-store" });
      if (response.ok && !cancelled) setBilling(await response.json());
    }
    if (ready) load().catch(() => setMessage("Billing status is unavailable."));
    return () => { cancelled = true; };
  }, [db, ready, user]);

  async function checkout() {
    if (!db) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: await authHeader(db),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout is unavailable.");
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout is unavailable.");
      setBusy(false);
    }
  }

  const status = billing?.subscription?.status;
  return (
    <>
      <div className="eyebrow">Membership plan</div>
      <h2>₹499 <span className="price-period">/ month</span></h2>
      <p>Monthly access to Depth Lab. The subscription covers up to 12 monthly payments and can be cancelled before the next billing cycle.</p>
      {status === "active" || status === "authenticated" ? (
        <p className="notice success">Your subscription is {status}. <a href="/settings">Manage billing →</a></p>
      ) : billing?.enabled ? (
        user ? (
          <button className="button" type="button" disabled={busy} onClick={checkout}>
            {busy ? "Opening checkout…" : "Subscribe for ₹499/month"}
          </button>
        ) : (
          <a className="button" href="/login">Sign in to subscribe</a>
        )
      ) : (
        <>
          <p className="muted">Payments are not open yet. Join the waitlist for launch updates.</p>
          <button className="button" type="button" disabled>Pay ₹499/month · Coming soon</button>
        </>
      )}
      {message && <p role="status" className="notice error">{message}</p>}
      <p><a href="#waitlist"><strong>Join the waitlist for launch updates →</strong></a></p>
    </>
  );
}
