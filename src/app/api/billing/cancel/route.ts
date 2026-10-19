import { authorized, serverDb } from "@/lib/supabase";
import { razorpay, subscriptionUpdate, type RazorpaySubscription } from "@/lib/billing";

export async function POST(req: Request) {
  const auth = await authorized(req);
  if (!auth) return Response.json({ error: "Sign in first." }, { status: 401 });
  const db = serverDb();
  if (!db) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  const { data, error } = await db
    .from("billing_subscriptions")
    .select("id,provider_subscription_id,status,cancel_at_cycle_end")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  if (!data || data.status !== "active" || data.cancel_at_cycle_end)
    return Response.json({ error: "No active subscription to cancel." }, { status: 409 });
  try {
    const subscription = await razorpay<RazorpaySubscription>(
      `subscriptions/${encodeURIComponent(data.provider_subscription_id)}/cancel`,
      { method: "POST", body: JSON.stringify({ cancel_at_cycle_end: 1 }) },
    );
    if (subscription.id !== data.provider_subscription_id)
      throw new Error("Unexpected subscription response.");
    const { error: updateError } = await db
      .from("billing_subscriptions")
      .update({ ...subscriptionUpdate(subscription), cancel_at_cycle_end: true })
      .eq("id", data.id);
    if (updateError) throw updateError;
    return Response.json({ cancelledAtCycleEnd: true });
  } catch (error) {
    console.error("Razorpay cancellation failed", error);
    return Response.json({ error: "Could not cancel the subscription. Please retry." }, { status: 502 });
  }
}
