# Recommended Choices in Brainstorm and Update

## Goal

Make every multiple-choice question in the brainstorm profile's `brainstorm`
and `update` workflows useful without requiring the user to infer which option
best fits the current context. The agent presents viable choices, identifies one
recommended choice, and gives a concise reason for that recommendation.

The workflow is viability-first, not count-first. It never manufactures extra
options to reach a default count. When only one approach is genuinely viable,
the agent presents that approach directly and explains why without wrapping it
in an artificial multiple-choice question.

## Behavior

The agent presents only genuinely viable options. It does not target a minimum
or default option count, and it does not add weaker, duplicate, cosmetic, or
irrelevant alternatives merely to create a comparison.

Every presented approach includes concrete advantages and disadvantages grounded
in the current context. For a single viable approach, the agent still states its
benefits and limitations before explaining why it fits. It does not invent a
benefit or drawback merely to make the presentation look balanced.

This contract applies from the first question onward. No introductory,
change-selection, clarification, scope, or preference question is exempt. Choice
guidance must appear before any workflow instruction that can cause the agent to
ask a question, so prompt ordering reinforces the rule instead of relying only
on later prose.

Whenever either workflow genuinely has two or more choices to present, it must:

1. Mark exactly one choice as `(Recommended)`.
2. Explain briefly why that choice best fits the known project context,
   requirements, constraints, and long-term quality goals.
3. State concrete advantages and disadvantages for every choice rather than
   presenting filler alternatives or vague trade-off labels.
4. Preserve user authority: the recommendation is guidance, not an automatic
   selection, and the user may choose any option.

After the user chooses, that viable option becomes the authoritative decision
for subsequent reasoning and artifact updates, even when it differs from the
agent's recommendation. The agent must not keep relitigating the recommendation,
silently substitute another option, or treat the recommended option as selected.
If new evidence later makes the chosen option infeasible or contradictory, the
agent presents that evidence and asks the user to decide again before changing
direction.

If the agent lacks enough evidence to make a responsible recommendation, it
must not guess. It asks one focused clarifying question to obtain the missing
context, then presents the choices with a recommendation. Questions that do not
offer multiple choices are unchanged.

When exactly one approach is genuinely viable, the agent presents it directly
with its rationale and asks for agreement where the workflow requires approval.
It does not invent a second option such as “do nothing,” a knowingly weaker
shortcut, or a superficial variant solely to satisfy a comparison format.

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

The `Approaches Considered` guidance in
`schemas/brainstorm/templates/brainstorm.md` uses the same viability-first rule
so the artifact template cannot reintroduce a default option count.

The existing instruction to compare two or three viable design approaches is
replaced with a viability-first instruction. Multiple approaches are compared
only when multiple approaches survive the agent's context and feasibility
review. The policy does not change artifact structure, CLI arguments, resolved
paths, or workflow sequencing.

## Edge Cases

- A binary choice still has exactly one recommendation when evidence supports it.
- The first question follows the same recommendation and advantage/disadvantage
  rules as every later question.
- A single viable approach is presented directly without a `(Recommended)` label
  or fabricated alternatives, with both its advantages and limitations.
- A neutral preference question still requires contextual guidance; when no
  relevant context exists, the agent asks for the missing preference instead of
  inventing a recommendation.
- An unavailable or invalid option is not presented as a viable choice merely to
  satisfy the multiple-choice shape.
- Update recommendations cannot override its existing confirmation gates or edit
  artifacts automatically.
- A post-choice workflow follows the user's selected viable option. It reopens
  the decision only when new evidence makes that option infeasible or contradictory.
- Visual-companion choices follow the same recommendation rule when the agent
  presents selectable alternatives.

## Testing

Focused template tests verify that generated `brainstorm` and `update` skill and
command variants contain the shared recommendation contract. Schema instruction
tests verify that direct brainstorm artifact instructions also require exactly
one contextual recommendation and clarification instead of guessing when the
evidence is insufficient.

Tests also reject count-first language and require explicit instructions not to
manufacture options. They verify that one viable approach may be presented
directly and that recommendation labeling activates only when two or more viable
options actually exist.

Generated-workflow tests verify prompt ordering: the shared choice policy appears
before the first instruction that can ask a question in both brainstorm and
update. Canonical schema tests verify the same first-question scope explicitly.

Tests require the generated and canonical instructions to treat the user's
chosen viable option as authoritative after selection and to request a new
decision before changing direction when later evidence invalidates it.

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
- The rule applies to the first question, with choice guidance ordered before
  any question-producing instruction.
- Neither workflow targets a default option count or fabricates alternatives.
- A single genuinely viable approach is presented directly with its rationale.
- Every presented approach has context-specific advantages and disadvantages.
- Agents ask for missing decision context rather than recommending arbitrarily.
- Recommendations never bypass user confirmation or make a selection on the
  user's behalf.
- The user's selected viable option controls subsequent work unless new evidence
  is surfaced and the user explicitly revisits the decision.
- Generated skills, generated commands, and canonical schema instructions remain
  aligned and are covered by focused regression tests.

## Non-goals

- Applying the policy to workflows outside brainstorm and update.
- Changing how CLI interactive selectors choose defaults.
- Automatically accepting the recommended option.
- Requiring recommendations for open-ended questions with no presented choices.
