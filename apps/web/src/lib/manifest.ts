import { normaliseChoice, type Catalog } from "@buildour/catalog";
import { catalog, getItem, getSystem } from "./catalog";
import type { CartState } from "./types";

/**
 * Builds the manifest: the machine-readable record of exactly what the buyer
 * ordered. Everything downstream (the plan, the package, the buyer's Claude)
 * reads this and nothing else, which is what makes the cart a contract.
 *
 * See docs/planning/04-build-package.md.
 */

export interface ManifestItem {
  id: string;
  kind: string;
  name: string;
  options: Record<string, unknown>;
  free_text: Record<string, string>;
}

export interface ManifestSystem {
  id: string;
  name: string;
  answers: Record<string, unknown>;
  items: ManifestItem[];
}

export interface Manifest {
  manifest_version: string;
  project: { id: string; slug: string; name: string; version: number };
  generated_at: string;
  catalog_version: string;
  business_profile: Record<string, unknown>;
  data_location: { id: string; name: string; options: Record<string, unknown> } | null;
  deployment_target: { id: string; name: string; options: Record<string, unknown> } | null;
  systems: ManifestSystem[];
  warnings: {
    item: string;
    relation: string;
    related: string;
    status: "resolved" | "unresolved";
    note?: string;
  }[];
  already_have: string[];
  cart_free_text: string;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "my-business"
  );
}

export function projectName(cart: CartState): string {
  const business = String(cart.profile.business_name ?? "").trim();
  const systems = [...new Set(cart.items.map((item) => item.systemId))]
    .map((id) => getSystem(id)?.name ?? id)
    .join(" and ");

  if (business && systems) return `${business} — ${systems}`;
  if (systems) return `${systems} system`;
  return "My business system";
}

export function buildManifest(
  cart: CartState,
  warnings: { itemId: string; relation: string; relatedId: string }[],
): Manifest {
  const name = projectName(cart);
  const systemIds = [...new Set(cart.items.map((item) => item.systemId))];

  const dataLocation = cart.dataLocationId ? getItem(cart.dataLocationId) : undefined;
  const deployment = cart.deploymentTargetId ? getItem(cart.deploymentTargetId) : undefined;

  return {
    manifest_version: "1.0",
    project: {
      id: "prototype",
      slug: slugify(name),
      name,
      version: 1,
    },
    generated_at: new Date().toISOString(),
    catalog_version: (catalog as Catalog).version,
    business_profile: cart.profile,
    data_location: dataLocation
      ? { id: dataLocation.id, name: dataLocation.name, options: {} }
      : null,
    deployment_target: deployment
      ? { id: deployment.id, name: deployment.name, options: {} }
      : null,
    systems: systemIds.map((systemId) => ({
      id: systemId,
      name: getSystem(systemId)?.name ?? systemId,
      answers: cart.answers[systemId] ?? {},
      items: cart.items
        .filter((line) => line.systemId === systemId)
        .map((line) => {
          const item = getItem(line.itemId);
          return {
            id: line.itemId,
            kind: item?.kind ?? "feature",
            name: item?.name ?? line.itemId,
            options: line.options,
            free_text: line.freeText,
          };
        }),
    })),
    warnings: warnings.map((warning) => ({
      item: warning.itemId,
      relation: warning.relation,
      related: warning.relatedId,
      status: "unresolved" as const,
      note:
        warning.relation === "requires"
          ? `${getItem(warning.relatedId)?.name ?? warning.relatedId} was not ordered. Build around it and leave a clear seam, then explain the limitation to the owner.`
          : undefined,
    })),
    already_have: cart.alreadyHave,
    cart_free_text: cart.cartNote,
  };
}

/** Renders a stored option value as the words the buyer picked. */
export function optionWords(itemId: string, key: string, value: unknown): string {
  const option = getItem(itemId)?.options.find((candidate) => candidate.key === key);
  if (!option) return String(value);

  if (option.type === "boolean") return value ? "Yes" : "No";

  const labelFor = (raw: unknown) => {
    const match = option.choices?.map(normaliseChoice).find((choice) => choice.value === raw);
    return match ? match.label : String(raw);
  };

  if (option.type === "multiselect") {
    const list = Array.isArray(value) ? value : [];
    return list.length ? list.map(labelFor).join(", ") : "None";
  }
  if (option.type === "select") return labelFor(value);
  if (option.unit) return `${value} ${option.unit}`;
  return String(value ?? "");
}
