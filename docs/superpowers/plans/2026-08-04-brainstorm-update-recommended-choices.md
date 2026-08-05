# Viability-First Choices in Brainstorm and Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task inline in the primary session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop brainstorm and update from manufacturing a default number of options while preserving contextual recommendations when multiple viable choices genuinely exist.

**Architecture:** Replace count-first approach language with one shared viability-first policy consumed by generated brainstorm and update workflows. Mirror the same contract in the canonical brainstorm schema instruction, including the rule that a user's selected viable option becomes authoritative after the choice.

**Tech Stack:** TypeScript 6, YAML, Vitest 3, pnpm 9.

## Global Constraints

- Present only genuinely viable options; never target a minimum or default option count.
- When one approach is genuinely viable, present it directly with its rationale and do not fabricate alternatives.
- Only when two or more viable options genuinely remain, mark exactly one as `(Recommended)` and state the material trade-offs.
- State concrete, context-specific advantages and disadvantages for every presented approach, including a single viable approach.
- Apply the contract from the first question onward; introductory and clarification questions are not exempt.
- If evidence is insufficient, ask one focused clarifying question before presenting options; never guess.
- After the user chooses, follow that viable option even when it differs from the recommendation.
- Reopen a settled choice only after surfacing new evidence that makes it infeasible or contradictory and asking the user to decide again.
- Preserve unrelated worktree changes and do not create commits.
- Implementation runs inline in the primary session.

## File Responsibilities

- `src/core/templates/workflows/brainstorm/native-discipline.ts`: removes the default two-or-three approach pressure from native brainstorm orchestration.
- `src/core/templates/workflows/brainstorm/workflow-policy.ts`: owns shared viability, recommendation, and post-choice authority guidance.
- `test/core/templates/workflows/brainstorm-update.test.ts`: verifies generated brainstorm/update skill and command behavior.
- `schemas/brainstorm/schema.yaml`: owns the canonical direct brainstorm artifact instruction.
- `schemas/brainstorm/templates/brainstorm.md`: keeps the generated artifact shape free of count-first option guidance.
- `test/schemas/brainstorm.instruction.test.ts`: verifies canonical viability-first and post-choice behavior.

---

### Task 1: Viability-first generated workflow guidance

**Files:**
- Modify: `test/core/templates/workflows/brainstorm-update.test.ts`
- Modify: `src/core/templates/workflows/brainstorm/native-discipline.ts`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`

**Interfaces:**
- Consumes: existing `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK: string` injected by brainstorm and update templates.
- Produces: generated skill and command prose with no default option count and with authoritative post-choice behavior.

- [ ] **Step 1: Extend the generated-workflow test for viability-first behavior**

Inside the existing target-workflow loop in `test/core/templates/workflows/brainstorm-update.test.ts`, normalize whitespace and assert the new contract:

```ts
const normalized = runtime.replace(/\s+/g, ' ');
expect(normalized, workflowId).toContain('Do not target a minimum or default option count');
expect(normalized, workflowId).toContain('When only one approach is genuinely viable, present it directly');
expect(normalized, workflowId).toContain('Only when two or more genuinely viable options remain');
expect(normalized, workflowId).toContain('concrete advantages and disadvantages for every presented approach');
expect(normalized, workflowId).toContain('Do not invent benefits or drawbacks');
expect(normalized, workflowId).toContain('the user chooses becomes authoritative');
expect(normalized, workflowId).toContain('ask the user to decide again before changing direction');
expect(normalized, workflowId).not.toContain('Compare two or three viable approaches');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/core/templates/workflows/brainstorm-update.test.ts
```

Expected: FAIL because current generated guidance still requests two or three approaches and lacks one-option and post-choice rules.

- [ ] **Step 3: Replace count-first native brainstorm prose**

Replace the opening approach guidance in `NATIVE_BRAINSTORM_METHOD` with:

```ts
Explore the project context first. Ask one clarifying question at a time. Identify
only genuinely viable approaches and compare them when more than one remains.
Do not target a minimum or default option count. When only one approach is
genuinely viable, present it directly with its rationale instead of manufacturing
alternatives. Obtain agreement on the chosen design.
```

Keep the existing long-term quality, artifact review, approval, and visual-assistance paragraphs unchanged.

- [ ] **Step 4: Strengthen the shared choice policy**

Replace `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK` with:

```ts
export const BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK = `**Choice guidance:**

- Present only genuinely viable options. Do not target a minimum or default option count, and never add weaker, duplicate, cosmetic, or irrelevant alternatives merely to create a comparison.
- State concrete advantages and disadvantages for every presented approach. When only one approach is genuinely viable, present it directly with its benefits, limitations, and rationale. Only when two or more genuinely viable options remain, mark exactly one as \`(Recommended)\` and briefly explain why. Do not invent benefits or drawbacks merely to make the presentation look balanced.
- A recommendation is guidance only and does not select an option or bypass confirmation. The viable option the user chooses becomes authoritative, even when it differs from the recommendation; follow it without relitigating or silently substituting another option.
- If evidence is insufficient, ask one focused clarifying question before presenting options. Never guess. If new evidence later makes the chosen option infeasible or contradictory, surface that evidence and ask the user to decide again before changing direction.`;
```

- [ ] **Step 5: Run generated workflow tests and verify GREEN**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/core/templates/workflows/brainstorm-update.test.ts test/core/shared/skill-generation.test.ts
```

Expected: PASS; brainstorm and update contain the viability-first contract and other generated workflow invariants remain green.

- [ ] **Step 6: Review Task 1 without committing**

Run `git diff --check` for the three Task 1 files. Confirm no generated workflow outside brainstorm/update received the shared block and leave the changes uncommitted.

### Task 2: Canonical schema alignment

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`
- Modify: `schemas/brainstorm/templates/brainstorm.md`

**Interfaces:**
- Consumes: behavioral contract from `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK`.
- Produces: direct brainstorm artifact instructions aligned with generated brainstorm/update behavior.

- [ ] **Step 1: Extend the schema regression test**

Add these assertions to the existing normalized instruction test:

```ts
expect(normalized).toContain('Do not target a minimum or default option count');
expect(normalized).toContain('When only one approach is genuinely viable, present it directly');
expect(normalized).toContain('Only when two or more genuinely viable options remain');
expect(normalized).toContain('concrete advantages and disadvantages for every presented approach');
expect(normalized).toContain('Do not invent benefits or drawbacks');
expect(normalized).toContain('the user chooses becomes authoritative');
expect(normalized).toContain('ask the user to decide again before changing direction');
expect(normalized).not.toContain('compare two or three viable approaches');
```

- [ ] **Step 2: Run the schema test and verify RED**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts
```

Expected: FAIL because the canonical instruction still requests two or three approaches and lacks authoritative post-choice behavior.

- [ ] **Step 3: Align canonical schema prose**

Replace the opening approach and multiple-choice paragraphs in `schemas/brainstorm/schema.yaml` with the same viability-first semantics used by Task 1. Preserve YAML indentation and all later artifact, review, follow-up, and approval instructions unchanged.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts test/core/templates/workflows/brainstorm-update.test.ts test/core/shared/skill-generation.test.ts
```

Expected: PASS with canonical and generated contracts aligned.

- [ ] **Step 5: Run project verification without committing**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm lint
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm build
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm test
git diff --check
```

Expected: focused tests, lint, and build pass. The current branch's known unrelated completion-registry baseline may remain one failing full-suite test: `init --scope` exists in Commander but is absent from the completion registry. Report the exact final counts and do not broaden this change to fix it.

- [ ] **Step 6: Review the final diff without committing**

Confirm the diff contains only the approved spec, plan, two source-policy files, schema, and two regression tests plus the user's pre-existing unrelated workspace changes. Leave all new changes uncommitted as requested.

### Task 3: First-question policy ordering

**Files:**
- Modify: `test/core/templates/workflows/brainstorm-update.test.ts`
- Modify: `src/core/templates/workflows/brainstorm/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`

**Interfaces:**
- Consumes: `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK` and generated brainstorm/update runtime strings.
- Produces: first-question coverage enforced by both explicit prose and prompt ordering.

- [ ] **Step 1: Add failing generated-order tests**

For each generated brainstorm/update skill and command runtime, assert:

```ts
expect(runtime).toContain('Apply this guidance from the first question onward');
expect(runtime.indexOf('Choice guidance:')).toBeLessThan(runtime.indexOf('Ask one clarifying question'));
```

For update, compare against `Ask focused questions` when `Ask one clarifying question` is absent. Assert every located question-producing instruction has an index greater than `Choice guidance:`.

- [ ] **Step 2: Run generated tests and verify RED**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/core/templates/workflows/brainstorm-update.test.ts
```

Expected: FAIL because brainstorm currently places native clarification guidance before the shared choice policy and the policy lacks explicit first-question scope.

- [ ] **Step 3: Put shared choice guidance first**

Add `Apply this guidance from the first question onward; introductory and clarification questions are not exempt.` to `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK`. In `BRAINSTORM_THIN_BODY_TEMPLATE`, render `${BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK}` before `${NATIVE_BRAINSTORM_METHOD}`. Preserve update's existing policy-before-question ordering.

- [ ] **Step 4: Add failing canonical-order test**

Normalize the canonical brainstorm instruction and assert it begins with choice guidance that includes `Apply this guidance from the first question onward`, before `Ask one clarifying question`.

- [ ] **Step 5: Run the schema test and verify RED**

Run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts
```

Expected: FAIL because the canonical instruction currently asks for clarification before declaring first-question choice behavior.

- [ ] **Step 6: Reorder canonical guidance and verify GREEN**

Move the canonical choice-guidance paragraph before exploration and clarification instructions, include the explicit first-question sentence, then run:

```bash
PATH=/home/dev/.nvm/versions/node/v22.23.0/bin:$PATH pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts test/core/templates/workflows/brainstorm-update.test.ts test/core/shared/skill-generation.test.ts
```

Expected: PASS with choice guidance preceding every first-question instruction.

- [ ] **Step 7: Verify without committing**

Run focused tests, lint, build, full tests, and `git diff --check`. Report the known unrelated completion-registry baseline separately and leave all changes unstaged and uncommitted.
