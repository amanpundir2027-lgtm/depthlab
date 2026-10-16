"use client";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/Providers";
import { lessons } from "@/lib/curriculum";
type Progress = { module_id: string; state: string; confidence: number | null };
export default function ProgressPage() {
  const { user, db, ready } = useAccount();
  const [rows, setRows] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!ready) return;
    if (!db || !user) {
      setLoading(false);
      return;
    }
    db.from("learning_progress")
      .select("module_id,state,confidence")
      .then(({ data }) => {
        setRows(data || []);
        setLoading(false);
      });
  }, [db, user, ready]);
  return (
    <>
      <div className="eyebrow">Your understanding</div>
      <h1>What can you explain?</h1>
      <p className="lead">
        Reading and confidence do not grant mastery. Submitted evidence across
        accuracy, reasoning, limits, and application shapes your learning state.
      </p>
      {!user ? (
        <div className="notice">
          <a href="/login">Sign in</a> to see saved progress.
        </div>
      ) : loading ? (
        <p>Loading progress…</p>
      ) : (
        <div className="two">
          <div className="panel">
            <h2>Draft lessons</h2>
            {lessons.map((l) => (
              <div className="module-row" key={l.slug}>
                <a href={`/lesson/${l.slug}`}>{l.title}</a>
                <span className="tag">
                  {rows
                    .find((r) => r.module_id === l.slug)
                    ?.state.replaceAll("_", " ") || "Not started"}
                </span>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>Mastery policy</h3>
            <p>
              Demonstrated understanding requires evidence in all four rubric
              dimensions. Mastery requires strong evidence plus a successful
              delayed review or similarly strong independent repeat performance.
              A single attempt does not grant mastery.
            </p>
            <p>
              Current feedback is provisional. Revisit a weak dimension with a
              new example rather than accumulating reading time.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
