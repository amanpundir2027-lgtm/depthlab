"use client";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/Providers";
import { getLesson } from "@/lib/curriculum";
type Review = {
  id: string;
  module_id: string;
  prompt: string;
  due_at: string;
  completed_at: string | null;
};
export default function Reviews() {
  const { user, db, ready } = useAccount();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!ready) return;
    if (!db || !user) {
      setLoading(false);
      return;
    }
    db.from("review_tasks")
      .select("*")
      .is("completed_at", null)
      .order("due_at")
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [db, user, ready]);
  return (
    <>
      <div className="eyebrow">Spaced review</div>
      <h1>Bring it back to mind.</h1>
      <p className="lead">
        Reviews ask you to retrieve and apply ideas after a delay. They are
        scheduled from your submitted feedback.
      </p>
      {!user ? (
        <div className="notice">
          <a href="/login">Sign in</a> to see your review queue.
        </div>
      ) : loading ? (
        <p>Loading reviews…</p>
      ) : !items.length ? (
        <div className="panel">
          <h3>Nothing due yet</h3>
          <p>
            Complete a teach-back and application in a draft lesson to create a
            review task.
          </p>
        </div>
      ) : (
        <div className="stack">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <span className="eyebrow">
                {getLesson(item.module_id)?.title || item.module_id} ·{" "}
                {new Date(item.due_at) <= new Date()
                  ? "Due now"
                  : `Due ${new Date(item.due_at).toLocaleDateString()}`}
              </span>
              <h3>{item.prompt}</h3>
              <div className="row">
                <a className="button" href={`/discuss/${item.module_id}`}>
                  Answer the review
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
