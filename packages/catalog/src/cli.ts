#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadCatalog } from "./node.js";

/**
 * Validates the YAML catalog and writes it as JSON for the web app to import.
 *
 * Generating at build time rather than reading files at runtime keeps the
 * catalog available to client components (the cart runs in the browser) and
 * avoids any filesystem assumptions on Vercel.
 */

const repoRoot = resolve(process.cwd());
const catalogDir = resolve(repoRoot, "catalog");
const outFile = resolve(repoRoot, "apps/web/src/generated/catalog.json");

const version = new Date().toISOString().slice(0, 10);
const { catalog, errors } = loadCatalog(catalogDir, version);

if (errors.length > 0) {
  console.error(`\nCatalog validation failed with ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error("");
  process.exit(1);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(catalog, null, 2));

const live = catalog.systems.filter((s) => s.status === "live").length;
console.log(
  `Catalog ok: ${catalog.systems.length} systems (${live} live), ${catalog.items.length} items → apps/web/src/generated/catalog.json`,
);
