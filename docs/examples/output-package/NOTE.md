# About this example

This folder is a **sample of what a buyer receives**, not part of the platform's own source code.

It shows one imaginary buyer, Acme Design, a 12-person agency in India, who ordered a Finance
system with invoicing, a reminder agent, overdue escalation, a cash flow dashboard and a branded
invoice PDF. Their cart is in `manifest.json`. Everything else in this folder was generated from
that cart.

Read it in this order to see how the model works end to end:

1. `manifest.json` — the cart, the contract
2. `README.md` — what the non-technical owner sees first
3. `CLAUDE.md` — what their Claude Code is told
4. `build-plan.md` — the phased build
5. `systems/finance/spec.md` and `systems/finance/agents/invoice-reminders.md` — the detail
6. `guidelines/` — the technical instructions the owner never reads

Compare `manifest.json` against `docs/examples/catalog/*.yaml` to see how catalog entries plus
chosen options become the delivered package.

A real package also contains `data-model.md`, `screens.md`, `workflows.md`, `reports.md`,
`dashboards.md`, `templates/`, `roles.md`, `policies.md` and the remaining guidelines. They are
omitted here to keep the example readable.
