import { authorized, serverDb } from "@/lib/supabase";
import {
  BILLING_CYCLES,
  MONTHLY_AMOUNT_PAISE,
  billingConfigured,
  isRazorpayCheckoutUrl,
  razorpay,
  type RazorpaySubscription,
} from "@/lib/billing";

type RazorpayPlan = {
  id: string;
  period: string;
  interval: number;
  item: { amount: number; currency: string };
};

export async function POST(req: Request) {
  if (!billingConfigured())
    return Response.json({ error: "Payments are not open yet." }, { status: 503 });
  const auth = await authorized(req);
  if (!auth) return Response.json({ error: "Sign in first." }, { status: 401 });
  const db = serverDb();
  if (!db) return Response.json({ error: "Billing is unavailable." }, { status: 503 });

  const { data: existing, error: lookupError } = await db
    .from("billing_subscriptions")
    .select("status,checkout_url")
    .eq("user_id", auth.user.id)
    .in("status", ["created", "authenticated", "active", "pending", "halted"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  if (existing?.status === "active" || existing?.status === "authenticated")
    return Response.json({ error: "You already have a subscription." }, { status: 409 });
  if (existing?.status === "halted")
    return Response.json({ error: "Please resolve your current subscription in Razorpay first." }, { status: 409 });
  if (existing && isRazorpayCheckoutUrl(existing.checkout_url))
    return Response.json({ checkoutUrl: existing.checkout_url });

  try {
    const planId = process.env.RAZORPAY_PLAN_ID!;
    const plan = await razorpay<RazorpayPlan>(`plans/${encodeURIComponent(planId)}`);
    if (
      plan.id !== planId ||
      plan.period !== "monthly" ||
      plan.interval !== 1 ||
      plan.item?.amount !== MONTHLY_AMOUNT_PAISE ||
      plan.item.currency !== "INR"
    )
      return Response.json({ error: "Billing plan does not match ₹499/month." }, { status: 503 });

    const subscription = await razorpay<RazorpaySubscription>("subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        total_count: BILLING_CYCLES,
        customer_notify: 1,
        notes: { depthlab_user_id: auth.user.id },
      }),
    });
    if (
      !subscription.id ||
      subscription.plan_id !== planId ||
      !isRazorpayCheckoutUrl(subscription.short_url)
    )
      throw new Error("Invalid Razorpay subscription response.");
    const { error } = await db.from("billing_subscriptions").insert({
      user_id: auth.user.id,
      provider_subscription_id: subscription.id,
      checkout_url: subscription.short_url,
      status: subscription.status,
      total_count: BILLING_CYCLES,
    });
    if (error) throw error;
    return Response.json({ checkoutUrl: subscription.short_url });
  } catch (error) {
    console.error("Could not prepare Razorpay checkout", error);
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });
  }
}
