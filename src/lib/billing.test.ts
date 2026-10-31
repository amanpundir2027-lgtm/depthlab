import { afterEach, describe, expect, it } from "vitest";
import { isDodoCheckoutUrl, validDodoProduct, validPaidCheckout } from "./billing";
import type DodoPayments from "dodopayments";

const oldProduct = process.env.DODO_PAYMENTS_PRODUCT_ID;
afterEach(() => { process.env.DODO_PAYMENTS_PRODUCT_ID = oldProduct; });

describe("Dodo checkout validation", () => {
  it("only redirects to Dodo hosted URLs", () => {
    expect(isDodoCheckoutUrl("https://checkout.dodopayments.com/session")).toBe(true);
    expect(isDodoCheckoutUrl("https://dodopayments.com.evil.example/session")).toBe(false);
    expect(isDodoCheckoutUrl("http://checkout.dodopayments.com/session")).toBe(false);
  });

  it("rejects a product with a different billing term or amount", () => {
    process.env.DODO_PAYMENTS_PRODUCT_ID = "pdt_example";
    const product = {
      product_id: "pdt_example", is_recurring: true,
      price: { type: "recurring_price", currency: "INR", price: 49900,
        payment_frequency_count: 1, payment_frequency_interval: "Month",
        subscription_period_count: 12, subscription_period_interval: "Month",
        tax_inclusive: true },
    } as unknown as DodoPayments.Product;
    expect(validDodoProduct(product)).toBe(true);
    expect(validDodoProduct({ ...product, price: { ...product.price, price: 59900 } } as DodoPayments.Product)).toBe(false);
    expect(validDodoProduct({ ...product, price: { ...product.price, subscription_period_count: 1 } } as DodoPayments.Product)).toBe(false);
  });

  it("only links an exact paid ₹499 checkout to a subscription", () => {
    const payment = { status: "succeeded", charge_type: "new",
      checkout_session_id: "cks_example", currency: "INR",
      total_amount: 49900, subscription_ids: ["sub_example"] } as unknown as DodoPayments.Payment;
    expect(validPaidCheckout(payment)).toBe(true);
    expect(validPaidCheckout({ ...payment, total_amount: 499 } as DodoPayments.Payment)).toBe(false);
    expect(validPaidCheckout({ ...payment, status: "processing" } as DodoPayments.Payment)).toBe(false);
    expect(validPaidCheckout({ ...payment, checkout_session_id: null } as DodoPayments.Payment)).toBe(false);
  });
});
