/** Shared reminder so any OPSX skill/command can orient a fresh conversation. */
export const BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK = `
**Workflow sequence (brainstorm-root):** Use when the user starts mid-conversation or asks what to do next.

1. \`openspec-brainstorm\` / \`/opsx:brainstorm\` — clarify the idea; capture **user-approved** design decisions in \`openspec/changes/<change-name>/brainstorm.md\`.
2. \`openspec-propose\` / \`/opsx:propose\` **or** \`openspec-continue-change\` / \`/opsx:continue\` — create/update schema artifacts until \`openspec status --change "<name>" --json\` shows every artifact in \`applyRequires\` as done.
3. \`openspec-writing-plans\` / \`/opsx:writing-plans\` — write \`openspec/changes/<change-name>/execution-plan.md\` (required before apply on this schema).
4. \`openspec-apply-change\` / \`/opsx:apply\` — implement using \`execution-plan.md\` plus task checkboxes.
5. \`openspec-archive-change\` / \`/opsx:archive\` — when the change is finished.

Infer the **single** next step from \`schemaName\`, \`brainstorm.md\`, artifact statuses, and whether \`execution-plan.md\` exists; recommend exactly one slash command. Do not skip **propose/continue** after an approved brainstorm while artifacts are still missing; do not skip **writing-plans** before apply.
`.trim();

/** Identical body for openspec-brainstorm skill instructions and OPSX: Brainstorm command content (after each file’s intro + Input). */
export const BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- Where the superpowers \`brainstorming\` skill tells you to write a design doc under \`docs/superpowers/specs/\`, update \`openspec/changes/<change-name>/brainstorm.md\` instead with the same quality bar (clear scope, no vague placeholders, self-review). After the user **approves** that captured design, hand off to **propose**: run \`openspec-propose\` / \`/opsx:propose\` or iterate with \`openspec-continue-change\` / \`/opsx:continue\` until all required artifacts for this schema are done. Do **not** jump straight to \`writing-plans\` or \`apply\` from brainstorm alone.
- Do not create new files under \`docs/superpowers/specs/\` during this OpenSpec workflow.
- The superpowers \`brainstorming\` step about committing the design doc does not apply to this OpenSpec workflow: do not introduce extra commit obligations for that step; keep \`brainstorm.md\` current as the session progresses.

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
- Where the superpowers \`writing-plans\` skill tells you to save the plan under \`docs/superpowers/plans/\`, save to \`openspec/changes/<change-name>/execution-plan.md\` instead. Keep the same plan structure, required header, bite-sized tasks, self-review, and "no placeholders" rules from the skill; only the destination path changes.
- When the skill’s execution handoff mentions \`docs/superpowers/plans/\`, use the actual \`execution-plan.md\` path above when confirming completion or offering subagent-driven vs inline execution.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/execution-plan.md\`

Guardrails:
- Keep tasks executable and testable with explicit file paths.
- Include verification steps and expected outcomes.
- Do not start implementation in this workflow.
- Ensure the plan is complete before \`/opsx:apply\`.
`;
