# Brainstorm-root Superpowers template mapping — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `openspec-brainstorm` and `openspec-writing-plans` templates (skill + command) with the approved design so Superpowers path overrides and skill/command parity are explicit, without dual-writing to `docs/superpowers/…` during these workflows.

**Architecture:** Introduce small shared string constants for the identical “Superpowers → OpenSpec” bodies; compose skill vs command wrappers that follow spec-driven conventions (`**Input**` with slash args on commands, `**Input**` with user/session wording on skills, `---` separator, then shared block). Update frozen hash map in parity tests after payloads change.

**Tech Stack:** TypeScript, existing `SkillTemplate` / `CommandTemplate` types, Vitest parity tests.

**Source spec:** `docs/superpowers/specs/2026-05-04-brainstorm-root-superpowers-template-mapping-design.md`

---

### Task 1: Add shared mapping strings module

**Files:**
- Create: `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts`
- Modify: (none yet; `index.ts` does not need to re-export constants unless you want them public — keep internal)

- [ ] **Step 1: Create the module with two exported template literals**

Create `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts`:

```typescript
/** Identical body for openspec-brainstorm skill instructions and OPSX: Brainstorm command content (after each file’s intro + Input). */
export const BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY = `Superpowers → OpenSpec (artifact mapping):
- Where the superpowers \`brainstorming\` skill tells you to write a design doc under \`docs/superpowers/specs/\`, update \`openspec/changes/<change-name>/brainstorm.md\` instead with the same quality bar (clear scope, no vague placeholders, self-review, user approval for design content before moving to planning).
- Do not create new files under \`docs/superpowers/specs/\` during this OpenSpec workflow.
- The superpowers \`brainstorming\` step about committing the design doc does not apply to this OpenSpec workflow: do not introduce extra commit obligations for that step; keep \`brainstorm.md\` current as the session progresses.

Change selection rules:
- If the user already mentioned a change name, use that change.
- If the current session already has an active/recent change in scope, continue that change.
- If no clear change exists, create one first with \`openspec new change "<change-name>"\`.

Mandatory output artifact:
- Create or update \`openspec/changes/<change-name>/brainstorm.md\`

Guardrails:
- Finish design clarification before implementation or before handoff to the planning step.
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
```

- [ ] **Step 2: Run TypeScript check (optional quick gate)**

Run: `cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && npx tsc --noEmit -p tsconfig.json`  
Expected: PASS (no errors). If the project uses a different check script, use `package.json` scripts instead.

---

### Task 2: Wire `brainstorm.ts` to shared body + spec-driven framing

**Files:**
- Modify: `src/core/templates/workflows/brainstorm-root/brainstorm.ts`

- [ ] **Step 1: Import shared body**

Add:

```typescript
import { BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY } from './superpowers-openspec-mapping.js';
```

- [ ] **Step 2: Replace `instructions` template**

Use this shape (preserve `name`, `description`, `license`, `compatibility`, `metadata`):

```typescript
instructions: `Run the superpowers \`brainstorming\` skill and follow it end-to-end before planning or implementation.

---

**Input**: The user's request may include a change name (kebab-case) or a description of the work; if unclear, resolve the active change using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}`,
```

- [ ] **Step 3: Replace `content` template for the command**

```typescript
content: `Use the superpowers \`brainstorming\` skill and complete brainstorming before any implementation work.

---

**Input**: The argument after \`/opsx:brainstorm\` is the change name (kebab-case), if provided; otherwise infer from session context using the rules below.

${BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY}`,
```

- [ ] **Step 4: Run parity test file only (expect failure until Task 4 updates hashes)**

Run: `cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && npx vitest run test/core/templates/skill-templates-parity.test.ts`  
Expected: FAIL on `preserves brainstorm-root template function payloads exactly` until hashes are updated in Task 4.

---

### Task 3: Wire `writing-plans.ts` to shared body + spec-driven framing

**Files:**
- Modify: `src/core/templates/workflows/brainstorm-root/writing-plans.ts`

- [ ] **Step 1: Import shared body**

```typescript
import { BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY } from './superpowers-openspec-mapping.js';
```

- [ ] **Step 2: Replace skill `instructions`**

Rename section **Requirements** to match design: use **Guardrails** only inside the shared body (already done in Task 1). Skill intro:

```typescript
instructions: `Run the superpowers \`writing-plans\` skill using the approved design and artifacts for the change (for example \`brainstorm.md\` and other completed files under \`openspec/changes/<change-name>/\`).

---

**Input**: The user's request may name a change (kebab-case) or rely on session context; resolve the active change before drafting the plan.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}`,
```

- [ ] **Step 3: Replace command `content`**

```typescript
content: `Use the superpowers \`writing-plans\` skill for the active change.

---

**Input**: The argument after \`/opsx:writing-plans\` is the change name (kebab-case), if provided; otherwise infer from session context.

${BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY}`,
```

- [ ] **Step 4: Re-run the same vitest file**

Run: `npx vitest run test/core/templates/skill-templates-parity.test.ts`  
Expected: Still FAIL on hash assertion until Task 4.

---

### Task 4: Refresh frozen hashes (and optional containment asserts)

**Files:**
- Modify: `test/core/templates/skill-templates-parity.test.ts`

- [ ] **Step 1: Compute new hashes**

Run:

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec
npx vitest run test/core/templates/skill-templates-parity.test.ts 2>&1 | head -80
```

Copy the `Expected` vs `Received` diff for `preserves brainstorm-root template function payloads exactly` and update **only** these keys in `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES`:

- `getBrainstormRootBrainstormSkillTemplate`
- `getBrainstormRootWritingPlansSkillTemplate`
- `getOpsxBrainstormRootBrainstormCommandTemplate`
- `getOpsxBrainstormRootWritingPlansCommandTemplate`

Leave other brainstorm-root factory hashes unchanged unless vitest reports they shifted (they should not if untouched).

- [ ] **Step 2 (optional): Add mapping anchor asserts**

Inside `skill-templates-parity.test.ts` (new `it` block or extend an existing describe), assert:

```typescript
const brainstormSkill = getBrainstormRootBrainstormSkillTemplate();
const writingSkill = getBrainstormRootWritingPlansSkillTemplate();
expect(brainstormSkill.instructions).toContain('Superpowers → OpenSpec');
expect(brainstormSkill.instructions).toContain('docs/superpowers/specs/');
expect(writingSkill.instructions).toContain('docs/superpowers/plans/');
expect(writingSkill.instructions).toContain('execution-plan.md');
```

- [ ] **Step 3: Full test run**

Run: `npx vitest run`  
Expected: PASS for entire suite.

---

### Task 5: Commit

**Files:**
- Modify: (git index only)

- [ ] **Step 1: Stage and commit**

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec
git add src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts \
  src/core/templates/workflows/brainstorm-root/brainstorm.ts \
  src/core/templates/workflows/brainstorm-root/writing-plans.ts \
  test/core/templates/skill-templates-parity.test.ts
git commit -m "fix(templates): align brainstorm-root superpowers mapping and skill/command parity"
```

Expected: Commit succeeds; working tree clean for those paths.

---

## Self-review (plan vs spec)

| Spec § | Covered by |
|--------|----------------|
| 3.1 Brainstorm path mapping + no `docs/superpowers/specs` + skip commit step | `BRAINSTORM_ROOT_BRAINSTORM_SHARED_BODY` |
| 3.1 Writing-plans path + handoff path note | `BRAINSTORM_ROOT_WRITING_PLANS_SHARED_BODY` |
| 3.2 Shared block, Input on skill + command, Guardrails naming | Tasks 2–3 |
| 3.3 Optional new module | Task 1 |
| 3.4 Parity hashes + optional asserts | Task 4 |
| 3.5 Out of scope | No tasks for propose/apply/superpowers repo |

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-04-brainstorm-root-superpowers-template-mapping.md`.

**1. Subagent-Driven (recommended)** — dispatch per task, review between tasks.  
**2. Inline Execution** — run tasks in this session with checkpoints after Task 2, 3, and 4.

Which approach do you want next?
