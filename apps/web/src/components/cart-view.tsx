"use client";

import { useState } from "react";
import Link from "next/link";
import { KIND_LABELS, type CatalogItem } from "@buildour/catalog";
import { getItem, getSystem, itemsOfKind } from "@/lib/catalog";
import { useCart, describeOption } from "@/lib/cart-context";
import { ItemPanel } from "./item-panel";
import { WarningList } from "./warning-list";

export function CartView() {
  const {
    cart,
    ready,
    itemCount,
    size,
    warnings,
    suggestions,
    removeItem,
    putItem,
    setDataLocation,
    setDeploymentTarget,
    setCartNote,
  } = useCart();
  const [open, setOpen] = useState<CatalogItem | null>(null);

  if (!ready) {
    return (
      <div className="shell cart-page">
        <p className="field__help">Loading your cart&hellip;</p>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="shell shell--narrow cart-page">
        <div className="cart-empty">
          <h1 style={{ fontSize: "var(--step-3)" }}>Your cart is empty</h1>
          <p className="lede">
            Pick a system and add the parts you want. Nothing is charged, and you can change
            anything right up to the end.
          </p>
          <Link href="/systems" className="btn btn--primary">
            Browse systems
          </Link>
        </div>
      </div>
    );
  }

  const systemIds = [...new Set(cart.items.map((line) => line.systemId))];
  const dataLocations = itemsOfKind("data_location");
  const deployments = itemsOfKind("deployment_target");
  const ready_to_finish = Boolean(cart.dataLocationId && cart.deploymentTargetId);

  return (
    <div className="shell cart-page">
      <div className="section__head">
        <div>
          <p className="eyebrow">Step 1 of 2</p>
          <h1 style={{ fontSize: "var(--step-3)" }}>Everything you have chosen</h1>
        </div>
        <p>
          This list becomes your plan, word for word. Change anything now, or after you have read
          the summary on the next page.
        </p>
      </div>

      <div className="cart-layout">
        <div>
          {warnings.length > 0 ? (
            <div style={{ marginBottom: "2rem" }}>
              <WarningList />
            </div>
          ) : null}

          {systemIds.map((systemId) => {
            const system = getSystem(systemId);
            const lines = cart.items.filter((line) => line.systemId === systemId);

            return (
              <section className="cart-system" key={systemId}>
                <div className="cart-system__head">
                  <h2>{system?.name ?? systemId}</h2>
                  <Link href={`/systems/${systemId}`} className="btn btn--bare btn--sm">
                    Add more to this
                  </Link>
                </div>

                <ul className="cart-lines">
                  {lines.map((line) => {
                    const item = getItem(line.itemId);
                    if (!item) return null;

                    const chips = Object.entries(line.options)
                      .map(([key, value]) => describeOption(line.itemId, key, value))
                      .filter(Boolean) as string[];

                    const notes = Object.entries(line.freeText).filter(([, text]) => text.trim());

                    return (
                      <li className="cart-line" key={line.itemId}>
                        <div className="cart-line__top">
                          <div>
                            <div className="cart-line__name">{item.name}</div>
                            <div className="cart-line__kind">{KIND_LABELS[item.kind].singular}</div>
                          </div>
                          <div className="cart-line__actions">
                            <button
                              type="button"
                              className="btn btn--quiet btn--sm"
                              onClick={() => setOpen(item)}
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              className="btn btn--bare btn--sm"
                              onClick={() => removeItem(line.itemId)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {chips.length > 0 ? (
                          <div className="chip-row">
                            {chips.map((chip) => (
                              <span className="chip" key={chip}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {notes.map(([key, text]) => (
                          <p className="cart-line__note" key={key}>
                            &ldquo;{text}&rdquo;
                          </p>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {suggestions.length > 0 ? (
            <section className="cart-system">
              <div className="cart-system__head">
                <h2>You might also want</h2>
              </div>
              <div className="chip-row">
                {suggestions.map((suggestion) => {
                  const item = getItem(suggestion.relatedId);
                  if (!item) return null;
                  return (
                    <button
                      type="button"
                      className="btn btn--quiet btn--sm"
                      key={suggestion.relatedId}
                      onClick={() => setOpen(item)}
                    >
                      {item.name}
                      <span className="field__help">{suggestion.message}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="cart-system">
            <div className="cart-system__head">
              <h2>Where your data lives</h2>
              <span className="shelf__count">Pick one</span>
            </div>
            <div className="picker-grid">
              {dataLocations.map((option) => (
                <button
                  type="button"
                  className="picker"
                  key={option.id}
                  aria-pressed={cart.dataLocationId === option.id}
                  onClick={() => setDataLocation(option.id)}
                >
                  <strong>{option.name}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="cart-system">
            <div className="cart-system__head">
              <h2>Where it runs</h2>
              <span className="shelf__count">Pick one</span>
            </div>
            <div className="picker-grid">
              {deployments.map((option) => (
                <button
                  type="button"
                  className="picker"
                  key={option.id}
                  aria-pressed={cart.deploymentTargetId === option.id}
                  onClick={() => setDeploymentTarget(option.id)}
                >
                  <strong>{option.name}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="cart-system">
            <div className="cart-system__head">
              <h2>Anything else</h2>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="cart-note">
                Is there anything about your business the plan should know?
              </label>
              <textarea
                id="cart-note"
                className="textarea"
                placeholder="e.g. our accountant works in Tally, so anything we send them needs to suit it"
                value={cart.cartNote}
                onChange={(event) => setCartNote(event.target.value)}
              />
              <p className="field__help">This goes into the plan word for word.</p>
            </div>
          </section>
        </div>

        <aside className="summary-card">
          <h2 style={{ fontSize: "var(--step-1)" }}>Your build</h2>
          <dl>
            <div className="summary-row">
              <dt>Systems</dt>
              <dd className="tnum">{systemIds.length}</dd>
            </div>
            <div className="summary-row">
              <dt>Things being built</dt>
              <dd className="tnum">{itemCount}</dd>
            </div>
            <div className="summary-row">
              <dt>Build size</dt>
              <dd>{size.label}</dd>
            </div>
            <div className="summary-row">
              <dt>Build phases</dt>
              <dd className="tnum">{size.phases}</dd>
            </div>
            {warnings.length > 0 ? (
              <div className="summary-row">
                <dt>Things to look at</dt>
                <dd className="tnum">{warnings.length}</dd>
              </div>
            ) : null}
          </dl>

          {!ready_to_finish ? (
            <p className="field__help">
              Choose where your data lives and where it runs to carry on.
            </p>
          ) : null}

          <Link
            href="/review"
            className="btn btn--primary btn--block"
            aria-disabled={!ready_to_finish}
            onClick={(event) => {
              if (!ready_to_finish) event.preventDefault();
            }}
            style={ready_to_finish ? undefined : { opacity: 0.45, pointerEvents: "none" }}
          >
            See the summary
          </Link>
          <Link href="/systems" className="btn btn--quiet btn--block">
            Keep shopping
          </Link>
        </aside>
      </div>

      {open ? <ItemPanel item={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
