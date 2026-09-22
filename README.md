# Buildour Systems Platform

A "shop for your business system" platform for Buildour community members.

A business owner comes in, picks the systems they need (finance, CRM, HR, LMS, compliance, ...),
answers questions about their business, and adds features, agents, automations, reports, dashboards,
connectors and more to a cart. What they are adding to cart is not software. It is the **build
specification** for that software. At checkout they receive a complete build package they run in
Claude Code, and Claude Code builds the actual system.

Reference for look, feel and product primitives: [zite.com](https://www.zite.com/).

## Status

**Planning phase. No application code yet.**

Start with the planning docs, in order:

| # | Doc | What it covers |
|---|-----|----------------|
| 1 | [Vision and principles](docs/planning/01-vision.md) | What we are building, for whom, what it is not |
| 2 | [Catalog model](docs/planning/02-catalog-model.md) | Systems, item kinds, options, dependencies, templates |
| 3 | [Buyer flow](docs/planning/03-buyer-flow.md) | Screen by screen: browse, question, customise, cart, checkout |
| 4 | [Build package spec](docs/planning/04-build-package.md) | Exactly what the buyer downloads and how Claude Code consumes it |
| 5 | [Platform architecture](docs/planning/05-architecture.md) | Stack, data model, generation pipeline |
| 6 | [Admin area](docs/planning/06-admin.md) | How Buildour manages the catalog without touching code |
| 7 | [Roadmap](docs/planning/07-roadmap.md) | Phased build order |
| 8 | [Open decisions](docs/planning/08-open-decisions.md) | Things still to decide, with a recommendation for each |

Concrete examples that make the model real:

- [`docs/examples/catalog/`](docs/examples/catalog/) sample catalog entries (a system, a feature, an agent, an automation)
- [`docs/examples/output-package/`](docs/examples/output-package/) a sample of what a buyer receives

## The prototype

A clickable prototype of the shopping experience. No database, no accounts, no payments: the cart
lives in the browser and the downloaded package is assembled client-side from the buyer's actual
choices.

```bash
npm install
npm run dev      # validates the catalog, then starts the app on :3000
npm test         # dependency and condition logic
npm run build    # production build
```

Walk it: landing → a system → configure something → cart → review → download. Add the invoice
reminder teammate *without* Invoicing to see the dependency warning and its one-click fixes.

### Layout

| Path | What it is |
|------|-----------|
| `catalog/` | The catalog as YAML. The source of truth, validated on every build. |
| `packages/catalog/` | Schemas, the YAML loader, dependency warnings and `show_if` conditions. Phase 1 reuses all of it server-side. |
| `apps/web/` | The Next.js app: buyer flow today, admin later. |

Catalog changes need no code change. Edit the YAML, and `npm run catalog:build` validates it and
regenerates what the app reads. A broken reference or a missing field fails the build with a
message naming the file.
