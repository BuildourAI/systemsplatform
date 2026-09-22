import { KIND_LABELS, type ItemKind } from "@buildour/catalog";
import { getItem, getSystem } from "./catalog";
import { optionWords, type Manifest } from "./manifest";

/**
 * Assembles the build package from a manifest.
 *
 * Deterministic, with no AI pass: in the prototype the buyer's actual cart
 * drives every file, which is what we want to test. Phase 1 adds the coherence
 * pass over spec.md, data-model.md and build-plan.md, plus the validation gate
 * described in docs/planning/04-build-package.md.
 */

export type PackageFiles = Record<string, string>;

const KICKOFF = "Read CLAUDE.md and build-plan.md, then start Phase 0.";

export function buildPackage(manifest: Manifest): PackageFiles {
  const files: PackageFiles = {};

  files["README.md"] = readme(manifest);
  files["CLAUDE.md"] = claudeInstructions(manifest);
  files["manifest.json"] = JSON.stringify(manifest, null, 2);
  files["build-plan.md"] = buildPlan(manifest);
  files["business-profile.md"] = businessProfile(manifest);

  for (const system of manifest.systems) {
    files[`systems/${system.id}/spec.md`] = systemSpec(manifest, system);

    for (const item of system.items) {
      const catalogItem = getItem(item.id);
      if (catalogItem?.kind === "agent" && catalogItem.agent) {
        const slug = item.id.split(".").pop();
        files[`systems/${system.id}/agents/${slug}.md`] = agentBrief(item.id, item.options);
      }
    }
  }

  files["guidelines/stack.md"] = stackGuidelines(manifest);
  files["guidelines/acceptance.md"] = acceptance(manifest);

  return files;
}

function readme(manifest: Manifest): string {
  return `# ${manifest.project.name}

This folder is your build plan. It is not the software yet. Follow the three steps below and
Claude Code will build the system described here.

## Step 1: Install Claude Code

Go to https://claude.com/claude-code and follow the install instructions for your computer. It
takes a few minutes. You will need a Claude account.

## Step 2: Open this folder

Unzip this folder somewhere you can find again, such as your Documents folder. Then open a
terminal in this folder and type:

    claude

## Step 3: Paste this line

    ${KICKOFF}

That is it. Claude will read your plan and start building. It will ask you questions along the way
when it needs something only you know, such as your logo or your bank details. It will tell you in
plain language when each phase is finished.

## What is in here

| File or folder | What it is |
|----------------|-----------|
| \`build-plan.md\` | The step-by-step build, in phases |
| \`business-profile.md\` | What we recorded about your business |
| \`systems/\` | The detailed description of everything you asked for |
| \`guidelines/\` | Technical instructions for Claude, you can ignore these |
| \`manifest.json\` | The exact list of what you ordered, in machine form |

## If something goes wrong

Ask Claude directly: "Something isn't working, help me." It has the full plan and can explain
anything in this folder.
`;
}

function claudeInstructions(manifest: Manifest): string {
  const warningLines =
    manifest.warnings.length > 0
      ? manifest.warnings
          .map((warning) => `- \`${warning.item}\` ${warning.relation} \`${warning.related}\`. ${warning.note ?? ""}`)
          .join("\n")
      : "- None.";

  return `# Instructions for Claude Code

You are building a business system for a **non-technical owner**. Read this file fully before
starting.

## Source of truth

\`manifest.json\` is the contract. It lists every item the owner ordered, every option they chose
and every note they wrote. The markdown files explain the manifest in readable form. If a markdown
file ever contradicts the manifest, **the manifest wins**.

Build everything in the manifest. Build nothing that is not in it. If you believe something
essential is missing, note it in \`DECISIONS.md\` and ask the owner before adding it.

## How to work

1. Read \`build-plan.md\`. Work phase by phase, in order. Do not skip ahead.
2. At the end of each phase, run that phase's acceptance checks and report to the owner in plain
   language: what now works, what they can try, what comes next.
3. Follow everything in \`guidelines/\`.
4. Record every judgement call in \`DECISIONS.md\`.
5. Commit after each phase with a message the owner could understand.

## The stack

\`guidelines/stack.md\` contains a recommended stack. It is a recommendation, not a requirement.
You may substitute if the owner asks or something is unavailable. Record any substitution in
\`DECISIONS.md\`.

## Talking to the owner

The owner is not technical. Never ask them to choose between two technologies. Ask them about
their business instead. Prefer a sensible default and tell them what you chose.

## Rules

- Never put secrets, keys or passwords in code.
- Agents defined in \`systems/*/agents/\` have explicit guardrails. Implement every guardrail. A
  guardrail is not optional.
- Items the owner said they already have must be integrated with, not rebuilt.

## Known gaps in this order

${warningLines}
`;
}

function businessProfile(manifest: Manifest): string {
  const entries = Object.entries(manifest.business_profile).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  const lines = entries
    .map(([key, value]) => `- **${key.replace(/_/g, " ")}**: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("\n");

  return `# The business

${lines || "_The owner skipped the profile questions._"}

${manifest.cart_free_text ? `\n## In the owner's own words\n\n> ${manifest.cart_free_text}\n` : ""}
The owner is not technical. Explain things in plain language and do not ask them to make
technology choices.
`;
}

function buildPlan(manifest: Manifest): string {
  const phases: string[] = [];

  phases.push(`## Phase 0 — Set up

**Goal:** an empty but running application the owner can open in a browser.

1. Read \`guidelines/stack.md\` and set up the project.
2. Set up where the data lives. The owner chose **${manifest.data_location?.name ?? "nothing yet"}**;
   see \`guidelines/stack.md\` for what that means in practice.
3. Set up sign-in for the owner and their team.
4. Deploy it so the owner has a working address from day one. They chose
   **${manifest.deployment_target?.name ?? "nothing yet"}**.
5. Create \`DECISIONS.md\`.

**Acceptance**
- The owner can open an address, sign in, and see an empty home screen.
- Nothing is stored only on the builder's machine.
`);

  // Features first, then everything that depends on them, so each phase can be
  // tried by the owner as soon as it lands.
  const order: ItemKind[] = [
    "feature",
    "doc_template",
    "form",
    "connector",
    "migration",
    "agent",
    "automation",
    "dashboard",
    "report",
    "portal",
    "role",
    "policy",
    "notification",
    "training_content",
    "sop",
  ];

  let phaseNumber = 1;

  for (const system of manifest.systems) {
    const grouped = order
      .map((kind) => ({ kind, items: system.items.filter((item) => item.kind === kind) }))
      .filter((group) => group.items.length > 0);

    for (const group of grouped) {
      const body = group.items
        .map((item) => {
          const catalogItem = getItem(item.id);
          const choices = Object.entries(item.options)
            .map(([key, value]) => {
              const option = catalogItem?.options.find((candidate) => candidate.key === key);
              return option ? `   - ${option.label}: **${optionWords(item.id, key, value)}**` : null;
            })
            .filter(Boolean)
            .join("\n");

          const notes = Object.values(item.free_text)
            .filter((text) => text.trim())
            .map((text) => `   - The owner said: "${text}"`)
            .join("\n");

          const checks = (catalogItem?.build.acceptance ?? []).map((line) => `- ${line}`).join("\n");

          return `### ${item.name}\n\n${catalogItem?.description ?? ""}\n\n${choices}${notes ? `\n${notes}` : ""}\n\n${checks ? `**Acceptance**\n\n${checks}\n` : ""}`;
        })
        .join("\n");

      // Use the heading exactly as written: lower-casing it breaks "AI teammates".
      phases.push(
        `## Phase ${phaseNumber} — ${system.name}: ${KIND_LABELS[group.kind].plural}\n\n${body}`,
      );
      phaseNumber += 1;
    }
  }

  return `# Build plan — ${manifest.project.name}

Work through these phases in order. Report to the owner after each one.

${phases.join("\n---\n\n")}

---

## Finishing

Run \`guidelines/acceptance.md\` end to end. Give the owner a plain summary: what was built, what
to try first, what could not be done and why.
`;
}

function systemSpec(manifest: Manifest, system: Manifest["systems"][number]): string {
  const catalogSystem = getSystem(system.id);

  const answerLines = Object.entries(system.answers)
    .map(([key, value]) => {
      const question = catalogSystem?.questions.find((candidate) => candidate.key === key);
      if (!question) return null;
      const shown = Array.isArray(value) ? value.join(", ") : String(value);
      return `- **${question.label}** ${shown}`;
    })
    .filter(Boolean)
    .join("\n");

  const itemSections = system.items
    .map((item) => {
      const catalogItem = getItem(item.id);
      const options = Object.entries(item.options)
        .map(([key, value]) => {
          const option = catalogItem?.options.find((candidate) => candidate.key === key);
          return option ? `| ${option.label} | ${optionWords(item.id, key, value)} |` : null;
        })
        .filter(Boolean);

      const notes = Object.entries(item.free_text)
        .filter(([, text]) => text.trim())
        .map(([key, text]) => {
          const slot = catalogItem?.free_text.find((candidate) => candidate.key === key);
          return `**${slot?.prompt ?? "The owner added"}**\n\n> ${text}`;
        })
        .join("\n\n");

      const entities = (catalogItem?.build.entities ?? [])
        .map((entity) =>
          typeof entity === "string"
            ? `- ${entity}`
            : `- **${entity.name}**: ${entity.fields.join(", ")}`,
        )
        .join("\n");

      return `## ${item.name}

_${KIND_LABELS[(catalogItem?.kind ?? "feature") as ItemKind].singular}_

${catalogItem?.description ?? ""}

${options.length ? `| Choice | The owner picked |\n|---|---|\n${options.join("\n")}` : ""}

${notes}

${entities ? `### Data it needs\n\n${entities}` : ""}
`;
    })
    .join("\n---\n\n");

  return `# ${system.name} — specification

What the owner asked for, in detail. This document explains \`manifest.json\`. Where the two
disagree, the manifest is correct.

${answerLines ? `## How they work today\n\n${answerLines}\n` : ""}
${itemSections}
`;
}

function agentBrief(itemId: string, options: Record<string, unknown>): string {
  const item = getItem(itemId);
  const agent = item?.agent;
  if (!item || !agent) return "";

  const chosen = Object.entries(options)
    .map(([key, value]) => {
      const option = item.options.find((candidate) => candidate.key === key);
      return option ? `| ${option.label} | ${optionWords(itemId, key, value)} |` : null;
    })
    .filter(Boolean)
    .join("\n");

  const permissions = agent.permissions;

  return `# ${item.name}

## What it is for

${item.description}

## How the owner set it up

${chosen ? `| Choice | Setting |\n|---|---|\n${chosen}` : "_No options were set._"}

## When it runs

${agent.triggers.map((trigger) => `- ${trigger.value}`).join("\n") || "- On demand"}

${
  permissions
    ? `## What it can see and do

| | |
|---|---|
| Can read | ${permissions.read.join(", ") || "Nothing"} |
| Can write | ${permissions.write.join(", ") || "Nothing"} |
| Must never write | ${permissions.never.join(", ") || "Nothing"} |
| Outside the system | ${permissions.external ?? "Nothing"} |
`
    : ""
}
## Guardrails

These are requirements, not suggestions. Implement every one.

${agent.guardrails.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

${agent.playbook_md ? `## Playbook\n\n${agent.playbook_md}` : ""}

## Acceptance

${agent.acceptance.map((line) => `- ${line}`).join("\n")}
`;
}

function stackGuidelines(manifest: Manifest): string {
  const dataLocation = manifest.data_location?.id ? getItem(manifest.data_location.id) : null;
  const deployment = manifest.deployment_target?.id ? getItem(manifest.deployment_target.id) : null;

  return `# Recommended stack

This is a recommendation. You may substitute if the owner asks or something is unavailable.
Record any substitution in \`DECISIONS.md\`.

| Layer | Recommendation |
|-------|---------------|
| Application | Next.js with TypeScript |
| UI | Tailwind with a small component set |
| Data | ${dataLocation?.name ?? "Not chosen"} — ${dataLocation?.tagline ?? ""} |
| Hosting | ${deployment?.name ?? "Not chosen"} — ${deployment?.tagline ?? ""} |

## Things to get right regardless of stack

- Money is stored in the smallest unit as integers. Never floats.
- Any sequence the owner sees (invoice numbers, job numbers) must be safe when two people act at
  the same moment. Use a database sequence or a transaction, not a count of rows.
- Every table carries created_at, updated_at and who changed it.
- Show every date and time in the owner's own time zone.

## Not needed here

No multi-tenancy: this is one business.
`;
}

function acceptance(manifest: Manifest): string {
  const checks = manifest.systems
    .map((system) => {
      const lines = system.items
        .flatMap((item) => {
          const catalogItem = getItem(item.id);
          const own = catalogItem?.build.acceptance ?? [];
          const agentChecks = catalogItem?.agent?.acceptance ?? [];
          const automationChecks = catalogItem?.automation?.acceptance ?? [];
          return [...own, ...agentChecks, ...automationChecks].map((line) => `- [ ] ${line}`);
        })
        .join("\n");

      return `## ${system.name}\n\n${lines}`;
    })
    .join("\n\n");

  return `# Final acceptance checklist

Run this when all phases are done. Report the result to the owner in plain language.

${checks}

## Basics

- [ ] The owner can sign in from a phone and a laptop
- [ ] Someone with a limited role sees only what they should
- [ ] No keys or passwords anywhere in the code
- [ ] Backups confirmed running
- [ ] Every date and time shown is in the owner's time zone
`;
}

export { KICKOFF };
