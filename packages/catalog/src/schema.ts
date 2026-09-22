import { z } from "zod";

/**
 * The catalog schema. This is the real phase-1 schema, not a prototype stand-in:
 * the same definitions validate the YAML, drive the admin forms and feed the
 * package generator. See docs/planning/02-catalog-model.md.
 */

export const ITEM_KINDS = [
  "feature",
  "agent",
  "automation",
  "connector",
  "report",
  "dashboard",
  "doc_template",
  "form",
  "portal",
  "role",
  "policy",
  "data_location",
  "deployment_target",
  "training_content",
  "sop",
  "notification",
  "migration",
] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];

/** Buyer-facing group headings. The buyer never sees the word "feature" or "agent". */
export const KIND_LABELS: Record<ItemKind, { plural: string; singular: string }> = {
  feature: { plural: "Things it does", singular: "Capability" },
  agent: { plural: "AI teammates", singular: "AI teammate" },
  automation: { plural: "Runs automatically", singular: "Automation" },
  connector: { plural: "Connects to", singular: "Connection" },
  report: { plural: "Reports", singular: "Report" },
  dashboard: { plural: "Dashboards", singular: "Dashboard" },
  doc_template: { plural: "Document templates", singular: "Document template" },
  form: { plural: "Forms", singular: "Form" },
  portal: { plural: "Portals", singular: "Portal" },
  role: { plural: "Who can do what", singular: "Role" },
  policy: { plural: "Rules", singular: "Rule" },
  data_location: { plural: "Where your data lives", singular: "Data location" },
  deployment_target: { plural: "Where it runs", singular: "Deployment" },
  training_content: { plural: "Training", singular: "Course" },
  sop: { plural: "Procedures", singular: "Procedure" },
  notification: { plural: "Alerts", singular: "Alert" },
  migration: { plural: "Bring existing data", singular: "Data import" },
};

/** The order kinds appear on a system page. Features first, plumbing last. */
export const KIND_ORDER: ItemKind[] = [
  "feature",
  "agent",
  "automation",
  "dashboard",
  "report",
  "doc_template",
  "form",
  "portal",
  "connector",
  "migration",
  "training_content",
  "sop",
  "role",
  "policy",
  "notification",
  "data_location",
  "deployment_target",
];

const choiceSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
    label: z.string(),
    hint: z.string().optional(),
  }),
]);

export const optionSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["select", "multiselect", "boolean", "number", "currency", "text", "date"]),
  choices: z.array(choiceSchema).optional(),
  default: z.unknown().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  help: z.string().optional(),
  /** Short statement shown on the cart chip. Questions make poor chips. */
  chip: z.string().optional(),
  /** Expression against business profile, system answers or other options. */
  show_if: z.string().nullable().optional(),
});

export const freeTextSlotSchema = z.object({
  key: z.string(),
  prompt: z.string(),
  placeholder: z.string().optional(),
});

export const dependenciesSchema = z.object({
  requires: z.array(z.string()).default([]),
  recommends: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
});

const entitySchema = z.union([
  z.string(),
  z.object({ name: z.string(), fields: z.array(z.string()).default([]) }),
]);

export const buildFragmentSchema = z.object({
  entities: z.array(entitySchema).default([]),
  screens: z.array(z.string()).default([]),
  workflows: z.array(z.string()).default([]),
  acceptance: z.array(z.string()).default([]),
  spec_md: z.string().optional(),
});

/** Extra fields carried by kind: agent. */
export const agentDetailSchema = z.object({
  reports_to: z.string().optional(),
  triggers: z.array(z.object({ type: z.string(), value: z.string() })).default([]),
  permissions: z
    .object({
      read: z.array(z.string()).default([]),
      write: z.array(z.string()).default([]),
      never: z.array(z.string()).default([]),
      external: z.string().optional(),
    })
    .optional(),
  guardrails: z.array(z.string()).default([]),
  tools_needed: z.array(z.string()).default([]),
  playbook_md: z.string().optional(),
  acceptance: z.array(z.string()).default([]),
});

/** Extra fields carried by kind: automation. */
export const automationDetailSchema = z.object({
  trigger: z.object({ type: z.string(), value: z.string() }),
  steps: z.array(z.string()).default([]),
  failure_handling: z
    .object({ on_error: z.string().optional(), never: z.string().optional() })
    .optional(),
  acceptance: z.array(z.string()).default([]),
});

export const catalogItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_-]+$/, "id must be <system>.<kind>.<slug>"),
  kind: z.enum(ITEM_KINDS),
  system: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  tier: z.enum(["core", "standard", "advanced"]).default("standard"),
  domains: z.array(z.string()).default([]),
  effort_points: z.number().int().min(1).max(20).default(3),
  status: z.enum(["live", "draft", "deprecated"]).default("live"),
  replaced_by: z.string().optional(),
  options: z.array(optionSchema).default([]),
  free_text: z.array(freeTextSlotSchema).default([]),
  dependencies: dependenciesSchema.default({ requires: [], recommends: [], conflicts: [] }),
  build: buildFragmentSchema.default({
    entities: [],
    screens: [],
    workflows: [],
    acceptance: [],
  }),
  agent: agentDetailSchema.optional(),
  automation: automationDetailSchema.optional(),
});

export const systemQuestionSchema = optionSchema.extend({
  key: z.string(),
  label: z.string(),
});

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  domains: z.array(z.string()).default([]),
  items: z
    .array(
      z.object({
        id: z.string(),
        options: z.record(z.unknown()).optional(),
      }),
    )
    .default([]),
});

export const systemSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  status: z.enum(["live", "coming_soon"]).default("coming_soon"),
  /** False for cross-cutting systems like `core`, which back the cart's own pickers. */
  browsable: z.boolean().default(true),
  domains: z.array(z.string()).default([]),
  use_cases: z.array(z.string()).default([]),
  icon: z.string().optional(),
  questions: z.array(systemQuestionSchema).default([]),
  templates: z.array(templateSchema).default([]),
});

export const businessProfileQuestionSchema = optionSchema;

export const catalogSchema = z.object({
  version: z.string(),
  systems: z.array(systemSchema),
  items: z.array(catalogItemSchema),
  profile_questions: z.array(businessProfileQuestionSchema).default([]),
  domains: z
    .array(z.object({ id: z.string(), label: z.string(), kind: z.enum(["industry", "use_case"]) }))
    .default([]),
});

export type Choice = z.infer<typeof choiceSchema>;
export type Option = z.infer<typeof optionSchema>;
export type FreeTextSlot = z.infer<typeof freeTextSlotSchema>;
export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type SystemQuestion = z.infer<typeof systemQuestionSchema>;
export type Template = z.infer<typeof templateSchema>;
export type BusinessSystem = z.infer<typeof systemSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

/** Normalise a choice to its object form, so UI code has one shape to render. */
export function normaliseChoice(choice: Choice): { value: string; label: string; hint?: string } {
  if (typeof choice === "string") {
    return { value: choice, label: choice.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) };
  }
  return choice;
}
