# 7. Roadmap

## Phase 0: Content (runs in parallel with everything)

Author the Finance, Sales CRM and HR catalogs in YAML, using `docs/examples/catalog/` as the
pattern. This is the largest and most valuable workstream and it is mostly Buildour's domain
knowledge. Working method: Claude drafts a first version of each system, Buildour corrects and
extends, we iterate in git.

Done when: three systems have full items, options, free text, dependencies and build fragments,
and all pass schema validation.

## Phase 1: MVP

Goal: an invited Buildour member can go from the landing page to a runnable Finance package.

- Invite-only auth and member accounts
- Business profile questionnaire
- Browse systems and items; system questions; item configuration with options and free text
- Cart with dependency warnings, data location and deployment target
- Review page
- Generate, validate and download the package zip
- My projects
- Admin: catalog sync from YAML, package preview, invites, projects, validation report
- No payments

Launch gate: one Finance package built end to end in Claude Code by someone outside the team,
passing its own `acceptance.md`.

## Phase 2: Real shop

- Templates and "popular with your industry"
- Multi-system merge polish (shared entities, one unified build plan)
- "Make a ..." free-text entry that proposes a starting cart
- GitHub repo export instead of, or alongside, the zip
- Delta packages for returning buyers, with CHANGELOG and migration instructions
- Admin catalog authoring UI and catalog versioning
- Remaining systems, authored in demand order from waitlist data

## Phase 3: Business

- Payments and pricing, including delta pricing
- Analytics: which items get added, which carts abandon, which packages get built
- "Bring your own agent": package variants for other coding agents
- Optional hosted build, where Buildour runs Claude Code for the buyer
- Post-build support: a "health check" package that reviews a built system

## Sequencing note

Phase 0 gates everything. A beautiful configurator over a thin catalog sells nothing. Start
Finance content the same week as phase 1 scaffolding.
