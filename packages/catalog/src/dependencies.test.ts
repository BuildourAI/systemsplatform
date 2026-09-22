import { test } from "node:test";
import assert from "node:assert/strict";
import { computeWarnings, computeSuggestions, estimateBuildSize } from "./dependencies.ts";
import type { Catalog } from "./schema.ts";

function item(id: string, name: string, deps: Partial<{ requires: string[]; recommends: string[]; conflicts: string[] }> = {}, effort = 3) {
  return {
    id,
    kind: "feature" as const,
    system: "finance",
    name,
    tagline: "",
    description: "",
    tier: "standard" as const,
    domains: [],
    effort_points: effort,
    status: "live" as const,
    options: [],
    free_text: [],
    dependencies: { requires: deps.requires ?? [], recommends: deps.recommends ?? [], conflicts: deps.conflicts ?? [] },
    build: { entities: [], screens: [], workflows: [], acceptance: [] },
  };
}

const catalog: Catalog = {
  version: "test",
  systems: [],
  profile_questions: [],
  domains: [],
  items: [
    item("finance.feature.invoicing", "Invoicing"),
    item("finance.agent.invoice-reminders", "Invoice reminder teammate", {
      requires: ["finance.feature.invoicing"],
      recommends: ["finance.connector.whatsapp"],
    }),
    item("finance.connector.whatsapp", "WhatsApp"),
    item("finance.feature.simple-billing", "Simple billing", { conflicts: ["finance.feature.invoicing"] }),
    item("finance.dashboard.cash-flow", "Cash flow dashboard", {}, 8),
  ],
};

test("an item whose requirement is missing raises a warning", () => {
  const warnings = computeWarnings([{ itemId: "finance.agent.invoice-reminders" }], catalog);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].relation, "requires");
  assert.equal(warnings[0].relatedId, "finance.feature.invoicing");
  assert.match(warnings[0].message, /needs Invoicing to work/);
});

test("adding the requirement clears the warning", () => {
  const warnings = computeWarnings(
    [{ itemId: "finance.agent.invoice-reminders" }, { itemId: "finance.feature.invoicing" }],
    catalog,
  );
  assert.equal(warnings.length, 0);
});

test("'I already have this' clears the warning without adding the item", () => {
  const warnings = computeWarnings(
    [
      { itemId: "finance.agent.invoice-reminders" },
      { itemId: "finance.feature.invoicing", alreadyHave: true },
    ],
    catalog,
  );
  assert.equal(warnings.length, 0);
});

test("a warning offers add, already-have and remove, in that order", () => {
  const [warning] = computeWarnings([{ itemId: "finance.agent.invoice-reminders" }], catalog);
  assert.deepEqual(
    warning.fixes.map((f) => f.kind),
    ["add", "already_have", "remove"],
  );
});

test("conflicting items warn once, not once per direction", () => {
  const warnings = computeWarnings(
    [{ itemId: "finance.feature.invoicing" }, { itemId: "finance.feature.simple-billing" }],
    catalog,
  );
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].relation, "conflicts");
});

test("a conflict with an item not in the cart does not warn", () => {
  const warnings = computeWarnings([{ itemId: "finance.feature.simple-billing" }], catalog);
  assert.equal(warnings.length, 0);
});

test("recommendations are suggestions, never warnings", () => {
  const cart = [{ itemId: "finance.agent.invoice-reminders" }, { itemId: "finance.feature.invoicing" }];
  assert.equal(computeWarnings(cart, catalog).length, 0);

  const suggestions = computeSuggestions(cart, catalog);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].relatedId, "finance.connector.whatsapp");
});

test("an item already in the cart is never suggested", () => {
  const suggestions = computeSuggestions(
    [
      { itemId: "finance.agent.invoice-reminders" },
      { itemId: "finance.feature.invoicing" },
      { itemId: "finance.connector.whatsapp" },
    ],
    catalog,
  );
  assert.equal(suggestions.length, 0);
});

test("unknown item ids are ignored rather than crashing the cart", () => {
  const warnings = computeWarnings([{ itemId: "finance.feature.does-not-exist" }], catalog);
  assert.equal(warnings.length, 0);
});

test("build size rolls up effort points into a label and phase count", () => {
  const empty = estimateBuildSize([], catalog);
  assert.equal(empty.points, 0);
  assert.equal(empty.phases, 0);

  const small = estimateBuildSize([{ itemId: "finance.feature.invoicing" }], catalog);
  assert.equal(small.points, 3);
  assert.equal(small.label, "small");

  const bigger = estimateBuildSize(
    [
      { itemId: "finance.feature.invoicing" },
      { itemId: "finance.agent.invoice-reminders" },
      { itemId: "finance.dashboard.cash-flow" },
    ],
    catalog,
  );
  assert.equal(bigger.points, 14);
  assert.equal(bigger.label, "medium");
  assert.ok(bigger.phases >= 3);
});
