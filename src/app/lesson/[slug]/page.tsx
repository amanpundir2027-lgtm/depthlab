import { getLesson } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import { LessonActions } from "@/components/LessonActions";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return (
    <>
      <a href="/library" className="muted">
        ← Library
      </a>
      <div className="eyebrow" style={{ marginTop: 24 }}>
        {lesson.subject} · {lesson.minutes} min read · Research brief
      </div>
      <h1>{lesson.title}</h1>
      <p className="lead">{lesson.question}</p>
      <div className="row">
        <a className="button" href={`/discuss/${slug}`}>
          Discuss research brief →
        </a>
        <a className="button secondary" href="#practice">
          Written practice
        </a>
      </div>
      <div className="two section">
        <article className="panel lesson-copy">
          <h2>Understand the idea</h2>
          {lesson.explanation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <h3>Worked example</h3>
          <p>{lesson.example}</p>
          <h3>Where the idea stops</h3>
          <p>{lesson.limitation}</p>
          <h3>Connect it</h3>
          <p>{lesson.connection}</p>
          <h3>Go deeper</h3>
          <p>{lesson.reviewLater}</p>
          <h3>Sources</h3>
          {lesson.sources.length === 0 && (
            <p className="muted">
              Source links are being updated for this brief.
            </p>
          )}
          {lesson.sources.map((s) => (
            <div key={s.url} className="message">
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title} ↗
              </a>
              <p>
                {s.author} · {s.type} · Date: {s.revised}
              </p>
              <p>{s.whyUseful}</p>
              <small>
                Link checked {s.checkedAt} · {s.accessStatus}
              </small>
            </div>
          ))}
        </article>
        <aside className="stack">
          <div className="panel">
            <h3>What you will learn</h3>
            <ul>
              {lesson.objectives.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="muted">
              Prerequisite:{" "}
              {lesson.stage === "foundation"
                ? "None"
                : "Previous topic in this path"}
            </p>
          </div>
          <LessonActions slug={slug} />
        </aside>
      </div>
      <div id="practice" className="panel">
        <div className="eyebrow">Practice</div>
        <h2>Test the idea</h2>
        <p>{lesson.exercise}</p>
        <ol>
          {lesson.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
        <p>
          Use the discussion screen to submit a teach-back and application
          answer for feedback.
        </p>
      </div>
    </>
  );
}
