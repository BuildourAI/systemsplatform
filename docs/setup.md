# Setting up Vercel and Supabase

Two accounts to create. Read this first, because **you only need one of them right now**.

| Service | What it does for us | Needed when |
|---------|---------------------|-------------|
| **Vercel** | Puts the platform on a web address so people can open it | **Now**, to see the prototype |
| **Supabase** | Stores accounts, carts and projects | **Phase 1**, when we add sign-in and saved carts |

The prototype keeps the cart in the browser and needs no database at all. So set up Vercel today
and leave Supabase until we start phase 1. It is listed here so you know what is coming and can
create the account in the right place from the start.

---

## Before either of them: decide whose account this is

This matters more than it sounds, and it is easier to get right now than to fix later.

Use a **company email you control**, not a personal Gmail, and not the email of whoever happens
to be setting it up today. Something like `tech@buildour.ai` or `admin@buildour.ai`. If that
person leaves, or you want to add a developer, the account has to move, and moving a Vercel
project or a Supabase database between accounts is annoying.

On both services, create an **organisation or team**, not just a personal account. Both let you
invite people to a team. A personal account does not.

---

## Part 1: Vercel

### What Vercel is, in one line

It takes the code from GitHub and turns it into a web address that works. You push code, it
rebuilds the site. There is nothing to install and no server to look after.

### Step 1: Create the account

1. Go to [vercel.com/signup](https://vercel.com/signup).
2. Choose **Continue with GitHub**. This matters: signing up with GitHub is what lets Vercel see
   your repositories later.
3. Sign in with the GitHub account that has access to the **BuildourAI** organisation.
4. When it asks what you are doing, pick the team or organisation option rather than personal,
   and name it `Buildour`.

The free Hobby plan is enough for the prototype. Vercel will ask you to upgrade if the project is
used commercially; that is a later conversation, not a blocker now.

### Step 2: Give Vercel access to the repository

This is the step that failed last time, so do it deliberately.

1. In Vercel, go to **Settings → Git** (or it will prompt you during the first import).
2. Choose **GitHub** and click **Configure** or **Install**.
3. GitHub opens. Choose the **BuildourAI** organisation, not your personal account.
4. Under **Repository access**, either select **All repositories**, or select **Only select
   repositories** and add **systemsplatform**.
5. Click **Save** or **Install**.

If GitHub says the installation needs approval, you are not an owner of the BuildourAI
organisation. Whoever is has to approve it. You will see a "pending approval" note until they do.

### Step 3: Import the project

1. In Vercel, click **Add New → Project**.
2. Find **BuildourAI/systemsplatform** in the list and click **Import**.
3. Change one setting, and only one:

   **Root Directory** → click **Edit** → choose **`apps/web`**

   Everything else is already correct. Vercel detects Next.js, and the repository carries its own
   build configuration, so you do not need to touch the build command, the output directory or
   the install command.

4. Click **Deploy**.

The first build takes about two minutes. When it finishes you get a URL ending in `.vercel.app`.

### Step 4: Point it at the right branch

The work currently lives on a branch, not on the main branch, so a fresh import may build an
empty repository or an older state.

1. Go to **Settings → Git**.
2. Set **Production Branch** to `claude/buildour-platform-planning-qphvrv`.
3. Go to **Deployments**, click **Redeploy**.

Once the work is merged into the main branch, change this back to your main branch. From then on
every push deploys automatically, and every branch gets its own preview URL.

### If the build fails

Open the failed deployment and read the **Building** log. The error is always in there. Send me
the last twenty lines and I will fix it. Do not change settings by guessing, because a wrong
setting produces a different error and we lose the trail.

---

## Part 2: Supabase

**Not needed for the prototype.** Do this when we start phase 1. It is written out now so you can
create the account in the right place and know what you are agreeing to.

### What Supabase is, in one line

It is the database plus the sign-in system. It remembers who your members are, what is in their
cart, and every plan they have generated. Right now the prototype forgets everything when you
clear your browser.

### Step 1: Create the account

1. Go to [supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up).
2. Sign up with **GitHub**, using the same account as Vercel.
3. Create an **organisation** called `Buildour`. Pick the free plan to start.

### Step 2: Create the project

1. Click **New project**.
2. **Name**: `buildour-systems`.
3. **Database password**: let it generate one, then save it in your password manager
   immediately. You cannot see it again, and you will need it.
4. **Region**: pick the one closest to your members. For India that is **Mumbai (ap-south-1)**.
   This decides where your members' data physically sits, and moving it later means a migration.
5. Click **Create new project**. It takes a couple of minutes to start.

### Step 3: Hand me the keys

Once I am building phase 1, I will need three values from **Settings → API**:

| Value | What it is | Where it goes |
|-------|-----------|---------------|
| Project URL | The address of your database | Safe to share |
| `anon` public key | Used by the browser | Safe to share |
| `service_role` secret key | Full access, bypasses all security | **Never share. Never paste in chat.** |

Put all three into Vercel yourself, under **Settings → Environment Variables**. Do not send me the
`service_role` key in a message. I will tell you exactly which names to use when we get there, and
the code will read them from the environment rather than having them written into it.

### A note on the free plan

Supabase pauses free projects after a week of no activity. It takes a minute to wake up. That is
fine while we build and not fine once real members are using it, so budget for the paid plan
(around 25 dollars a month) before you invite anyone real.

---

## What I need back from you

Just the Vercel URL once it deploys. Nothing else, and no keys or passwords.
