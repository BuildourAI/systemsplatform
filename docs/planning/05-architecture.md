# 5. Platform architecture

## 5.1 Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Web | Next.js (App Router, TypeScript) | One app for buyer and admin, server actions for the generator |
| UI | Tailwind + shadcn/ui | Fast to build the Zite-like calm design system |
| Data & auth | Supabase (Postgres, Auth, Storage, RLS) | Already connected to this workspace; RLS fits per-member data |
| Hosting | Vercel | Already connected; preview deploys per branch |
| AI | Claude API | Coherence pass on generated docs; "Make a ..." cart proposer in phase 2 |
| Payments | Stripe, when decided | Not in phase 1 |
| Validation | Zod | One schema shared by catalog YAML, admin forms and the generator |

## 5.2 Repo layout

```
apps/web              Next.js app (buyer + admin, role-gated)
packages/catalog      Zod schemas, YAML loader, validation CLI, seed-to-DB sync
packages/generator    Assembly + coherence pass + validator. Pure functions, unit tested.
packages/ui           Shared components and design tokens
catalog/              YAML source of truth in phase 1
  systems/finance/...
supabase/             Migrations, RLS policies, seed
docs/                 These planning docs and examples
```

## 5.3 Database tables

**Identity and access**
- `profiles` — auth user, display name, role (`member` | `admin`)
- `invites` — code, email, issued_by, used_at, expires_at

**Buyer data**
- `business_profiles` — one per account, the profile answers
- `projects` — a buyer's system-in-progress. Status `draft` (the cart) | `ordered` | `delivered`
- `project_items` — project_id, item_id, option_values (jsonb), free_text (jsonb), already_have
- `project_answers` — system-level and profile-level answers (jsonb per system)
- `plan_versions` — project_id, version, manifest (jsonb), catalog_version, package_path,
  generated_at, validation_report (jsonb)
- `orders` — nullable until payments exist

**Catalog**
- `systems` — id, name, tagline, description, status (`live` | `coming_soon`), domains
- `catalog_items` — id, kind, system_id, name, tagline, description, tier, domains,
  effort_points, status, deprecated_by
- `item_options` — item_id, key, label, type, choices (jsonb), default, show_if
- `item_free_text_slots` — item_id, key, prompt, placeholder
- `item_dependencies` — item_id, related_item_id, relation (`requires` | `recommends` | `conflicts`)
- `item_build_fragments` — item_id, entities, screens, workflows, acceptance, spec_md, extras (jsonb)
- `system_questions` — system_id, key, label, type, choices, show_if
- `templates`, `template_items`
- `catalog_versions` — snapshot of the whole catalog as jsonb at publish time

**Ops**
- `admin_audit_log` — who changed what, when
- `waitlist` — interest in "coming soon" systems

RLS: a member reads and writes only their own `business_profiles`, `projects`, `project_items`,
`project_answers`, `plan_versions`. Catalog tables are world-readable for `live` rows and
admin-writable. Storage: package zips in a private bucket, served via short-lived signed URLs.

## 5.4 Generation pipeline

```
freeze manifest  →  assemble package tree  →  Claude coherence pass  →  validate  →  zip
   from project        deterministic             3 docs per system        hard gate     store
   + catalog version   substitution                                                     sign URL
```

1. **Freeze.** Snapshot project items, answers and the current catalog version into a manifest.
   Nothing downstream reads live catalog tables, so later edits cannot change a delivered plan.
2. **Assemble.** Pure function: manifest + catalog snapshot → in-memory file tree. Fully unit
   testable with no network.
3. **Coherence pass.** One Claude call per system rewrites `spec.md`, `data-model.md` and
   `build-plan.md`. System prompt forbids adding or dropping anything in the manifest.
4. **Validate.** Every item id present, every free-text note present, no unknown ids. On failure,
   abort and alert admin. Store the validation report on the plan version.
5. **Deliver.** Zip to Supabase Storage, signed download link, optional GitHub repo push
   (phase 2).

Runs as a background job (Vercel background function or Supabase edge function) with progress
shown on the package page.

## 5.5 Testing

- `packages/catalog`: schema validation over every YAML file in `catalog/`, run in CI.
- `packages/generator`: golden-file tests. A fixture manifest produces a known package tree;
  snapshot the output. Coherence pass mocked in unit tests, exercised in one integration test.
- `apps/web`: Playwright happy path from landing to package download.
- Launch gate: one real Finance package built end to end in Claude Code by someone outside the
  team (see build package doc, section 4.5).
