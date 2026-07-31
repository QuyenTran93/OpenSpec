# Rename `brainstorm-root` Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `brainstorm` the canonical built-in schema ID while keeping `brainstorm-root` as a compatibility alias.

**Architecture:** Centralize legacy-name canonicalization in the artifact-graph resolver after exact project/user lookup, then make all new configuration, generated workflow text, and active source paths use `brainstorm`. Preserve old configuration and metadata on disk while returning the canonical name from newly loaded runtime contexts.

**Tech Stack:** TypeScript, Node.js filesystem APIs, YAML schemas, Vitest, pnpm.

## Global Constraints

- Preserve all unrelated and pre-existing worktree changes.
- `brainstorm-root` remains accepted for at least one major release.
- Exact project-local and user schemas named `brainstorm-root` take precedence over the built-in alias.
- Reads never rewrite legacy project configuration or change metadata.
- No artifact graph or workflow behavior changes beyond schema naming.

---

### Task 1: Canonical schema resolution

**Files:**
- Modify: `test/core/artifact-graph/resolver.test.ts`
- Modify: `src/core/artifact-graph/resolver.ts`
- Rename: `schemas/brainstorm-root/` to `schemas/brainstorm/`

**Interfaces:**
- Produces: `canonicalizeBuiltInSchemaName(name: string): string` and canonical behavior from `getSchemaDir`, `resolveSchema`, `listSchemas`, and `listSchemasWithInfo`.

- [ ] Add resolver tests proving `brainstorm` is listed, `brainstorm-root` resolves to it, filename suffixes work, and an exact project-local legacy schema wins.
- [ ] Run `pnpm exec vitest run test/core/artifact-graph/resolver.test.ts` and confirm the new assertions fail because `brainstorm` is not yet canonical.
- [ ] Rename the built-in schema directory and implement exact-first alias fallback in the resolver.
- [ ] Run the resolver test and confirm it passes.

### Task 2: Canonical runtime context and validation

**Files:**
- Modify: `test/core/artifact-graph/instruction-loader.test.ts`
- Modify: `src/core/artifact-graph/instruction-loader.ts`
- Modify: `src/commands/workflow/shared.ts`
- Modify: `src/commands/workflow/instructions.ts`

**Interfaces:**
- Consumes: resolver canonicalization from Task 1.
- Produces: canonical `schemaName: brainstorm` for built-in legacy references while retaining exact custom legacy names.

- [ ] Add tests loading legacy change metadata and asserting canonical runtime output without rewriting the metadata file.
- [ ] Run the focused instruction-loader tests and confirm the canonical-name assertion fails.
- [ ] Canonicalize built-in resolved names at the context boundary and make schema validation return the canonical ID.
- [ ] Run focused instruction and workflow tests and confirm they pass.

### Task 3: New configuration and generated workflows

**Files:**
- Modify: `test/core/init.test.ts`
- Modify: `test/core/shared/skill-generation.test.ts`
- Modify: `test/core/templates/skill-templates-parity.test.ts`
- Modify: `src/core/init.ts`
- Rename: `src/core/templates/workflows/brainstorm-root/` to `src/core/templates/workflows/brainstorm/`
- Modify: `src/core/templates/skill-templates.ts`
- Modify: `src/core/shared/skill-generation.ts`

**Interfaces:**
- Produces: profile initialization with `schema: brainstorm` and generated instructions that use `--schema brainstorm`.

- [ ] Change existing tests to require canonical config and generated workflow output.
- [ ] Run the focused init/template tests and confirm they fail on legacy output.
- [ ] Update initialization, active workflow source naming, imports, descriptions, and generated command text.
- [ ] Recompute only parity values changed by the rename, then rerun the focused tests.

### Task 4: End-to-end migration coverage and documentation

**Files:**
- Rename: `test/schemas/brainstorm-root.instruction.test.ts` to `test/schemas/brainstorm.instruction.test.ts`
- Rename: `test/integration/brainstorm-root-flow.test.ts` to `test/integration/brainstorm-flow.test.ts`
- Modify: brainstorm-related tests and active documentation
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: canonical runtime and generation behavior from Tasks 1-3.
- Produces: end-to-end coverage of both canonical and legacy inputs.

- [ ] Update canonical flow fixtures and retain explicit legacy compatibility cases.
- [ ] Run the brainstorm schema and integration suites and address only rename-related failures.
- [ ] Add a changelog entry documenting the canonical name and compatibility alias.
- [ ] Search active source and schemas for unintended `brainstorm-root` references; retain only alias code, compatibility tests, historical documents, and changelog history.

### Task 5: Verification

**Files:**
- Verify all files changed above.

**Interfaces:**
- Produces: evidence that focused behavior and the repository as a whole remain valid.

- [ ] Run all focused resolver, init, schema, integration, workflow, and template tests.
- [ ] Run the project typecheck/build command.
- [ ] Run the full test suite.
- [ ] Run `git diff --check` and review the final diff for accidental edits to pre-existing work.
