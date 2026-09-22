# Build plan — Acme Design Finance System

Five phases. Build them in order. Report to the owner after each one.

Estimated size: medium. Ordered by dependency: data first, then the screens the owner uses every
day, then the things that run on their own.

---

## Phase 0 — Set up

**Goal:** an empty but running application the owner can open in a browser.

1. Read `guidelines/stack.md` and set up the project.
2. Set up Supabase in region `ap-south-1` per `guidelines/data-location.md`.
3. Set up authentication. The owner plus up to 12 team members.
4. Deploy to Vercel per `guidelines/deployment.md` so the owner has a working URL from day one.
5. Create `DECISIONS.md` and record anything you chose here.

**Acceptance**
- The owner can open a URL, log in, and see an empty dashboard.
- Nothing is stored on your machine only; it is all in Supabase.

**Ask the owner for:** their business logo, their GSTIN, their bank details and UPI ID for
invoices, and their preferred web address if they have one.

---

## Phase 1 — Customers and invoices

**Goal:** the owner can invoice a customer today.

Covers `finance.feature.invoicing`.

1. Build the data model in `systems/finance/data-model.md`: Customer, Invoice, InvoiceLine,
   Payment, CreditNote.
2. Invoice numbering: **yearly prefix**, `2026-001` format, no gaps, no duplicates, safe under
   two people creating invoices at the same time.
3. GST at line level, with the breakdown shown per line as the owner requires.
4. A PO number field in the invoice header, optional.
5. Payment terms: 15 days for customers marked as retainer, 30 days otherwise.
6. Screens: customer list and detail, invoice list with unpaid / overdue / paid filters, invoice
   editor with live totals, invoice detail with payment history.
7. Part payments: record a payment against an invoice and show the running balance.

**Acceptance** (from the ordered item, all must pass)
- Can create an invoice with multiple lines and correct GST totals.
- Invoice numbers follow `2026-001` with no gaps or duplicates.
- A sent invoice cannot be silently edited; corrections produce a credit note.
- A part payment leaves the correct balance outstanding.
- Unpaid, overdue and paid are correctly separated in the list.

---

## Phase 2 — Sending invoices

**Goal:** invoices leave the building looking professional.

Covers `finance.doc_template.invoice-pdf` and the send channels.

1. Invoice PDF in the minimal style with the owner's logo, GSTIN, per-line GST breakdown, and a
   UPI QR code carrying the exact invoice amount.
2. Send by email from the owner's own address.
3. WhatsApp sending was **not purchased** (see manifest warnings). Build the send step so a
   WhatsApp channel can be added later without rework, and tell the owner that for now the flow
   is: generate PDF, then share it themselves on WhatsApp.
4. Recurring invoices for the 3 monthly retainer clients: generate on a schedule, hold as draft
   for the owner to approve, then send.

**Acceptance**
- A generated PDF opens correctly and the UPI QR scans to the right amount.
- An invoice arrives by email with the PDF attached.
- A retainer invoice appears as a draft on schedule and is not sent without approval.

---

## Phase 3 — The reminder teammate

**Goal:** unpaid invoices get chased without the owner doing it.

Covers `finance.agent.invoice-reminders`. Read `systems/finance/agents/invoice-reminders.md` in
full. **Every guardrail in that file must be implemented.** They are not suggestions.

1. Daily run at 09:30 IST, working hours only.
2. Follow-ups on the due date, 7 days after, 14 days after.
3. Friendly tone, first names, never mention late fees.
4. Never chase Northwind, Skyline or Perch.
5. First message to each customer is shown to the owner for approval; after that, automatic.
6. Escalate to the owner after 3 unanswered reminders, or immediately on any customer reply.
7. Every message logged.

**Acceptance**
- A test invoice past due produces exactly one reminder on the right day.
- Marking it paid stops all further reminders immediately.
- Northwind never receives a message.
- A customer reply escalates to the owner and gets no automated answer.
- No message contains an amount that differs from the invoice record.

---

## Phase 4 — Escalation, dashboard and exports

**Goal:** the owner can see where the money is.

Covers `finance.automation.overdue-escalation` and `finance.dashboard.cash-flow`.

1. Daily 08:00 check for invoices more than 30 days overdue and over ₹25,000. One escalation per
   customer, not per invoice, and not repeated daily for unchanged invoices. Flags the customer
   as on hold for new work. Notifies the owner by email and in the app.
2. Cash flow dashboard over a rolling 90 days: money in, money expected, overdue total, the five
   largest outstanding invoices.
3. Tally-compatible export, because the owner's accountant uses Tally (from the cart note).
   Confirm the exact format with the owner before building it.

**Acceptance**
- An invoice one day under the threshold is not escalated; one day over is.
- Three overdue invoices for one customer produce one escalation.
- The dashboard numbers match what the invoice list shows.
- The accountant can import the export without manual fixing.

---

## Finishing

Run `guidelines/acceptance.md` end to end. Give the owner a plain summary: what was built, what
to try first, what could not be done and why. List everything in `DECISIONS.md` that they might
want to change.
