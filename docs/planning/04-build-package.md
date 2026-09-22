# 4. Build package specification

The package is what the buyer downloads. It is the whole product from the buyer's point of view.
It must be complete, consistent, and usable by a non-technical owner running Claude Code.

## 4.1 Structure

```
<project-slug>/
  README.md                 Plain-English: install Claude Code, open this folder, run `claude`,
                            paste the kickoff line. Three steps, no jargon.
  CLAUDE.md                 Instructions for their Claude. See 4.3.
  manifest.json             Machine-readable cart. Source of truth. See 4.2.
  build-plan.md             Phased plan with acceptance criteria per phase.
  business-profile.md       Who the business is, in prose, from the profile answers.
  systems/
    finance/
      spec.md               Merged, human-readable spec for the whole system
      data-model.md         Entities, fields, relations across all chosen items
      screens.md            Every screen, what it shows, who can see it
      workflows.md          Automations: triggers, steps, failure handling
      agents/
        invoice-reminders.md    Playbook, permissions, guardrails, triggers, tools
      reports.md
      dashboards.md
      templates/            Document templates as markdown with placeholders
      forms.md
      portals.md
      roles.md              Roles and permission matrix
      policies.md           Rules the system and agents enforce
      sops/                 Procedures the system embeds
      migration.md          If a migration item was chosen
    crm/ ...
  guidelines/
    stack.md                Recommended stack, why, and allowed substitutions
    developer-guidelines.md Code structure, naming, testing expectations, commit habits
    technical-guidelines.md Auth, permissions, audit trail, backups, logging, error handling
    data-location.md        Specifics for the chosen data location
    deployment.md           Specifics for the chosen deployment target, env vars, domains, costs
    integrations.md         Per connector: what to set up, which keys, where to put them
    security.md             Secrets handling, PII, least privilege for agents
    acceptance.md           Final checklist their Claude runs and reports on
  .claude/
    commands/
      build-phase.md        Slash command: build one phase of build-plan.md
      run-acceptance.md     Slash command: run the acceptance checklist
  CHANGELOG.md              Delta packages only: what this version adds or changes
```

## 4.2 manifest.json

```json
{
  "manifest_version": "1.0",
  "project": { "id": "prj_...", "slug": "acme-finance", "name": "Acme Finance", "version": 1 },
  "generated_at": "2026-09-22T10:00:00Z",
  "catalog_version": "2026.09.3",
  "business_profile": { "name": "Acme Design", "country": "IN", "currency": "INR", "team_size": 12, "...": "..." },
  "data_location": { "id": "core.data_location.supabase", "options": {} },
  "deployment_target": { "id": "core.deployment_target.vercel", "options": {} },
  "systems": [
    {
      "id": "finance",
      "answers": { "invoice_cadence": "per_project", "expense_approver": "owner" },
      "free_text": "We work with 3 retainer clients and many one-off projects.",
      "items": [
        {
          "id": "finance.feature.invoicing",
          "kind": "feature",
          "options": { "numbering": "yearly_prefix", "taxes": ["gst"] },
          "free_text": { "special_rules": "GST breakdown per line, UPI QR on every invoice" }
        },
        {
          "id": "finance.agent.invoice-reminders",
          "kind": "agent",
          "options": { "tone": "friendly", "channels": ["email", "whatsapp"], "schedule": [3, 7, 14] },
          "free_text": {}
        }
      ]
    }
  ],
  "warnings": [
    { "item": "finance.agent.invoice-reminders", "requires": "finance.feature.invoicing", "status": "resolved" }
  ],
  "already_have": [],
  "cart_free_text": "..."
}
```

## 4.3 CLAUDE.md (what their Claude is told)

- You are building the system described in `manifest.json`. The manifest is the source of truth.
  The markdown files explain it; if they ever disagree with the manifest, the manifest wins.
- Read `build-plan.md` and work phase by phase. Do not skip phases. After each phase, run that
  phase's acceptance checks and report to the owner in plain language.
- Follow `guidelines/`. The stack in `guidelines/stack.md` is a recommendation. You may
  substitute if the owner asks or if something is unavailable, but record the substitution in
  `DECISIONS.md`.
- The owner is not technical. Ask only when the manifest and specs are silent. Prefer sensible
  defaults and note them in `DECISIONS.md`.
- Never store secrets in code. Use `guidelines/integrations.md` for where keys go.
- Items marked `already_have` in the manifest exist elsewhere. Integrate, do not rebuild.
- For delta packages: read `CHANGELOG.md` first and migrate the existing build. Do not start over.

## 4.4 Generation rules

1. **Deterministic assembly.** Every item's build fragments are inserted with option values and
   free text substituted. Business profile and system answers fill placeholders. Order is by
   system, then by kind, then by item.
2. **Coherence pass (Claude API).** One pass rewrites `spec.md`, `data-model.md` and
   `build-plan.md` per system so they read as one document: overlapping entities are merged,
   phases are ordered by dependency, free text lands in the right section. The pass is instructed
   to add nothing that is not in the manifest and remove nothing.
3. **Validation.** Every manifest item id appears in the output. Every free-text note appears
   verbatim or quoted. No item ids appear that are not in the manifest. Fail generation and alert
   admin if validation fails; never ship a package that fails.
4. **Delta packages.** Diff the new manifest against the last delivered version. Regenerate the
   full package and prepend `CHANGELOG.md` describing additions, removals and option changes.

## 4.5 Quality bar

Before phase 1 ships, one complete Finance package must be run end to end in Claude Code by
someone who did not write the catalog, and the resulting system must pass `acceptance.md`. This is
the launch gate.
