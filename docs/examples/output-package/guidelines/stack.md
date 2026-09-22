# Recommended stack

This is a recommendation. You may substitute if the owner asks or something is unavailable.
Record any substitution in `DECISIONS.md`.

| Layer | Recommendation | Why for this owner |
|-------|---------------|--------------------|
| Application | Next.js with TypeScript | One codebase for screens and server logic; easy to deploy |
| UI | Tailwind with shadcn/ui | Clean defaults; the owner is not choosing a designer |
| Data | Supabase Postgres, region ap-south-1 | Data stays in India; auth and storage included |
| Auth | Supabase Auth, email login | 13 users, no need for anything heavier |
| Hosting | Vercel | The owner gets a working URL with no server administration |
| Scheduled jobs | Vercel cron | Daily 08:00 and 09:30 runs |
| Email | The owner's Google Workspace, via an SMTP or API integration | Invoices come from their own address |
| PDF | Server-side HTML to PDF | Full control over the invoice layout |

## Things to get right regardless of stack

- Invoice numbering must be safe when two people create invoices simultaneously. Use a database
  sequence or a transaction, not a count of rows.
- Money is stored in the smallest unit as integers. Never floats.
- Every table carries created_at, updated_at and who changed it.
- Time zone is Asia/Kolkata for everything the owner sees.

## Not needed here

No multi-tenancy. This is one business. No mobile app. No queue system at this scale.
