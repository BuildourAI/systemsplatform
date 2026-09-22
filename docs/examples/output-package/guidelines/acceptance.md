# Final acceptance checklist

Run this when all phases are done. Report the result to the owner in plain language.

## Invoicing
- [ ] Create an invoice with three lines and confirm GST totals per line and overall
- [ ] Confirm the number is `2026-00X`, following the previous one with no gap
- [ ] Add a PO number and confirm it appears on the PDF
- [ ] Send an invoice by email and confirm the PDF arrives and opens
- [ ] Scan the UPI QR and confirm the amount matches exactly
- [ ] Record a part payment; confirm the balance is right and status is part-paid
- [ ] Try to edit a sent invoice; confirm it is prevented and a credit note is offered
- [ ] Create a credit note; confirm the customer balance adjusts

## Retainers
- [ ] Confirm three retainer invoices generate as drafts on schedule
- [ ] Confirm they are not sent without the owner approving

## Reminder teammate
- [ ] Back-date a test invoice past due; confirm exactly one reminder on the right day
- [ ] Confirm the first message to a customer waits for owner approval
- [ ] Mark the invoice paid; confirm no further reminders
- [ ] Confirm Northwind, Skyline and Perch receive nothing
- [ ] Reply as a customer; confirm the owner is notified and no automated answer is sent
- [ ] Check every message logged, with an amount matching the invoice

## Escalation
- [ ] Invoice 29 days overdue: not escalated. 31 days: escalated
- [ ] Below ₹25,000: not escalated
- [ ] Three overdue invoices for one customer: one escalation, not three
- [ ] Confirm the escalation does not repeat the next day unchanged
- [ ] Confirm the customer is flagged on hold and it shows on their screen

## Dashboard and export
- [ ] Dashboard totals match the invoice list
- [ ] Export opens in Tally without manual fixing

## Basics
- [ ] Owner can log in from a phone and a laptop
- [ ] A team member sees only what their role allows
- [ ] No keys or passwords anywhere in the code
- [ ] Backups confirmed running
- [ ] Every time shown is Asia/Kolkata
