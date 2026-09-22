# Finance system — specification

What Acme Design asked for, in detail. This document explains `manifest.json`. Where the two
disagree, the manifest is correct.

## How Acme bills

A mix: three retainer clients on monthly invoices, everything else invoiced per project when the
work is done. Retainer clients get 15-day payment terms; project clients get 30 days.

The owner approves all spending personally. Their accountant works in Tally and needs the numbers
in a form Tally can import.

## Invoicing

Invoice numbers run `2026-001`, `2026-002`, resetting each year. Numbers must never repeat and
never skip, even when two people create invoices at the same moment.

Every invoice carries GST, broken down per line rather than as a single total. The header carries
the client's PO number where they provide one. Invoices go out as a PDF by email; the owner
shares them on WhatsApp themselves for now.

Once an invoice has been sent it cannot be quietly changed. A mistake is corrected with a credit
note, so the trail stays honest for the accountant.

Customers often pay in instalments, so the system records part payments and shows the running
balance. Everything is in rupees; no other currency is needed.

The three retainer invoices generate automatically each month as drafts, and wait for the owner
to approve them before sending.

## Chasing payment

The reminder teammate follows up on the due date, then 7 days later, then 14 days later. It
writes warmly and uses first names. It never mentions late fees. It never contacts Northwind,
Skyline or Perch, who are handled personally by the owner.

The first message to any customer is shown to the owner before it goes out. After that the
teammate sends on its own. Any reply from a customer goes straight to the owner; the teammate
does not answer questions. After three unanswered reminders it hands the customer over.

Full behaviour, permissions and guardrails: `agents/invoice-reminders.md`.

## When things go badly late

Each morning the system looks for invoices more than 30 days overdue worth more than ₹25,000. It
tells the owner once per customer, with the whole history in one place, and marks that customer
as on hold for new work.

## Seeing the money

A cash flow view over the last and next 90 days: what came in, what is expected, what is overdue,
and the five largest outstanding invoices.

## Known gap

WhatsApp sending was not part of this order. The reminder teammate works by email. The system is
built so WhatsApp can be added later without rebuilding anything.
