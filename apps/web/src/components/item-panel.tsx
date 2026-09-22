"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { KIND_LABELS, visibleOptions, type CatalogItem } from "@buildour/catalog";
import { getItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { OptionInput } from "./option-input";

/**
 * The configuration panel.
 *
 * This is where "customisation down to the last detail" either works or
 * overwhelms. Structured options first, because most buyers only need those,
 * then the free-text slots for whatever the options could not anticipate.
 */
export function ItemPanel({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const { cart, putItem, removeItem, hasItem, getCartItem } = useCart();
  const existing = getCartItem(item.id);
  const inCart = hasItem(item.id);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [options, setOptions] = useState<Record<string, unknown>>(() => {
    if (existing) return existing.options;
    return Object.fromEntries(
      item.options
        .filter((option) => option.default !== undefined)
        .map((option) => [option.key, option.default]),
    );
  });

  const [freeText, setFreeText] = useState<Record<string, string>>(() => existing?.freeText ?? {});

  // Conditions see the buyer's profile, this system's answers, and the choices
  // made so far in this very panel, so a question can appear as you answer.
  const shown = useMemo(
    () =>
      visibleOptions(item.options, {
        business: cart.profile,
        system: cart.answers[item.system] ?? {},
        options,
      }),
    [item.options, item.system, cart.profile, cart.answers, options],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const save = () => {
    // Only persist options the buyer can actually see. A hidden question's
    // value must never end up in the manifest as something they asked for.
    const visibleKeys = new Set(shown.map((option) => option.key));
    putItem({
      itemId: item.id,
      systemId: item.system,
      options: Object.fromEntries(
        Object.entries(options).filter(([key]) => visibleKeys.has(key)),
      ),
      freeText: Object.fromEntries(
        Object.entries(freeText).filter(([, text]) => text.trim() !== ""),
      ),
    });
    onClose();
  };

  const requires = item.dependencies.requires.map(getItem).filter(Boolean) as CatalogItem[];
  const recommends = item.dependencies.recommends.map(getItem).filter(Boolean) as CatalogItem[];

  return (
    <>
      <div className="panel-scrim" onClick={onClose} aria-hidden="true" />
      <aside className="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
        <div className="panel__head">
          <div>
            <p className="panel__kind">{KIND_LABELS[item.kind].singular}</p>
            <h2 id="panel-title">{item.name}</h2>
          </div>
          <button
            type="button"
            className="panel__close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>

        <div className="panel__body">
          <p className="panel__desc">{item.description}</p>

          {requires.length > 0 || recommends.length > 0 ? (
            <div className="stack stack--tight">
              {requires.map((required) => (
                <div className="notice" key={required.id}>
                  <span className="notice__head">Needs {required.name}</span>
                  <span>
                    {item.name} works on top of {required.name}. You can add this on its own, and
                    we will tell your Claude to connect it to what you already have.
                  </span>
                </div>
              ))}
              {recommends.length > 0 ? (
                <div className="notice notice--soft">
                  <span className="notice__head">Works well with</span>
                  <span>{recommends.map((r) => r.name).join(", ")}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {shown.length > 0 ? (
            <div className="stack">
              <p className="panel__section-label">Make it yours</p>
              {shown.map((option) => (
                <OptionInput
                  key={option.key}
                  option={option}
                  idPrefix={item.id}
                  value={options[option.key]}
                  onChange={(value) =>
                    setOptions((current) => ({ ...current, [option.key]: value }))
                  }
                />
              ))}
            </div>
          ) : null}

          {item.free_text.length > 0 ? (
            <div className="stack">
              <p className="panel__section-label">Anything we have not asked</p>
              {item.free_text.map((slot) => (
                <div className="field" key={slot.key}>
                  <label className="field__label" htmlFor={`${item.id}-${slot.key}`}>
                    {slot.prompt}
                  </label>
                  <textarea
                    id={`${item.id}-${slot.key}`}
                    className="textarea"
                    placeholder={slot.placeholder}
                    value={freeText[slot.key] ?? ""}
                    onChange={(event) =>
                      setFreeText((current) => ({ ...current, [slot.key]: event.target.value }))
                    }
                  />
                  <p className="field__help">
                    Whatever you write here goes into the plan word for word.
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {item.kind === "agent" && item.agent ? <AgentFacts item={item} /> : null}
        </div>

        <div className="panel__foot">
          <button type="button" className="btn btn--primary btn--block" onClick={save}>
            {inCart ? "Save changes" : "Add to cart"}
          </button>
          {inCart ? (
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                removeItem(item.id);
                onClose();
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

/**
 * An agent is a teammate, so the panel says when it works and what it will
 * never do. The guardrails are the distinctive part, but there can be seven of
 * them, so they collapse: visible enough to find, quiet enough not to push the
 * buyer's actual choices below the fold.
 */
function AgentFacts({ item }: { item: CatalogItem }) {
  const agent = item.agent!;
  return (
    <div className="agent-facts">
      {agent.triggers.length > 0 ? (
        <div>
          <h4>When it works</h4>
          <ul>
            {agent.triggers.map((trigger) => (
              <li key={trigger.value}>{trigger.value}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {agent.guardrails.length > 0 ? (
        <details className="rules">
          <summary>
            What it will never do
            <span className="rules__count tnum">{agent.guardrails.length} rules</span>
          </summary>
          <ul>
            {agent.guardrails.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
