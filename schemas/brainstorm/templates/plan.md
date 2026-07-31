# <Change Name> Implementation Plan

## Goal

<!-- Concrete implementation outcome. -->

## Architecture

<!-- Architecture and execution order. -->

## Tech Stack

<!-- Languages, frameworks, libraries, and verification tooling. -->

## Global Constraints

<!-- Copy exact project-wide constraints from the approved brainstorm. -->

## File Responsibilities

<!-- Files to create or modify and each file's responsibility. -->

## Tasks

### 1. <Deliverable>

**Source tasks:** <!-- IDs from tasks.md -->

**Files:**

- Create: `path/to/new-file`
- Modify: `path/to/file`
- Test: `<resolved-test-path>`

**Interfaces:**

- Consumes: `exactName(input: Type): Output`
- Produces: `exactName(input: Type): Output`

- [ ] **Step 1: Write the failing test**

```<language>
// Concrete focused test derived from the approved behavior.
```

- [ ] **Step 2: Run the test to verify RED**

Run: `<focused-test-command>`
Expected: FAIL with the specific missing-behavior message.

- [ ] **Step 3: Add the minimal implementation**

```<language>
// Concrete implementation or precise pseudocode with exact symbols.
```

- [ ] **Step 4: Run the test to verify GREEN**

Run: `<focused-test-command>`
Expected: PASS with no new warnings.

- [ ] **Step 5: Refactor while tests remain green**

<!-- Name the focused cleanup and rerun command. -->

- [ ] **Step 6: Review checkpoint**

<!-- Verify requirements first, then code quality. -->

- [ ] **Step 7: Commit checkpoint**

Run: `git add <resolved-test-path> <resolved-source-path> && git commit -m "feat: concrete deliverable"`

For a documentation-only or configuration-only task, replace RED/GREEN steps
only after stating why no behavior changes and providing a concrete validation
command with its expected result.

## Plan Self-Review

- Requirement and task coverage
- Placeholder and undefined-interface scan
- Identifier and type consistency
- Dependency order and task sizing
- Executable commands and expected results
- Package/module scope and duplicate-root scan

## Execution Handoff

- Implementation runs inline in the primary session.
- Establish or verify an isolated worktree when safe; preserve dirty overlapping work.
- Execute tasks in dependency order and keep task state current.
- A task is complete only after its acceptance criteria and focused verification pass.
- Immediately persist its `- [ ]` → `- [x]` transition in tasks.md before starting the next task.
- Never batch-fill checkboxes at the end of a session. Never mark failed, partial, or blocked work complete.
- If updating tasks.md fails, stop before the next task and report the error.
- On resume, reread tasks.md and continue from the first incomplete task in dependency order.
- Use test-first development and systematic root-cause debugging for behavior changes.
- Review requirements compliance before code quality and verify review feedback.
- Subagents are limited to independent review or read-only research.
- Subagents must not edit files, implement tasks, or orchestrate the apply loop.
- If unavailable, use expanded inline self-review and record the review mode.
- Never claim completion without fresh focused and project-level verification.
- Leave commit, push, merge, and branch integration decisions to the user or controlling repository policy.
- User approval is required before apply begins.

## Deferred Follow-up Handoff

- Follow-up work is accepted product or engineering scope deliberately deferred beyond this change.
- Work required to complete the current change or meet its requirements and success criteria must remain in tasks.md and plan.md.
- Excluded routine workflow-completion steps include manual testing, verification, archiving, automated checks, review, required documentation, correctness cleanup, VCS decisions, and handoff.
- Record eligible work in `<planningHome.root>/TODO.md`, using the store-aware planning root returned by the CLI. Read and preserve existing content first.
- Reconcile semantically equivalent entries rather than duplicating them.
- Each entry states the deferred outcome, why it was deferred, the originating change, and enough context or acceptance criteria to resume it.
- Do not create or modify `TODO.md` when no eligible follow-up work exists.

## Final Verification

```bash
<focused tests, typecheck, and build commands>
```
