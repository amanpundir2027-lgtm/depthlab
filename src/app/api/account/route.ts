import { authorized, serverDb } from "@/lib/supabase";
export async function DELETE(req: Request) {
  const auth = await authorized(req);
  if (!auth) return Response.json({ error: "Sign in first." }, { status: 401 });
  const db = serverDb();
  if (!db)
    return Response.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  for (const table of [
    "notes",
    "tutor_sessions",
    "assessment_attempts",
    "review_tasks",
    "learning_progress",
    "provider_usage",
    "api_limits",
  ]) {
    const { error } = await db.from(table).delete().eq("user_id", auth.user.id);
    if (error)
      return Response.json(
        { error: "Could not finish deleting learning data." },
        { status: 502 },
      );
  }
  return Response.json({ deleted: true });
}
