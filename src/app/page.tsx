import { lessons, paths } from "@/lib/curriculum";
import { WaitlistForm } from "@/components/WaitlistForm";
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
      <section className="section signup-grid" aria-label="Join Depth Lab">
        <div className="panel" id="waitlist">
          <div className="eyebrow">Early access</div>
          <h2>Join the waitlist</h2>
          <p>Leave your email and we’ll let you know when Depth Lab opens.</p>
          <WaitlistForm />
        </div>
        <div className="panel" id="pricing">
          <div className="eyebrow">Membership plan</div>
          <h2>
            ₹499 <span className="price-period">/ month</span>
          </h2>
          <p>Monthly access to Depth Lab when paid membership launches.</p>
          <p className="muted">
            Payment gateway integration is coming next. Subscriptions and
            charges are not available yet.
          </p>
          <button className="button" type="button" disabled>
            Pay ₹499/month · Coming soon
          </button>
          <p>
            <a href="#waitlist">
              <strong>Join the waitlist for launch updates →</strong>
            </a>
          </p>
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
