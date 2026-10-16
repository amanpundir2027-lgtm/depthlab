import { DeepgramClient } from "@deepgram/sdk";
import { authorized, limit, serverDb } from "@/lib/supabase";
export async function POST(req: Request) {
  const auth = await authorized(req);
  if (!auth)
    return Response.json({ error: "Sign in to use voice." }, { status: 401 });
  if (!(await limit(auth.db, auth.user.id, "deepgram", 30)))
    return Response.json(
      { error: "Hourly voice session limit reached." },
      { status: 429 },
    );
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key)
    return Response.json(
      { error: "Voice transcription is not configured. Use text mode." },
      { status: 503 },
    );
  try {
    const client = new DeepgramClient({ apiKey: key });
    const data = await client.auth.v1.tokens.grant();
    await serverDb()
      ?.from("provider_usage")
      .insert({
        user_id: auth.user.id,
        provider: "deepgram",
        kind: "session_started",
        units: 1,
      });
    return Response.json({
      token: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch {
    return Response.json(
      { error: "Could not connect to transcription provider." },
      { status: 502 },
    );
  }
}
