import { authorized, serverDb } from "@/lib/supabase";
import {
  BILLING_CYCLES,
  billingConfigured,
  dodoClient,
  isDodoCheckoutUrl,
  validDodoProduct,
} from "@/lib/billing";

export async function POST(req: Request) {
  if (!billingConfigured())
    return Response.json({ error: "Payments are not open yet." }, { status: 503 });
  const auth = await authorized(req);
  if (!auth || !auth.user.email)
    return Response.json({ error: "Sign in with an email first." }, { status: 401 });
  const db = serverDb();
  if (!db) return Response.json({ error: "Billing is unavailable." }, { status: 503 });

  const { data: existing, error: lookupError } = await db
    .from("billing_subscriptions")
    .select("provider,status,checkout_url")
    .eq("user_id", auth.user.id)
    .in("status", ["preparing", "created", "authenticated", "pending", "active", "on_hold", "paused", "past_due", "halted"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) return Response.json({ error: "Billing is unavailable." }, { status: 503 });
  if (existing) {
    if (existing.provider === "dodo" && ["preparing", "pending"].includes(existing.status)) {
      if (isDodoCheckoutUrl(existing.checkout_url))
        return Response.json({ checkoutUrl: existing.checkout_url });
      return Response.json({ error: "Checkout is being prepared. Please retry shortly or contact support." }, { status: 409 });
    }
    return Response.json({ error: "You already have an open subscription." }, { status: 409 });
  }

  let rowId: string | undefined;
  let sessionCreated = false;
  try {
    const dodo = dodoClient();
    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID!;
    const product = await dodo.products.retrieve(productId);
    if (!validDodoProduct(product))
      return Response.json({ error: "Dodo product must be ₹499 INR monthly for 12 months, tax included." }, { status: 503 });

    const { data: row, error: insertError } = await db
      .from("billing_subscriptions")
      .insert({ user_id: auth.user.id, provider: "dodo", status: "preparing",
        checkout_url: "", total_count: BILLING_CYCLES })
      .select("id")
      .single();
    if (insertError || !row) return Response.json({ error: "Checkout is already in progress." }, { status: 409 });
    rowId = row.id;

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: auth.user.email },
      billing_currency: "INR",
      feature_flags: { allow_currency_selection: false, allow_discount_code: false,
        allow_customer_editing_email: false },
      metadata: { depthlab_billing_id: row.id, depthlab_user_id: auth.user.id },
      return_url: "https://depthlab.me/settings",
      cancel_url: "https://depthlab.me/#pricing",
    });
    sessionCreated = true;
    if (!session.session_id || !isDodoCheckoutUrl(session.checkout_url))
      throw new Error("Invalid Dodo checkout response.");
    const { error: updateError } = await db
      .from("billing_subscriptions")
      .update({ checkout_session_id: session.session_id,
        checkout_url: session.checkout_url, status: "pending",
        updated_at: new Date().toISOString() })
      .eq("id", rowId);
    if (updateError) throw updateError;
    return Response.json({ checkoutUrl: session.checkout_url });
  } catch (error) {
    if (rowId && !sessionCreated)
      await db.from("billing_subscriptions").delete().eq("id", rowId);
    console.error("Could not prepare Dodo checkout", error);
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502 });
  }
}
