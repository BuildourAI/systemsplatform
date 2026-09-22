import { SystemBrowser } from "@/components/system-browser";

export const metadata = { title: "Browse systems" };

export default function SystemsPage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="section__head">
          <div>
            <p className="eyebrow">The shelves</p>
            <h2>What would you like to run better?</h2>
          </div>
          <p>
            Pick a system to see everything in it. You can take one part or all of it, and combine
            as many systems as you like.
          </p>
        </div>
        <SystemBrowser />
      </div>
    </section>
  );
}
