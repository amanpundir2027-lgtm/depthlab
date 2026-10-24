import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const previous = {
  key: process.env.DODO_PAYMENTS_API_KEY,
  secret: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
};
afterEach(() => {
  process.env.DODO_PAYMENTS_API_KEY = previous.key;
  process.env.DODO_PAYMENTS_WEBHOOK_SECRET = previous.secret;
  process.env.DODO_PAYMENTS_ENVIRONMENT = previous.environment;
});

describe("Dodo webhook", () => {
  it("rejects an unsigned subscription event before any account update", async () => {
    process.env.DODO_PAYMENTS_API_KEY = "test_key";
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET = "test_secret";
    process.env.DODO_PAYMENTS_ENVIRONMENT = "test_mode";
    const response = await POST(new Request("https://depthlab.me/api/billing/webhook", {
      method: "POST",
      body: JSON.stringify({ type: "subscription.active", data: { subscription_id: "sub_test" } }),
    }));
    expect(response.status).toBe(401);
  });
});
