# Recommended Choices in Brainstorm and Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task inline in the primary session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every multiple-choice question in the brainstorm profile's `brainstorm` and `update` workflows identify and briefly justify one contextually appropriate recommendation.

**Architecture:** Define one reusable prompt-policy constant and inject it into both generated workflow bodies so skill and command variants cannot drift. Mirror the contract in the canonical brainstorm schema instruction because direct `openspec instructions brainstorm` consumers do not depend solely on generated workflow prose.

**Tech Stack:** TypeScript 6, YAML, Vitest 3, pnpm 9.

## Global Constraints

- Apply the policy only to the brainstorm profile's `brainstorm` and `update` workflows.
- Mark exactly one choice as `(Recommended)` whenever two or more choices are presented.
- Briefly justify the recommendation from known project context, requirements, constraints, and long-term quality goals.
- When evidence is insufficient, ask one focused clarifying question before presenting choices; never guess.
- A recommendation never selects an option, bypasses user confirmation, or makes other options artificial.
- Preserve unrelated worktree changes.
- Implementation runs inline in the primary session; subagents must not implement tasks or edit files.

## File Responsibilities

- `src/core/templates/workflows/brainstorm/workflow-policy.ts`: owns the reusable multiple-choice recommendation policy.
- `src/core/templates/workflows/brainstorm/brainstorm.ts`: injects the shared policy into generated brainstorm skills and commands.
- `src/core/templates/workflows/brainstorm/update-change.ts`: injects the shared policy into generated update skills and commands.
- `test/core/templates/workflows/brainstorm-update.test.ts`: verifies both generated surfaces receive the policy and unrelated workflows do not.
- `schemas/brainstorm/schema.yaml`: owns the canonical direct brainstorm artifact instruction.
- `test/schemas/brainstorm.instruction.test.ts`: verifies the canonical instruction matches the generated policy's behavioral contract.

---

### Task 1: Shared recommendation policy for generated workflows

**Files:**
- Modify: `test/core/templates/workflows/brainstorm-update.test.ts`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `src/core/templates/workflows/brainstorm/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm/update-change.ts`

**Interfaces:**
- Produces: `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK: string` exported from `workflow-policy.ts`.
- Consumes: `getSkillTemplates(workflowIds: string[], profile: "brainstorm")` and `getCommandTemplates(workflowIds: string[], profile: "brainstorm")` from existing skill generation.

- [ ] **Step 1: Write a failing generated-workflow regression test**

Add this test to `test/core/templates/workflows/brainstorm-update.test.ts`:

```ts
it('recommends one contextually justified option for every multiple-choice question', () => {
  for (const workflowId of ['brainstorm', 'update']) {
    const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
    const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';

    for (const runtime of [skill, command]) {
      expect(runtime, workflowId).toContain('Multiple-choice guidance:');
      expect(runtime, workflowId).toContain('exactly one option as `(Recommended)`');
      expect(runtime, workflowId).toContain('briefly explain why');
      expect(runtime, workflowId).toContain('ask one focused clarifying question');
      expect(runtime, workflowId).toContain('Never guess');
      expect(runtime, workflowId).toContain('does not select it for the user');
    }
  }

  for (const workflowId of ['new', 'propose', 'writing-plans', 'apply', 'archive']) {
    const skill = getSkillTemplates([workflowId], 'brainstorm')[0]?.template.instructions ?? '';
    const command = getCommandTemplates([workflowId], 'brainstorm')[0]?.template.content ?? '';
    expect(skill, workflowId).not.toContain('Multiple-choice guidance:');
    expect(command, workflowId).not.toContain('Multiple-choice guidance:');
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run test/core/templates/workflows/brainstorm-update.test.ts
```

Expected: FAIL because generated brainstorm/update content does not contain `Multiple-choice guidance:`.

- [ ] **Step 3: Add the shared policy constant**

Add this exported constant to `src/core/templates/workflows/brainstorm/workflow-policy.ts`:

```ts
export const BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK = `**Multiple-choice guidance:**

- Whenever presenting two or more options, mark exactly one option as \`(Recommended)\` and briefly explain why it best fits the known project context, requirements, constraints, and long-term quality.
- Keep every other option viable and state its material trade-off. A recommendation is guidance only and does not select it for the user or bypass confirmation.
- If there is not enough evidence to recommend responsibly, ask one focused clarifying question before presenting the options. Never guess.`;
```

- [ ] **Step 4: Inject the policy into both workflow bodies**

Import `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK` in `brainstorm.ts` and `update-change.ts`. Place `${BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK}` once in each shared body, before workflow-specific steps or gates, so both the skill and command variants inherit identical text.

- [ ] **Step 5: Run focused generation tests and verify GREEN**

Run:

```bash
pnpm exec vitest run test/core/templates/workflows/brainstorm-update.test.ts test/core/shared/skill-generation.test.ts
```

Expected: PASS; both target workflows contain the policy, excluded workflows do not, and general generation invariants remain green.

- [ ] **Step 6: Review and commit Task 1**

Review that the constant is imported only by `brainstorm.ts` and `update-change.ts`, no policy prose is duplicated, and existing approval gates remain unchanged. Then run:

```bash
git add test/core/templates/workflows/brainstorm-update.test.ts src/core/templates/workflows/brainstorm/workflow-policy.ts src/core/templates/workflows/brainstorm/brainstorm.ts src/core/templates/workflows/brainstorm/update-change.ts
git commit -m "feat: recommend choices in brainstorm workflows"
```

### Task 2: Canonical schema alignment and verification

**Files:**
- Modify: `test/schemas/brainstorm.instruction.test.ts`
- Modify: `schemas/brainstorm/schema.yaml`

**Interfaces:**
- Consumes: the behavioral phrases defined by `BRAINSTORM_CHOICE_RECOMMENDATION_POLICY_BLOCK` in Task 1.
- Produces: canonical `brainstorm` artifact instructions with the same exactly-one recommendation, concise rationale, clarification-before-options, and user-authority guarantees.

- [ ] **Step 1: Write a failing schema-instruction regression test**

Add this test to `test/schemas/brainstorm.instruction.test.ts`:

```ts
it('requires contextual recommendations for every multiple-choice question', () => {
  const instruction = schema.artifacts.find((item) => item.id === 'brainstorm')?.instruction ?? '';

  expect(instruction).toContain('two or more options');
  expect(instruction).toContain('exactly one option as `(Recommended)`');
  expect(instruction).toContain('briefly explain why');
  expect(instruction).toContain('ask one focused clarifying question');
  expect(instruction).toContain('Never guess');
  expect(instruction).toContain('does not select it for the user');
});
```

- [ ] **Step 2: Run the schema test and verify RED**

Run:

```bash
pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts
```

Expected: FAIL because the current schema recommends among design approaches but does not define the generalized multiple-choice contract.

- [ ] **Step 3: Align the canonical brainstorm instruction**

Add this paragraph after the opening approach-comparison paragraph in `schemas/brainstorm/schema.yaml`:

```yaml
      Whenever presenting two or more options, mark exactly one option as
      `(Recommended)` and briefly explain why it best fits the known project
      context, requirements, constraints, and long-term quality. Keep every other
      option viable and state its material trade-off. The recommendation is
      guidance only and does not select it for the user or bypass confirmation.
      If there is not enough evidence to recommend responsibly, ask one focused
      clarifying question before presenting the options. Never guess.
```

- [ ] **Step 4: Run focused schema and workflow tests and verify GREEN**

Run:

```bash
pnpm exec vitest run test/schemas/brainstorm.instruction.test.ts test/core/templates/workflows/brainstorm-update.test.ts test/core/shared/skill-generation.test.ts
```

Expected: PASS with canonical and generated contracts aligned.

- [ ] **Step 5: Run project verification**

Run:

```bash
pnpm lint
pnpm build
pnpm test
git diff --check
```

Expected: all commands exit 0. Review `git diff --stat` and `git status --short` afterward to distinguish this change from the user's pre-existing modified and untracked files.

- [ ] **Step 6: Review and commit Task 2**

Confirm every success criterion in the design spec is represented by focused assertions and that no workflow outside `brainstorm` and `update` received the generated policy. Then run:

```bash
git add test/schemas/brainstorm.instruction.test.ts schemas/brainstorm/schema.yaml
git commit -m "feat: align brainstorm recommendation guidance"
```
