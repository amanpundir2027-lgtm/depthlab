import { beforeEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({
  payment: vi.fn(), subscription: vi.fn(), update: vi.fn(),
  selectedRow: vi.fn(), unwrap: vi.fn(),
}));

vi.mock("@/lib/billing", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/billing")>();
  return {
    ...original,
    dodoClient: () => ({
      webhooks: { unwrap: mocked.unwrap },
      payments: { retrieve: mocked.payment },
      subscriptions: { retrieve: mocked.subscription },
    }),
  };
});

vi.mock("@/lib/supabase", () => ({
  serverDb: () => {
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: mocked.selectedRow,
      update: mocked.update,
    };
    return { from: () => query };
  },
}));

import { POST } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET = "test_secret";
  process.env.DODO_PAYMENTS_PRODUCT_ID = "pdt_monthly";
  mocked.unwrap.mockReturnValue({ type: "payment.succeeded",
    data: { payment_id: "pay_example" } });
  mocked.selectedRow.mockResolvedValue({ data: { id: "billing-row", provider_subscription_id: null }, error: null });
  mocked.payment.mockResolvedValue({ payment_id: "pay_example", status: "succeeded",
    checkout_session_id: "cks_example", charge_type: "new", currency: "INR",
    total_amount: 49900, subscription_ids: ["sub_example"] });
  mocked.subscription.mockResolvedValue({ subscription_id: "sub_example",
    product_id: "pdt_monthly", currency: "INR", payment_frequency_count: 1,
    payment_frequency_interval: "Month", subscription_period_count: 12,
    subscription_period_interval: "Month", tax_inclusive: true,
    status: "active", next_billing_date: "2026-11-30T00:00:00Z",
    cancel_at_next_billing_date: false });
  mocked.update.mockReturnValue({ eq: async () => ({ error: null }) });
});

describe("paid Dodo checkout handoff", () => {
  it("stores a subscription only after matching the checkout session and price", async () => {
    const response = await POST(new Request("https://depthlab.me/api/billing/webhook",
      { method: "POST", body: "{}" }));
    expect(response.status).toBe(200);
    expect(mocked.update).toHaveBeenCalledWith(expect.objectContaining({
      provider_subscription_id: "sub_example", status: "active",
    }));
  });

  it("rejects a successful payment at a different amount", async () => {
    mocked.payment.mockResolvedValueOnce({ payment_id: "pay_example", status: "succeeded",
      checkout_session_id: "cks_example", charge_type: "new", currency: "INR",
      total_amount: 499, subscription_ids: ["sub_example"] });
    const response = await POST(new Request("https://depthlab.me/api/billing/webhook",
      { method: "POST", body: "{}" }));
    expect(response.status).toBe(400);
    expect(mocked.update).not.toHaveBeenCalled();
  });
});
