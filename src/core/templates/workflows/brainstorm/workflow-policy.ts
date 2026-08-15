/** Shared native policy for brainstorm generated skills and commands. */
export const BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK = `**Choice guidance:**

- Apply this guidance from the first question onward; introductory and clarification questions are not exempt.
- Present only genuinely viable options. Do not target a minimum or default option count, and never add weaker, duplicate, cosmetic, or irrelevant alternatives merely to create a comparison.
- State concrete advantages and disadvantages for every presented approach. When only one approach is genuinely viable, present it directly with its benefits, limitations, and rationale. Only when two or more genuinely viable options remain, mark exactly one option as \`(Recommended)\` and briefly explain why. Do not invent benefits or drawbacks merely to make the presentation look balanced.
- A recommendation is guidance only and does not select an option or bypass confirmation. The viable option the user chooses becomes authoritative, even when it differs from the recommendation; follow it without relitigating or silently substituting another option.
- If evidence is insufficient, ask one focused clarifying question before presenting options. Never guess. If new evidence later makes the chosen option infeasible or contradictory, surface that evidence and ask the user to decide again before changing direction.`;

export const BRAINSTORM_VISUAL_DESIGN_POLICY_BLOCK = `**Visual design gate:**

- When the change includes layout or component decisions, use visual exploration and obtain visual approval before finalizing the design or reconciling planning artifacts.
- When available, prioritize the \`popular-web-designs\`, \`sketch\`, and \`humanize\` skills. Use \`popular-web-designs\` to evaluate established layout and component patterns, \`sketch\` to produce the visual options, and \`humanize\` to refine usability and interface copy. If one is unavailable, continue with the remaining skills and state the fallback used.
- Present the relevant wireframe, mockup, or component comparison through the OpenSpec visual companion. If it is unavailable, use HTML/SVG, Mermaid, ASCII, or another inspectable visual fallback. Text alone does not satisfy this gate when layout or component choices remain unresolved.
- Wait for the user's visual selection or approval before recording the decision as final. A later terminal response overrides an earlier visual selection.
- After the visual decision is finalized, close any visual companion session started by the workflow with \`openspec visual stop\`. If shutdown fails, report the failure and the session details so the user can close it manually.`;

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

export const BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK = `**Artifact prose policy:**

Before writing or saving an artifact, edit its prose so it reads like deliberate
technical writing rather than generic AI copy.

- Preserve the author's meaning, decisions, technical terms, uncertainty, and
  level of confidence. Keep the template structure and required detail intact.
- Remove generic framing and conclusions, inflated claims of importance,
  promotional language, vague attribution, fake-depth “-ing” clauses, forced
  groups of three, and stock transitions such as “Additionally” or “In today's
  rapidly evolving landscape.”
- Prefer concrete nouns, direct verbs, specific claims, and the shortest wording
  that remains clear. Vary sentence length naturally; do not make every section
  follow the same rhythm or outline pattern.
- Do not manufacture personality. Add no jokes, feelings, first-person asides,
  rhetorical questions, unsupported examples, or stronger certainty than the
  source material supports. Technical artifacts should sound human because they
  are precise and purposeful, not because they imitate casual conversation.
- Do not rewrite commands, paths, identifiers, code, checklist markers,
  acceptance criteria, requirement keywords such as MUST/SHOULD, or text whose
  exact spelling carries operational meaning.

Run this edit as a final pass. If style conflicts with correctness or
completeness, preserve correctness and completeness.`;

export const BRAINSTORM_WRITING_PLANS_SHARED_BODY = `Planning method:
- Read brainstorm.md and tasks.md in full.
- Check that the scope is one coherent change.
- Resolve the exact setup prerequisites, services, fixtures, environment flags,
  entrypoints, and affected boundaries before locking the plan.
- Resolve the exact focused test command, project-level verification command,
  and baseline or reproduction command when behavior is changing or a bug is
  being fixed.
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
- Do not start implementation in this workflow.`;

export const BRAINSTORM_INLINE_EXECUTION_POLICY_BLOCK = `Execution policy:
- Implementation always runs inline in the primary session.
- Establish or verify an isolated worktree when safe and available. Preserve
  existing dirty overlapping work instead of replacing it implicitly.
- Before the first edit, confirm the execution surface: exact package or module,
  focused test command, project-level verification command, and any required
  services, fixtures, or environment flags.
- For bug fixes or behavior changes, reproduce the current behavior or intended
  RED state before editing.
- If tooling, dependencies, or environment are missing, surface the blocker immediately instead of guessing or claiming progress.
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
