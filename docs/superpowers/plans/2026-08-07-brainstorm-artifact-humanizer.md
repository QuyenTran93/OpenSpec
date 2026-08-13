# Brainstorm Artifact Humanizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact anti-AI-slop editing policy to brainstorm-profile workflows that write planning artifacts.

**Architecture:** Define one shared string constant in the brainstorm workflow-policy module and interpolate it into the four artifact-writing workflow templates. Verify generated skill and command content through the existing profile-aware template tests.

**Tech Stack:** TypeScript, Vitest, pnpm

## Global Constraints

- Keep the policy between 150 and 250 words.
- Apply it only to brainstorm-profile `brainstorm`, `propose`, `writing-plans`, and `update` output.
- Preserve meaning, technical syntax, uncertainty, and artifact structure.
- Do not install or reference a standalone humanizer skill.
- Do not modify `core` or `custom` workflow output.
- Do not commit; the user retains all VCS decisions.

---

### Task 1: Compact artifact prose policy

**Files:**
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `src/core/templates/workflows/brainstorm/workflow-policy.ts`
- Modify: `src/core/templates/workflows/brainstorm/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm/propose.ts`
- Modify: `src/core/templates/workflows/brainstorm/writing-plans.ts`
- Modify: `src/core/templates/workflows/brainstorm/update-change.ts`

**Interfaces:**
- Produces: `BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK: string`
- Consumed by: brainstorm skill and command body templates for `brainstorm`, `propose`, `writing-plans`, and `update`

- [x] **Step 1: Write the failing profile-scoping test**

Add a Vitest case that generates skill and command content for the four included workflow IDs and expects the stable heading `Artifact prose policy:`. Generate `new`, `apply`, and `archive` brainstorm variants plus representative default/core `propose` and `update` variants and assert the heading is absent.

- [x] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- test/core/shared/skill-generation.test.ts`

Expected: FAIL because generated brainstorm artifact-writing workflows do not contain `Artifact prose policy:`.

- [x] **Step 3: Add and wire the minimal policy**

Export `BRAINSTORM_ARTIFACT_PROSE_POLICY_BLOCK` from `workflow-policy.ts`. Its instructions must cover meaning preservation, removal of common AI writing tells, concrete/direct prose, natural rhythm, no invented personality or claims, and protection for commands, paths, identifiers, code, checklist syntax, acceptance criteria, and normative keywords.

Import and interpolate the block immediately before the write/reconcile instruction in each included workflow body. Do not add it to shared blocks used by unrelated workflows.

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm test -- test/core/shared/skill-generation.test.ts`

Expected: PASS.

- [ ] **Step 5: Run static and broader verification**

Run: `pnpm lint`

Expected: PASS with no ESLint errors.

Run: `pnpm test`

Expected: all test files pass.

Observed: lint passed and 3,444/3,445 tests passed. The unrelated existing
`command-registry.test.ts` parity test fails because `init --scope` is present
in the CLI at `HEAD` but absent from the completion registry.

- [x] **Step 6: Review the generated text and diff**

Confirm the policy word count is within 150–250 words, all four included skill/command pairs contain it once, excluded variants contain it zero times, and no standalone skill or dependency was introduced.
