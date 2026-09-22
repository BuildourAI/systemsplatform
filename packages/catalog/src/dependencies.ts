import type { Catalog, CatalogItem } from "./schema.js";

/**
 * Dependency warnings.
 *
 * Buildour's rule: warnings never block. A buyer may take an agent without the
 * feature it works on (they may already run that feature elsewhere), or the
 * feature without the agent. We tell them what will happen and let them decide.
 *
 * Pure function with no I/O, so the cart UI and the phase-1 server generator
 * produce identical warnings from identical carts.
 */

export type WarningRelation = "requires" | "conflicts";

export interface CartEntry {
  itemId: string;
  /** Buyer ticked "I already have this" on a missing requirement. */
  alreadyHave?: boolean;
}

export interface DependencyWarning {
  /** The item in the cart that raised this. */
  itemId: string;
  itemName: string;
  relation: WarningRelation;
  /** The item that is missing (requires) or clashing (conflicts). */
  relatedId: string;
  relatedName: string;
  /** Buyer-facing sentence. Plain language, no jargon. */
  message: string;
  /** Offered fixes, in the order the UI should show them. */
  fixes: WarningFix[];
}

export type WarningFix =
  | { kind: "add"; itemId: string; label: string }
  | { kind: "already_have"; itemId: string; label: string }
  | { kind: "remove"; itemId: string; label: string };

export interface Suggestion {
  itemId: string;
  itemName: string;
  relatedId: string;
  relatedName: string;
  message: string;
}

function indexItems(catalog: Catalog): Map<string, CatalogItem> {
  return new Map(catalog.items.map((item) => [item.id, item]));
}

/**
 * Hard warnings: unmet requirements and conflicting pairs.
 *
 * An unmet requirement is suppressed once the buyer says they already have it,
 * but it still travels into the manifest so their Claude integrates rather than
 * rebuilds.
 */
export function computeWarnings(cart: CartEntry[], catalog: Catalog): DependencyWarning[] {
  const byId = indexItems(catalog);
  const inCart = new Set(cart.map((entry) => entry.itemId));
  const alreadyHave = new Set(cart.filter((e) => e.alreadyHave).map((e) => e.itemId));
  const warnings: DependencyWarning[] = [];
  const seenConflicts = new Set<string>();

  for (const entry of cart) {
    const item = byId.get(entry.itemId);
    if (!item) continue;

    for (const requiredId of item.dependencies.requires) {
      if (inCart.has(requiredId)) continue;
      if (alreadyHave.has(requiredId)) continue;

      const required = byId.get(requiredId);
      if (!required) continue;

      warnings.push({
        itemId: item.id,
        itemName: item.name,
        relation: "requires",
        relatedId: requiredId,
        relatedName: required.name,
        message: `${item.name} needs ${required.name} to work. You can still add it, but it won't do anything on its own.`,
        fixes: [
          { kind: "add", itemId: requiredId, label: `Add ${required.name}` },
          { kind: "already_have", itemId: requiredId, label: "I already have this" },
          { kind: "remove", itemId: item.id, label: `Remove ${item.name}` },
        ],
      });
    }

    for (const conflictId of item.dependencies.conflicts) {
      if (!inCart.has(conflictId)) continue;

      // One warning per pair, not one per direction.
      const pairKey = [item.id, conflictId].sort().join("|");
      if (seenConflicts.has(pairKey)) continue;
      seenConflicts.add(pairKey);

      const other = byId.get(conflictId);
      if (!other) continue;

      warnings.push({
        itemId: item.id,
        itemName: item.name,
        relation: "conflicts",
        relatedId: conflictId,
        relatedName: other.name,
        message: `${item.name} and ${other.name} overlap. Keeping both is fine, but you may be paying for the same thing twice.`,
        fixes: [
          { kind: "remove", itemId: conflictId, label: `Remove ${other.name}` },
          { kind: "remove", itemId: item.id, label: `Remove ${item.name}` },
        ],
      });
    }
  }

  return warnings;
}

/**
 * Soft suggestions from `recommends`. Never styled as warnings: these are
 * "works well with", not "this is broken".
 */
export function computeSuggestions(cart: CartEntry[], catalog: Catalog): Suggestion[] {
  const byId = indexItems(catalog);
  const inCart = new Set(cart.map((entry) => entry.itemId));
  const alreadyHave = new Set(cart.filter((e) => e.alreadyHave).map((e) => e.itemId));
  const suggestions = new Map<string, Suggestion>();

  for (const entry of cart) {
    const item = byId.get(entry.itemId);
    if (!item) continue;

    for (const recommendedId of item.dependencies.recommends) {
      if (inCart.has(recommendedId) || alreadyHave.has(recommendedId)) continue;
      if (suggestions.has(recommendedId)) continue;

      const recommended = byId.get(recommendedId);
      if (!recommended || recommended.status !== "live") continue;

      suggestions.set(recommendedId, {
        itemId: item.id,
        itemName: item.name,
        relatedId: recommendedId,
        relatedName: recommended.name,
        message: `Goes well with ${item.name}`,
      });
    }
  }

  return [...suggestions.values()];
}

/** Relative build size, shown on the cart so nobody is surprised by scope. */
export function estimateBuildSize(
  cart: CartEntry[],
  catalog: Catalog,
): { points: number; label: "small" | "medium" | "large" | "very large"; phases: number } {
  const byId = indexItems(catalog);
  const points = cart.reduce((total, entry) => total + (byId.get(entry.itemId)?.effort_points ?? 0), 0);

  const label = points <= 10 ? "small" : points <= 25 ? "medium" : points <= 45 ? "large" : "very large";
  // Phase 0 is always setup; roughly one phase per 8 points of work after that.
  const phases = points === 0 ? 0 : 1 + Math.max(1, Math.ceil(points / 8));

  return { points, label, phases };
}
