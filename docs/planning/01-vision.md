# 1. Vision and principles

## One sentence

A configurator that turns "I want a finance system that does X, Y and Z for my kind of business"
into an exact, buildable specification, sold like a shopping cart.

## Who it is for

Buildour community members: business owners who are **not technical**. They know their business
inside out. They do not know what a data model or a webhook is, and they should never need to.

The output must be runnable with near-zero know-how: install Claude Code, open the folder, run one
command.

## What the buyer is buying

Not software. The **build specification** for software. Every item in the cart (a feature, an AI
teammate, an automation, a report, a connector...) contributes a piece of a complete plan that
Claude Code follows to build the real thing in the buyer's own environment.

## What we take from Zite (reference: zite.com)

- The calm, confident visual language: cream background, yellow accents, serif headline, generous
  whitespace.
- Product primitives on the front page: Apps, Databases, Workflows, Websites, Forms. Our shelves
  are organised the same way but sold as build specs.
- "Solutions by use case" and "by industry" browsing.
- Agents presented as teammates with a playbook, permissions and guardrails. We copy that framing
  for every agent item.
- "Bring your own agent". Our package is written for Claude Code first, but the manifest is
  agent-neutral so other coding agents can consume it later.
- The big "Make a ..." prompt box as a second way in. Phase 2 for us.

## Principles

1. **The cart is the contract.** The manifest lists every item, every option value and every
   free-text note. The generated plan contains nothing that is not in the manifest, and nothing in
   the manifest may be dropped. Deterministic assembly first, AI polish second, validation last.
2. **Non-technical all the way to "run it".** The buyer never sees YAML or JSON. The package opens
   with a one-page README in plain language.
3. **Warn, don't block.** Missing dependencies show a warning with a one-click fix. The buyer can
   always proceed. Unresolved warnings travel into the package so their Claude knows too.
4. **Everything is an item.** Features, agents, automations, connectors, reports, dashboards,
   templates, forms, portals, roles, policies, training content, SOPs, migrations. Same shape,
   same cart, same admin screen.
5. **Their stack, their choice.** We recommend a stack, a data location and a deployment target.
   The package tells their Claude it may substitute if the owner prefers.
6. **Incremental forever.** A project keeps its manifest. Adding items later produces a delta
   package that builds on top of what already exists.
7. **Minute customisation is welcome.** Structured options for the common cases, free text for
   everything else, at both item and system level.

## Not in scope

- We do not host or run the built system.
- We do not run Claude Code for the buyer (an option for phase 3, see roadmap).
- We are not a no-code builder. We are the spec shop that sits in front of one.
