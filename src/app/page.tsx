import { lessons, paths } from "@/lib/curriculum";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          A learning companion for deeper understanding
        </div>
        <h1>Know it well enough to explain it.</h1>
        <p className="lead">
          Read an idea. Talk it through. Test your reasoning. Return to it
          later. Depth Lab helps you build understanding that lasts.
        </p>
        <div className="row">
          <a className="button" href="/library">
            Explore the library →
          </a>
          <a className="button secondary" href="/reviews">
            See your reviews
          </a>
        </div>
      </section>
      <section className="section">
        <div className="eyebrow">Start here</div>
        <h2>Explore all 14 subjects</h2>
        <p className="muted">
          Six draft lessons in each path. Source review is still in progress.
        </p>
        <div className="grid">
          {Object.entries(paths).map(([name, modules]) => (
            <a
              className="card"
              href={`/library#${name
                .toLowerCase()
                .replaceAll(/[^a-z0-9]+/g, "-")
                .replace(/-$/, "")}`}
              key={name}
            >
              <span className="tag draft">6 draft lessons</span>
              <h3>{name}</h3>
              <p>{modules.slice(0, 3).join(" · ")}</p>
              <strong>Explore path →</strong>
            </a>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Pick up a question</h2>
        <div className="grid">
          {lessons.slice(0, 3).map((x) => (
            <a href={`/lesson/${x.slug}`} className="card" key={x.slug}>
              <span className="eyebrow">
                {x.subject} · {x.minutes} min
              </span>
              <h3>{x.question}</h3>
              <p>Read, discuss, and try a fresh application.</p>
              <strong>Open lesson →</strong>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
