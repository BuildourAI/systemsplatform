import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell shell--narrow stack">
        <h1 style={{ fontSize: "var(--step-3)" }}>We could not find that page</h1>
        <p className="lede">It may have moved, or the address may have a typo in it.</p>
        <div className="row">
          <Link href="/systems" className="btn btn--primary">
            Browse systems
          </Link>
          <Link href="/" className="btn btn--quiet">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
