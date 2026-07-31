/** Shared native policy for brainstorm generated skills and commands. */
export const BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK = `
**Workflow sequence (brainstorm):**

1. \`openspec-brainstorm\` / \`/opsx:brainstorm\` → \`brainstorm.md\`.
2. \`openspec-propose\` / \`/opsx:propose\` → reconcile \`tasks.md\`.
3. \`openspec-writing-plans\` / \`/opsx:writing-plans\` → \`plan.md\`.
4. \`openspec-update-change\` / \`/opsx:update\` → reconcile existing planning artifacts only.
5. \`openspec-apply-change\` / \`/opsx:apply\` → implement and track \`tasks.md\`.
6. \`openspec-archive-change\` / \`/opsx:archive\` → archive verified work.

Use \`openspec status --change <name> --json\` and the resolved paths returned by
\`openspec instructions <artifact> --change <name> --json\`. Preserve the same
\`--store <id>\` on every follow-up when one was selected. Never rebuild change
paths from the process working directory.
`.trim();

export const BRAINSTORM_GATE_POLICY_BLOCK = `Before creating downstream artifacts, read the current brainstorm.md and confirm the user agrees with its chosen approach. If the design is ambiguous or still changing, ask one clarifying question at a time and update brainstorm.md first.`;

export const BRAINSTORM_WRITING_PLANS_SHARED_BODY = `Planning method:
- Read brainstorm.md and tasks.md in full.
- Check that the scope is one coherent change.
- Map files to responsibilities before decomposing work.
- Produce independently testable deliverables with concrete paths, commands,
  expected outcomes, and interfaces only where they matter.
- Check requirement coverage, placeholders, and identifier consistency.
- Ask the user to review plan.md before implementation.
- Do not start implementation in this workflow.`;
