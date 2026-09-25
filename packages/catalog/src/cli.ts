#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "./node.js";

/**
 * Validates the YAML catalog and writes it as JSON for the web app to import.
 *
 * Generating at build time rather than reading files at runtime keeps the
 * catalog available to client components (the cart runs in the browser) and
 * avoids any filesystem assumptions on a host like Vercel.
 *
 * Paths resolve from this file's own location, not the working directory, so
 * the script behaves the same whether it is run from the repo root or from
 * apps/web (which is where a normal Vercel monorepo import starts).
 */

// dist/cli.js → packages/catalog/dist → packages/catalog → packages → repo root
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

const catalogDir = resolve(repoRoot, argValue("--catalog") ?? "catalog");
const outFile = resolve(repoRoot, argValue("--out") ?? "apps/web/src/generated/catalog.json");

const version = new Date().toISOString().slice(0, 10);
const { catalog, errors } = loadCatalog(catalogDir, version);

if (errors.length > 0) {
  console.error(`\nCatalog validation failed with ${errors.length} problem(s) in ${catalogDir}:\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error("");
  process.exit(1);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(catalog, null, 2));

const live = catalog.systems.filter((s) => s.status === "live").length;
console.log(
  `Catalog ok: ${catalog.systems.length} systems (${live} live), ${catalog.items.length} items → ${outFile}`,
);
