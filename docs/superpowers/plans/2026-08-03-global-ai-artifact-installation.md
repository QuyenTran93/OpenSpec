# Global AI Artifact Installation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe, explicit user-scoped installation and updating of OpenSpec AI skills and commands through `--scope global`, while preserving project scope as the default.

**Architecture:** Tool metadata declares verified global delivery roots; pure resolution code maps generated artifacts into those roots. A versioned global record and ownership-aware reconciler make repeated init/update safe. Separate global orchestration keeps the existing project `InitCommand` and `UpdateCommand` behavior stable, with the CLI delegating according to scope.

**Tech Stack:** TypeScript 6, Commander 14, Node.js filesystem/path/os APIs, Zod, Vitest, existing OpenSpec template and command adapter registries.

## Global Constraints

- `project` remains the default scope and retains current behavior.
- Global init creates no planning root and performs no project migration or cleanup.
- Only verified, explicitly declared global paths are supported; never infer `~/<project-relative-path>`.
- `--tools all` in global scope selects every tool with at least one verified global surface.
- Global writes and deletes must remain inside the declared tool root.
- User-owned or unmarked files are preserved.
- Tests must redirect home, config, and data paths to temporary directories.
- Existing user modifications in unrelated files must remain untouched.

## File map

- `src/core/install-scope.ts`: shared scope parsing and types.
- `src/core/global-artifacts/capabilities.ts`: per-tool verified global roots and capability queries.
- `src/core/global-artifacts/paths.ts`: pure root/destination resolution and containment.
- `src/core/global-artifacts/record.ts`: versioned record schema and atomic persistence.
- `src/core/global-artifacts/reconcile.ts`: ownership-aware writes and stale cleanup.
- `src/core/global-artifacts/init.ts`: global init orchestration and reporting model.
- `src/core/global-artifacts/update.ts`: record-driven global update orchestration.
- `src/core/global-artifacts/project-cleanup.ts`: safe discovery and cleanup of local generated artifacts.
- `src/commands/clean.ts`: preview-by-default cleanup CLI and JSON output.
- `src/cli/index.ts`: `--scope` flags and scope delegation.
- `src/core/version-check.ts`: preserve scope when re-running an upgraded CLI.
- `src/core/completions/command-registry.ts`: expose the new CLI option in generated completions.
- `test/core/global-artifacts/*.test.ts`: focused resolver, record, reconciliation, init, and update coverage.
- `test/cli/*.test.ts` and existing init/update tests: CLI and project-scope regression coverage.
- `docs/{installation,supported-tools,cli,how-commands-work,troubleshooting}.md`: user documentation.

---

### Task 1: Scope types and verified global capability registry

**Files:**
- Create: `src/core/install-scope.ts`
- Create: `src/core/global-artifacts/capabilities.ts`
- Create: `src/core/global-artifacts/paths.ts`
- Modify: `src/core/config.ts`
- Test: `test/core/global-artifacts/capabilities.test.ts`
- Test: `test/core/global-artifacts/paths.test.ts`

**Interfaces:**
- Produces: `type InstallScope = 'project' | 'global'`
- Produces: `parseInstallScope(value?: string): InstallScope`
- Produces: `GlobalPathContext { env, platform, homedir }`
- Produces: `GlobalToolCapability { toolId, skillsRoot?, commandsRoot? }`
- Produces: `getGlobalToolCapability(toolId, context)` and `getGlobalCapableToolIds(context)`
- Produces: `resolveGlobalSkillFile(...)`, `resolveGlobalCommandFile(...)`, and `assertContainedPath(...)`

- [ ] **Step 1: Write failing scope, capability, and path tests**

Cover default `project`, rejected scope strings, representative POSIX/Windows roots, tool-specific environment overrides, capability filtering, absolute output, and traversal/empty-root rejection. Table-drive every declared capability so its resolved roots are absolute and non-broad.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/capabilities.test.ts test/core/global-artifacts/paths.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement scope and pure capability/path resolution**

Use dependency-injected environment values. Keep command adapters responsible for relative file shapes and strip only the declared project prefix when mapping into a verified global commands root. Reject a destination unless:

```ts
const relative = pathImpl.relative(root, destination);
const contained = relative !== '' && !relative.startsWith(`..${pathImpl.sep}`) && relative !== '..' && !pathImpl.isAbsolute(relative);
```

Document the authoritative source for every declared tool path next to its registry entry. Omit tools whose global discovery cannot be verified.

- [ ] **Step 4: Run focused tests and build**

Run: `pnpm exec vitest run test/core/global-artifacts/capabilities.test.ts test/core/global-artifacts/paths.test.ts && pnpm run build`

Expected: PASS.

- [ ] **Step 5: Commit the capability slice**

```bash
git add src/core/install-scope.ts src/core/global-artifacts/capabilities.ts src/core/global-artifacts/paths.ts src/core/config.ts test/core/global-artifacts/capabilities.test.ts test/core/global-artifacts/paths.test.ts
git commit -m "feat: resolve verified global AI tool paths"
```

### Task 2: Versioned installation record and safe reconciler

**Files:**
- Create: `src/core/global-artifacts/record.ts`
- Create: `src/core/global-artifacts/reconcile.ts`
- Test: `test/core/global-artifacts/record.test.ts`
- Test: `test/core/global-artifacts/reconcile.test.ts`

**Interfaces:**
- Consumes: containment helpers and global capability roots from Task 1.
- Produces: `GLOBAL_ARTIFACT_RECORD_VERSION = 1`
- Produces: `GlobalArtifactRecord`, `GlobalToolRecord`, and `GlobalArtifactEntry`
- Produces: `getGlobalArtifactRecordPath()`, `readGlobalArtifactRecord()`, `writeGlobalArtifactRecordAtomic(record)`
- Produces: `reconcileGlobalTool(input): Promise<GlobalToolRecord>`

- [ ] **Step 1: Write failing record tests**

Test missing-record distinction, valid round trip, malformed JSON/schema rejection, unsupported newer versions, injected global config root, and atomic replacement that leaves the prior file intact when rename fails.

- [ ] **Step 2: Write failing reconciler tests**

Test first install, idempotent overwrite of marked content, conflict with an unrelated destination file, stale marked deletion, preservation of stale unmarked/modified files, containment recheck, empty leaf cleanup, and partial filesystem failure.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/record.test.ts test/core/global-artifacts/reconcile.test.ts`

Expected: FAIL because record/reconcile modules do not exist.

- [ ] **Step 4: Implement validated atomic record persistence**

Validate with Zod. Write JSON to a sibling temporary file opened with exclusive creation, fsync/close it, then rename it over the record. Always remove the temporary file on failure without changing the previous record.

- [ ] **Step 5: Implement ownership-aware reconciliation**

Treat a file as managed only when its path is in the previous record or its content carries the existing OpenSpec generated marker. Preflight all desired-file conflicts for one tool before writing. Delete stale entries only when the record, current containment, and marker checks all pass; otherwise return a preserved-file diagnostic.

- [ ] **Step 6: Run focused tests and build**

Run: `pnpm exec vitest run test/core/global-artifacts/record.test.ts test/core/global-artifacts/reconcile.test.ts && pnpm run build`

Expected: PASS.

- [ ] **Step 7: Commit the persistence slice**

```bash
git add src/core/global-artifacts/record.ts src/core/global-artifacts/reconcile.ts test/core/global-artifacts/record.test.ts test/core/global-artifacts/reconcile.test.ts
git commit -m "feat: safely reconcile global OpenSpec artifacts"
```

### Task 3: Global init orchestration

**Files:**
- Create: `src/core/global-artifacts/init.ts`
- Modify: `src/cli/index.ts`
- Modify: `src/core/completions/command-registry.ts`
- Test: `test/core/global-artifacts/init.test.ts`
- Test: `test/cli/init-global.test.ts`

**Interfaces:**
- Consumes: Task 1 capability/path APIs, Task 2 record/reconciler, existing profile/delivery/template/adapter APIs.
- Produces: `GlobalInitOptions { tools?, profile? }`
- Produces: `GlobalInitResult { installed, skipped, failed, recordPath }`
- Produces: `GlobalArtifactInitCommand.execute(): Promise<GlobalInitResult>`

- [ ] **Step 1: Write failing orchestration tests**

Verify explicit tool selection and aliases, global `all` filtering, unsupported explicit-tool failure before writes, skills-only/commands-only/both delivery, profile override, previous-record reconciliation, no `openspec/` creation, and per-tool partial failure recording.

- [ ] **Step 2: Write failing CLI tests**

Assert `init --scope global --tools all`, invalid scope, positional path rejection, default project delegation, completion metadata, and clear installed/skipped/unsupported output.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/init.test.ts test/cli/init-global.test.ts`

Expected: FAIL because the command and CLI option do not exist.

- [ ] **Step 4: Implement global init and CLI delegation**

Resolve all desired destinations before the first write. Generate content through `getSkillTemplates`, `generateSkillContent`, `getCommandContents`, `generateCommands`, and the existing per-tool transformer/capability functions. Persist only successful tool records and set a nonzero exit on any failed tool.

- [ ] **Step 5: Run focused and project-init regression tests**

Run: `pnpm exec vitest run test/core/global-artifacts/init.test.ts test/cli/init-global.test.ts test/core/init.test.ts`

Expected: PASS with project init snapshots/behavior unchanged.

- [ ] **Step 6: Commit global init**

```bash
git add src/core/global-artifacts/init.ts src/cli/index.ts src/core/completions/command-registry.ts test/core/global-artifacts/init.test.ts test/cli/init-global.test.ts
git commit -m "feat: initialize OpenSpec artifacts globally"
```

### Task 4: Record-driven global update and upgrade re-run

**Files:**
- Create: `src/core/global-artifacts/update.ts`
- Modify: `src/cli/index.ts`
- Modify: `src/core/version-check.ts`
- Test: `test/core/global-artifacts/update.test.ts`
- Test: `test/cli/update-global.test.ts`
- Modify: relevant existing version-check tests discovered by `rg -n "rerunUpdateWithUpgradedCli" test`

**Interfaces:**
- Consumes: record and reconciliation APIs from Task 2; generation behavior from Task 3.
- Produces: `GlobalArtifactUpdateCommand.execute(): Promise<GlobalInitResult>`
- Extends: `rerunUpdateWithUpgradedCli(targetPath, { force, scope })`

- [ ] **Step 1: Write failing global update tests**

Cover missing-record guidance, recorded tool reuse, current global profile/delivery, force behavior, deselected stale cleanup, preserved modified stale diagnostics, record replacement, and partial tool failure.

- [ ] **Step 2: Write failing CLI and upgrade re-run tests**

Verify `update --scope global`, positional path rejection, project default delegation, and that the upgraded CLI argv contains `--scope global` exactly once.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/update.test.ts test/cli/update-global.test.ts`

Expected: FAIL because global update does not exist.

- [ ] **Step 4: Implement record-driven update and CLI delegation**

Require a valid record, regenerate its tool set with current config, reconcile each tool, persist successful results, and return actionable diagnostics for preserved stale files. Forward the scope through the self-upgrade subprocess path.

- [ ] **Step 5: Run focused and project-update regression tests**

Run: `pnpm exec vitest run test/core/global-artifacts/update.test.ts test/cli/update-global.test.ts test/core/update.test.ts test/core/version-check.test.ts`

Expected: PASS; adjust the final filename only to the exact existing version-check test path found earlier.

- [ ] **Step 6: Commit global update**

```bash
git add src/core/global-artifacts/update.ts src/cli/index.ts src/core/version-check.ts test/core/global-artifacts/update.test.ts test/cli/update-global.test.ts test/core
git commit -m "feat: update global OpenSpec artifacts"
```

### Task 5: Guided project-local artifact cleanup

**Files:**
- Create: `src/core/global-artifacts/project-cleanup.ts`
- Create: `src/commands/clean.ts`
- Modify: `src/cli/index.ts`
- Modify: `src/core/global-artifacts/init.ts`
- Modify: `src/core/global-artifacts/update.ts`
- Modify: `src/core/completions/command-registry.ts`
- Test: `test/core/global-artifacts/project-cleanup.test.ts`
- Test: `test/commands/clean.test.ts`

**Interfaces:**
- Consumes: existing project tool paths/adapters, generated markers, and Task 1 containment helpers.
- Produces: `ProjectArtifactCleanupPlan { scope, tools, removable, preserved, status }`
- Produces: `discoverProjectArtifacts(projectRoot, toolIds)` and `applyProjectArtifactCleanup(plan)`
- Produces: `registerCleanCommand(program)` with `--scope project`, `--tools`, `--yes`, and `--json`.

- [ ] **Step 1: Write failing discovery and cleanup tests**

Cover skills and commands for representative layouts, selected-tool filtering,
dry-run immutability, marked-file deletion under `--yes`, unmarked/modified-file
preservation, traversal/containment rejection, empty leaf cleanup, and strict
preservation of `openspec/` and shared tool roots.

- [ ] **Step 2: Write failing CLI and post-install hint tests**

Verify human preview output, stable JSON keys, `--yes` execution, invalid/non-project
scope rejection, collaborator warning, and global init/update hints only when the
current directory contains matching local generated artifacts.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/project-cleanup.test.ts test/commands/clean.test.ts`

Expected: FAIL because discovery and the command do not exist.

- [ ] **Step 4: Implement discovery, preview, and guarded deletion**

Discover only known OpenSpec skill directory names and command adapter outputs.
Return normalized absolute candidates but render project-relative paths in human
output. Re-read and revalidate marker plus containment immediately before every
`--yes` deletion. Never delete `openspec/`, a tool root, or a shared parent.

- [ ] **Step 5: Add post-global-install cleanup suggestions**

After successful global init/update, inspect only the current directory and only
globally installed tools. Print preview/apply commands when removable local files
exist; never perform cleanup from init/update.

- [ ] **Step 6: Run focused tests, init/update regressions, and build**

Run: `pnpm exec vitest run test/core/global-artifacts/project-cleanup.test.ts test/commands/clean.test.ts test/core/global-artifacts/init.test.ts test/core/global-artifacts/update.test.ts && pnpm run build`

Expected: PASS.

- [ ] **Step 7: Commit guided cleanup**

```bash
git add src/core/global-artifacts/project-cleanup.ts src/commands/clean.ts src/cli/index.ts src/core/global-artifacts/init.ts src/core/global-artifacts/update.ts src/core/completions/command-registry.ts test/core/global-artifacts/project-cleanup.test.ts test/commands/clean.test.ts
git commit -m "feat: safely clean project OpenSpec artifacts"
```

### Task 6: Documentation, parity checks, and full verification

**Files:**
- Modify: `docs/installation.md`
- Modify: `docs/supported-tools.md`
- Modify: `docs/cli.md`
- Modify: `docs/how-commands-work.md`
- Modify: `docs/troubleshooting.md`
- Modify: `docs/commands.md`
- Modify: `README.md`
- Test: `test/core/global-artifacts/documentation.test.ts`

**Interfaces:**
- Consumes: the authoritative capability registry from Task 1 and CLI behavior from Tasks 3-4.
- Produces: documented global path/capability table and install/update/uninstall guidance.

- [ ] **Step 1: Write a failing documentation parity test**

Parse stable tool IDs/markers from the supported-tools global table and assert exact equality with `getGlobalCapableToolIds()` so docs cannot claim unsupported paths or omit implemented ones.

- [ ] **Step 2: Run the parity test and confirm RED**

Run: `pnpm exec vitest run test/core/global-artifacts/documentation.test.ts`

Expected: FAIL because global documentation is absent.

- [ ] **Step 3: Update user documentation**

Document project-vs-global examples, `--tools all` scope semantics, coexistence/native precedence, verified global path patterns, unsupported-tool errors, record location/purpose, cleanup preview/`--yes`/JSON behavior, collaborator warnings, safe manual uninstall using recorded paths, and recovery from malformed records or permission conflicts.

- [ ] **Step 4: Run parity, focused, and full verification**

Run:

```bash
pnpm exec vitest run test/core/global-artifacts test/cli/init-global.test.ts test/cli/update-global.test.ts test/commands/clean.test.ts
pnpm test
pnpm run build
git diff --check
```

Expected: every command exits 0. Confirm the two pre-existing modified brainstorm documents remain unstaged and unchanged by this work.

- [ ] **Step 5: Commit documentation and parity coverage**

```bash
git add README.md docs/installation.md docs/supported-tools.md docs/cli.md docs/how-commands-work.md docs/troubleshooting.md docs/commands.md test/core/global-artifacts/documentation.test.ts
git commit -m "docs: explain global OpenSpec artifact installation"
```

- [ ] **Step 6: Review final diff against the design spec**

Run: `git diff 7e3da83^ --stat && git status --short`

Expected: only feature files plus the two pre-existing unrelated modified documents; no generated home-directory artifacts or temporary record files.
