import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { isRazorpayCheckoutUrl, validWebhookSignature } from "./billing";

const oldSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
afterEach(() => { process.env.RAZORPAY_WEBHOOK_SECRET = oldSecret; });

describe("Razorpay webhook verification", () => {
  it("accepts only a signature of the exact raw body", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "test-secret";
    const body = '{"event":"subscription.activated"}';
    const signature = createHmac("sha256", "test-secret").update(body).digest("hex");
    expect(validWebhookSignature(body, signature)).toBe(true);
    expect(validWebhookSignature(body + " ", signature)).toBe(false);
    expect(validWebhookSignature(body, "invalid")).toBe(false);
    expect(validWebhookSignature(body, null)).toBe(false);
  });
});

describe("hosted checkout URL", () => {
  it("rejects redirects outside Razorpay", () => {
    expect(isRazorpayCheckoutUrl("https://rzp.io/i/example")).toBe(true);
    expect(isRazorpayCheckoutUrl("https://api.razorpay.com/example")).toBe(true);
    expect(isRazorpayCheckoutUrl("https://rzp.io.evil.example/")).toBe(false);
    expect(isRazorpayCheckoutUrl("http://rzp.io/i/example")).toBe(false);
  });
});
