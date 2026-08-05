# Global AI Artifact Installation

## Goal

Allow users to install OpenSpec-generated AI skills and commands once at user
scope instead of copying them into every project. Project-local installation
remains the default and keeps its current behavior.

## User interface

```bash
openspec init --scope global --tools codex,claude
openspec init --scope global --tools all
openspec update --scope global
openspec clean --scope project --tools codex,claude
openspec clean --scope project --tools codex,claude --yes
```

`--scope` accepts `project` and `global`; `project` is the default. A global
initialization installs only AI-tool artifacts and records their configuration.
It does not create an `openspec/` planning root in the user's home directory and
does not require the current directory to contain an OpenSpec project.

The positional path on `init` and `update` is invalid with `--scope global`
unless it is the unchanged default. This avoids presenting a path that global
installation would silently ignore.

## Capability model

Global support is explicit per tool. The tool registry gains optional metadata
that resolves the user-scoped roots for skills and commands. Resolvers receive
an injectable environment, platform, and home directory so Unix, macOS, Windows,
XDG, and tool-specific home overrides can be tested without mutating the process.

A tool may support:

- global skills only;
- global commands only;
- both global delivery surfaces; or
- no verified global surface.

The global path does not default to `~/<project-relative-path>`. Each supported
surface must have a verified resolver. This is important for project-only
surfaces such as `.github`, IDE integrations, and tools whose user configuration
directory differs from the repository directory.

`--tools all` at global scope selects every tool with at least one verified
global delivery surface. Explicitly selecting an unsupported tool fails before
writing anything and names the unsupported tools. If the selected delivery mode
has no supported surface for a selected tool, the command reports that tool as
skipped and succeeds only when at least one requested artifact can be installed.

## Artifact path resolution

A shared scope-aware path service resolves every generated destination. Project
scope continues to join the existing relative adapter paths to the project root.
Global scope combines the tool's verified global root with a surface-relative
path supplied by the existing skill and command generation layers.

Command adapters remain responsible for filenames and formats. They do not read
the host environment. Tool capability metadata maps their project-relative
command shape into the corresponding global command root, avoiding absolute
paths hidden inside adapters.

All resolved global destinations must be absolute and contained by their
declared tool root. Resolution rejects traversal or an empty/broad root before
any write occurs.

## Global installation record

OpenSpec stores a versioned JSON record in its existing global config directory:

```text
<global-config-dir>/global-artifacts.json
```

The record contains:

- record format version;
- OpenSpec generator version;
- selected tool IDs;
- effective profile and delivery;
- selected workflows when applicable;
- generated files grouped by tool and surface;
- the declared global root associated with every recorded file.

Paths are recorded as normalized absolute paths because different tools may use
different homes. The record is written atomically only after generation
completes. A partial tool failure is reported and successful tool entries are
recorded, matching the current best-effort per-tool setup behavior.

The record is OpenSpec state, not the AI tool's discovery mechanism. Tools find
artifacts through their native global paths.

## Project artifact cleanup

After a successful global init or update, OpenSpec scans the current directory
for project-local OpenSpec skills and commands belonging to the tools installed
globally. When matches exist, it explains that local artifacts may shadow the
global installation and prints commands to preview and apply cleanup. It does
not remove project artifacts automatically.

```bash
# Preview only
openspec clean --scope project --tools codex,claude

# Apply the previewed cleanup
openspec clean --scope project --tools codex,claude --yes
```

Project cleanup is deliberately limited to generated AI-tool artifacts. It never
removes `openspec/`, planning artifacts, project configuration, or an AI tool's
root directory. A candidate is removable only when it is contained by the
selected tool's declared project artifact paths and retains a recognized
OpenSpec generated marker. Unmarked, modified, or user-created files are
preserved and reported.

The default mode is a dry run that lists removable and preserved paths and makes
no filesystem changes. `--yes` applies exactly the same ownership and containment
checks immediately before each deletion. Empty OpenSpec-created leaf directories
may be removed; shared parent directories remain.

`--json` returns a stable object containing `scope`, `tools`, `removable`,
`removed`, `preserved`, and `status`. Cleanup warns that removing committed local
artifacts can affect collaborators who have not installed OpenSpec globally.

## Init behavior

Project-scoped `init` remains unchanged.

Global `init`:

1. validates scope, profile, delivery, tool IDs, and global capabilities;
2. resolves every destination and checks containment before writing;
3. generates the selected profile's skills and commands;
4. reconciles previously recorded artifacts for each selected tool;
5. writes the new installation record atomically;
6. prints installed, skipped, and unsupported surfaces with their roots.

Interactive global init presents only global-capable tools. Non-interactive
`--tools` retains aliases and comma-separated selection.

Global init does not perform project migration, legacy project cleanup, planning
root validation, or project configuration creation.

## Update behavior

Project-scoped `update` remains unchanged.

Global `update` requires an existing global installation record. It regenerates
the recorded tools using the current global profile and delivery configuration,
unless an explicit CLI override is available for the same setting. It removes
recorded OpenSpec artifacts that are no longer selected, then atomically replaces
the record.

If the record is absent, the error directs the user to run
`openspec init --scope global --tools ...`. Global update never infers installed
tools by scanning the entire home directory.

The CLI self-upgrade flow preserves `--scope global` when it re-runs update.

## Reconciliation and safety

OpenSpec may overwrite a destination when the existing file contains its
recognized generated marker or the exact path already appears in the global
installation record. An unrelated existing file at a desired destination is a
conflict: that file is preserved and the tool fails with an actionable error.

Stale deletion requires all of the following:

1. the path is present in the previous global installation record;
2. the path remains contained by the recorded, re-resolved tool root;
3. the file still carries a recognized OpenSpec generated marker.

Failure of any check preserves the file and reports it. Empty OpenSpec-created
leaf directories may be removed after their managed files are deleted, but tool
roots and shared parent directories are never removed.

Global and project installations may coexist. OpenSpec does not emulate or
override an AI tool's native precedence rules; documentation explains that the
tool determines whether a project-local artifact shadows a global one.

## Components

### Scope and capability types

Introduce an `InstallScope` type and tool-level global delivery metadata in a
focused module. CLI parsing, init, update, detection, and reporting consume the
same types rather than comparing ad hoc strings.

### Global path service

Provide pure functions for environment-aware root resolution, destination
mapping, normalization, and containment checks. This module has no file writes.

### Installation record store

Provide validated read and atomic write operations for the versioned record.
Malformed or newer unsupported record formats fail with recovery guidance and
are never silently replaced.

### Artifact reconciler

Centralize ownership checks, safe writes, stale detection, and safe cleanup.
Both global init and global update call this component. Existing project-local
generation continues on its current path in this feature to minimize regression
risk.

### Global command orchestration

Keep global orchestration separate from the already-large project `InitCommand`
and `UpdateCommand`. The CLI delegates by scope, while shared template/profile/
delivery helpers preserve content parity between scopes.

### Project cleanup command

A focused cleanup command reuses existing tool detection, command adapters,
generated-marker checks, and containment helpers. Candidate discovery and
deletion are separate operations so dry-run output and `--yes` execution share
the same policy without global init gaining destructive behavior.

## Error handling

Validation errors happen before writes wherever possible. Messages name the
tool, surface, and relevant path without exposing file contents. Expected errors
include unsupported tool scope, delivery with no supported surface, destination
conflict, invalid or unsafe root, malformed installation record, and permission
failure.

Multi-tool generation is best effort after validation: one tool's filesystem
failure does not roll back other tools, but the command exits nonzero and records
only successful reconciliations. An interrupted atomic record write leaves the
previous valid record intact.

## Documentation

Update installation, supported-tools, CLI, command-workflow, troubleshooting,
and uninstall documentation. The supported-tools table distinguishes verified
project and global paths and is the authoritative capability list. Uninstall
instructions use the installation record or a future dedicated uninstall command
rather than broad wildcard deletion.

## Testing

Tests cover:

- CLI parsing, default project scope, and invalid scope/path combinations;
- capability filtering for interactive selection and `--tools all`;
- environment and path resolution on POSIX and Windows;
- tool-specific environment overrides and XDG behavior where supported;
- destination containment and traversal rejection;
- skills-only, commands-only, and dual-surface tools;
- idempotent init and update;
- profile, workflow, and delivery changes with stale reconciliation;
- missing, malformed, and newer-version installation records;
- conflicts with user-owned files;
- preservation of modified or unmarked stale files;
- partial multi-tool failure and atomic record updates;
- post-global-install detection and cleanup command hints;
- project cleanup dry-run, `--yes`, JSON output, containment, and ownership;
- preservation of planning roots, tool roots, unmarked files, and files for
  unselected tools;
- coexistence with unchanged project-scoped init/update;
- preservation of `--scope global` through the CLI upgrade re-run;
- documentation parity with the capability registry.

Focused unit tests cover the pure resolver and record/reconciliation components.
CLI and core integration tests use temporary home/config directories and never
write to the real user home.

## Out of scope

- Changing the default from project to global.
- Inventing global paths for tools without verified user-scoped discovery.
- Changing AI tools' precedence rules.
- Creating a planning root or global store as part of global artifact install.
- Automatically migrating existing project-local artifacts into global scope.
- A global uninstall command; the installation record deliberately enables one
  later without expanding this implementation.
