import { serverDb } from "../../../lib/supabase";
import { normalizeWaitlistEmail } from "../../../lib/waitlist";

export async function POST(req: Request) {
  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 1024)
      return Response.json({ error: "Request is too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  const fields = body as Record<string, unknown>;
  if (fields.website) return Response.json({ joined: true });
  const email = normalizeWaitlistEmail(fields.email);
  if (!email)
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );

  const db = serverDb();
  if (!db)
    return Response.json(
      { error: "Waitlist is temporarily unavailable. Please try later." },
      { status: 503 },
    );
  const { error } = await db
    .from("waitlist")
    .upsert(
      { email, plan: "monthly_499_inr" },
      { onConflict: "email", ignoreDuplicates: true },
    );
  if (error)
    return Response.json(
      { error: "Could not save your email. Please try later." },
      { status: 503 },
    );
  return Response.json({ joined: true });
}
