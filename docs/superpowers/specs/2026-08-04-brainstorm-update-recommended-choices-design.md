# Recommended Choices in Brainstorm and Update

## Goal

Make every multiple-choice question in the brainstorm profile's `brainstorm`
and `update` workflows useful without requiring the user to infer which option
best fits the current context. The agent presents viable choices, identifies one
recommended choice, and gives a concise reason for that recommendation.

## Behavior

Whenever either workflow asks a question with two or more choices, it must:

1. Mark exactly one choice as `(Recommended)`.
2. Explain briefly why that choice best fits the known project context,
   requirements, constraints, and long-term quality goals.
3. Keep every other choice viable and describe its material trade-off rather
   than presenting filler alternatives.
4. Preserve user authority: the recommendation is guidance, not an automatic
   selection, and the user may choose any option.

If the agent lacks enough evidence to make a responsible recommendation, it
must not guess. It asks one focused clarifying question to obtain the missing
context, then presents the choices with a recommendation. Questions that do not
offer multiple choices are unchanged.

This rule applies to all multiple-choice questions in these workflows, including
scope, requirements, design, compatibility, migration, artifact reconciliation,
and next-step decisions. It is not limited to architectural approach comparisons.

## Architecture and Source Ownership

A reusable choice-recommendation policy block lives in
`src/core/templates/workflows/brainstorm/workflow-policy.ts`. Both generated
workflow surfaces consume the same wording:

- `brainstorm` includes the policy through its generated skill and command body;
- `update` includes the policy through its generated skill and command body.

The canonical brainstorm artifact instruction in `schemas/brainstorm/schema.yaml`
also expresses the same behavioral contract. This keeps direct CLI artifact
instructions aligned with generated skills and commands instead of relying on a
single entry point.

The existing rule to compare two or three viable design approaches remains in
place. The new policy generalizes recommendation guidance to every other group
of choices and does not change artifact structure, CLI arguments, resolved paths,
or workflow sequencing.

## Edge Cases

- A binary choice still has exactly one recommendation when evidence supports it.
- A neutral preference question still requires contextual guidance; when no
  relevant context exists, the agent asks for the missing preference instead of
  inventing a recommendation.
- An unavailable or invalid option is not presented as a viable choice merely to
  satisfy the multiple-choice shape.
- Update recommendations cannot override its existing confirmation gates or edit
  artifacts automatically.
- Visual-companion choices follow the same recommendation rule when the agent
  presents selectable alternatives.

## Testing

Focused template tests verify that generated `brainstorm` and `update` skill and
command variants contain the shared recommendation contract. Schema instruction
tests verify that direct brainstorm artifact instructions also require exactly
one contextual recommendation and clarification instead of guessing when the
evidence is insufficient.

Tests should assert stable behavioral phrases rather than the entire prose block
so harmless editorial changes do not create brittle snapshots. Existing tests
continue to verify workflow sequence, planning-only update behavior, user gates,
and absence of external-plugin references.

## Compatibility and Migration

The change is prompt-only and backward compatible. Existing changes and planning
artifacts need no migration. Newly generated or updated agent assets receive the
stronger interaction policy through the normal OpenSpec installation/update
path.

## Success Criteria

- Every multiple-choice prompt produced by brainstorm or update identifies one
  contextually justified recommendation.
- Agents ask for missing decision context rather than recommending arbitrarily.
- Recommendations never bypass user confirmation or make a selection on the
  user's behalf.
- Generated skills, generated commands, and canonical schema instructions remain
  aligned and are covered by focused regression tests.

## Non-goals

- Applying the policy to workflows outside brainstorm and update.
- Changing how CLI interactive selectors choose defaults.
- Automatically accepting the recommended option.
- Requiring recommendations for open-ended questions with no presented choices.
