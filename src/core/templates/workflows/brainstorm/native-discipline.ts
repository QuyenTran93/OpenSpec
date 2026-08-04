export const NATIVE_BRAINSTORM_METHOD = `
Explore the project context first. Ask one clarifying question at a time. Identify
only genuinely viable approaches and compare them when more than one remains.
Do not target a minimum or default option count. When only one approach is
genuinely viable, present it directly with its rationale instead of manufacturing
alternatives. Obtain agreement on the chosen design.
Choose for long-term project quality, favoring a clean design and reuse. Never
select a weaker approach because shipping speed alone makes it convenient.
Write brainstorm.md, then review it for placeholders,
consistency, scope, and ambiguity; fix findings inline.

Review the artifact for requirements coverage and alignment between behavior and
architecture. When available, use a review-only subagent for independent review
of consistency, feasibility, and unnecessary scope. The subagent must not edit
files. Evaluate its findings in the primary session. If subagents are unavailable,
perform an expanded inline self-review from a fresh pass. Obtain user approval
before handing off to downstream artifacts.

Visual assistance is optional. Offer it only when the current question is
materially easier to answer by seeing a UI/layout, architecture flow, state
machine, spatial relationship, or visual comparison. Ask permission before
running \`openspec visual start --port <port>\` (omit \`--port\` for an ephemeral
port). Read the printed \`screenDir\` and \`events.jsonl\` paths. For each visual
question, write a new semantic, accessible HTML fragment into \`screenDir\`;
mark selectable buttons/cards with a short \`data-choice\` value. Wait for the
corresponding JSONL choice event, then confirm it in the terminal. A later
terminal answer always overrides a visual selection. On Remote SSH, tell the
user to forward the printed port in the IDE Ports panel and open the printed
localhost URL; never try to open the remote browser. Requirements, scope, APIs,
data models, and textual trade-offs stay in the terminal. If visual tooling is
unavailable, continue with Mermaid, ASCII, SVG/HTML, or text.
`.trim();

export const NATIVE_APPLY_DISCIPLINE = `
For behavior changes use RED → GREEN → REFACTOR: write a focused test, observe
the intended failure, add the minimum implementation, and keep tests green while
refactoring. For unexpected behavior, reproduce first, gather evidence, trace
the failing path, test one hypothesis at a time, fix the root cause, and add a
regression test. Review requirements compliance before code quality. Verify
review feedback against the code and requirements. Never claim completion
without fresh verification evidence.

Implementation runs inline in the primary session. Subagents are limited to
independent review or read-only research; they must not edit files, implement
tasks, or orchestrate the apply loop. If unavailable, use expanded inline
self-review and record that review mode in the handoff summary.
`.trim();
