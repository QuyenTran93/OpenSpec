# Brainstorm Profile Native Skills Design

## Goal

Add a production-ready `brainstorm` profile on top of OpenSpec at commit
`4e16790d90d8f54d4773ad9a5e71a57cd9f1e86b`. The profile must preserve the
current OpenSpec planning-root, store, and workset behavior while providing its
own brainstorm-first workflow without requiring the Superpowers plugin.

## Baseline and compatibility boundary

Commit `4e16790d90d8f54d4773ad9a5e71a57cd9f1e86b` defines the behavior that the
`core` profile must retain. The new profile may add artifacts, workflow
variants, generated skills, generated commands, configuration values, and tests,
but it must not regress or fork the existing root-resolution model.

“Workspace support” means compatibility with current OpenSpec concepts:

- local OpenSpec roots;
- project `store:` pointers;
- explicit `--store <id>` selection;
- machine-level `defaultStore` selection;
- worksets and context that contain or reference those project/store roots.

It does not restore the retired workspace/initiative data model or vocabulary.

## Chosen architecture

Use native, profile-specific workflow variants rather than generating a second
layer of helper skills. Model `brainstorm.md`, `tasks.md`, and `plan.md` as
ordinary artifacts in the existing OpenSpec graph; do not add a parallel phase
abstraction or a public `phases[]` status contract. The installed entry points remain:

1. `openspec-brainstorm` / `/opsx:brainstorm`;
2. `openspec-propose` / `/opsx:propose`;
3. `openspec-writing-plans` / `/opsx:writing-plans`;
4. `openspec-update-change` / `/opsx:update`;
5. `openspec-apply-change` / `/opsx:apply`;
6. `openspec-archive-change` / `/opsx:archive`;
7. `openspec-new-change` / `/opsx:new`.

The brainstorm and writing-plans variants embed their complete interaction and
self-review methods. Apply embeds the required test-first, review, and
verification disciplines. These are OpenSpec-owned instructions: generated
runtime content must neither invoke nor require any `superpowers:*` skill.

No standalone `openspec-tdd`, `openspec-code-review`, or
`openspec-verification` skills are added. Those are implementation disciplines
inside apply, not user-facing workflow transitions.

The minimal schema contract is:

```yaml
name: brainstorm-root
version: 1
artifacts:
  - id: brainstorm
    generates: brainstorm.md
    template: brainstorm.md
    requires: []
  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [brainstorm]
  - id: plan
    generates: plan.md
    template: plan.md
    requires: [brainstorm, tasks]
apply:
  requires: [plan]
  tracks: tasks.md
```

There is no `PhaseSchema`, `PHASE_IDS`, `GraphNode`, `status.phases[]`, or
`apply.executionPlan`. Existing artifact status, dependency, instruction, and
path-resolution APIs remain authoritative.

## Superpowers concepts absorbed into the native profile

The implementation does not merely remove plugin calls. It preserves the useful
behavioral contracts of the relevant Superpowers skills and rewrites them as
OpenSpec-owned workflow instructions:

| Source concept | Native brainstorm-profile behavior |
|---|---|
| Brainstorming | Explore context first; ask one question at a time; compare 2–3 approaches; obtain section-by-section design approval; self-review the written design; require user acknowledgement. |
| Writing plans | Scope check; file/responsibility map; independently testable tasks; concrete file paths, commands, expected results, and interface contracts; coverage and consistency review. |
| Test-driven development | RED → GREEN → REFACTOR for behavior changes; observe the intended failure before implementation; keep production changes minimal until green. |
| Systematic debugging | Reproduce first; collect evidence; trace the failing data/control path; form one hypothesis at a time; verify the root cause before changing code; add a regression test. |
| Requesting code review | Review requirements compliance before code quality; provide the reviewer with the relevant change scope and verification evidence; resolve critical findings before completion. |
| Receiving code review | Verify feedback against code and requirements; ask when ambiguous; implement one verified finding at a time; do not accept technically incorrect feedback performatively. |
| Verification before completion | Identify the command proving each claim; run it fresh; inspect exit status and failures; report actual evidence and remaining gaps. |

These concepts are copied at the level of principles and workflow guarantees,
not as runtime references to external skill names. Attribution is retained in
source documentation where required by the upstream license.

## Root-aware data flow

Generated workflows must not construct `openspec/changes/<name>` from the
process working directory. They ask the CLI to resolve the planning home and
consume the returned `changeRoot`, `changeDir`, or resolved artifact paths.

The flow is:

1. Pass through an explicit `--store <id>` when the invocation supplies one.
2. Otherwise let the existing resolver apply local-root, project-pointer, and
   global-default precedence.
3. Read `openspec status --change <name> --json` and/or
   `openspec instructions <id> --change <name> --json`.
4. Write only to paths returned or derived from the resolved change directory.
5. Keep one resolved planning home for the entire command; do not independently
   rediscover a root halfway through a workflow.

This makes a brainstorm change behave the same whether launched from a store
checkout, a project pointing to a store, or a project opened through a workset.

## Native visual companion

The brainstorm profile includes an optional browser companion implemented and
distributed by OpenSpec. It is offered just-in-time only when a question is
materially easier to answer visually: UI/layout comparisons, architecture or
data-flow diagrams, state machines, spatial relationships, and visual polish.
Requirements, scope, API design, data models, and textual trade-offs remain in
the terminal.

The user must explicitly accept before OpenSpec opens a browser. Declining,
running headless, or encountering an unsupported host never blocks the
brainstorm workflow; the agent falls back to Mermaid, ASCII, repository-native
SVG/HTML, or text.

### Runtime shape

OpenSpec exposes a native command group:

```text
openspec visual start [--project <path>] [--port <port>] [--open] [--json]
openspec visual status [--project <path>] [--json]
openspec visual stop [--project <path>] [--json]
```

`start --json` returns the authenticated URL, screen directory, state directory,
session directory, and process/port metadata. The generated brainstorm skill
writes a new semantic HTML fragment for each visual question and reads JSONL
selection events after the user's next terminal response. Terminal feedback is
always authoritative; browser events are supplemental.

When `--port` is omitted, OpenSpec selects a free ephemeral port. A positive
explicit port is stable and intended for IDE or SSH forwarding; if occupied,
startup fails clearly instead of silently switching ports. Port values are
validated before binding. The selected port is persisted in session metadata so
status and restart reuse it when possible.

### Remote SSH and port forwarding

OpenSpec treats remote execution as a first-class case. When common remote
environment signals indicate SSH, a remote IDE server, container, or codespace,
`--open` does not attempt to launch a browser on the remote machine. Human and
JSON output instead state that port forwarding may be required and provide:

- the remote bind endpoint (`127.0.0.1:<remote-port>`);
- the complete authenticated local URL to open after forwarding, including the
  session key;
- VS Code/Cursor guidance to forward `<remote-port>` from the IDE Ports panel;
- a generic SSH example:
  `ssh -N -L <local-port>:127.0.0.1:<remote-port> <remote-host>`.

OpenSpec does not guess credentials, mutate SSH configuration, or create a
forward automatically. The generated example uses the same local and remote
port for clarity; users choosing a different local port replace only the first
port and the port in the local URL. This does not weaken server authentication.
If remote detection is inconclusive, OpenSpec prints the normal URL plus a short
forwarding hint rather than claiming direct reachability.

Project sessions persist below `.openspec/visual-companion/`, which is ignored
by Git. The server reuses a live project session where safe, exposes explicit
status, and stops on command or idle timeout. OpenSpec owns cross-platform
process handling; generated skills do not contain host-specific backgrounding
instructions.

### Security, privacy, and accessibility

- Bind to loopback by default. Non-loopback binding requires an explicit flag
  and prints a warning.
- Generate a cryptographically random session key and require it for HTTP and
  WebSocket access.
- Validate host/origin, prevent path traversal and symlink escape, cap request,
  screen, and event sizes, and write state atomically.
- Send a restrictive Content Security Policy, `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, and a `Permissions-Policy` disabling camera,
  microphone, geolocation, and other unused capabilities.
- Load no third-party scripts, fonts, analytics, trackers, or remote images.
- Strip scripts, inline event handlers, and unsafe URLs from fragment content;
  the bundled helper uses event delegation over `data-choice` attributes.
- Minimize persisted events to session/screen identifiers, choice values, and
  timestamps; do not duplicate arbitrary page text into logs.
- Render choices as semantic buttons with keyboard operation, visible focus,
  `aria-pressed`, status announcements, reduced-motion support, and sufficient
  contrast.
- Use feature detection and progressive enhancement. A lost WebSocket leaves
  the screen readable and clearly reports that selection sync is paused.

The implementation may adapt the MIT-licensed Superpowers companion, but copied
or substantially derived source retains Jesse Vincent's copyright and license
notice in OpenSpec's third-party notices.

## Native workflow disciplines

### Brainstorm

The native brainstorm workflow explores repository context, asks one clarifying
question at a time, compares viable approaches without manufacturing a fixed
number of options, obtains design approval, writes a substantive
`brainstorm.md`, and reviews it for placeholders, consistency, scope, and
ambiguity before propose. Approval remains conversational; it is not represented
by pseudo-state markers in the artifact.

### Planning

The native writing-plans workflow reads the resolved `brainstorm.md` and
`tasks.md`, maps files and responsibilities, decomposes work into independently
testable deliverables with concrete commands and expected results, and checks
coverage and identifier consistency before apply. It does not impose a 2–5
minute duration, mandatory per-task commits, worktrees, subagents, or interface
sections where they add no value.

### Update change

The native update workflow revises an existing brainstorm-root change without
starting implementation. It resolves the current planning home, reads
`brainstorm.md`, `tasks.md`, and `plan.md` when present, asks focused questions
for the requested revision, and updates artifacts in dependency order:

1. update `brainstorm.md` when decisions or scope change;
2. reconcile `tasks.md` while preserving completed checkboxes whose meaning is
   unchanged;
3. reconcile `plan.md` when files, interfaces, ordering, or verification steps
   change;
4. rerun the same self-review and user-acknowledgement gates for every materially
   changed planning artifact.

`update` never edits production code, marks implementation tasks complete, or
silently discards completed task state. If a completed task conflicts with the
new design, it is retained and annotated for explicit user resolution.

### Apply

Each behavior change follows a red-green-refactor cycle. Substantive changes
receive a requirements review and then a code-quality review. Completion claims
require fresh verification output. The schema does not prescribe inline versus
delegated execution, commits, worktrees, or branch operations; those follow user
authorization and host policy. Implementation must not depend on delegation or
any external plugin.

When apply encounters unexpected behavior or a failing test not explained by
the planned RED state, it switches to the native systematic-debugging contract:
reproduce, gather evidence, trace the path, test one hypothesis, fix the root
cause, and verify with a regression test. Review feedback follows the native
receiving-review contract before changes are accepted.

## Source ownership and attribution

Instructions are rewritten for OpenSpec’s artifact model and terminology. If a
section is copied substantially rather than re-expressed, retain the applicable
upstream license and attribution in the repository source. Generated runtime
files remain OpenSpec-branded and self-contained.

## Registry cleanup

The current feature branch contains merge-union duplication in profile and
template registries. Normalize each registry to one entry per workflow and one
`CORE_WORKFLOWS` declaration. Profile selection chooses exactly one template
variant for overlapping workflow IDs.

## Contracts removed from the feature branch

- The brainstorm/plan phase model and its cross-node graph extensions.
- `apply.executionPlan`; `apply.requires: [plan]` is sufficient.
- Prose readiness variables such as `design_approved` and
  `user_acknowledged_plan` that are neither persisted nor validated.
- Automatic workflow coupling through
  `ensureWritingPlansWhenBrainstormSelected`; the preset declares its complete
  workflow list and custom profiles remain explicit.
- Project-schema creation or mutation from update and migration. Only init may
  create a missing config for an explicitly selected brainstorm profile.
- Execution-host contracts for subagents, worktrees, commits, pushes, merges,
  and fixed-duration micro-steps.
- Tests that pin incidental prose, step numbering, or external skill names.

## Tests and acceptance criteria

The implementation is accepted when:

- `core` profile outputs remain equivalent to the `4e16790…` baseline except
  for intentional shared bug fixes;
- `brainstorm` installs exactly its declared native workflow set;
- `update` revises brainstorm, tasks, and plan in dependency order without
  implementing code or losing unchanged completion state;
- generated brainstorm skills and commands contain no `superpowers:` reference,
  plugin availability precheck, or plugin-install fallback;
- brainstorm, plan, apply, and archive use CLI-resolved artifact/change paths;
- external-store integration tests cover project `store:` pointers and explicit
  `--store` selection;
- visual companion lifecycle, authentication, traversal protection, sanitizing,
  security headers, keyboard/ARIA behavior, event minimization, idle shutdown,
  and headless fallback are covered by tests;
- registry uniqueness, schema validation, generated-content parity, typecheck,
  build, and focused tests pass;
- the complete suite is run and any unrelated environmental failures are
  reported separately with exact evidence.

## Out of scope

- Restoring the retired workspace/initiative model.
- Changing workset persistence or opener behavior.
- Adding an OpenSpec plugin manager.
- Installing or vendoring the Superpowers plugin.
- Changing the `core` profile’s workflow set.
