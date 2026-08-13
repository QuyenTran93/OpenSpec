# Brainstorm Artifact Humanizer Design

## Goal

Make prose written by the `brainstorm` profile sound direct and human without installing or loading a separate humanizer skill. Preserve technical meaning, artifact structure, and authorial intent.

## Design

Add one compact shared policy constant to the brainstorm workflow policy module. Inject it only into brainstorm-profile workflows that write or revise prose artifacts:

- `openspec-brainstorm` before writing `brainstorm.md`
- `openspec-propose` before writing or reconciling `tasks.md`
- `openspec-writing-plans` before writing `plan.md`
- `openspec-update-change` before saving revised planning artifacts

The policy will be roughly 150–250 words. It will require a final editing pass that:

- preserves meaning, technical terms, uncertainty, decisions, checklist syntax, and template structure;
- removes generic framing, inflated significance, promotional language, vague attribution, fake-depth `-ing` clauses, forced rule-of-three phrasing, and common AI transitions;
- prefers concrete nouns, direct verbs, specific claims, and naturally varied sentence length;
- avoids adding personality, emotion, first-person commentary, jokes, or unsupported claims to technical artifacts;
- edits only prose, not commands, paths, identifiers, code, acceptance criteria, or normative keywords.

This is an editing constraint, not a new workflow step or user gate. It runs immediately before each artifact write.

## Scope Boundaries

Do not install a standalone humanizer skill. Do not copy the source skill's full pattern catalog. Do not apply the policy to `core` or `custom` template variants. Mechanical task checkbox updates during implementation and archive operations remain unchanged.

## Testing

Add template-generation tests proving that all four brainstorm artifact-writing workflows include the compact policy in both skill and command output. Assert that representative non-brainstorm templates do not include it. Keep the policy's stable heading or marker as the test contract rather than duplicating its prose in assertions.

