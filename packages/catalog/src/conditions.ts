/**
 * Evaluates an option's `show_if`.
 *
 * Deliberately tiny: a fixed grammar, no expression parser, no eval. Admins write
 * conditions in the catalog, and a catalog author should never be able to make
 * the buyer's browser run arbitrary code.
 *
 * Supported forms, where <ref> is business.X, system.X or options.X:
 *
 *   <ref> == <literal>
 *   <ref> != <literal>
 *   <ref> in [<literal>, <literal>]
 *   <ref> includes <literal>      (ref holds an array, literal is one of its values)
 *
 * Literals are "quoted strings", bare words, numbers, true or false.
 * Anything unparseable shows the option rather than hiding it: a visible question
 * the buyer can ignore beats a hidden one they never get asked.
 */

export interface ConditionScope {
  business?: Record<string, unknown>;
  system?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

const REF = /^(business|system|options)\.([A-Za-z0-9_]+)$/;

function literal(raw: string): unknown {
  const text = raw.trim();
  if (/^".*"$/.test(text) || /^'.*'$/.test(text)) return text.slice(1, -1);
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

function resolve(ref: string, scope: ConditionScope): { ok: boolean; value?: unknown } {
  const match = REF.exec(ref.trim());
  if (!match) return { ok: false };
  const [, namespace, key] = match;
  const bag = scope[namespace as keyof ConditionScope];
  return { ok: true, value: bag?.[key] };
}

function sameValue(a: unknown, b: unknown): boolean {
  // Catalog authors write `== true`; a checkbox may hand us the string "true".
  if (typeof a === "boolean" || typeof b === "boolean") return Boolean(a) === Boolean(b);
  return String(a) === String(b);
}

export function evaluateCondition(expression: string | null | undefined, scope: ConditionScope): boolean {
  if (!expression) return true;

  const inMatch = /^(.+?)\s+in\s+\[(.*)\]$/s.exec(expression);
  if (inMatch) {
    const { ok, value } = resolve(inMatch[1], scope);
    if (!ok) return true;
    const candidates = inMatch[2]
      .split(",")
      .map((part) => literal(part))
      .filter((part) => part !== "");
    return candidates.some((candidate) => sameValue(value, candidate));
  }

  const includesMatch = /^(.+?)\s+includes\s+(.+)$/s.exec(expression);
  if (includesMatch) {
    const { ok, value } = resolve(includesMatch[1], scope);
    if (!ok) return true;
    const needle = literal(includesMatch[2]);
    if (!Array.isArray(value)) return false;
    return value.some((entry) => sameValue(entry, needle));
  }

  const comparison = /^(.+?)\s*(==|!=)\s*(.+)$/s.exec(expression);
  if (comparison) {
    const { ok, value } = resolve(comparison[1], scope);
    if (!ok) return true;
    const expected = literal(comparison[3]);
    const equal = sameValue(value, expected);
    return comparison[2] === "==" ? equal : !equal;
  }

  // Unrecognised: show the option rather than silently swallowing a question.
  return true;
}

/** Filters a list of options down to those whose condition currently holds. */
export function visibleOptions<T extends { show_if?: string | null }>(
  options: T[],
  scope: ConditionScope,
): T[] {
  return options.filter((option) => evaluateCondition(option.show_if, scope));
}
