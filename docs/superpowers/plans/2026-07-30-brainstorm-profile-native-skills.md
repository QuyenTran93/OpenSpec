# Brainstorm Profile Native Skills Implementation Plan

> **For agentic workers:** Execute this plan inline in the primary session. Each task uses test-first implementation, requirements review, code-quality review, and fresh verification. No Superpowers plugin or `superpowers:*` runtime skill is required. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a root-aware `brainstorm` profile whose generated skills and commands embed complete brainstorm, optional native visual collaboration, planning, update-change, test-first implementation, systematic-debugging, review, and verification workflows without depending on the Superpowers plugin.

**Architecture:** Preserve commit `4e16790d90d8f54d4773ad9a5e71a57cd9f1e86b` as the behavioral baseline for existing OpenSpec root/store/workset flows. Represent brainstorm, tasks, and plan as ordinary artifacts in the existing graph, select profile-specific template variants for overlapping workflow IDs, and resolve every path through existing CLI planning-home APIs. Remove the branch's phase engine, pseudo-readiness state, and execution-host contracts.

**Tech Stack:** TypeScript 6, Commander, Zod, YAML, Vitest, existing OpenSpec planning-home/store resolvers and generated skill/command adapters.

## Global Constraints

- Generated runtime content for the `brainstorm` profile must contain no `superpowers:` reference and no external-plugin availability precheck.
- Do not restore the retired workspace/initiative model or vocabulary.
- Preserve local-root, project `store:` pointer, explicit `--store`, `defaultStore`, workset, and context behavior from the baseline.
- Do not hard-code `openspec/changes/<name>` when a resolved `changeRoot`, `changeDir`, or artifact path is available.
- Do not change the workflow set or generated template variant of the `core` profile.
- Keep implementation inline by default; optional delegation is limited to review or read-only research and must never be required.
- `update-change` may revise planning artifacts but must never modify production code or mark implementation work complete.
- Use the existing artifact graph; do not retain `PhaseSchema`, `PHASE_IDS`, `GraphNode`, `status.phases[]`, or `apply.executionPlan`.
- Do not encode conversational approval as unpersisted readiness variables.
- Do not make custom profiles silently acquire workflows.
- Visual companion use is opt-in per visual question and must never block brainstorming.
- The visual server is loopback-only by default, authenticated, sanitized, privacy-minimizing, accessible, and free of third-party runtime resources.
- `visual start --port <port>` must support stable IDE/SSH forwarding; omitted ports are selected automatically, while occupied explicit ports fail without substitution.
- Remote execution must provide forwarding guidance and must not assume a browser can reach or open on the remote host.
- Do not commit during execution unless the user explicitly requests it.

---

## File and responsibility map

| File or area | Responsibility |
|---|---|
| `src/core/profiles.ts` | Canonical workflow sets and profile-to-workflow selection. |
| `src/core/shared/skill-generation.ts` | Select exactly one skill/command variant per workflow ID. |
| `src/core/templates/workflows/brainstorm-root/*.ts` | Self-contained brainstorm-profile skill and command bodies. |
| `src/core/templates/workflows/brainstorm-root/native-discipline.ts` | Shared OpenSpec-native interaction, planning, TDD, systematic-debugging, review, and verification text blocks. |
| `src/core/templates/workflows/brainstorm-root/update-change.ts` | Root-aware reconciliation of brainstorm, tasks, and plan without implementation. |
| `src/commands/visual.ts` | Native start/status/stop CLI surface and JSON contracts. |
| `src/core/visual-companion/{server,session,sanitize}.ts` | Authenticated local server, persistent session lifecycle, safe fragment ingestion, and event storage. |
| `src/core/visual-companion/{frame,helper}.ts` | Bundled accessible browser frame and progressively enhanced client behavior. |
| `src/core/visual-companion/types.ts` | Stable CLI/session/event response types and validation limits. |
| `THIRD_PARTY_NOTICES.md` | MIT attribution for substantially adapted Superpowers companion source. |
| `schemas/brainstorm-root/schema.yaml` | Ordinary artifact graph and canonical resolved CLI instructions. |
| `schemas/brainstorm-root/templates/*.md` | Minimal substantive artifact shapes without plugin references. |
| `src/core/artifact-graph/*` and `src/commands/workflow/{status,instructions}.ts` | Remove branch-only phase handling and retain baseline artifact behavior. |
| `test/core/profiles-brainstorm-workflows.test.ts` | Profile set and registry uniqueness. |
| `test/core/shared/skill-generation.test.ts` | Variant selection and plugin-independence checks. |
| `test/integration/brainstorm-root-flow.test.ts` | End-to-end artifact progression. |
| `test/integration/brainstorm-root-store-flow.test.ts` | Store pointer and explicit store resolution for brainstorm artifacts. |
| `test/core/templates/skill-templates-parity.test.ts` | Generated template parity and full registry coverage. |

### Task 1: Remove the parallel phase engine and restore artifact-only contracts

**Files:**

- Modify: `src/core/artifact-graph/types.ts`
- Modify: `src/core/artifact-graph/schema.ts`
- Modify: `src/core/artifact-graph/graph.ts`
- Modify: `src/core/artifact-graph/state.ts`
- Modify: `src/core/artifact-graph/instruction-loader.ts`
- Modify: `src/commands/workflow/status.ts`
- Modify: `src/commands/workflow/instructions.ts`
- Modify: `schemas/brainstorm-root/schema.yaml`
- Test: `test/core/artifact-graph/*.test.ts`
- Test: `test/integration/brainstorm-root-flow.test.ts`

**Interfaces:**

- Produces: a `brainstorm-root` schema with artifact IDs `brainstorm`, `tasks`, and `plan`; `apply.requires === ['plan']`; `apply.tracks === 'tasks.md'`.
- Removes: `PhaseSchema`, `PHASE_IDS`, `PhaseId`, `GraphNode`, phase lookup methods, `ChangeStatus.phases`, and `ApplyPhase.executionPlan`.

- [ ] **Step 1: Rewrite flow tests against ordinary artifacts**

  Assert fresh status has `brainstorm: ready`, then tasks and plan unlock in dependency order, and apply blocks until `plan.md` exists. Assert no `phases` property is emitted.

- [ ] **Step 2: Run focused tests and observe failures from the phase-based implementation**

  ```bash
  pnpm exec vitest run test/core/artifact-graph test/integration/brainstorm-root-flow.test.ts
  ```

- [ ] **Step 3: Replace schema v2 with the minimal artifact schema v1**

  Use the exact schema structure documented in the design. Remove
  `executionPlan`; apply obtains plan through its required artifact.

- [ ] **Step 4: Delete branch-only phase paths from core code**

  Restore artifact-only graph, completion, status, and instruction behavior from
  `4e16790…`, retaining unrelated upstream fixes already present on the branch.

- [ ] **Step 5: Run focused tests and typecheck**

  Expected: artifact graph and brainstorm flow tests pass with no phase API.

### Task 2: Normalize profile and template registries

**Files:**

- Modify: `src/core/profiles.ts`
- Modify: `src/core/shared/skill-generation.ts`
- Modify: `src/core/templates/skill-templates.ts`
- Test: `test/core/profiles.test.ts`
- Test: `test/core/profiles-brainstorm-workflows.test.ts`
- Test: `test/core/shared/skill-generation.test.ts`

**Interfaces:**

- Consumes: `Profile = 'core' | 'custom' | 'brainstorm'` from `src/core/global-config.ts`.
- Produces: one `CORE_WORKFLOWS`, one `BRAINSTORM_WORKFLOWS`, and unique `SkillTemplateEntry[]` / `CommandTemplateEntry[]` values from `getSkillTemplates()` and `getCommandTemplates()`.

- [ ] **Step 1: Add failing uniqueness and baseline tests**

  Add assertions equivalent to:

  ```ts
  expect(CORE_WORKFLOWS).toEqual(['propose', 'explore', 'apply', 'update', 'sync', 'archive']);
  expect(BRAINSTORM_WORKFLOWS).toEqual([
    'propose', 'brainstorm', 'new', 'writing-plans', 'update', 'apply', 'archive',
  ]);

  const skills = getSkillTemplates(undefined, 'brainstorm');
  expect(new Set(skills.map((entry) => entry.workflowId)).size).toBe(skills.length);
  expect(new Set(skills.map((entry) => entry.dirName)).size).toBe(skills.length);

  const commands = getCommandTemplates(undefined, 'brainstorm');
  expect(new Set(commands.map((entry) => entry.id)).size).toBe(commands.length);
  ```

- [ ] **Step 2: Run the focused tests and confirm the duplicate-registry failure**

  Run:

  ```bash
  pnpm exec vitest run test/core/profiles.test.ts test/core/profiles-brainstorm-workflows.test.ts test/core/shared/skill-generation.test.ts
  ```

  Expected: failure showing duplicate declarations or duplicate `new`, `apply`, or other workflow entries.

- [ ] **Step 3: Normalize registry construction**

  Keep one baseline entry per workflow and select its variant at construction time:

  ```ts
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore', workflowId: 'explore' },
    {
      template: brainstorm ? getBrainstormRootNewChangeSkillTemplate() : getNewChangeSkillTemplate(),
      dirName: 'openspec-new-change',
      workflowId: 'new',
    },
    ...(brainstorm ? [] : [{
      template: getContinueChangeSkillTemplate(),
      dirName: 'openspec-continue-change',
      workflowId: 'continue',
    }]),
    {
      template: brainstorm ? getBrainstormRootApplyChangeSkillTemplate() : getApplyChangeSkillTemplate(),
      dirName: 'openspec-apply-change',
      workflowId: 'apply',
    },
    // remaining unique workflow entries
  ];
  ```

  Apply the same structure to commands. Remove the duplicate `CORE_WORKFLOWS` declaration while retaining the baseline six workflows.

- [ ] **Step 4: Run focused tests and typecheck**

  Run:

  ```bash
  pnpm exec vitest run test/core/profiles.test.ts test/core/profiles-brainstorm-workflows.test.ts test/core/shared/skill-generation.test.ts
  pnpm exec tsc --noEmit
  ```

  Expected: all commands exit 0.

### Task 3: Replace external skill references with OpenSpec-native disciplines

**Files:**

- Create: `src/core/templates/workflows/brainstorm-root/native-discipline.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/writing-plans.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/apply-change.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts` (rename in Task 3)
- Test: `test/core/templates/workflows/apply-change.plan-gate.test.ts`
- Test: `test/core/shared/skill-generation.test.ts`

**Interfaces:**

- Produces: `NATIVE_BRAINSTORM_METHOD`, `NATIVE_PLANNING_METHOD`, `NATIVE_TDD_DISCIPLINE`, `NATIVE_DEBUGGING_DISCIPLINE`, `NATIVE_REVIEW_DISCIPLINE`, `NATIVE_VERIFICATION_DISCIPLINE`, `NATIVE_BRANCH_HANDOFF`, and `BRAINSTORM_ROOT_WORKFLOW_SEQUENCE_BLOCK` string constants.
- Consumed by: both skill and command factory functions, so each pair has identical behavioral gates.

- [ ] **Step 1: Add a generated-output independence test**

  ```ts
  const runtime = [
    ...getSkillTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm').map((entry) => entry.template.instructions),
    ...getCommandTemplates(BRAINSTORM_WORKFLOWS, 'brainstorm').map((entry) => entry.template.content),
  ].join('\n');

  expect(runtime).not.toMatch(/superpowers:/i);
  expect(runtime).not.toMatch(/plugin (?:is )?(?:missing|required)/i);
  expect(runtime).toContain('Ask one clarifying question at a time');
  expect(runtime).toContain('RED → GREEN → REFACTOR');
  expect(runtime).toContain('Reproduce the failure before proposing a fix');
  expect(runtime).toContain('Verify review feedback against the code and requirements');
  expect(runtime).toContain('fresh verification evidence');
  ```

- [ ] **Step 2: Run the test and confirm it fails on current plugin references**

  Run:

  ```bash
  pnpm exec vitest run test/core/shared/skill-generation.test.ts test/core/templates/workflows/apply-change.plan-gate.test.ts
  ```

  Expected: failure containing current `superpowers:*` markers.

- [ ] **Step 3: Create native discipline blocks**

  Implement focused constants that absorb the essential contracts from the
  relevant Superpowers methods without retaining their external names or
  invocation requirements:

  ```ts
  export const NATIVE_BRAINSTORM_METHOD = `
  1. Explore the project context before proposing changes.
  2. Ask one clarifying question at a time.
  3. Present 2–3 approaches with trade-offs and a recommendation.
  4. Present the design in reviewable sections and obtain explicit approval.
  5. Write the resolved brainstorm artifact, then review it for placeholders,
     internal consistency, scope, and ambiguity; fix findings inline.
  6. Ask the user to acknowledge the written artifact before propose.
  `.trim();

  export const NATIVE_TDD_DISCIPLINE = `
  For every behavior change use RED → GREEN → REFACTOR: write a focused test,
  run it and observe the expected failure, add the minimum implementation, run
  it to green, then refactor without changing behavior. Review requirements
  compliance before code quality. Never claim completion without fresh
  verification evidence from the command that proves the claim.
  `.trim();
  ```

  Expand the native blocks to cover:

  - brainstorming context/question/approach/approval/self-review gates;
  - writing-plans scope, file map, interfaces, concrete steps, coverage, and consistency;
  - systematic debugging through reproduction, evidence, path tracing, one hypothesis at a time, root-cause correction, and regression tests;
  - requesting review through requirements-first then quality review;
  - receiving review through technical verification and ambiguity handling;
  - verification through fresh evidence tied to each completion claim;

- [ ] **Step 4: Compose native blocks into all brainstorm variants**

  Remove every skill-availability precheck, Skill-tool invocation,
  plugin-install suggestion, and external execution fallback. Keep the native
  brainstorming, planning, test-first, debugging, review, and verification
  disciplines without prescribing host-specific orchestration or git policy.

- [ ] **Step 5: Run focused tests**

  Run:

  ```bash
  pnpm exec vitest run test/core/shared/skill-generation.test.ts test/core/templates/workflows/apply-change.plan-gate.test.ts
  ```

  Expected: exit 0 and no generated `superpowers:` content.

### Task 4: Add the native visual companion

**Files:**

- Create: `src/commands/visual.ts`
- Create: `src/core/visual-companion/types.ts`
- Create: `src/core/visual-companion/session.ts`
- Create: `src/core/visual-companion/sanitize.ts`
- Create: `src/core/visual-companion/server.ts`
- Create: `src/core/visual-companion/frame.ts`
- Create: `src/core/visual-companion/helper.ts`
- Modify: `src/cli/index.ts`
- Modify: `.gitignore`
- Modify: `src/core/templates/workflows/brainstorm-root/brainstorm.ts`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `test/core/visual-companion/session.test.ts`
- Create: `test/core/visual-companion/sanitize.test.ts`
- Create: `test/core/visual-companion/server.test.ts`
- Create: `test/commands/visual.test.ts`

**Interfaces:**

- Produces: `VisualSessionInfo`, `VisualEvent`, and CLI commands `openspec visual start|status|stop`.
- Consumed by: `openspec-brainstorm` / `/opsx:brainstorm` only after user opt-in for a genuinely visual question.

- [ ] **Step 1: Add failing CLI and lifecycle tests**

  Test that `start --json` returns exactly one JSON document containing:

  ```ts
  interface VisualSessionInfo {
    sessionDir: string;
    screenDir: string;
    stateDir: string;
    url: string;
    host: string;
    port: number;
    pid: number;
    remote: boolean;
    forwardingRequired: boolean;
    localUrl: string;
    forwardingCommand?: string;
  }
  ```

  Verify `status --json` discovers the live session, `stop --json` stops only
  that session, and repeated start safely reuses or replaces stale state. Add
  cases for auto-selected ports, a valid fixed `--port`, invalid/range-exceeded
  ports, and an occupied explicit port that fails without choosing another.

- [ ] **Step 2: Add failing security and privacy tests**

  Cover missing/wrong key rejection for HTTP and WebSocket, loopback default,
  explicit warning for non-loopback binding, host/origin rejection, `..` and
  encoded traversal, symlink escape, request/screen/event size limits, atomic
  writes, idle shutdown, and these response headers:

  ```text
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  Permissions-Policy: camera=(), microphone=(), geolocation=(), accelerometer=()
  ```

  Assert no telemetry or third-party network request is emitted and persisted
  events contain only session/screen ID, choice, and timestamp.

- [ ] **Step 3: Add failing sanitizer and accessibility tests**

  Verify fragments remove `<script>`, inline `on*` handlers, `javascript:` URLs,
  remote resource URLs, unsafe embeds, and document-level tags. Verify generated
  options use semantic buttons, `aria-pressed`, visible focus, keyboard
  activation, an `aria-live` connection/selection status, and
  `prefers-reduced-motion` handling.

- [ ] **Step 4: Implement session state and safe fragment ingestion**

  Store project sessions under `.openspec/visual-companion/<session-id>/` with
  `content/`, `state/`, `server-info.json`, and JSONL events. Use
  cryptographically random keys, restrictive permissions where supported,
  canonical-path containment checks, bounded reads/writes, and atomic rename.

- [ ] **Step 5: Implement the local server and progressive browser client**

  Bind loopback by default, authenticate every HTTP/WebSocket request, serve
  only bundled assets and sanitized fragments, watch for the newest semantic
  screen filename, and degrade to a readable paused state when WebSocket support
  or connectivity is absent. Use event delegation rather than inline handlers.

- [ ] **Step 6: Implement start/status/stop CLI commands**

  Register the command group in `src/cli/index.ts`, including `--port <port>`.
  Keep human output concise and preserve the one-JSON-document contract under
  `--json`. Open a browser only with explicit `--open`. Under detected Remote
  SSH/remote IDE/container execution, do not launch a remote browser: return the
  remote endpoint, complete authenticated local URL, IDE Ports guidance, and a
  parameterized `ssh -N -L` example. Never infer credentials or create the
  forward. Headless/open failures return the same forwarding-aware information
  and do not terminate the brainstorm workflow.

- [ ] **Step 7: Test Remote SSH and IDE forwarding behavior**

  Simulate `SSH_CONNECTION`, VS Code remote, container, and codespace signals.
  Assert `--open` does not launch a browser, the fixed remote port is preserved,
  the displayed local URL retains `?key=...`, and JSON exposes
  `forwardingRequired`, `localUrl`, and the generic forwarding command. Verify
  the guidance clearly shows how a different local port can be substituted
  without changing the remote listener.

- [ ] **Step 8: Integrate just-in-time use into the brainstorm skill and command**

  Add the per-question visual-vs-text decision rule, explicit user-consent gate,
  new-file-per-screen rule, terminal-feedback precedence, event reading, waiting
  screen behavior, and Mermaid/ASCII/text fallback. Do not start the server at
  profile installation or brainstorm startup.

- [ ] **Step 9: Add attribution and ignore local sessions**

  Add `.openspec/visual-companion/` to `.gitignore`. Record the upstream MIT
  license, copyright holder, source project, and which portions were adapted in
  `THIRD_PARTY_NOTICES.md`.

- [ ] **Step 10: Run visual companion verification**

  ```bash
  pnpm exec vitest run test/core/visual-companion test/commands/visual.test.ts
  pnpm exec tsc --noEmit
  ```

  Expected: lifecycle, security, privacy, sanitizer, accessibility, and CLI tests pass.

### Task 5: Add the native brainstorm update-change workflow

**Files:**

- Create: `src/core/templates/workflows/brainstorm-root/update-change.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/index.ts`
- Modify: `src/core/templates/skill-templates.ts`
- Modify: `src/core/shared/skill-generation.ts`
- Modify: `src/core/profiles.ts`
- Test: `test/core/profiles-brainstorm-workflows.test.ts`
- Test: `test/core/shared/skill-generation.test.ts`
- Create: `test/core/templates/workflows/brainstorm-root-update.test.ts`

**Interfaces:**

- Produces: `getBrainstormRootUpdateChangeSkillTemplate()` and `getOpsxBrainstormRootUpdateCommandTemplate()`.
- Consumes: resolved status/instruction JSON, native brainstorm/planning review blocks, and the brainstorm profile's `update` workflow ID.

- [ ] **Step 1: Add failing variant-selection tests**

  ```ts
  const skill = getSkillTemplates(['update'], 'brainstorm')[0];
  const command = getCommandTemplates(['update'], 'brainstorm')[0];

  expect(skill.template.name).toBe('openspec-update-change');
  expect(skill.template.instructions).toContain('Reconcile planning artifacts in dependency order');
  expect(command.template.content).toContain('brainstorm.md → tasks.md → plan.md');
  expect(`${skill.template.instructions}\n${command.template.content}`).not.toMatch(/superpowers:/i);
  ```

- [ ] **Step 2: Run tests and confirm the brainstorm profile currently selects the core update variant or omits update**

  Run:

  ```bash
  pnpm exec vitest run test/core/profiles-brainstorm-workflows.test.ts test/core/shared/skill-generation.test.ts test/core/templates/workflows/brainstorm-root-update.test.ts
  ```

- [ ] **Step 3: Implement the profile-specific update factories**

  The shared skill/command body must:

  ```text
  1. Resolve the change and planning home once.
  2. Read brainstorm.md, tasks.md, and plan.md when present.
  3. Ask focused questions about the requested revision.
  4. Update brainstorm.md when decisions/scope changed.
  5. Reconcile tasks.md, preserving unchanged [x] items.
  6. Reconcile plan.md when files, interfaces, order, tests, or verification changed.
  7. Rerun self-review and user acknowledgement for materially changed artifacts.
  8. Stop before production-code changes.
  ```

  When a completed task conflicts with revised scope, retain it with an explicit
  conflict annotation and ask the user; never reset or delete it silently.

- [ ] **Step 4: Register the variant and rerun focused tests**

  Add `update` to `BRAINSTORM_WORKFLOWS`, choose the brainstorm update factories
  when `profile === 'brainstorm'`, and retain the existing update factories for
  all other profiles. Expected: focused tests exit 0 with one unique update entry.

### Task 6: Simplify and make the artifact templates self-contained

**Files:**

- Modify: `schemas/brainstorm-root/schema.yaml`
- Modify: `schemas/brainstorm-root/templates/brainstorm.md`
- Modify: `schemas/brainstorm-root/templates/tasks.md`
- Modify: `schemas/brainstorm-root/templates/plan.md`
- Rename: `src/core/templates/workflows/brainstorm-root/superpowers-openspec-mapping.ts` to `src/core/templates/workflows/brainstorm-root/workflow-policy.ts`
- Modify: imports in `src/core/templates/workflows/brainstorm-root/*.ts`
- Test: `test/schemas/brainstorm-root.instruction.test.ts`
- Test: `test/integration/brainstorm-root-flow.test.ts`

**Interfaces:**

- Consumes: ordinary artifact schema support from `src/core/artifact-graph/schema.ts`.
- Produces: concise artifact shapes; workflow procedure remains in generated skills/commands rather than being duplicated into templates.

- [ ] **Step 1: Replace plugin-marker assertions with behavior assertions**

  Assert that schema instructions contain the native gates and reject external dependencies:

  ```ts
  expect(`${bInstr}\n${pInstr}\n${aInstr}`).not.toMatch(/superpowers:/i);
  expect(bInstr).toContain('Ask one clarifying question at a time');
  expect(bInstr).not.toMatch(/user_acknowledged|design_approved|self_review_passed/);
  expect(pInstr).toContain('File / responsibility map');
  expect(pInstr).not.toMatch(/user_acknowledged|self_review_passed/);
  expect(aInstr).toContain('RED → GREEN → REFACTOR');
  expect(aInstr).toContain('fresh verification evidence');
  ```

- [ ] **Step 2: Run schema tests and observe the current dependency failures**

  Run:

  ```bash
  pnpm exec vitest run test/schemas/brainstorm-root.instruction.test.ts test/integration/brainstorm-root-flow.test.ts
  ```

  Expected: failure on existing Superpowers prechecks and template content.

- [ ] **Step 3: Rewrite schema instructions and templates**

  Preserve `brainstorm → tasks → plan → apply`, but keep templates focused on
  artifact content. Use:

  ```md
  # <Change Name> Implementation Plan

  ## Goal
  ## Approach
  ## Files
  ## Tasks
  ## Final Verification
  ```

  `brainstorm.md` keeps goal, requirements, scope, viable approaches, chosen
  approach, and relevant implementation notes. `tasks.md` contains one example
  group, stable-ID guidance, and checkbox preservation guidance. Remove approval
  metadata, fixed option counts, fixed group counts, host-specific execution
  policy, mandatory interfaces, fixed-duration steps, and per-task commits.

- [ ] **Step 4: Validate YAML and run focused tests**

  Run:

  ```bash
  node -e "const fs=require('node:fs');const YAML=require('yaml');YAML.parse(fs.readFileSync('schemas/brainstorm-root/schema.yaml','utf8'))"
  pnpm exec vitest run test/schemas/brainstorm-root.instruction.test.ts test/integration/brainstorm-root-flow.test.ts
  ```

  Expected: parse succeeds and tests exit 0.

### Task 7: Route brainstorm workflows through resolved planning homes

**Files:**

- Modify: `src/core/templates/workflows/brainstorm-root/brainstorm.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/propose.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/writing-plans.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/update-change.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/apply-change.ts`
- Modify: `src/core/templates/workflows/brainstorm-root/archive-change.ts`
- Modify if required by failing tests: `src/commands/workflow/instructions.ts`
- Modify if required by failing tests: `src/core/artifact-graph/instruction-loader.ts`
- Create: `test/integration/brainstorm-root-store-flow.test.ts`

**Interfaces:**

- Consumes: existing `resolvePlanningHome`, `PlanningHomeSummary`, CLI `status --json`, and CLI `instructions --json` outputs from the baseline.
- Produces: generated workflows that use one resolved `changeDir` and resolved artifact paths throughout an invocation.

- [ ] **Step 1: Add project-pointer and explicit-store integration tests**

  Create two registered temporary stores and a project whose `openspec/config.yaml` contains:

  ```yaml
  schema: brainstorm-root
  store: planning
  ```

  Verify:

  ```ts
  expect(pointerInstructions.changeDir).toBe(path.join(storeRoot, 'openspec', 'changes', changeName));
  expect(explicitInstructions.changeDir).toBe(path.join(otherStoreRoot, 'openspec', 'changes', changeName));
  expect(pointerInstructions.outputPath).toBe('brainstorm.md');
  expect(explicitInstructions.outputPath).toBe('brainstorm.md');
  ```

  Also assert generated workflow bodies tell the agent to use the returned `changeDir`/resolved paths and do not prescribe `cwd/openspec/changes/<name>`.

- [ ] **Step 2: Run the integration test and record the failing path assumption**

  Run:

  ```bash
  pnpm exec vitest run test/integration/brainstorm-root-store-flow.test.ts
  ```

  Expected: current hard-coded path wording or missing resolved artifact paths causes failure.

- [ ] **Step 3: Update generated workflow path contracts**

  For each artifact workflow and the update workflow, require this sequence in the skill and command body:

  ```text
  1. Resolve the change with `openspec status --change <name> --json` using the
     invocation's `--store` when supplied.
  2. Request the current artifact with `openspec instructions <id> --change <name>
     --json` using the same store selection.
  3. Treat `changeDir`, `resolvedOutputPath`, and `existingOutputPaths` from the
     response as authoritative; never rebuild them from the process cwd.
  ```

  If instruction responses do not expose resolved paths, extend the existing
  artifact response shape consistently rather than adding a separate resolver.

- [ ] **Step 4: Verify local, pointer, and explicit-store paths**

  Run:

  ```bash
  pnpm exec vitest run test/integration/brainstorm-root-store-flow.test.ts test/integration/brainstorm-root-flow.test.ts test/core/artifact-graph/instruction-loader.test.ts
  ```

  Expected: all three resolution modes pass.

### Task 8: Align init, update, migration, and documentation behavior

**Files:**

- Modify: `src/core/init.ts`
- Modify: `src/core/update.ts`
- Modify: `src/core/migration.ts`
- Delete: `src/core/project-config-normalizer.ts`
- Modify: `docs/cli.md`
- Modify: `docs/opsx.md`
- Test: `test/core/init.test.ts`
- Test: `test/core/update.test.ts`
- Test: `test/core/migration.test.ts`
- Delete: `test/core/project-config-normalizer.test.ts`
- Test: `test/commands/config.test.ts`

**Interfaces:**

- Consumes: profile/delivery configuration and existing create-if-missing project configuration behavior.
- Produces: idempotent installation/update of the brainstorm variant without rewriting an existing project store pointer or unrelated config.

- [ ] **Step 1: Add preservation tests**

  Cover an existing config such as:

  ```yaml
  schema: brainstorm-root
  store: planning
  context: Keep this text unchanged
  ```

  Assert `init --profile brainstorm`, update, and migration do not delete or rewrite `store` or `context`, while a missing config is created with the minimum required schema selection.

- [ ] **Step 2: Run focused tests and observe any destructive normalization**

  Run:

  ```bash
  pnpm exec vitest run test/core/init.test.ts test/core/update.test.ts test/core/migration.test.ts test/commands/config.test.ts
  ```

- [ ] **Step 3: Implement create-if-missing behavior only**

  Remove workflow-driven schema normalization from update and migration. Extend
  the existing init config creation path only: when the user explicitly invokes
  `init --profile brainstorm` and no config exists, create the minimum
  `schema: brainstorm-root` config. Never rewrite an existing config.

- [ ] **Step 4: Update docs with native and root-aware behavior**

  Document profile selection, installed entry points, store precedence reuse, and the explicit guarantee that no Superpowers plugin is required. Do not describe the feature as a restoration of legacy workspaces.

- [ ] **Step 5: Run focused tests**

  Run the command from Step 2. Expected: exit 0.

### Task 9: Regenerate parity data and perform final verification

**Files:**

- Modify: `test/core/templates/skill-templates-parity.test.ts`
- Modify if generated by repository tooling: committed generated skill distribution files

**Interfaces:**

- Consumes: final template factories and profile registry.
- Produces: parity hashes and coverage assertions that fail on unreviewed generated-content drift.

- [ ] **Step 1: Run parity tests before hash updates**

  Run:

  ```bash
  pnpm exec vitest run test/core/templates/skill-templates-parity.test.ts
  ```

  Expected: only reviewed hash/content differences fail; investigate any missing or duplicate registry entry before regeneration.

- [ ] **Step 2: Regenerate hashes with the repository script**

  Run:

  ```bash
  pnpm run regen:parity-hashes
  ```

  Review the diff and retain only hashes corresponding to intentional template changes.

- [ ] **Step 3: Scan runtime sources for forbidden dependency strings**

  Run:

  ```bash
  rg -n "superpowers:|plugin install|Superpowers plugin" schemas/brainstorm-root src/core/templates/workflows/brainstorm-root
  ```

  Expected: no matches. Historical design/plan documents are excluded from this runtime scan.

- [ ] **Step 4: Run format-independent static checks**

  Run:

  ```bash
  git diff --check
  pnpm exec tsc --noEmit
  pnpm run build
  ```

  Expected: all commands exit 0.

- [ ] **Step 5: Run focused feature tests**

  Run:

  ```bash
  pnpm exec vitest run \
    test/core/profiles.test.ts \
    test/core/profiles-brainstorm-workflows.test.ts \
    test/core/shared/skill-generation.test.ts \
    test/core/templates/workflows/apply-change.plan-gate.test.ts \
    test/core/templates/workflows/brainstorm-root-update.test.ts \
    test/core/visual-companion \
    test/commands/visual.test.ts \
    test/core/templates/skill-templates-parity.test.ts \
    test/schemas/brainstorm-root.instruction.test.ts \
    test/integration/brainstorm-root-flow.test.ts \
    test/integration/brainstorm-root-store-flow.test.ts \
    test/core/init.test.ts \
    test/core/update.test.ts \
    test/core/migration.test.ts
  ```

  Expected: all test files pass with zero failures.

- [ ] **Step 6: Run the complete suite with freshly built CLI artifacts**

  Run:

  ```bash
  pnpm run build
  pnpm test
  ```

  Expected: zero failures. If an environment-dependent baseline failure remains, rerun that exact test against `4e16790…` in an isolated worktree and report both outputs; do not classify it as unrelated without baseline evidence.

- [ ] **Step 7: Review final scope**

  Confirm the final diff contains no workset persistence/opener changes, no legacy workspace/initiative model, no external plugin dependency, and no unintended `core` profile output changes.

## Review checkpoint

Implementation starts only after the user reviews this plan and confirms the workflow set, native-discipline boundaries, and planning-root/store test coverage.
