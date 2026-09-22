"use client";

import Link from "next/link";
import { KIND_LABELS } from "@buildour/catalog";
import { getItem, getSystem, catalog } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { optionWords, projectName } from "@/lib/manifest";

/**
 * The contract. Everything the buyer chose, in readable form, before they
 * commit. If something here is wrong, the build will be wrong, so this page
 * hides nothing and abbreviates nothing.
 */
export function ReviewView() {
  const { cart, ready, itemCount, size, warnings } = useCart();

  if (!ready) {
    return (
      <div className="shell review">
        <p className="field__help">Loading&hellip;</p>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="shell shell--narrow review">
        <div className="cart-empty">
          <h1 style={{ fontSize: "var(--step-3)" }}>There is nothing to summarise yet</h1>
          <Link href="/systems" className="btn btn--primary">
            Browse systems
          </Link>
        </div>
      </div>
    );
  }

  const systemIds = [...new Set(cart.items.map((line) => line.systemId))];
  const dataLocation = cart.dataLocationId ? getItem(cart.dataLocationId) : null;
  const deployment = cart.deploymentTargetId ? getItem(cart.deploymentTargetId) : null;
  const profileEntries = catalog.profile_questions
    .map((question) => [question.label, cart.profile[question.key]] as const)
    .filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div className="shell review">
      <div className="section__head">
        <div>
          <p className="eyebrow">Step 2 of 2</p>
          <h1 style={{ fontSize: "var(--step-3)" }}>Read this before you finish</h1>
        </div>
        <p>
          This is exactly what will be built. Nothing more, nothing less. If anything is wrong, go
          back and change it now.
        </p>
      </div>

      <div className="review__doc">
        <header className="review__title">
          <h1>{projectName(cart)}</h1>
          <p className="field__help tnum">
            {itemCount} things across {systemIds.length}{" "}
            {systemIds.length === 1 ? "system" : "systems"} &middot; {size.label} build &middot;{" "}
            {size.phases} phases
          </p>
        </header>

        {profileEntries.length > 0 ? (
          <section className="review-block">
            <h2>Your business</h2>
            <p className="review-block__sub">What we will tell the plan about you</p>
            <dl className="spec-list">
              {profileEntries.map(([label, value]) => (
                <div style={{ display: "contents" }} key={label}>
                  <dt>{label}</dt>
                  <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {systemIds.map((systemId) => {
          const system = getSystem(systemId);
          const answers = cart.answers[systemId] ?? {};
          const lines = cart.items.filter((line) => line.systemId === systemId);

          return (
            <section className="review-block" key={systemId}>
              <h2>{system?.name ?? systemId}</h2>
              <p className="review-block__sub tnum">{lines.length} things</p>

              {Object.keys(answers).length > 0 ? (
                <dl className="spec-list" style={{ marginBottom: "0.75rem" }}>
                  {system?.questions
                    .filter((question) => answers[question.key] !== undefined)
                    .map((question) => (
                      <div style={{ display: "contents" }} key={question.key}>
                        <dt>{question.label}</dt>
                        <dd>
                          {Array.isArray(answers[question.key])
                            ? (answers[question.key] as string[]).join(", ")
                            : String(answers[question.key])}
                        </dd>
                      </div>
                    ))}
                </dl>
              ) : null}

              {lines.map((line) => {
                const item = getItem(line.itemId);
                if (!item) return null;
                const options = Object.entries(line.options).filter(
                  ([, value]) => value !== undefined && value !== null && value !== "",
                );
                const notes = Object.entries(line.freeText).filter(([, text]) => text.trim());

                return (
                  <div className="review-item" key={line.itemId}>
                    <div className="review-item__head">
                      <span className="review-item__name">{item.name}</span>
                      <span className="field__help">{KIND_LABELS[item.kind].singular}</span>
                    </div>

                    {options.length > 0 ? (
                      <dl className="spec-list">
                        {options.map(([key, value]) => {
                          const option = item.options.find((candidate) => candidate.key === key);
                          if (!option) return null;
                          return (
                            <div style={{ display: "contents" }} key={key}>
                              <dt>{option.label}</dt>
                              <dd>{optionWords(line.itemId, key, value)}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    ) : null}

                    {notes.map(([key, text]) => {
                      const slot = item.free_text.find((candidate) => candidate.key === key);
                      return (
                        <div key={key}>
                          <p className="field__help">{slot?.prompt ?? "Your note"}</p>
                          <p className="cart-line__note">&ldquo;{text}&rdquo;</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </section>
          );
        })}

        <section className="review-block">
          <h2>Foundations</h2>
          <p className="review-block__sub">Choices that apply to the whole build</p>
          <dl className="spec-list">
            <div style={{ display: "contents" }}>
              <dt>Where your data lives</dt>
              <dd>{dataLocation?.name ?? "Not chosen"}</dd>
            </div>
            <div style={{ display: "contents" }}>
              <dt>Where it runs</dt>
              <dd>{deployment?.name ?? "Not chosen"}</dd>
            </div>
          </dl>
        </section>

        {cart.cartNote.trim() ? (
          <section className="review-block">
            <h2>Your note</h2>
            <p className="cart-line__note">&ldquo;{cart.cartNote}&rdquo;</p>
          </section>
        ) : null}

        {warnings.length > 0 ? (
          <section className="review-block">
            <h2>Known gaps</h2>
            <p className="review-block__sub">
              You chose to carry on with these. They go into the plan so your Claude works around
              them.
            </p>
            {warnings.map((warning) => (
              <div className="notice" key={`${warning.itemId}-${warning.relatedId}`}>
                <span>{warning.message}</span>
              </div>
            ))}
          </section>
        ) : null}
      </div>

      <div className="row" style={{ marginTop: "1.5rem" }}>
        <Link href="/package" className="btn btn--primary">
          This is right, build my plan
        </Link>
        <Link href="/cart" className="btn btn--quiet">
          Go back and change something
        </Link>
      </div>
    </div>
  );
}
