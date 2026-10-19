import { createHmac, timingSafeEqual } from "node:crypto";

export const MONTHLY_AMOUNT_PAISE = 49900;
export const MONTHLY_PLAN = "monthly_499_inr";
export const BILLING_CYCLES = 12;

export function billingConfigured() {
  return (
    process.env.BILLING_ENABLED === "true" &&
    !!process.env.RAZORPAY_KEY_ID &&
    !!process.env.RAZORPAY_KEY_SECRET &&
    !!process.env.RAZORPAY_PLAN_ID &&
    !!process.env.RAZORPAY_WEBHOOK_SECRET
  );
}

export function validWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const actual = Buffer.from(signature, "hex");
  const expected = createHmac("sha256", secret).update(body).digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export type RazorpaySubscription = {
  id: string;
  status: string;
  plan_id: string;
  short_url?: string;
  paid_count?: number;
  total_count?: number;
  current_end?: number | null;
  has_scheduled_changes?: boolean;
};

export async function razorpay<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new Error("Razorpay is not configured.");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Razorpay request failed (${response.status}).`);
  return (await response.json()) as T;
}

export function isRazorpayCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "rzp.io" || url.hostname.endsWith(".razorpay.com"));
  } catch {
    return false;
  }
}

export function subscriptionUpdate(subscription: RazorpaySubscription) {
  return {
    status: subscription.status,
    paid_count: subscription.paid_count ?? 0,
    current_end: subscription.current_end
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
    ...(subscription.has_scheduled_changes === undefined
      ? {}
      : { cancel_at_cycle_end: subscription.has_scheduled_changes }),
    updated_at: new Date().toISOString(),
  };
}
