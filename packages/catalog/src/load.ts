import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { parseAllDocuments } from "yaml";
import { catalogSchema, systemSchema, catalogItemSchema, type Catalog, type CatalogItem, type BusinessSystem } from "./schema.js";

/**
 * Loads the YAML catalog from disk and validates it.
 *
 * Phase 1 keeps catalog content in files: authoring in bulk is far faster than
 * in forms, and git gives us review. Phase 2 moves authoring into the admin UI
 * against the same schema. See docs/planning/06-admin.md.
 */

function walkYamlFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walkYamlFiles(full));
    } else if (extname(entry) === ".yaml" || extname(entry) === ".yml") {
      found.push(full);
    }
  }
  return found.sort();
}

export interface LoadResult {
  catalog: Catalog;
  errors: string[];
}

export function loadCatalog(rootDir: string, version = new Date().toISOString().slice(0, 10)): LoadResult {
  const errors: string[] = [];
  const systems: BusinessSystem[] = [];
  const items: CatalogItem[] = [];
  let profileQuestions: Catalog["profile_questions"] = [];
  let domains: Catalog["domains"] = [];

  for (const file of walkYamlFiles(rootDir)) {
    const relative = file.slice(rootDir.length + 1);

    // A file may hold several documents separated by `---`, which is how the
    // coming-soon systems are listed together.
    let documents;
    try {
      documents = parseAllDocuments(readFileSync(file, "utf8"));
    } catch (error) {
      errors.push(`${relative}: could not parse YAML — ${(error as Error).message}`);
      continue;
    }

    for (const [index, document] of documents.entries()) {
      const where = documents.length > 1 ? `${relative}#${index + 1}` : relative;

      if (document.errors.length > 0) {
        errors.push(`${where}: ${document.errors.map((e) => e.message).join("; ")}`);
        continue;
      }

      const raw: unknown = document.toJS();
      if (raw === null || typeof raw !== "object") {
        continue; // An empty document, usually a trailing separator.
      }

      const doc = raw as Record<string, unknown>;

      // The profile file is the only non-item, non-system document.
      if (relative === "profile.yaml") {
        const parsed = catalogSchema.pick({ profile_questions: true, domains: true }).safeParse(doc);
        if (parsed.success) {
          profileQuestions = parsed.data.profile_questions;
          domains = parsed.data.domains;
        } else {
          errors.push(`${where}: ${formatIssues(parsed.error.issues)}`);
        }
        continue;
      }

      // A system document has no `kind`; an item document always has one.
      const parsed = "kind" in doc ? catalogItemSchema.safeParse(doc) : systemSchema.safeParse(doc);

      if (!parsed.success) {
        errors.push(`${where}: ${formatIssues(parsed.error.issues)}`);
        continue;
      }

      if ("kind" in doc) {
        items.push(parsed.data as CatalogItem);
      } else {
        systems.push(parsed.data as BusinessSystem);
      }
    }
  }

  errors.push(...checkReferences(systems, items));

  return {
    catalog: { version, systems, items, profile_questions: profileQuestions, domains },
    errors,
  };
}

function formatIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues.map((issue) => `${issue.path.join(".") || "(root)"} — ${issue.message}`).join("; ");
}

/**
 * Catches the mistakes a schema cannot: an item pointing at a system that does
 * not exist, a dependency on an id nobody defines, an id that disagrees with
 * the item's own system or kind.
 */
function checkReferences(systems: BusinessSystem[], items: CatalogItem[]): string[] {
  const errors: string[] = [];
  const systemIds = new Set(systems.map((s) => s.id));
  const itemIds = new Set(items.map((i) => i.id));

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`${item.id}: duplicate item id`);
    seen.add(item.id);

    if (!systemIds.has(item.system)) {
      errors.push(`${item.id}: belongs to system "${item.system}", which is not defined`);
    }

    const [idSystem, idKind] = item.id.split(".");
    if (idSystem !== item.system) {
      errors.push(`${item.id}: id says system "${idSystem}" but the item says "${item.system}"`);
    }
    if (idKind !== item.kind) {
      errors.push(`${item.id}: id says kind "${idKind}" but the item says "${item.kind}"`);
    }

    for (const [relation, ids] of Object.entries(item.dependencies)) {
      for (const related of ids as string[]) {
        if (!itemIds.has(related)) {
          errors.push(`${item.id}: ${relation} "${related}", which is not defined`);
        }
        if (related === item.id) {
          errors.push(`${item.id}: ${relation} itself`);
        }
      }
    }

    if (item.kind === "agent" && !item.agent) {
      errors.push(`${item.id}: kind is agent but no agent details were given`);
    }
    if (item.kind === "automation" && !item.automation) {
      errors.push(`${item.id}: kind is automation but no automation details were given`);
    }
  }

  for (const system of systems) {
    for (const template of system.templates) {
      for (const entry of template.items) {
        if (!itemIds.has(entry.id)) {
          errors.push(`${system.id}/${template.id}: includes "${entry.id}", which is not defined`);
        }
      }
    }
  }

  return errors;
}
