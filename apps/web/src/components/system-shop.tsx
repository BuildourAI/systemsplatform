"use client";

import { useState } from "react";
import Link from "next/link";
import type { BusinessSystem, CatalogItem } from "@buildour/catalog";
import { visibleOptions } from "@buildour/catalog";
import type { KindGroup } from "@/lib/catalog";
import { getItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { ItemPanel } from "./item-panel";
import { OptionInput } from "./option-input";

export function SystemShop({ system, groups }: { system: BusinessSystem; groups: KindGroup[] }) {
  const { cart, hasItem, putItem, setAnswers, itemCount, size } = useCart();
  const [open, setOpen] = useState<CatalogItem | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const answers = cart.answers[system.id] ?? {};
  const answered = Object.keys(answers).length > 0;

  const questions = visibleOptions(system.questions, {
    business: cart.profile,
    system: answers,
    options: {},
  });

  /** A template is a saved cart: apply its items with their preset options. */
  const applyTemplate = (templateId: string) => {
    const template = system.templates.find((candidate) => candidate.id === templateId);
    if (!template) return;

    for (const entry of template.items) {
      const item = getItem(entry.id);
      if (!item) continue;

      const defaults = Object.fromEntries(
        item.options
          .filter((option) => option.default !== undefined)
          .map((option) => [option.key, option.default]),
      );

      putItem({
        itemId: item.id,
        systemId: item.system,
        options: { ...defaults, ...(entry.options ?? {}) },
        freeText: {},
      });
    }
    setShowQuestions(true);
  };

  return (
    <div className="system-layout">
      <div>
        {system.templates.length > 0 ? (
          <section>
            <div className="shelf__head">
              <h2>Start from a ready-made one</h2>
              <span className="shelf__count">or build it up yourself below</span>
            </div>
            <div className="template-row">
              {system.templates.map((template) => (
                <div className="template-card" key={template.id}>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <button
                    type="button"
                    className="btn btn--accent btn--sm"
                    onClick={() => applyTemplate(template.id)}
                  >
                    Add these {template.items.length} things
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {questions.length > 0 ? (
          <section className="shelf">
            <div className="shelf__head">
              <h2>About how you work</h2>
              <span className="shelf__count">
                {answered ? "answered" : "helps us set sensible defaults"}
              </span>
            </div>

            {showQuestions || answered ? (
              <div className="stack" style={{ maxWidth: "34rem" }}>
                {questions.map((question) => (
                  <OptionInput
                    key={question.key}
                    option={question}
                    idPrefix={`sys-${system.id}`}
                    value={answers[question.key] ?? question.default}
                    onChange={(value) => setAnswers(system.id, { [question.key]: value })}
                  />
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => setShowQuestions(true)}
              >
                Answer {questions.length} quick questions
              </button>
            )}
          </section>
        ) : null}

        {groups.map((group) => (
          <section className="shelf" key={group.kind}>
            <div className="shelf__head">
              <h2>{group.heading}</h2>
              <span className="shelf__count tnum">{group.items.length}</span>
            </div>
            <div className="item-grid">
              {group.items.map((item) => {
                const inCart = hasItem(item.id);
                return (
                  <button
                    type="button"
                    className="item-card"
                    key={item.id}
                    data-in-cart={inCart}
                    onClick={() => setOpen(item)}
                  >
                    <div className="item-card__top">
                      <h3>{item.name}</h3>
                      {inCart ? (
                        <span className="tick" aria-label="In your cart">
                          <svg width="11" height="9" viewBox="0 0 11 9" aria-hidden="true">
                            <path
                              d="M1 4.5L4 7.5L10 1.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </div>
                    <p>{item.tagline}</p>
                    <div className="item-card__foot">
                      <span className="field__help">{inCart ? "Change it" : "Set it up"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="rail" aria-label="Your cart">
        <h2>Your cart</h2>
        {itemCount === 0 ? (
          <p className="rail__empty">
            Nothing yet. Pick anything above and we will ask how you want it to work.
          </p>
        ) : (
          <>
            <ul className="rail__list">
              {cart.items.map((line) => {
                const item = getItem(line.itemId);
                if (!item) return null;
                return (
                  <li className="rail__line" key={line.itemId}>
                    <span>{item.name}</span>
                  </li>
                );
              })}
            </ul>
            <div className="rail__meta">
              <span className="tnum">{itemCount} items</span>
              <span>{size.label} build</span>
            </div>
          </>
        )}
        <Link href="/cart" className="btn btn--primary btn--block">
          {itemCount === 0 ? "See the cart" : "Review and finish"}
        </Link>
      </aside>

      {open ? <ItemPanel item={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
