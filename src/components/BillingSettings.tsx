"use client";

import { useEffect, useState } from "react";
import { authHeader, useAccount } from "@/components/Providers";

type Subscription = {
  provider: string;
  status: string;
  current_end: string | null;
  cancel_at_cycle_end: boolean;
};

export function BillingSettings() {
  const { db, user } = useAccount();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db || !user) return;
    let cancelled = false;
    async function load() {
      const response = await fetch("/api/billing", {
        headers: await authHeader(db!),
        cache: "no-store",
      });
      if (!cancelled) {
        if (response.ok) setSubscription((await response.json()).subscription);
        else setMessage("Billing status is unavailable.");
        setLoading(false);
      }
    }
    load().catch(() => {
      if (!cancelled) {
        setMessage("Billing status is unavailable.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [db, user]);

  async function cancel() {
    if (!db || !confirm("Cancel your subscription at the end of the current billing cycle?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: await authHeader(db),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not cancel subscription.");
      setSubscription((previous) => previous && { ...previous, cancel_at_cycle_end: true });
      setMessage("Cancellation is scheduled for the end of your current billing cycle.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel subscription.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel section">
      <h3>Membership billing</h3>
      {loading ? <p>Loading billing status…</p> : subscription ? (
        <>
          <p>Provider: {subscription.provider === "dodo" ? "Dodo Payments" : "Razorpay"}. Status: <strong>{subscription.status}</strong>.</p>
          {subscription.current_end && <p>Current billing period ends {new Date(subscription.current_end).toLocaleDateString()}.</p>}
          {subscription.cancel_at_cycle_end && <p>Cancellation is scheduled for the end of this billing period.</p>}
          {subscription.status === "active" && !subscription.cancel_at_cycle_end && (
            <button className="button secondary" type="button" disabled={busy} onClick={cancel}>
              {busy ? "Scheduling cancellation…" : "Cancel at period end"}
            </button>
          )}
        </>
      ) : <p>No subscription yet. <a href="/#pricing">See the membership plan →</a></p>}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
