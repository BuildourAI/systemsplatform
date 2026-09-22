"use client";

import { getItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";

/**
 * Dependency warnings with their one-click fixes.
 *
 * Buildour's rule is that a warning never blocks: every one of these can be
 * left exactly as it is, and the buyer can carry on to checkout regardless.
 */
export function WarningList() {
  const { warnings, putItem, removeItem, markAlreadyHave } = useCart();

  if (warnings.length === 0) return null;

  return (
    <div className="stack stack--tight">
      <p className="panel__section-label">
        {warnings.length === 1 ? "One thing to look at" : `${warnings.length} things to look at`}
      </p>

      {warnings.map((warning) => (
        <div className="notice" key={`${warning.itemId}-${warning.relatedId}`}>
          <span className="notice__head">{warning.itemName}</span>
          <span>{warning.message}</span>
          <div className="row">
            {warning.fixes.map((fix) => {
              const label = fix.label;

              if (fix.kind === "add") {
                const item = getItem(fix.itemId);
                if (!item) return null;
                return (
                  <button
                    type="button"
                    className="btn btn--accent btn--sm"
                    key={`${fix.kind}-${fix.itemId}`}
                    onClick={() =>
                      putItem({
                        itemId: item.id,
                        systemId: item.system,
                        options: Object.fromEntries(
                          item.options
                            .filter((option) => option.default !== undefined)
                            .map((option) => [option.key, option.default]),
                        ),
                        freeText: {},
                      })
                    }
                  >
                    {label}
                  </button>
                );
              }

              if (fix.kind === "already_have") {
                return (
                  <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    key={`${fix.kind}-${fix.itemId}`}
                    onClick={() => markAlreadyHave(fix.itemId)}
                  >
                    {label}
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  className="btn btn--bare btn--sm"
                  key={`${fix.kind}-${fix.itemId}`}
                  onClick={() => removeItem(fix.itemId)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
