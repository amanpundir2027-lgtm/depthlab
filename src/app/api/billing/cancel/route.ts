import { authorized, serverDb } from "@/lib/supabase";
import { dodoClient, subscriptionUpdate, validDodoSubscription } from "@/lib/billing";

export async function POST(req: Request) {
  const auth = await authorized(req);
  if (!auth) return Response.json({ error: "Sign in first." }, { status: 401 });
  const db = serverDb();
  if (!db) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  const { data, error } = await db
    .from("billing_subscriptions")
    .select("id,provider,provider_subscription_id,status,cancel_at_cycle_end")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  if (!data || data.provider !== "dodo" || data.status !== "active" ||
    !data.provider_subscription_id || data.cancel_at_cycle_end)
    return Response.json({ error: "No active Dodo subscription to cancel." }, { status: 409 });
  try {
    const dodo = dodoClient();
    const current = await dodo.subscriptions.retrieve(data.provider_subscription_id);
    if (!validDodoSubscription(current)) throw new Error("Subscription plan mismatch.");
    const updated = await dodo.subscriptions.update(data.provider_subscription_id, {
      cancel_at_next_billing_date: true,
    });
    if (updated.subscription_id !== data.provider_subscription_id || !updated.cancel_at_next_billing_date)
      throw new Error("Cancellation was not confirmed.");
    const { error: updateError } = await db
      .from("billing_subscriptions")
      .update(subscriptionUpdate(updated))
      .eq("id", data.id);
    if (updateError) throw updateError;
    return Response.json({ cancelledAtCycleEnd: true });
  } catch (error) {
    console.error("Dodo cancellation failed", error);
    return Response.json({ error: "Could not cancel the subscription. Please retry." }, { status: 502 });
  }
}
