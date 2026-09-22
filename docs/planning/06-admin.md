# 6. Admin area

Same Next.js app under `/admin`, gated on `profiles.role = 'admin'`.

## 6.1 Phase 1: YAML plus a thin admin

Catalog content lives in `catalog/**.yaml` in the repo. Reasons: authoring in bulk is far faster
in files, changes get reviewed in git, and the schema stays honest. A CLI command validates and
syncs YAML into the database.

Admin screens in phase 1:

- **Catalog viewer** — read-only browse of what is synced, with validation status per item.
- **Package preview** — build any cart and download the package without paying. This is the tool
  we use while authoring content.
- **Members and invites** — issue invite links, see who signed up.
- **Projects** — every member project, its manifest, and a "regenerate package" button.
- **Validation report** — items missing descriptions, broken dependency ids, orphaned options.

## 6.2 Phase 2: full authoring UI

- **Systems**: create, edit, order, mark `live` or `coming_soon`.
- **Items**: create and edit any kind. Form adapts to the kind. Markdown editors for
  `spec_md`, `playbook_md` and guideline fragments, with live placeholder preview showing what a
  buyer's chosen options would produce.
- **Options and free-text slots**: add, reorder, set defaults and `show_if` conditions.
- **Dependencies**: pick related items, set relation, preview the warning copy the buyer sees.
- **System questions**: build the questionnaire with conditions.
- **Templates**: create from scratch or save any cart as a template.
- **Publish**: creates a `catalog_version` snapshot. Nothing reaches buyers until published.
- **Audit log**: who changed what, when, with a diff.

## 6.3 Guardrails

- Editing a live item never changes an already-delivered package (manifests are frozen).
- Deleting an item is not allowed. Mark it `deprecated` with `replaced_by`.
- Publishing runs the same validation as CI. A failing catalog cannot be published.
