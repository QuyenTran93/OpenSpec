# Native Brainstorm and Plan Output Parity

## Goal

Raise the native `brainstorm` schema's `brainstorm.md` and `plan.md` output
quality to closely match Superpowers' brainstorming and writing-plans contracts
without requiring the Superpowers plugin or emitting `superpowers:*` references.

## Principles

- Preserve the behavioral rigor of the reference skills, adapted to OpenSpec's
  schema, resolved paths, artifacts, and generated workflows.
- Keep schema instructions canonical. Templates define document shape; generated
  skills and commands orchestrate CLI calls, approval gates, reviews, and handoff.
- Implementation always runs inline in the primary session.
- Subagents may be used only for independent review or read-only research. They
  must not edit files, implement tasks, or orchestrate the apply loop.
- When subagents are unavailable, workflows continue with an expanded inline
  self-review and identify the review mode in the handoff summary.

## Brainstorm Output Contract

`brainstorm.md` must contain enough information for a contributor with no session
history to understand and review the chosen design. Its required sections are:

1. Goal and observable outcome.
2. Requirements, constraints, and measurable success criteria.
3. In-scope and out-of-scope boundaries.
4. Current context and relevant existing-system behavior.
5. Two or three viable approaches with concrete trade-offs. Fewer are allowed
   only when the document explains why no other approach is genuinely viable.
6. Chosen approach, rationale, and durable decisions.
7. Architecture and responsibilities of affected components.
8. Interfaces and data flow where the change crosses component boundaries.
9. Error handling, edge cases, compatibility, and migration where applicable.
10. Testing strategy and observable verification criteria.
11. Risks, mitigations, and resolved or explicitly open questions.

The brainstorm instruction must require project exploration, one clarifying
question at a time, explicit comparison and recommendation, user agreement, and
document review. Review checks placeholders, contradictions, scope, ambiguity,
requirement coverage, and whether the chosen architecture matches the described
behavior.

After self-review, use a review-only subagent when available. The reviewer checks
requirements coverage, internal consistency, feasibility, and unnecessary scope.
The primary session evaluates its findings and fixes valid issues. Without a
subagent, the primary session repeats the expanded review from a fresh pass. The
user remains the approval authority before `tasks.md` may be created.

## Plan Output Contract

`plan.md` must be executable by a skilled contributor with no codebase or session
context. It begins with:

- Goal.
- Architecture and execution order.
- Tech stack and relevant tooling.
- Global constraints copied precisely from the approved brainstorm.
- A file-responsibility map.

Each independently reviewable task contains:

- Stable task number and source IDs from `tasks.md`.
- Exact create, modify, and test paths.
- Interfaces consumed and produced, including exact names and types when tasks
  depend on them.
- Checkbox steps small enough to execute and verify independently.
- For behavior changes: a focused failing test, the command that proves RED and
  its expected failure, minimal implementation with concrete code or pseudocode
  precise enough to implement, the command that proves GREEN and its expected
  result, then refactoring while keeping tests green.
- Focused verification and an independently meaningful review checkpoint.
- A commit checkpoint with exact paths and a proposed commit message. It is
  planning guidance only; execution still respects repository and user policy.

Plans must not contain `TBD`, `TODO`, “implement later”, “similar to another
task”, generic error-handling directions, unnamed tests, or references to
undefined interfaces. Documentation-only or configuration-only work may omit
TDD steps only when the plan states why no behavior is changing and supplies an
appropriate validation command.

Plan self-review checks brainstorm and task coverage, placeholders, identifier
and type consistency, dependency order, task sizing, executable commands, and
expected results. A review-only subagent checks the same contract when available;
the primary session resolves findings. Without one, use the expanded inline
self-review. The user approves `plan.md` before apply begins.

## Native Execution Policy

The generated plan and apply handoff states the following policy explicitly:

1. Work is implemented inline in the primary session. There is no
   subagent-driven execution option.
2. Establish or verify an isolated worktree when safe and available. Preserve
   existing work and never replace a dirty overlapping workspace implicitly.
3. Execute tasks in dependency order and keep task completion state current.
4. Use test-first development for behavior changes: RED, GREEN, then refactor.
5. For unexpected behavior, reproduce, gather evidence, trace the failing path,
   test one hypothesis at a time, fix the root cause, and add a regression test.
6. Review requirement compliance before code quality.
7. Use subagents only for independent review or read-only research; they may not
   mutate the workspace or execute implementation tasks.
8. Verify review feedback against the code and requirements before accepting it.
9. Never claim completion without fresh focused and project-level verification.
10. Leave commit, push, merge, and branch integration decisions to the user or
    the repository's controlling policy.

The policy is native prose and must not instruct users to install or invoke an
external plugin. Execution-host details remain in the plan handoff and generated
apply workflow rather than being mixed into design decisions.

## Source Ownership

- `schemas/brainstorm/schema.yaml` owns canonical artifact and apply instructions.
- `schemas/brainstorm/templates/brainstorm.md` owns the brainstorm document shape.
- `schemas/brainstorm/templates/plan.md` owns the implementation-plan shape.
- `src/core/templates/workflows/brainstorm/native-discipline.ts` owns reusable
  native design, implementation, review, and fallback discipline.
- `src/core/templates/workflows/brainstorm/workflow-policy.ts` owns sequencing,
  approval gates, planning method, and always-inline execution handoff.
- Brainstorm and writing-plans generated skill/command modules orchestrate those
  contracts without duplicating the full schema instructions.

## Testing

Tests resolve the real schema and generate real brainstorm-profile skills and
commands. They verify:

- Every required brainstorm and plan section is present in the templates.
- Canonical instructions contain self-review, approval, independent-review, and
  fallback requirements.
- Plan output requires file responsibilities, interfaces, bite-sized checkbox
  steps, RED/GREEN commands and expected outcomes, concrete implementation
  guidance, commit checkpoints, and final verification.
- The execution policy says implementation is always inline and restricts
  subagents to review or read-only research.
- No generated runtime content contains `superpowers:` or requires an external
  plugin.
- Skill and command variants remain behaviorally equivalent.

Focused schema, generation, template-parity, and integration suites run before
build, lint, and the full test suite.

## Non-goals

- Reproducing Superpowers branding or plugin invocation syntax.
- Allowing subagent-driven implementation.
- Changing the artifact order `brainstorm.md → tasks.md → plan.md → apply`.
- Adding an execution-plan artifact separate from `plan.md`.
- Changing the canonical `brainstorm` schema ID or its legacy alias behavior.
