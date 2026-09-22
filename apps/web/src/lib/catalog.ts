import raw from "@/generated/catalog.json";
import {
  type Catalog,
  type CatalogItem,
  type BusinessSystem,
  KIND_ORDER,
  KIND_LABELS,
  type ItemKind,
} from "@buildour/catalog";

/**
 * The catalog, generated from YAML at build time by `npm run catalog:build`.
 *
 * Generating rather than reading files at runtime keeps the catalog available
 * to the cart, which runs in the browser, and makes the deployed app
 * independent of any filesystem layout.
 */
export const catalog = raw as unknown as Catalog;

const itemsById = new Map(catalog.items.map((item) => [item.id, item]));
const systemsById = new Map(catalog.systems.map((system) => [system.id, system]));

export function getItem(id: string): CatalogItem | undefined {
  return itemsById.get(id);
}

export function getSystem(id: string): BusinessSystem | undefined {
  return systemsById.get(id);
}

/** Systems a buyer can actually browse: live or coming soon, but not `core`. */
export function browsableSystems(): BusinessSystem[] {
  return catalog.systems
    .filter((system) => system.browsable !== false)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "live" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function itemsForSystem(systemId: string): CatalogItem[] {
  return catalog.items.filter((item) => item.system === systemId && item.status === "live");
}

export interface KindGroup {
  kind: ItemKind;
  heading: string;
  items: CatalogItem[];
}

/** Items grouped under the buyer-facing heading for their kind, in shelf order. */
export function groupByKind(items: CatalogItem[]): KindGroup[] {
  const groups = new Map<ItemKind, CatalogItem[]>();
  for (const item of items) {
    const bucket = groups.get(item.kind) ?? [];
    bucket.push(item);
    groups.set(item.kind, bucket);
  }

  // Within a shelf, the core things come first. A buyer scanning "Things it
  // does" should meet Invoicing before Daily takings.
  const tierRank = { core: 0, standard: 1, advanced: 2 } as const;

  return KIND_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
    kind,
    heading: KIND_LABELS[kind].plural,
    items: groups.get(kind)!.sort((a, b) => {
      const byTier = tierRank[a.tier] - tierRank[b.tier];
      return byTier !== 0 ? byTier : a.name.localeCompare(b.name);
    }),
  }));
}

export function itemsOfKind(kind: ItemKind): CatalogItem[] {
  return catalog.items.filter((item) => item.kind === kind && item.status === "live");
}

export const industries = catalog.domains.filter((d) => d.kind === "industry");
export const useCases = catalog.domains.filter((d) => d.kind === "use_case");

export function domainLabel(id: string): string {
  return catalog.domains.find((d) => d.id === id)?.label ?? id;
}
