import { authorized, serverDb } from "@/lib/supabase";
import { billingConfigured } from "@/lib/billing";

export async function GET(req: Request) {
  const enabled = billingConfigured();
  const auth = await authorized(req);
  if (!auth) return Response.json({ enabled, subscription: null });
  const db = serverDb();
  if (!db) return Response.json({ enabled: false, subscription: null });
  const { data, error } = await db
    .from("billing_subscriptions")
    .select("provider,status,current_end,cancel_at_cycle_end,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return Response.json({ error: "Billing status is unavailable." }, { status: 503 });
  return Response.json({ enabled, subscription: data });
}
