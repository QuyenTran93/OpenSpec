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

export const BRAINSTORM_FOLLOW_UP_POLICY_BLOCK = `**Deferred follow-up policy:**

- Follow-up work is accepted product or engineering scope deliberately deferred
  beyond the current change. Work required to complete the current change or meet
  its requirements and success criteria must remain in tasks.md and plan.md.
- Excluded routine workflow-completion steps include manual testing, verification, archiving,
  automated checks, review, required documentation, correctness cleanup,
  VCS decisions, and handoff.
- Record eligible work in \`<planningHome.root>/TODO.md\`, using the store-aware
  planning root returned by the CLI. Read and preserve existing content first.
- Reconcile semantically equivalent entries instead of duplicating them. Each
  entry must state the deferred outcome, why it was deferred, the originating
  change, and enough context or acceptance criteria to resume it.
- Do not create or modify TODO.md when no eligible follow-up work exists.`;

export const BRAINSTORM_GATE_POLICY_BLOCK = `Before creating downstream artifacts, read the current brainstorm.md and confirm the user agrees with its chosen approach. If the design is ambiguous or still changing, ask one clarifying question at a time and update brainstorm.md first.`;

export const BRAINSTORM_WRITING_PLANS_SHARED_BODY = `Planning method:
- Read brainstorm.md and tasks.md in full.
- Check that the scope is one coherent change.
- Map files to responsibilities before decomposing work.
- Before choosing Test paths, inspect the relevant repository, package, or module.
  The existing local test convention is authoritative: reuse \`tests/\`, \`test/\`, or \`__tests__/\`,
  or preserve a deliberate colocated-test convention. If none exists,
  use \`tests/\` at the nearest package or module scope.
  Do not introduce a second test-root convention within the same scope. Do not migrate existing tests.
  Do not create an empty test directory for documentation-only or configuration-only work.
- Replace every semantic template placeholder with the exact project-specific path, code-fence language, command, and expected result.
  Raw semantic placeholders must not remain in plan.md.
- Produce independently testable deliverables with exact paths, interfaces,
  bite-sized checkbox steps, RED/GREEN commands and expected outcomes, concrete
  implementation guidance, refactoring, review, and commit checkpoints.
- Check requirement coverage, placeholders, dependency order, task sizing,
  executable commands, and identifier/type consistency.
- Documentation-only or configuration-only tasks may omit RED/GREEN steps only
  after stating why no behavior changes and supplying a validation command with
  its expected result.
- When available, use a review-only subagent for independent review; it must not
  edit files. Otherwise perform expanded inline self-review from a fresh pass.
- Ask for user approval of plan.md before implementation.
- Do not start implementation in this workflow.`;

export const BRAINSTORM_INLINE_EXECUTION_POLICY_BLOCK = `Execution policy:
- Implementation always runs inline in the primary session.
- Establish or verify an isolated worktree when safe and available. Preserve
  existing dirty overlapping work instead of replacing it implicitly.
- Execute tasks in dependency order and keep task completion state current.
- Use test-first development for behavior changes and systematic root-cause
  debugging for unexpected behavior.
- Review requirements compliance before code quality. Verify review feedback
  against the code and requirements before accepting it.
- Subagents may be used only for independent review or read-only research.
- Subagents must not edit files, implement tasks, or orchestrate the apply loop.
- If subagents are unavailable, use expanded inline self-review and record the review mode.
- A task is complete only after its acceptance criteria and focused verification pass.
  Immediately persist its \`- [ ]\` → \`- [x]\` transition in tasks.md before starting the next task.
- Never batch-fill checkboxes at the end of a session. Never mark failed, partial, or blocked work complete.
- If updating tasks.md fails, stop before the next task and report the error.
  On resume, reread tasks.md and continue from the first incomplete task in dependency order.
- Leave commit, push, merge, and branch integration decisions to the user or controlling repository policy.`;
