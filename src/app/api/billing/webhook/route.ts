import { validWebhookSignature, razorpay, subscriptionUpdate, type RazorpaySubscription } from "@/lib/billing";
import { serverDb } from "@/lib/supabase";

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 100_000) return new Response(null, { status: 413 });
  if (!validWebhookSignature(raw, req.headers.get("x-razorpay-signature")))
    return new Response(null, { status: 401 });
  let event: {
    event?: string;
    payload?: { subscription?: { entity?: { id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!event.event?.startsWith("subscription.")) return Response.json({ ok: true });
  const subscriptionId = event.payload?.subscription?.entity?.id;
  if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId))
    return new Response(null, { status: 400 });
  const db = serverDb();
  if (!db) return new Response(null, { status: 503 });
  const { data: known, error: lookupError } = await db
    .from("billing_subscriptions")
    .select("id")
    .eq("provider_subscription_id", subscriptionId)
    .maybeSingle();
  if (lookupError) return new Response(null, { status: 503 });
  if (!known) return Response.json({ ok: true });
  try {
    // Fetch current state so delayed or repeated events cannot roll status back.
    const subscription = await razorpay<RazorpaySubscription>(
      `subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
    if (subscription.id !== subscriptionId || subscription.plan_id !== process.env.RAZORPAY_PLAN_ID)
      return new Response(null, { status: 400 });
    const { error } = await db
      .from("billing_subscriptions")
      .update(subscriptionUpdate(subscription))
      .eq("id", known.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Razorpay webhook sync failed", error);
    return new Response(null, { status: 503 });
  }
}
