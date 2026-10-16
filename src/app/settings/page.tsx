"use client";
import { useState } from "react";
import { useAccount, authHeader } from "@/components/Providers";
export default function Settings() {
  const { user, db } = useAccount();
  const [msg, setMsg] = useState("");
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
            <h3>What is stored</h3>
            <p>
              Notes, submitted assessments, feedback, progress, and review tasks
              are saved to your account. Conversation transcript retention is
              off by default. Raw microphone audio is not saved by Depth Lab.
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
