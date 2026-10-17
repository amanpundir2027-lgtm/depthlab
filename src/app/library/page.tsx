"use client";
import { useState } from "react";
import { lessons, paths } from "@/lib/curriculum";
export default function Library() {
  const [q, setQ] = useState("");
  return (
    <>
      <div className="eyebrow">The library</div>
      <h1>Follow a question further.</h1>
      <p className="lead">
        36 research briefs across 12 subjects. Each topic has a concept map,
        worked example, practice question, and linked sources. Source access
        limits are noted in each brief.
      </p>
      <div className="field">
        <label htmlFor="search">
          Search subjects, questions, and lesson text
        </label>
        <input
          id="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try causation, ethics, or models"
        />
      </div>
      <div className="subject-list">
        {Object.entries(paths).map(([subject, modules]) => {
          const matches = modules
            .map((title, i) => ({
              title,
              i,
              lesson: lessons.find(
                (x) => x.subject === subject && x.title === title,
              ),
            }))
            .filter((m) =>
              `${subject} ${m.title} ${m.lesson?.question || ""} ${m.lesson?.explanation.join(" ") || ""}`
                .toLowerCase()
                .includes(q.toLowerCase()),
            );
          if (!matches.length) return null;
          return (
            <section
              className="card"
              id={subject
                .toLowerCase()
                .replaceAll(/[^a-z0-9]+/g, "-")
                .replace(/-$/, "")}
              key={subject}
            >
              <div className="eyebrow">{subject}</div>
              <h3>{subject}</h3>
              {matches.map((m) => (
                <div className="module-row" key={m.title}>
                  <div>
                    <strong>
                      {m.i + 1}. {m.title}
                    </strong>
                    <div className="muted">
                      {m.lesson
                        ? `${m.lesson.minutes} min read · Research brief`
                        : "Planned · Prerequisite: previous module"}
                    </div>
                  </div>
                  {m.lesson ? (
                    <a href={`/lesson/${m.lesson.slug}`}>Open brief →</a>
                  ) : (
                    <span className="tag">Planned</span>
                  )}
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
