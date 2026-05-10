/** Shared reminder so any OPSX skill/command can orient a fresh conversation. */
export const BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK = `
**Workflow sequence (brainstorm-root v2):** Use when the user starts mid-conversation or asks what to do next.

1. \`openspec-brainstorm\` / \`/opsx:brainstorm\` — run **superpowers:brainstorming** interactively; capture the **final user-approved** outcome in \`openspec/changes/<change-name>/brainstorm.md\` only after readiness gate conditions are met.
2. \`openspec-propose\` / \`/opsx:propose\` — generate or reconcile \`openspec/changes/<change-name>/tasks.md\` from \`brainstorm.md\`. Re-running \`propose\` reconciles tasks against the latest brainstorm (preserving \`[x]\` completion state).
3. \`openspec-writing-plans\` / \`/opsx:writing-plans\` — write \`openspec/changes/<change-name>/plan.md\` (required before apply on this schema), reading both \`brainstorm.md\` and \`tasks.md\`.
4. \`openspec-apply-change\` / \`/opsx:apply\` — **default:** invoke **superpowers:subagent-driven-development** so execution follows \`plan.md\` and coarse progress is tracked in \`tasks.md\` checkboxes. **Inline** implementation in the primary session is allowed **only** if the user **explicitly** requests it (for example \`apply inline\`, \`inline mode\`).
5. \`openspec-archive-change\` / \`/opsx:archive\` — when the change is finished.

Infer the **single** next step from \`schemaName\`, \`brainstorm.md\`/\`tasks.md\`/\`plan.md\` existence, and artifact/phase statuses; recommend exactly one slash command. Do not skip **propose** after an approved brainstorm while \`tasks.md\` is still missing; do not skip **writing-plans** before apply.
Guardrail: for \`schemaName: "brainstorm-root"\`, drive progression from current artifact/phase status + \`apply.requires\` (i.e., \`tasks.md\` and \`plan.md\` existence) — do not require \`proposal.md\`, \`design.md\`, or per-capability spec files.
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

/** Identical body for openspec-writing-plans skill instructions and OPSX: Writing Plans command content (after each file's intro + Input). */
export const BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- IMPORTANT output redirection:
  - Write plan to \`openspec/changes/<change-name>/plan.md\` (never \`docs/superpowers/plans/\`).
  - Keep the writing-plans structure/quality bars unchanged; only the destination path changes.
- Handoff from writing-plans goes to \`openspec-apply-change\` / \`/opsx:apply\`. Do not present execution-mode alternatives here; keep them in apply.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/plan.md\`

Guardrails:
- Keep tasks executable and testable with explicit file paths.
- Include verification steps and expected outcomes.
- Do not start implementation in this workflow.
- Ensure the plan is complete before \`/opsx:apply\`.
`;
