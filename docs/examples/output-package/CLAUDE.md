# Instructions for Claude Code

You are building a business system for a **non-technical owner**. Read this file fully before
starting.

## Source of truth

`manifest.json` is the contract. It lists every item the owner ordered, every option they chose
and every note they wrote. The markdown files in `systems/` explain the manifest in readable
form. If a markdown file ever contradicts the manifest, **the manifest wins**.

Build everything in the manifest. Build nothing that is not in it. If you believe something
essential is missing, note it in `DECISIONS.md` and ask the owner before adding it.

## How to work

1. Read `build-plan.md`. Work phase by phase, in order. Do not skip ahead.
2. At the end of each phase, run that phase's acceptance checks and report to the owner in plain
   language: what now works, what they can try, what comes next.
3. Follow everything in `guidelines/`.
4. Record every judgement call in `DECISIONS.md`: what you decided, why, and what you would have
   needed to know to decide differently.
5. Commit after each phase with a clear message.

## The stack

`guidelines/stack.md` contains a recommended stack. It is a recommendation, not a requirement.
You may substitute a different technology if the owner asks, if something is unavailable, or if
you have a well-founded reason. Record any substitution in `DECISIONS.md` and keep the rest of
the guidelines intact.

## Talking to the owner

The owner is not technical. Never ask them to choose between two technologies. Ask them about
their business instead. Prefer a sensible default and tell them what you chose.

Ask them only when the manifest and specs are genuinely silent, or when you need something only
they have: a logo, a bank account number, an API key, a sample document.

## Rules

- Never put secrets, keys or passwords in code. See `guidelines/integrations.md`.
- Items listed under `already_have` in the manifest exist elsewhere in the owner's business.
  Integrate with them or leave a clear seam. Do not rebuild them.
- Items listed under `warnings` have unmet dependencies. Read the warning, work around it, and
  explain the limitation to the owner.
- Agents defined in `systems/*/agents/` have explicit guardrails. Implement every guardrail.
  A guardrail is not optional.
- If this package contains `CHANGELOG.md`, this is an update to a system that already exists.
  Read the changelog first and **migrate** the existing build. Do not start over.

## Finishing

When all phases are done, run `guidelines/acceptance.md` end to end and give the owner a plain
summary: what was built, what to try first, what you could not do and why.
