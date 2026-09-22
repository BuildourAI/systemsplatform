# Deployment

Target: **Vercel**, with Supabase in region `ap-south-1`.

## Environments

One production deployment. No staging at this size; use Vercel preview deployments for changes.

## What the owner needs to provide

- A Vercel account (free tier is enough to start).
- A Supabase account and project.
- A domain name, if they want one. Otherwise the Vercel URL is fine.
- Their Google Workspace credentials for sending email.

Walk them through creating these. Do not assume they know how.

## Environment variables

Keep every one of these out of the code. Set them in the Vercel dashboard.

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     server only, never exposed to the browser
SMTP_HOST / SMTP_USER / SMTP_PASS
APP_TIMEZONE=Asia/Kolkata
APP_CURRENCY=INR
```

## Scheduled jobs

- `08:00 IST` daily: overdue escalation.
- `09:30 IST` daily: invoice reminder teammate.
- `1st of each month, 09:00 IST`: generate retainer invoice drafts.

Vercel cron runs in UTC. Convert and note the conversion in a comment.

## Backups

Supabase daily backups are on by default; confirm they are enabled. Additionally, export invoices
and payments to a monthly CSV in Supabase Storage, so the owner's data is never trapped.

## Rough cost

Vercel free or hobby tier, Supabase free tier to start. Expect under ₹2,000 per month at this
size. Tell the owner before anything would start costing money.
