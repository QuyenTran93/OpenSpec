export const BRAINSTORM_GATE_POLICY_BLOCK = `Gate: Brainstorm approval required for brainstorm-root
- Check brainstorm.md for marker
- Redirect to brainstorming flow if marker missing
- OR condition: marker present or explicit chat confirmation
- Semantic confirmation must include guardrails
- Require positive agreement signal in current brainstorm decision context
- Reject negation/deferral/revision-intent signals
- If ambiguous/conflicting, do not pass gate automatically; ask one explicit confirmation question
- Auto-write marker before resuming
- If frontmatter parse fails, stop and require normalize before proceeding (no bypass).`;
