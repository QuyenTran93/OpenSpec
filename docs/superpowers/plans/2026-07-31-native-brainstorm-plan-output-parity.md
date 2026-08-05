# Native Brainstorm and Plan Output Parity Implementation Plan

> **For agentic workers:** Execute this plan inline in the primary session. Subagents are permitted only for independent review or read-only research. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make native `brainstorm.md` and `plan.md` outputs closely match Superpowers' quality contracts while keeping the workflow standalone and implementation always inline.

**Architecture:** Expand the canonical schema instructions and artifact templates, then expose reusable review and execution policy through the brainstorm generated workflows. Test the resolved schema and generated runtime behavior rather than source-only implementation details.

**Tech Stack:** TypeScript, YAML, Markdown templates, Vitest, pnpm.

## Global Constraints

- Implementation always runs inline in the primary session.
- Subagents may be used only for independent review or read-only research.
- Missing subagent support falls back to expanded inline self-review.
- Generated runtime content must not require a plugin or contain `superpowers:` references.
- Preserve `brainstorm.md → tasks.md → plan.md → apply` and the existing schema ID behavior.
- Preserve unrelated worktree changes.

---

### Task 1: Brainstorm output contract

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/brainstorm.md`
- Modify: `src/core/templates/workflows/brainstorm/native-discipline.ts`
- Modify: `src/core/templates/workflows/brainstorm/brainstorm.ts`

**Interfaces:**
- Consumes: resolved artifact instructions from `openspec instructions brainstorm`.
- Produces: a standalone brainstorm artifact contract and generated workflow with approval, review-only subagent, and fallback self-review gates.

- [ ] Add failing tests that resolve the real schema/template and require context, success criteria, approaches, architecture, interfaces/data flow, errors/compatibility, testing, risks/questions, expanded self-review, independent review, fallback, and user approval.
- [ ] Run `pnpm test -- test/schemas/brainstorm.instruction.test.ts` and confirm failure on missing output-contract markers.
- [ ] Expand `brainstorm.md`, canonical schema instruction, and native brainstorm discipline with the exact required sections and gates.
- [ ] Run the focused schema test and confirm it passes.

### Task 2: Plan output and always-inline execution contract

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `src/core/templates/workflows/brainstorm/writing-plans.ts`
- Modify: `src/core/templates/workflows/brainstorm/apply-change.ts`

**Interfaces:**
- Consumes: approved `brainstorm.md`, reconciled `tasks.md`, and canonical plan/apply CLI instructions.
- Produces: executable `plan.md`, review handoff, and an apply policy that permits subagents only for review/read-only research.

- [ ] Add failing tests requiring Goal, Architecture, Tech Stack, Global Constraints, file responsibilities, Interfaces, source task IDs, bite-sized checkbox steps, RED/GREEN commands and expected results, concrete implementation guidance, refactor, review, commit checkpoints, final verification, placeholder bans, independent review, fallback review, and user approval.
- [ ] Add generated-runtime assertions for “inline in the primary session”, no subagent-driven implementation, and review/read-only-only subagent use.
- [ ] Run the focused schema and generation tests and confirm failures identify missing plan/policy markers.
- [ ] Expand the plan template, canonical plan instruction, shared planning policy, writing-plans workflow, and apply handoff.
- [ ] Run focused schema, generation, workflow, and parity tests and confirm they pass.

### Task 3: Verification and documentation

**Files:**
- Modify: `CHANGELOG.md`
- Verify: all files above.

**Interfaces:**
- Produces: release-facing documentation and fresh verification evidence.

- [ ] Add a changelog entry describing higher-quality standalone brainstorm/plan output and always-inline execution.
- [ ] Run focused brainstorm schema, integration, generation, and parity suites.
- [ ] Run `pnpm build` and `pnpm lint`.
- [ ] Run the full test suite and distinguish rename/output-contract failures from known environment failures.
- [ ] Run `git diff --check` and audit active generated runtime content for forbidden plugin or subagent-driven execution references.

### Task 4: Deferred follow-up contract

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `src/core/templates/workflows/brainstorm/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm/propose.ts`
- Modify: `src/core/templates/workflows/brainstorm/writing-plans.ts`
- Modify: `src/core/templates/workflows/brainstorm/update-change.ts`
- Modify: `src/core/templates/workflows/brainstorm/apply-change.ts`

**Interfaces:**
- Produces: `BRAINSTORM_FOLLOW_UP_POLICY_BLOCK`, the single generated-runtime definition of eligible deferred work and planning-home backlog behavior.
- Consumes: store-aware `planningHome.root` returned by status/instructions JSON.

- [ ] Add failing schema/template tests requiring deferred product/engineering scope, current-change eligibility, explicit completion-step exclusions, preservation, semantic deduplication, resumable entry fields, and no `TODO.md` write when no eligible item exists.
- [ ] Add failing generation tests proving brainstorm/propose/writing-plans/update/apply include the shared policy while new-change/archive exclude it.
- [ ] Run the two focused tests and confirm RED on the missing shared contract and incorrect workflow scope.
- [ ] Extract `BRAINSTORM_FOLLOW_UP_POLICY_BLOCK` from the workflow-sequence block and inject it only into brainstorm/propose/writing-plans/update/apply.
- [ ] Reconcile `schema.yaml` brainstorm/plan/apply instructions and `plan.md` handoff with the same eligibility, exclusion, dedupe, preservation, entry-content, and no-op rules.
- [ ] Run focused schema, generation, parity, integration, metadata, and skip-specs suites and confirm GREEN.
- [ ] Run fresh build, lint, `git diff --check`, and forbidden-reference scans.

### Task 5: Convention-first test organization

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`

**Interfaces:**
- Consumes: repository/package/module test layout discovered during planning.
- Produces: exact `Test:` paths grouped under the existing `tests/`, `test/`, `__tests__/`, or deliberate colocated convention; defaults to scoped `tests/` only when no convention exists.

- [ ] Add failing schema/template tests requiring convention discovery, reuse of dedicated roots, scoped `tests/` fallback, no mixed roots, no migration, and no empty test directory for documentation/configuration-only work.
- [ ] Add failing generated-runtime tests requiring the same test-path resolution and plan self-review behavior.
- [ ] Run focused schema and generation tests; expect RED on missing test-organization markers.
- [ ] Update canonical plan instructions, plan template file-responsibility guidance and example `Test:` path, and shared writing-plans policy.
- [ ] Run focused schema, generation, parity, integration, metadata, and skip-specs suites; expect GREEN.
- [ ] Run fresh build, lint, `git diff --check`, and read-only review.

### Task 6: Keep test organization policy out of plan artifact structure

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `schemas/brainstorm/templates/plan.md`

**Interfaces:**
- Preserves: canonical/generated test-layout policy, grouped task `Test:` paths, and plan self-review.
- Removes: standalone `## Test Organization` output section from generated `plan.md`.

- [ ] Add a failing template assertion that rejects the standalone heading while retaining grouped test paths and self-review markers.
- [ ] Run the focused schema test and confirm RED on the existing heading.
- [ ] Remove only the heading and policy comment from `plan.md`; leave policy ownership in schema/generated instructions.
- [ ] Run focused regression suites, build, lint, `git diff --check`, and read-only review.

### Task 7: Stack-neutral plan template examples

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`

**Interfaces:**
- Template inputs: `<resolved-test-path>`, `<language>`, `<focused-test-command>`.
- Generated artifact output: exact project-specific path, code-fence language, command, and expected result; no raw semantic placeholders.

- [ ] Add failing tests requiring stack-neutral template placeholders and rejecting `.ts`, TypeScript code fences, and pnpm examples.
- [ ] Add failing schema/generated-runtime tests requiring every semantic placeholder to be resolved before writing `plan.md`.
- [ ] Run focused schema and generation tests; expect RED on current TypeScript/pnpm examples.
- [ ] Replace only stack-specific examples in `plan.md` and add placeholder-resolution instructions to canonical/generated planning policy.
- [ ] Run focused regression suites, build, lint, `git diff --check`, and read-only review.

### Task 8: Durable per-task checkbox persistence

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `src/core/templates/workflows/brainstorm/apply-change.ts`

**Interfaces:**
- Consumes: task acceptance criteria, focused verification result, and current `tasks.md` state.
- Produces: a persisted `- [x]` transition before the next task begins.

- [ ] Add failing schema/template/runtime assertions for verified-only completion, immediate persistence before the next task, no batch-fill, no failed/partial/blocked completion, persistence-failure stop, and resume from current file state.
- [ ] Run focused schema and generation tests; expect RED on missing invariant markers.
- [ ] Add the invariant to canonical apply instructions, shared inline execution policy, plan handoff, and both generated apply variants without creating a new CLI API.
- [ ] Run focused regression suites, build, lint, `git diff --check`, and read-only review.

### Task 9: Remove test-path-organization review item

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/plan.md`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`

- [ ] Add failing assertions that reject the literal `test-path organization` from schema/template/generated writing-plans content.
- [ ] Remove only that review/checklist phrase while preserving convention-first rules and grouped `Test:` paths.
- [ ] Re-run focused regression suites, build, lint, `git diff --check`, and read-only review.
