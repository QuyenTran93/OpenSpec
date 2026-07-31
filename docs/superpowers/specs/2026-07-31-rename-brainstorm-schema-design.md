# Rename `brainstorm-root` Schema to `brainstorm`

## Goal

Make `brainstorm` the canonical public schema name while preserving compatibility
for projects and commands that still reference `brainstorm-root`.

## Public behavior

- New brainstorm-profile projects write `schema: brainstorm`.
- Generated commands, skills, help text, examples, and current documentation use
  `brainstorm` as the schema name.
- `brainstorm-root` remains accepted as a deprecated alias for `brainstorm` for at
  least one major release.
- Resolving the legacy alias returns the canonical schema and reports
  `schemaName: brainstorm` in newly produced CLI/API output.
- Existing change metadata and project configuration are not rewritten merely by
  being read. Explicit migration/update flows may rewrite the alias to the
  canonical name when they already own configuration updates.
- User-defined project schemas keep precedence. A real project-local schema named
  `brainstorm-root` must not be silently redirected to the built-in `brainstorm`
  schema.

## Storage and resolution

The built-in schema directory becomes `schemas/brainstorm`. Schema resolution
first checks for an exact project-local or configured schema. If no exact legacy
schema exists, the built-in alias map resolves `brainstorm-root` to `brainstorm`.
The alias mapping is centralized so validation, completion, instruction loading,
status, and template loading cannot disagree.

Schema listings and shell completions expose only canonical names by default.
Error messages may mention that `brainstorm-root` is a deprecated alias when the
legacy spelling is supplied.

## Internal naming

Runtime symbols and active source paths use `Brainstorm` / `brainstorm` where they
refer to the schema variant. Historical changelog entries, dated design documents,
and migration fixtures retain `brainstorm-root` when it describes the old public
name. Tests specifically covering compatibility also retain the legacy spelling.

## Compatibility and errors

- Legacy project config and change metadata continue to load without modification.
- An explicit missing or malformed project-local `brainstorm-root` schema produces
  its normal schema error rather than falling through to the built-in alias.
- Alias handling applies consistently to extensionless names and supported schema
  filename suffixes.
- No additional artifact or workflow behavior changes are part of this rename.

## Testing

Tests cover canonical schema discovery, profile initialization, generated workflow
text, and end-to-end brainstorm flow under `brainstorm`. Separate compatibility
tests prove that `brainstorm-root` resolves to the canonical schema, old metadata
still works, project-local name precedence is preserved, and listings do not show
duplicate schemas. The focused suites run first, followed by the full test suite
and build/type checks.

## Rollout

The changelog calls out the new canonical name and the legacy alias. Removal of
the alias is explicitly deferred to a future major release and is not part of this
change.
