/** Shared reminder so any OPSX skill/command can orient a fresh conversation. */
export const BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK = `
**Workflow sequence (brainstorm-root):** Use when the user starts mid-conversation or asks what to do next.

1. \`openspec-brainstorm\` / \`/opsx:brainstorm\` — run **superpowers:brainstorming** interactively (see shared body); capture the **final user-approved** outcome in \`openspec/changes/<change-name>/brainstorm.md\` only after readiness gate conditions are met; add \`design.md\` **only when optional** per that body.
2. \`openspec-propose\` / \`/opsx:propose\` **or** \`openspec-continue-change\` / \`/opsx:continue\` — create/update schema artifacts except \`plan\`; stop and hand off once all non-plan requirements are done.
3. \`openspec-writing-plans\` / \`/opsx:writing-plans\` — write \`openspec/changes/<change-name>/execution-plan.md\` (required before apply on this schema).
4. \`openspec-apply-change\` / \`/opsx:apply\` — **default:** invoke **superpowers:subagent-driven-development** so execution follows \`execution-plan.md\` and coarse progress is tracked in \`tasks.md\` checkboxes. **Inline** implementation in the primary session is allowed **only** if the user **explicitly** requests it (for example \`apply inline\`, \`inline mode\`).
5. \`openspec-archive-change\` / \`/opsx:archive\` — when the change is finished.

Infer the **single** next step from \`schemaName\`, \`brainstorm.md\`, artifact statuses, and whether \`execution-plan.md\` exists; recommend exactly one slash command. Do not skip **propose/continue** after an approved brainstorm while artifacts are still missing; do not skip **writing-plans** before apply.
Guardrail: for \`schemaName: "brainstorm-root"\`, do not infer proposal-first sequencing or require \`proposal.md\`; drive progression from current artifact status + \`applyRequires\` + \`execution-plan.md\` presence.
Guardrail: for brainstorm-root, run schema-sensitive CLI calls with explicit \`--schema brainstorm-root\`.
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

/** Identical body for openspec-writing-plans skill instructions and OPSX: Writing Plans command content (after each file’s intro + Input). */
export const BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- IMPORTANT output redirection:
  - Write plan to \`openspec/changes/<change-name>/execution-plan.md\` (never \`docs/superpowers/plans/\`).
  - Keep the writing-plans structure/quality bars unchanged; only the destination path changes.
- Handoff from writing-plans goes to \`openspec-apply-change\` / \`/opsx:apply\`. Do not present execution-mode alternatives here; keep them in apply.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/execution-plan.md\`

Guardrails:
- Keep tasks executable and testable with explicit file paths.
- Include verification steps and expected outcomes.
- Do not start implementation in this workflow.
- Ensure the plan is complete before \`/opsx:apply\`.
`;
