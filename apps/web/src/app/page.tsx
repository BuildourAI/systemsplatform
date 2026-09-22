import Link from "next/link";
import { SystemBrowser } from "@/components/system-browser";

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero__inner">
          <span className="hero__badge">
            <b>New</b> Built by your own Claude, on your own machine
          </span>

          <h1>
            Shop for the system <em>your</em> business actually runs on
          </h1>

          <p className="hero__lede">
            Pick what you need, answer a few questions, and change anything you like. You leave with
            a complete plan. Your Claude builds it.
          </p>

          <div className="hero__actions">
            <Link href="/systems" className="btn btn--primary">
              Start with a system
            </Link>
            <Link href="/profile" className="btn btn--quiet">
              Tell us about your business first
            </Link>
          </div>

          <div className="prompt-box" aria-hidden="true">
            <p className="prompt-box__text">Make a&hellip;</p>
            <div className="prompt-box__foot">
              <span className="field__help">Describe it instead of browsing</span>
              <span className="tag-soon">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sunk">
        <div className="shell">
          <div className="section__head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step__n">1</span>
              <h3>Choose</h3>
              <p>
                Browse by what you do or what your business is. Add the parts you want: the things
                it does, the AI teammates, what runs on its own.
              </p>
            </div>
            <div className="step">
              <span className="step__n">2</span>
              <h3>Make it yours</h3>
              <p>
                Every part asks how you want it to work. Where our questions run out, you write the
                rest in your own words and it goes into the plan verbatim.
              </p>
            </div>
            <div className="step">
              <span className="step__n">3</span>
              <h3>Check the list</h3>
              <p>
                Your cart is the contract. Before you finish you see exactly what will be built,
                item by item, choice by choice.
              </p>
            </div>
            <div className="step">
              <span className="step__n">4</span>
              <h3>Build it</h3>
              <p>
                Download the plan, open it in Claude Code, and type one line. It builds your system
                and tells you when each part is ready to try.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="systems">
        <div className="shell">
          <div className="section__head">
            <div>
              <p className="eyebrow">The shelves</p>
              <h2>What would you like to run better?</h2>
            </div>
            <p>
              Three systems are ready to configure today. The rest are being written. Tell us which
              you want next.
            </p>
          </div>
          <SystemBrowser />
        </div>
      </section>
    </>
  );
}
