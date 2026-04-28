# brainstorm-root apply inline-default Implementation Plan

> **For agentic workers:** Implement this plan **in the primary session (inline)**. Follow `superpowers:test-driven-development`, `superpowers:requesting-code-review`, and `superpowers:verification-before-completion` when executing work. Do **not** use `superpowers:subagent-driven-development` to orchestrate the full apply loop (not in scope). Use subagents or the Task tool **only** for review or read-only research, matching `docs/superpowers/specs/2026-05-14-brainstorm-root-apply-inline-default-design.md`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `brainstorm-root` apply **default to inline** execution in the primary session, require preflight skills **TDD + requesting-code-review + verification-before-completion**, allow subagents **only** for review/research, sync generated apply templates and workflow sequence text, and update tests plus parity hashes until green.

**Architecture:** Canonical policy lives in `schemas/brainstorm-root/schema.yaml` (`apply.instruction` and a small `plan.instruction` tweak). `src/core/templates/workflows/brainstorm-root/apply-change.ts` gate step mirrors that policy. `superpowers-openspec-mapping.ts` workflow bullet for `/opsx:apply` matches the new default. Tests assert new markers; `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` updates when brainstorm apply/command template bytes change.

**Tech stack:** TypeScript (Vitest), YAML schema, OpenSpec template strings, SHA-256 parity hashes in `test/core/templates/skill-templates-parity.test.ts`.

---

## File map (before tasks)

| File | Responsibility |
|------|----------------|
| `schemas/brainstorm-root/schema.yaml` | Canonical `apply.instruction` rewrite; `plan.instruction` one-line policy handoff. |
| `src/core/templates/workflows/brainstorm-root/apply-change.ts` | `APPLY_EXECUTION_PLAN_GATE_STEP` string: preflight list + follow-cli sentence. |
| `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts` | `BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK` step 4 wording for apply default. |
| `test/schemas/brainstorm-root.instruction.test.ts` | Assertions on resolved schema `apply` / `plan` instruction text. |
| `test/core/templates/workflows/apply-change.plan-gate.test.ts` | Regex-captured step 6 must include new markers. |
| `test/integration/brainstorm-root-flow.test.ts` | `generateApplyInstructions` smoke string. |
| `test/core/templates/skill-templates-parity.test.ts` | Marker test for brainstorm apply + `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` for apply factories. |

**Out of scope (YAGNI):** `CHANGELOG.md`, archived `docs/superpowers/plans/*.md`, `openspec/changes/*`, and `spec-driven` schema.

---

### Task 1: Rewrite `apply.instruction` in `schemas/brainstorm-root/schema.yaml`

**Files:**
- Modify: `schemas/brainstorm-root/schema.yaml` (replace the entire `apply:` → `instruction: |` block body from line `118` through the end of `apply.instruction`; keep `requires`, `tracks`, `executionPlan` keys unchanged)

- [ ] **Step 1.1: Replace `apply.instruction` with the following literal block**

Use your editor to replace everything after `instruction: |` under `apply:` up to (but not including) the next top-level key, with:

```yaml
  instruction: |
    Before implementing, confirm skills and execution path:

    0. **Pre-flight — verify required Superpowers skills**

       This schema's apply phase requires ALL of the following skills. Confirm
       each appears in your available skills list before proceeding:

       - **superpowers:test-driven-development**
       - **superpowers:requesting-code-review**
       - **superpowers:verification-before-completion**

       If any required skill is missing, STOP and inform the user — do NOT
       proceed and do NOT silently fall back.

    1. **Primary path — inline in the primary session (default)**

       By default, YOU (the primary agent in this session) implement `plan.md`
       micro-tasks and update `tasks.md` checkboxes as coarse tasks complete.

       Discipline contract (follow these skills from the primary session; do not
       skip their rules):

       - **superpowers:test-driven-development** — RED-GREEN-REFACTOR; delete
         implementation code written before a failing test exists.
       - **superpowers:requesting-code-review** — run review rounds after
         substantive work per that skill. Review delegation to a subagent or
         Task-style reviewer is allowed **only** for this review work.
       - **superpowers:verification-before-completion** — run the verification
         gate before claiming apply is complete or marking remaining work done.

       Working agreements:

       - Read `plan.md` in this change directory for micro-tasks.
       - Do NOT run `git commit` while executing this flow unless the user
         explicitly asks for a commit; track progress with `tasks.md` checkboxes
         and working-tree changes only.
       - Do **not** default to `using-git-worktrees` unless the user explicitly
         asks for isolated worktrees.

       Do **not** invoke **superpowers:subagent-driven-development** to run the
       full apply implementation loop. That orchestration model is not the default
       for this schema.

    2. **Delegated subagents / Task tool — review and research only**

       You MAY use subagents or the Task tool **only** for:

       - **Review** passes aligned with `superpowers:requesting-code-review`.
       - **Research** / read-only exploration (for example mapping code or
         locating call sites) to support implementation decisions.

       You MUST NOT hand off bulk implementation of `plan.md` micro-tasks to
       implementation subagents in place of the primary inline path.

    3. **No `superpowers:executing-plans` substitute**

       This schema does NOT support `superpowers:executing-plans` as a shortcut
       that replaces the TDD + code-review + verification discipline in sections
       0–1. If you cannot satisfy the required skills in section 0, STOP and
       explain the gap — do not substitute `superpowers:executing-plans`.

       Lack of Task/subagent support does **not** excuse skipping section 0; the
       default path is inline in this session, not multi-subagent implementation.
```

- [ ] **Step 1.2: Validate YAML**

Run:

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && node -e "const fs=require('fs');const p=require('path');const yaml=require('yaml');yaml.parse(fs.readFileSync('schemas/brainstorm-root/schema.yaml','utf8'));"
```

Expected: process exits `0` with no parse error. If the project does not bundle `yaml` on `require`, instead run:

```bash
pnpm exec vitest run test/schemas/brainstorm-root.instruction.test.ts --reporter=dot 2>&1 | head -40
```

and fix YAML until the resolver test loads.

---

### Task 2: Tighten `plan.instruction` handoff in the same schema file

**Files:**
- Modify: `schemas/brainstorm-root/schema.yaml` (`plan.instruction` block)

- [ ] **Step 2.1: Replace the single execution-mode sentence**

Find (exact):

```text
    Do **not** choose execution mode here (inline vs subagent); `/opsx:apply` owns that policy.
```

Replace with:

```text
    `/opsx:apply` owns execution policy: default is **inline** in the primary session; subagents or Task tool are only for **review** or **read-only research** per `apply.instruction`. Do not sequence full-plan subagent orchestration here.
```

---

### Task 3: Sync `APPLY_EXECUTION_PLAN_GATE_STEP` in `apply-change.ts`

**Files:**
- Modify: `src/core/templates/workflows/brainstorm-root/apply-change.ts` (template literal passed to `APPLY_EXECUTION_PLAN_GATE_STEP`)

- [ ] **Step 3.1: Update the two bullet lines inside the gate**

Replace the preflight bullet that mentions `superpowers:subagent-driven-development` with explicit three-skill list matching Task 1, for example:

```text
   - `superpowers:test-driven-development`, `superpowers:requesting-code-review`, and `superpowers:verification-before-completion` are available.
```

Replace the `Follow CLI` sentence so it names **default inline**, **subagent scope review/research only**, and still says **no** ``superpowers:executing-plans`` **fallback**, plus `git commit` / `using-git-worktrees` defaults unchanged.

- [ ] **Step 3.2: Confirm both call sites still interpolate**

`APPLY_EXECUTION_PLAN_GATE_STEP('apply')` and `APPLY_EXECUTION_PLAN_GATE_STEP('\`/opsx:apply\`')` must remain unchanged outside the const body.

---

### Task 4: Update workflow sequence block

**Files:**
- Modify: `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts`

- [ ] **Step 4.1: Edit line 8 in `BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK`**

Replace the current apply bullet so it states:

- **Default:** primary agent implements from `plan.md` inline; `tasks.md` tracks coarse progress.
- **Subagents / Task:** only for review or read-only research, per schema `apply.instruction`.
- Remove the old phrasing that **only** allows inline when the user explicitly requests it.

Keep numbering `1.`–`5.` and the two Guardrail lines unchanged aside from item `4.`.

---

### Task 5: Update `test/schemas/brainstorm-root.instruction.test.ts`

**Files:**
- Modify: `test/schemas/brainstorm-root.instruction.test.ts`

- [ ] **Step 5.1: Rename describe block if needed**

Change describe title `apply.instruction (preserved from v1)` to something accurate, e.g. `apply.instruction (inline-default policy)`.

- [ ] **Step 5.2: Replace obsolete assertions**

Remove or replace tests that require:

- `superpowers:subagent-driven-development`
- `Use the Skill tool to invoke **superpowers:subagent-driven-development**`

Add assertions that `aInstr` (apply instruction string):

- Contains `superpowers:verification-before-completion`
- Contains `superpowers:test-driven-development` and `superpowers:requesting-code-review`
- Contains `inline` (or `primary session`) — pick one stable substring you actually ship in Task 1 prose
- Contains a phrase restricting subagent/Task to review/research (match your final wording, e.g. `review` and `research`)
- Still contains `superpowers:executing-plans` (forbidden section)
- Still contains `git commit` and `using-git-worktrees`

- [ ] **Step 5.3: Extend `plan.instruction` test**

In the existing `it('delegates execution mode to apply, not the plan phase'...)` block, update expectations: the old sentence is removed; assert instead that `plan.md` handoff mentions **inline** default and **review**/**research** scope (substrings from Task 2).

---

### Task 6: Update plan-gate integration regex test

**Files:**
- Modify: `test/core/templates/workflows/apply-change.plan-gate.test.ts`

- [ ] **Step 6.1: Change `expectPlanGatePrecedesImplementationLoop`**

Inside `expectPlanGatePrecedesImplementationLoop`, replace:

```ts
expect(step6ToImplement?.[1]).toContain('superpowers:subagent-driven-development');
```

with assertions that `step6ToImplement?.[1]` contains all of:

- `superpowers:test-driven-development`
- `superpowers:requesting-code-review`
- `superpowers:verification-before-completion`

and still contains `schemas/brainstorm-root/schema.yaml`, `git commit`, `plan.md`, `writing-plans`, `using-git-worktrees`.

Optionally assert the gate body mentions `inline` or `primary session` if you add that wording to `APPLY_EXECUTION_PLAN_GATE_STEP` in Task 3.

---

### Task 7: Update brainstorm-root flow integration test

**Files:**
- Modify: `test/integration/brainstorm-root-flow.test.ts`

- [ ] **Step 7.1: Replace the apply instruction assertion**

Change:

```ts
expect(apply.instruction).toContain('superpowers:subagent-driven-development');
```

to assert a stable substring from the new schema, for example:

```ts
expect(apply.instruction).toContain('superpowers:verification-before-completion');
```

and add one more `expect` for `primary session` or `inline` per Task 1 final text.

---

### Task 8: Refresh parity markers and hashes

**Files:**
- Modify: `test/core/templates/skill-templates-parity.test.ts`

- [ ] **Step 8.1: Update the brainstorm-root apply marker test**

In `it('requires brainstorm-root apply templates to mention plan.md gate and planning handoff'`, replace expectations that `applySkill.instructions` / `applyCommand.content` contain `superpowers:subagent-driven-development` with markers aligned to Task 3 gate text, for example:

- `superpowers:verification-before-completion`
- `superpowers:test-driven-development`
- `superpowers:requesting-code-review`

Keep existing expectations for: `schemas/brainstorm-root/schema.yaml`, `git commit`, `plan.md`, no `execution-plan.md`, `writing-plans`, `superpowers:executing-plans`, `using-git-worktrees`.

- [ ] **Step 8.2: Recompute `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES`**

Run:

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts --reporter=verbose 2>&1
```

Expected first run: **FAIL** with hash mismatch; Vitest will print `expected` vs `received` for `toEqual` on the brainstorm-root factory map (or run only the parity describe block).

Update these keys in `EXPECTED_BRAINSTORM_ROOT_FUNCTION_HASHES` to the **received** SHA-256 values reported for:

- `getBrainstormRootApplyChangeSkillTemplate`
- `getOpsxBrainstormRootApplyCommandTemplate`

Re-run the same command until **PASS**.

---

### Task 9: Verification sweep and commit

- [ ] **Step 9.1: Run the targeted suite from the design spec**

```bash
cd /home/welcome/User/Development/github.com/Downloads/OpenSpec && pnpm test -- test/schemas/brainstorm-root.instruction.test.ts test/integration/brainstorm-root-flow.test.ts test/core/templates/workflows/apply-change.plan-gate.test.ts test/core/templates/skill-templates-parity.test.ts
```

Expected: all tests **PASS**.

- [ ] **Step 9.2: Commit**

```bash
git add schemas/brainstorm-root/schema.yaml \
  src/core/templates/workflows/brainstorm-root/apply-change.ts \
  src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts \
  test/schemas/brainstorm-root.instruction.test.ts \
  test/core/templates/workflows/apply-change.plan-gate.test.ts \
  test/integration/brainstorm-root-flow.test.ts \
  test/core/templates/skill-templates-parity.test.ts
git commit -m "feat(brainstorm-root): default apply to inline with scoped subagents"
```

---

## Plan self-review (executed on this document)

- **Spec coverage:** Preflight B, inline default, review/research-only subagents, no executing-plans shortcut, git/worktree policy, template gate sync, workflow sequence, tests + hashes — each maps to Tasks 1–9.
- **Placeholder scan:** No TBD/TODO left; YAML block is concrete.
- **Consistency:** Task 1 prose matches design doc; optional subagent-driven opt-in intentionally omitted per spec.

---

**Plan complete and saved to** `docs/superpowers/plans/2026-05-14-brainstorm-root-apply-inline-default.md`.

**Execution options:**

1. **Subagent-driven** — Fresh subagent per task from this plan (only where it does not violate “no full apply orchestration” policy for the *feature* being built; here the feature *is* policy change, so prefer option 2).
2. **Inline** — Implement Tasks 1–9 in this primary session with checkpoints after Tasks 3, 5, 8, and 9.

**Which approach do you want for execution?**
