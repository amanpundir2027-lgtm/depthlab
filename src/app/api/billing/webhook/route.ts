import { dodoClient, subscriptionUpdate, validDodoSubscription, validPaidCheckout } from "@/lib/billing";
import { serverDb } from "@/lib/supabase";

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 100_000) return new Response(null, { status: 413 });
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) return new Response(null, { status: 503 });
  let event: ReturnType<ReturnType<typeof dodoClient>["webhooks"]["unwrap"]>;
  try {
    event = dodoClient().webhooks.unwrap(raw, {
      headers: Object.fromEntries(req.headers), key: secret,
    });
  } catch {
    return new Response(null, { status: 401 });
  }
  if (event.type !== "payment.succeeded" && !event.type.startsWith("subscription."))
    return Response.json({ ok: true });
  const db = serverDb();
  if (!db) return new Response(null, { status: 503 });
  try {
    const dodo = dodoClient();
    if (event.type === "payment.succeeded") {
      const payment = await dodo.payments.retrieve(event.data.payment_id);
      if (payment.payment_id !== event.data.payment_id || payment.status !== "succeeded")
        return new Response(null, { status: 400 });
      if (!payment.checkout_session_id || payment.charge_type !== "new")
        return Response.json({ ok: true });
      const { data: row, error: lookupError } = await db
        .from("billing_subscriptions")
        .select("id,provider_subscription_id")
        .eq("checkout_session_id", payment.checkout_session_id)
        .eq("provider", "dodo")
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!row) return Response.json({ ok: true });
      if (!validPaidCheckout(payment))
        return new Response(null, { status: 400 });
      const subscriptionId = payment.subscription_ids[0];
      if (row.provider_subscription_id && row.provider_subscription_id !== subscriptionId)
        return new Response(null, { status: 400 });
      const subscription = await dodo.subscriptions.retrieve(subscriptionId);
      if (subscription.subscription_id !== subscriptionId || !validDodoSubscription(subscription))
        return new Response(null, { status: 400 });
      const { error } = await db.from("billing_subscriptions")
        .update(subscriptionUpdate(subscription))
        .eq("id", row.id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    const subscriptionId = (event.data as { subscription_id?: string }).subscription_id;
    if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId))
      return new Response(null, { status: 400 });
    // Fetch current state so duplicate and delayed webhooks cannot roll status back.
    const subscription = await dodo.subscriptions.retrieve(subscriptionId);
    if (subscription.subscription_id !== subscriptionId) return new Response(null, { status: 400 });
    if (subscription.product_id !== process.env.DODO_PAYMENTS_PRODUCT_ID)
      return Response.json({ ok: true });
    if (!validDodoSubscription(subscription))
      return new Response(null, { status: 400 });
    const { data: row, error: lookupError } = await db
      .from("billing_subscriptions")
      .select("id")
      .eq("provider_subscription_id", subscriptionId)
      .eq("provider", "dodo")
      .maybeSingle();
    if (lookupError) throw lookupError;
    // The first paid checkout is linked through payment.checkout_session_id.
    // Subscription events arriving before that payment cannot grant access.
    if (!row) return Response.json({ ok: true });
    const { error } = await db
      .from("billing_subscriptions")
      .update(subscriptionUpdate(subscription))
      .eq("id", row.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Dodo webhook sync failed", error);
    return new Response(null, { status: 503 });
  }
}
