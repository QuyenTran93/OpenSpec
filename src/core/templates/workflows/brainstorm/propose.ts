/**
 * Skill Template Workflow Modules — propose (brainstorm v2)
 *
 * Generates or reconciles tasks.md from brainstorm.md. The only artifact
 * produced by /opsx:propose. Plan generation lives in /opsx:writing-plans.
 */
import type { SkillTemplate, CommandTemplate } from '../../types.js';
import {
  BRAINSTORM_GATE_POLICY_BLOCK,
  BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK,
} from './workflow-policy.js';

const PROPOSE_BODY = (argDescription: string): string => `Generate or reconcile \`tasks.md\` from the approved \`brainstorm.md\`.

${BRAINSTORM_WORKFLOW_SEQUENCE_BLOCK}

${BRAINSTORM_GATE_POLICY_BLOCK}

---

**Input**: ${argDescription}

**Steps**

1. **Resolve the change name**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change.
   - Auto-select if only one active change exists.
   - If ambiguous, run \`openspec list --json\` and use the **AskUserQuestion tool** to let the user choose.

   Always announce: "Using change: <name>".

2. **Check status**

   \`\`\`bash
   openspec status --change "<name>" --schema brainstorm --json
   \`\`\`

   Parse the JSON. Important fields:
   - \`artifacts[id=brainstorm].status\` — must be \`done\`. Otherwise STOP and instruct the user to run \`/opsx:brainstorm\` first.
   - \`artifacts[id=tasks].status\` — \`done\` means the resolved tasks artifact already exists; this is a **rerun** (reconcile branch). Otherwise this is a **first run**.
   - \`planningHome\`, \`changeRoot\`, and \`artifactPaths\` — use these resolved workspace/store paths; never infer a repository-local change directory.

3. **Get the canonical task instructions**

   \`\`\`bash
   openspec instructions tasks --change "<name>" --schema brainstorm --json
   \`\`\`

   The JSON includes \`instruction\`, \`template\`, \`outputPath\`/\`resolvedOutputPath\`, and \`dependencies\` (including the brainstorm artifact).

4. **Read the brainstorm path returned in \`dependencies\` or \`artifactPaths.brainstorm.existingOutputPaths\`** in full. This is the source of truth for scope, decisions, and open questions.

5. **Generate or reconcile \`tasks.md\`**

   - **First run** (\`tasks.md\` missing): use \`template\` as the structure; populate task groups (\`## N. Group\`) and checklist items (\`- [ ] N.M Task\`) from brainstorm decisions. Tasks should be small enough to complete in one session and ordered by dependency.
   - **Rerun** (\`tasks.md\` exists): read current \`tasks.md\`. Reconcile against the latest brainstorm:
     - Add new tasks for newly-decided scope.
     - Remove tasks for scope dropped from brainstorm.
     - Rename/rephrase tasks whose underlying decision changed.
     - **Preserve \`- [x]\` completion state** for tasks whose meaning is unchanged.

6. **Write only to the returned \`resolvedOutputPath\`** (or resolve \`outputPath\` against the returned \`changeRoot\`). Apply \`context\` and \`rules\` from the instructions JSON as constraints — do NOT copy them into the file.

7. **Show final status**

   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**Output**

After completion, summarize:
- Change name and \`tasks.md\` path.
- Number of tasks (groups × items).
- For rerun: counts of added / removed / renamed / preserved-with-checkmark tasks.
- Prompt: "Next: run \`/opsx:writing-plans\` to draft \`plan.md\` (reads \`brainstorm.md\` + \`tasks.md\`)."

**Guardrails**

- Never run \`/opsx:propose\` before \`brainstorm.md\` exists — STOP and direct the user to \`/opsx:brainstorm\`.
- Never auto-create \`plan.md\` here — that is \`/opsx:writing-plans\`'s job.
- Never silently overwrite \`[x]\` completion state during reconcile.
- Always invoke schema-sensitive CLI commands with \`--schema brainstorm\`.
- Verify \`tasks.md\` exists after writing before reporting success.`;

export function getBrainstormProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-propose',
    description: 'Generate or reconcile tasks.md for a brainstorm change. Reads brainstorm.md as the canonical input.',
    instructions: PROPOSE_BODY(
      "The user's request may include a change name (kebab-case); if unclear, resolve the active change."
    ),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '2.0' },
  };
}

export function getOpsxBrainstormProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Propose',
    description: 'Generate or reconcile tasks.md from brainstorm.md (brainstorm v2)',
    category: 'Workflow',
    tags: ['workflow', 'tasks', 'experimental'],
    content: PROPOSE_BODY(
      'The argument after `/opsx:propose` is the change name (kebab-case), if provided; otherwise infer from session context.'
    ),
  };
}
