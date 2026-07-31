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
