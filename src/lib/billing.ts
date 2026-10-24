import DodoPayments from "dodopayments";

export const MONTHLY_AMOUNT_PAISE = 49900;
export const BILLING_CYCLES = 12;

export function billingConfigured() {
  return (
    process.env.BILLING_ENABLED === "true" &&
    !!process.env.DODO_PAYMENTS_API_KEY &&
    !!process.env.DODO_PAYMENTS_PRODUCT_ID &&
    !!process.env.DODO_PAYMENTS_WEBHOOK_SECRET &&
    ["test_mode", "live_mode"].includes(process.env.DODO_PAYMENTS_ENVIRONMENT || "")
  );
}

export function dodoClient() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (!bearerToken || (environment !== "test_mode" && environment !== "live_mode"))
    throw new Error("Dodo Payments is not configured.");
  return new DodoPayments({ bearerToken, environment, maxRetries: 1, timeout: 12_000 });
}

export function validDodoProduct(product: DodoPayments.Product) {
  const price = product.price;
  return (
    product.product_id === process.env.DODO_PAYMENTS_PRODUCT_ID &&
    product.is_recurring &&
    price.type === "recurring_price" &&
    price.currency === "INR" &&
    price.price === MONTHLY_AMOUNT_PAISE &&
    price.payment_frequency_count === 1 &&
    price.payment_frequency_interval === "Month" &&
    price.subscription_period_count === BILLING_CYCLES &&
    price.subscription_period_interval === "Month" &&
    price.tax_inclusive === true &&
    (price.trial_period_days || 0) === 0 &&
    (price.discount_bps || 0) === 0 &&
    (price.discount || 0) === 0 &&
    !price.purchasing_power_parity
  );
}

export function isDodoCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "dodopayments.com" || url.hostname.endsWith(".dodopayments.com"));
  } catch {
    return false;
  }
}

export function validDodoSubscription(subscription: DodoPayments.Subscription) {
  return (
    subscription.product_id === process.env.DODO_PAYMENTS_PRODUCT_ID &&
    subscription.currency === "INR" &&
    subscription.payment_frequency_count === 1 &&
    subscription.payment_frequency_interval === "Month" &&
    subscription.subscription_period_count === BILLING_CYCLES &&
    subscription.subscription_period_interval === "Month" &&
    subscription.tax_inclusive === true
  );
}

export function subscriptionUpdate(subscription: DodoPayments.Subscription) {
  return {
    provider_subscription_id: subscription.subscription_id,
    status: subscription.status,
    current_end: subscription.next_billing_date || null,
    cancel_at_cycle_end: subscription.cancel_at_next_billing_date,
    updated_at: new Date().toISOString(),
  };
}
