"use client";
import { useEffect, useState } from "react";
import { useAccount, authHeader } from "@/components/Providers";
export default function Settings() {
  const { user, db } = useAccount();
  const [msg, setMsg] = useState("");
  const [usage, setUsage] = useState<{
    deepgramStarts: number;
    aiTokens: number;
  } | null>(null);
  useEffect(() => {
    if (!db || !user) return;
    db.from("provider_usage")
      .select("provider,kind,units")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        if (!data) return;
        setUsage({
          deepgramStarts: data.filter(
            (item) =>
              item.provider === "deepgram" && item.kind === "session_started",
          ).length,
          aiTokens: data
            .filter(
              (item) => item.provider === "openai" && item.kind === "tokens",
            )
            .reduce((sum, item) => sum + Number(item.units || 0), 0),
        });
      });
  }, [db, user]);
  async function erase() {
    if (
      !db ||
      !user ||
      !confirm(
        "Delete your notes, sessions, assessments, reviews, progress and usage records?",
      )
    )
      return;
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: await authHeader(db),
    });
    if (response.ok) setUsage({ deepgramStarts: 0, aiTokens: 0 });
    setMsg(
      response.ok
        ? "Learning data deleted."
        : "Deletion could not be completed. Please retry.",
    );
  }
  return (
    <>
      <div className="eyebrow">Account & privacy</div>
      <h1>Your learning, your choice.</h1>
      {!user ? (
        <div className="notice">
          <a href="/login">Sign in</a> to manage your data.
        </div>
      ) : (
        <>
          <div className="panel">
            <h3>Signed in</h3>
            <p>{user.email}</p>
            <button
              className="button secondary"
              onClick={() => db?.auth.signOut()}
            >
              Sign out
            </button>
          </div>
          <div className="panel section">
            <h3>Usage and costs</h3>
            {usage ? (
              <p>
                Recent recorded usage: {usage.deepgramStarts} Deepgram
                connection starts and about {usage.aiTokens.toLocaleString()}{" "}
                language-model tokens. These are application records, not
                provider billing totals or spending limits.
              </p>
            ) : (
              <p>Usage records are unavailable or still loading.</p>
            )}
            <p>
              Deepgram transcription uses its own account credits. The AI model
              uses separate provider billing. Browser speech playback has no TTS
              provider charge. Database and hosting may have separate plan
              limits. Check provider dashboards for actual balances and charges;
              this app cannot enforce their spending caps.
            </p>
          </div>
          <div className="panel section">
            <h3>What is stored</h3>
            <p>
              Notes, progress, and review tasks are saved to your account.
              Conversation transcripts and submitted assessment history are
              retained only when you opt in. Raw microphone audio is not saved
              by Depth Lab.
            </p>
            <p>
              Speech audio is sent to Deepgram when voice mode is on. Submitted
              text and lesson context are sent to the configured AI model.
              Provider retention depends on their account settings; this
              deployment has not verified those settings.
            </p>
            <button className="button ghost" onClick={erase}>
              Delete my learning data
            </button>
            {msg && <p role="status">{msg}</p>}
          </div>
        </>
      )}
    </>
  );
}
