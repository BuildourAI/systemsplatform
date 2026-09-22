# Developer guidelines

## Structure

Organise by feature, not by file type. Invoicing code lives together: its screens, its server
logic, its types. A new person should be able to find everything about invoicing in one place.

## Naming

Use the owner's language, not accounting jargon. If they say "customer", do not call it "debtor".
The names in `data-model.md` came from them; keep them.

## Testing

Test the rules that would cost the owner money if they broke:

- Invoice numbering under concurrency.
- GST calculation, per line and in total.
- Payment allocation and outstanding balance after part payments.
- Every agent guardrail. Each one gets a test proving it holds.
- The overdue threshold boundary, one day under and one day over.

Screens do not need exhaustive tests. The money rules do.

## Commits

Commit at the end of each phase, and whenever something meaningful works. Write messages the
owner could understand: "Invoices can now be part-paid" rather than "fix balance calc".

## Error handling

The owner will see errors. Every error message they can reach must say what happened and what to
do, in plain words. Log the technical detail separately.

## DECISIONS.md

Every judgement call goes here: what you decided, why, and what would change your mind. This is
how the owner, or a future developer, understands the system.
