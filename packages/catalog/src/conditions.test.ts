import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCondition, visibleOptions } from "./conditions.ts";

const scope = {
  business: { country: "IN", team_size: "11_50", existing_tools: ["tally", "excel"] },
  system: { invoice_cadence: "mixed", quotes_needed: true },
  options: { approval: "threshold", flag_unusual: true, what_to_bring: ["customers", "open_invoices"] },
};

test("no condition means always visible", () => {
  assert.equal(evaluateCondition(undefined, scope), true);
  assert.equal(evaluateCondition(null, scope), true);
  assert.equal(evaluateCondition("", scope), true);
});

test("equality against a quoted string", () => {
  assert.equal(evaluateCondition('business.country == "IN"', scope), true);
  assert.equal(evaluateCondition('business.country == "GB"', scope), false);
});

test("inequality", () => {
  assert.equal(evaluateCondition('business.country != "GB"', scope), true);
  assert.equal(evaluateCondition('business.country != "IN"', scope), false);
});

test("booleans compare as booleans, not strings", () => {
  assert.equal(evaluateCondition("options.flag_unusual == true", scope), true);
  assert.equal(evaluateCondition("options.flag_unusual == false", scope), false);
  assert.equal(evaluateCondition("system.quotes_needed == true", scope), true);
});

test("in a list of candidates", () => {
  assert.equal(evaluateCondition('system.invoice_cadence in ["monthly_retainer", "mixed"]', scope), true);
  assert.equal(evaluateCondition('system.invoice_cadence in ["per_project"]', scope), false);
});

test("includes checks membership of an array value", () => {
  assert.equal(evaluateCondition('options.what_to_bring includes "invoice_history"', scope), false);
  assert.equal(evaluateCondition('options.what_to_bring includes "customers"', scope), true);
  assert.equal(evaluateCondition('business.existing_tools includes "tally"', scope), true);
});

test("includes against a non-array is false, not a crash", () => {
  assert.equal(evaluateCondition('business.country includes "I"', scope), false);
});

test("an unset value compares as not equal rather than throwing", () => {
  assert.equal(evaluateCondition('options.never_set == "x"', scope), false);
  assert.equal(evaluateCondition('options.never_set != "x"', scope), true);
});

test("an unparseable condition shows the option rather than hiding it", () => {
  assert.equal(evaluateCondition("this is not a condition", scope), true);
  assert.equal(evaluateCondition("weird.namespace == 1", scope), true);
});

test("a condition can never execute code", () => {
  // The grammar has no call syntax; anything shaped like one is treated as a bare literal.
  assert.equal(evaluateCondition('business.country == "IN"; process.exit(1)', scope), false);
});

test("visibleOptions filters a list", () => {
  const options = [
    { key: "a", show_if: null },
    { key: "b", show_if: 'business.country == "IN"' },
    { key: "c", show_if: 'business.country == "GB"' },
  ];
  assert.deepEqual(
    visibleOptions(options, scope).map((o) => o.key),
    ["a", "b"],
  );
});
