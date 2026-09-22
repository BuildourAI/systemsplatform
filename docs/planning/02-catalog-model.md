# 2. Catalog model

The catalog is the product. Everything the buyer can browse, configure and add to cart is a
catalog entry. This doc defines its shape.

## 2.1 Hierarchy

```
Domain tags   industry: agencies, retail, clinics, schools, manufacturing, NGOs, local government...
              use case: operations, sales, HR, finance, education, compliance...
  └── System  Finance, Sales CRM, HR, ...
        ├── Templates          preset carts for this system ("Small agency finance")
        ├── System questions   asked once when the system enters the cart
        └── Items              the shopping units, each of exactly one Kind
              ├── Options            structured choices
              ├── Free-text slots    labelled prompts for minute customisation
              ├── Dependencies       requires / recommends / conflicts (warn-only)
              └── Build fragments    what this item contributes to the output package
```

## 2.2 Systems

Confirmed by Buildour:

| System | Short description |
|--------|-------------------|
| Finance | Invoicing, expenses, payments, cash flow, bookkeeping handoff |
| Sales CRM | Leads, pipeline, follow-ups, quotes |
| HR | People records, leave, attendance, appraisals |
| Inventory | Stock, suppliers, reorder, stock-take |
| Customer Support | Tickets, SLAs, knowledge base, chat |
| Training / LMS | Courses, quizzes, certificates, staff onboarding |
| Document Control | Controlled documents, versions, approvals, distribution |
| Quality Control & Assurance | Inspections, non-conformance, CAPA, audits |
| Compliance | Obligations register, evidence, reminders, audit trail |
| AI Department | A set of agents with playbooks, permissions and reporting |
| Regulations | Regulatory tracking, filings, deadlines, licences |

Suggested additions (to confirm):

| System | Why |
|--------|-----|
| Projects & Delivery | Most service businesses run on projects and milestones |
| Procurement & Vendors | Purchase orders, vendor onboarding, approvals |
| Marketing & Content | Campaign calendar, content pipeline, lead magnets |
| Operations & SOPs | The daily-running-of-the-business system; SOP library and checklists |
| Customer Portal | Self-service for clients: invoices, documents, requests |
| Field Service & Jobs | Job cards, scheduling, on-site checklists |
| Assets & Maintenance | Asset register, maintenance schedules, breakdowns |
| Recruitment & Onboarding | Job posts, candidates, interviews, first-30-days |
| Payroll & Attendance | Could fold into HR; kept separate because regulation differs by country |
| Legal & Contracts | Contract register, renewals, e-sign, clause library |
| Knowledge Base | Internal wiki with search and ownership |
| Analytics & BI | Cross-system dashboards and scheduled reports |
| Booking & Scheduling | Appointments, rooms, resources |
| Website & Lead Capture | Public site, forms, lead routing |

**Recommendation for launch:** fully author Finance, Sales CRM and HR. List the rest as
"coming soon" with a waitlist button so browsing feels complete and we learn demand before
authoring.

## 2.3 Item kinds

Each item has exactly one kind. Kinds differ in the extra fields they carry and in how they show
up in the output package.

| Kind | What the buyer gets | Example | Buyer-facing label |
|------|--------------------|---------|--------------------|
| feature | A capability with screens and data | Invoicing | "Things it does" |
| agent | An AI teammate with playbook, permissions, guardrails | Invoice reminder agent | "AI teammates" |
| automation | A scheduled or event-driven workflow with no AI judgement | Overdue escalation | "Runs automatically" |
| connector | Integration with an external tool | Stripe, WhatsApp, Gmail, Tally, Zoho | "Connects to" |
| report | A generated document on a schedule or on demand | Monthly P&L | "Reports" |
| dashboard | A live screen of metrics | Cash flow dashboard | "Dashboards" |
| doc_template | A branded document | Invoice PDF, Offer letter | "Document templates" |
| form | Data intake, internal or public | Expense claim form | "Forms" |
| portal | A public or customer-facing area | Client invoice portal | "Portals" |
| role | A permission set | Accountant, Manager | "Roles" |
| policy | A rule the system or agents enforce | Approval above amount X | "Rules" |
| data_location | Where data lives. One per project. | Supabase, Google Sheets, Airtable, AWS RDS | "Where your data lives" |
| deployment_target | Where it runs. One per project. | Vercel, AWS, VPS, local machine | "Where it runs" |
| training_content | Courses, lessons, quizzes (LMS) | Onboarding course | "Training" |
| sop | A written procedure the system embeds and links | Month-end close SOP | "Procedures" |
| notification | A channel plus a trigger | WhatsApp alert on payment received | "Alerts" |
| migration | Import from an existing tool | Import from Excel or Tally | "Bring existing data" |

## 2.4 Item schema

This is what an admin fills in. Phase 1 stores it as YAML in the repo; phase 2 moves it into the
admin UI and database with the same shape. See `docs/examples/catalog/` for filled-in examples.

```yaml
id: finance.feature.invoicing          # <system>.<kind>.<slug>, stable forever
kind: feature
system: finance
name: Invoicing
tagline: Create, send and track invoices
description: >
  Longer buyer-facing description. Plain language. No jargon.
tier: core            # core | standard | advanced (pricing bands later)
domains: [agencies, retail, services]   # for "popular with" and filtering
effort_points: 5      # relative build size; used to phase the plan

options:
  - key: numbering
    label: How should invoices be numbered?
    type: select      # select | multiselect | boolean | number | text | currency | date
    choices:
      - { value: sequential, label: "1, 2, 3..." }
      - { value: yearly_prefix, label: "2026-001, 2026-002..." }
      - { value: custom, label: "My own pattern (tell us below)" }
    default: sequential
  - key: taxes
    label: Which taxes apply?
    type: multiselect
    choices: [gst, vat, sales_tax, none]
    show_if: null     # conditions may reference business profile or other answers

free_text:
  - key: special_rules
    prompt: Anything specific about how your invoices must work?
    placeholder: e.g. we need a GST breakdown per line and a UPI QR code on every invoice

dependencies:
  requires: []                                   # warn if missing
  recommends: [finance.agent.invoice-reminders, finance.doc_template.invoice-pdf]
  conflicts: []                                  # warn if both present

build:
  entities: [Invoice, InvoiceLine, Customer, Payment]
  screens: [Invoice list, Invoice editor, Invoice detail, Customer picker]
  workflows: [send-invoice, record-payment, void-invoice]
  acceptance:
    - Can create an invoice with line items and the chosen taxes
    - Invoice number follows the chosen numbering scheme
    - Sent invoices are immutable; corrections produce a credit note
  spec_md: |
    ## Invoicing
    Numbering: {{options.numbering}}. Taxes: {{options.taxes}}.
    {{free_text.special_rules}}
    ...
```

Kind-specific extra fields:

- **agent**: `playbook_md` (what it does step by step), `permissions` (read/write per entity),
  `guardrails` (never do X; ask a human when Y), `triggers` (schedule or event), `tools_needed`
  (email, WhatsApp, calendar...), `reports_to` (which role reviews its work).
- **automation**: `trigger`, `steps`, `failure_handling`, `notify_on_failure`.
- **connector**: `provider`, `auth_type`, `setup_steps_md`, `data_flows` (what goes in and out).
- **report / dashboard**: `metrics`, `filters`, `schedule`, `audience_roles`.
- **data_location / deployment_target**: `guidelines_md` (inserted into the package guidelines).
- **training_content**: `modules`, `quiz`, `certificate`.
- **migration**: `source`, `mapping_notes_md`.

## 2.5 Questions

Three levels. All answers are stored on the project and copied into the manifest.

1. **Business profile** (once per account, editable). Business name, country, currency, language,
   team size, industry, tools already in use, data sensitivity, preferred data location, who will
   run Claude Code (me / my helper / Buildour).
2. **System questions** (once per system in cart). Example for Finance: "Do you invoice per
   project or per month?", "Who approves expenses?", "Do you have an accountant who needs
   exports?".
3. **Item options and free-text slots** (per item, defined in the item schema).

Any question may be conditional with `show_if`, referencing business profile fields, system
answers or other options. Example: `show_if: business.country == "IN"` for a GST question.

## 2.6 Dependencies (warn-only)

Decision from Buildour: dependencies warn, never block. A buyer may buy an agent without its
feature (they may already have the feature elsewhere) or the feature without the agent.

Behaviour:

- On add-to-cart and on the cart page, for each `requires` not in cart: "Invoice reminders won't
  work without Invoicing. Add Invoicing?" with a one-click add and a "I already have this" option.
- For `recommends`: a soft suggestion, no warning styling.
- For `conflicts`: "These two overlap. Keep both or pick one?"
- Unresolved warnings and "I already have this" answers are written into the manifest and the
  package so their Claude can plan around them.

## 2.7 Templates

A template is a saved cart for one system with default option values and answers. Choosing a
template pre-fills the cart. The buyer then adds, removes and changes anything. Admin can save any
cart as a template. Templates carry a `domains` tag so "Small agency finance" surfaces for agencies.

## 2.8 Versioning

Every catalog publish creates a `catalog_version`. A project's manifest records which version it
was built from, so later catalog edits never silently change an already-delivered plan. Item ids
are stable forever; retired items are marked `deprecated` with a `replaced_by`.
