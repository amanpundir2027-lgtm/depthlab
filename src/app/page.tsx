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
        <h2>Two paths in development</h2>
        <div className="grid">
          {["Philosophy", "Science"].map((name) => (
            <a className="card" href="/library" key={name}>
              <span className="tag draft">6 draft lessons</span>
              <h3>{name}</h3>
              <p>{paths[name].slice(0, 3).join(" · ")}</p>
              <strong>Explore path →</strong>
            </a>
          ))}
          <div className="card">
            <span className="tag">Coming later</span>
            <h3>12 more subjects</h3>
            <p>
              Structured learning paths are planned. Lessons will appear as they
              are researched and reviewed.
            </p>
            <a href="/library">View the roadmap →</a>
          </div>
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
