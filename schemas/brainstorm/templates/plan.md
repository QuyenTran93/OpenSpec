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
- Test: `path/to/test`

**Interfaces:**

- Consumes: `exactName(input: Type): Output`
- Produces: `exactName(input: Type): Output`

- [ ] **Step 1: Write the failing test**

```ts
// Concrete focused test derived from the approved behavior.
```

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm test -- path/to/test`
Expected: FAIL with the specific missing-behavior message.

- [ ] **Step 3: Add the minimal implementation**

```ts
// Concrete implementation or precise pseudocode with exact symbols.
```

- [ ] **Step 4: Run the test to verify GREEN**

Run: `pnpm test -- path/to/test`
Expected: PASS with no new warnings.

- [ ] **Step 5: Refactor while tests remain green**

<!-- Name the focused cleanup and rerun command. -->

- [ ] **Step 6: Review checkpoint**

<!-- Verify requirements first, then code quality. -->

- [ ] **Step 7: Commit checkpoint**

Run: `git add path/to/test path/to/file && git commit -m "feat: concrete deliverable"`

For a documentation-only or configuration-only task, replace RED/GREEN steps
only after stating why no behavior changes and providing a concrete validation
command with its expected result.

## Plan Self-Review

- Requirement and task coverage
- Placeholder and undefined-interface scan
- Identifier and type consistency
- Dependency order and task sizing
- Executable commands and expected results

## Execution Handoff

- Implementation runs inline in the primary session.
- Establish or verify an isolated worktree when safe; preserve dirty overlapping work.
- Execute tasks in dependency order and keep task state current.
- Use test-first development and systematic root-cause debugging for behavior changes.
- Review requirements compliance before code quality and verify review feedback.
- Subagents are limited to independent review or read-only research.
- Subagents must not edit files, implement tasks, or orchestrate the apply loop.
- If unavailable, use expanded inline self-review and record the review mode.
- Never claim completion without fresh focused and project-level verification.
- Leave commit, push, merge, and branch integration decisions to the user or controlling repository policy.
- Record any accepted follow-up work in `<planningHome.root>/TODO.md`; preserve existing entries and include enough context to resume it.
- User approval is required before apply begins.

## Final Verification

```bash
<focused tests, typecheck, and build commands>
```
