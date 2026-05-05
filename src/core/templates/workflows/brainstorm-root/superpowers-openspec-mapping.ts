/** Shared reminder so any OPSX skill/command can orient a fresh conversation. */
export const BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK = `
**Workflow sequence (brainstorm-root):** Use when the user starts mid-conversation or asks what to do next.

1. \`openspec-brainstorm\` / \`/opsx:brainstorm\` — run **superpowers:brainstorming** interactively (see shared body); capture **user-approved** outcome in \`openspec/changes/<change-name>/brainstorm.md\`; add \`design.md\` **only when optional** per that body.
2. \`openspec-propose\` / \`/opsx:propose\` **or** \`openspec-continue-change\` / \`/opsx:continue\` — create/update schema artifacts until \`openspec status --change "<name>" --json\` shows every artifact in \`applyRequires\` as done.
3. \`openspec-writing-plans\` / \`/opsx:writing-plans\` — write \`openspec/changes/<change-name>/execution-plan.md\` (required before apply on this schema).
4. \`openspec-apply-change\` / \`/opsx:apply\` — implement with \`execution-plan.md\` as the source of truth for step order, and mark task checkboxes in \`tasks.md\`.
5. \`openspec-archive-change\` / \`/opsx:archive\` — when the change is finished.

Infer the **single** next step from \`schemaName\`, \`brainstorm.md\`, artifact statuses, and whether \`execution-plan.md\` exists; recommend exactly one slash command. Do not skip **propose/continue** after an approved brainstorm while artifacts are still missing; do not skip **writing-plans** before apply.
`.trim();

export const BRAINSTORM_ROOT_GATE_POLICY_BLOCK = `Gate: Brainstorm approval required for brainstorm-root
- Check brainstorm.md for marker
- Redirect to brainstorming flow if marker missing
- OR condition: marker present or explicit chat confirmation
- Semantic confirmation must include guardrails
- Require positive agreement signal in current brainstorm decision context
- Reject negation/deferral/revision-intent signals
- If ambiguous/conflicting, do not pass gate automatically; ask one explicit confirmation question
- Auto-write marker before resuming
- If frontmatter parse fails, stop and require normalize before proceeding (no bypass).`;

/** Identical body for openspec-brainstorm skill instructions and OPSX: Brainstorm command content (after each file’s intro + Input). */
export const BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- IMPORTANT output redirection:
  - Do NOT write to \`docs/superpowers/specs/\`. Persist to \`openspec/changes/<change-name>/brainstorm.md\`.
  - OPTIONAL \`design.md\`: add or update **only when** brainstorming produces a substantive standalone technical-design write-up. If \`brainstorm.md\` alone is sufficient, omit \`design.md\`; do not create empty files “to scaffold” the change.
- OpenSpec overrides: ignore superpowers \`brainstorming\` steps that commit under \`docs/superpowers/specs/\`, require the superpowers spec file review loop there, or invoke \`writing-plans\`; those belong to later OPSX steps, not brainstorm.
- After the user-approved outcome is reflected in \`brainstorm.md\`, hand off to **propose / continue**. Do **not** jump straight to \`writing-plans\` or \`apply\` from brainstorm alone.
- Keep \`brainstorm.md\` updated as dialogue progresses.

Interactive brainstorming (**mandatory** — do NOT skip ahead by dumping templates without dialogue unless the user explicitly authors manually):
  1. Explore project context (files, docs, recent commits as appropriate).
  2. Clarifying questions — one message, one question.
  3. Propose 2–3 approaches with trade-offs.
  4. Present design sections for incremental approval.
  5. Summarize the agreed outcome in \`brainstorm.md\` using the brainstorm template structure.

Guardrail — no silent scaffolding:
  - Forbidden: creating or selecting a change, then immediately writing placeholder \`brainstorm.md\` / \`design.md\` without running the interactive flow via **superpowers:brainstorming** (manual opt-in excluded).

Change selection rules:
- If the user already mentioned a change name, use that change.
- If the current session already has an active/recent change in scope, continue that change.
- If no clear change exists, create one first with \`openspec new change "<change-name>"\`.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Guardrails:
- Finish design clarification and user approval in \`brainstorm.md\` before running \`openspec-propose\` / \`/opsx:propose\` or creating artifacts that depend on an approved brainstorm gate.
- Do not implement application code in this workflow.
- Do not write to \`docs/superpowers/specs/\` in this workflow.
- Capture clarified scope, constraints, and approved design decisions in the brainstorm artifact.
- If visual options are discussed, record the chosen direction in the artifact.
`;

/** Identical body for openspec-writing-plans skill instructions and OPSX: Writing Plans command content (after each file’s intro + Input). */
export const BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- IMPORTANT output redirection:
  - Do NOT write to \`docs/superpowers/plans/\`. Save the plan directly to \`openspec/changes/<change-name>/execution-plan.md\` with the same plan structure, required header, bite-sized tasks, self-review, and "no placeholders" rules from the skill; only the destination path changes.
- When the skill’s execution handoff mentions \`docs/superpowers/plans/\` or moving on to implementation, use the \`execution-plan.md\` path above and hand off to \`openspec-apply-change\` / \`/opsx:apply\`. Do not present execution-mode alternatives in this writing-plans step; keep those options inside apply.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/execution-plan.md\`

Guardrails:
- Keep tasks executable and testable with explicit file paths.
- Include verification steps and expected outcomes.
- Do not start implementation in this workflow.
- Ensure the plan is complete before \`/opsx:apply\`.
`;
