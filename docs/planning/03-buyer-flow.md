# 3. Buyer flow

Screen by screen. Buyer-facing copy avoids the words feature, agent, automation, connector where a
plain phrase works: "Things it does", "AI teammates", "Runs automatically", "Connects to".

## 3.1 Landing

Zite-style hero: calm cream background, yellow accents, serif headline, one clear promise.

Two ways in:

- **Browse systems**: cards for Finance, Sales CRM, HR, ... plus "by industry" and "by use case"
  menus.
- **"Make a ..." box** (phase 2): free text like "a finance system for my 12-person design agency
  in India". Claude proposes a starting cart the buyer can edit.

Sign in / create account (invite-only in phase 1).

## 3.2 Business profile

Six to eight questions, one per screen, skippable and resumable. Stored once, editable from the
account page. Everything after this is pre-filtered and pre-filled from it (currency, country
taxes, tools they already use).

## 3.3 Browse a system

System page shows:

- What this system does, in plain words, and who it is for.
- Templates for this system, with "popular with agencies" style tags from the buyer's industry.
- Items grouped by kind with buyer-facing labels. Each card: name, tagline, tier, "Add".
- A sticky cart summary on the right.

## 3.4 System questions

When a system enters the cart (via template or first item), a short questionnaire opens. Answers
tune defaults for every item in that system.

## 3.5 Configure an item

Clicking a card opens a side panel:

1. Description and what it will look like (illustration or wireframe thumbnail).
2. Options, with sensible defaults from the business profile and system answers.
3. Free-text slots, clearly labelled: "Anything specific about how this must work?"
4. Dependency notes: "Works best with...", "Won't work without... (Add / I already have this)".
5. "Add to cart". Editing a cart item reopens the same panel.

## 3.6 Cart

- Grouped by system. Each item shows its chosen options and a "Edit" link.
- Inline warnings from dependencies, each with its one-click fix.
- "Where your data lives" and "Where it runs" pickers if not yet chosen. Exactly one of each per
  project.
- Estimated build size: effort points rolled up into "small / medium / large" and an estimated
  number of build phases.
- Free-text at cart level: "Anything else about this whole system?"

## 3.7 Review

A readable, printable summary of exactly what will be built, system by system, item by item, with
every option and note. This is the buyer's contract. "Looks right, continue" or "Go back and
change".

## 3.8 Checkout

Payment if enabled (open decision), otherwise "Generate my build package". Progress screen while
the package is generated.

## 3.9 Package page

- "Download package" (zip).
- "Create GitHub repo" (phase 2).
- "How to run it" in three steps, with a copy button for the kickoff prompt.
- The project now lives in **My projects** with its manifest, downloads and history.

## 3.10 Coming back later

Open a project from My projects, add or change items, get a **delta package** (paid). The delta
carries a CHANGELOG and tells their Claude to migrate, not rebuild.

## 3.11 Edge cases to design for

- Buyer leaves mid-cart: cart is a draft project, always saved.
- Buyer changes business profile after building: existing manifests are frozen; new packages use
  the new profile.
- Catalog changes after a project was built: project stays pinned to its catalog version; buyer
  sees "newer version available" on items when they return.
