export const APPLY_EXECUTION_ENVIRONMENT_POLICY_BLOCK = `
Execution environment policy:
- Tests MUST run outside sandbox.
- Lint MUST run outside sandbox.
- Build MUST run outside sandbox.
- For non-test commands, first run in the default sandboxed environment unless a stronger policy explicitly overrides it.
- Retry outside sandbox only when the failure clearly indicates sandbox/environment restrictions.
- Retry outside sandbox at most once.
- If the outside-sandbox retry fails, pause and report the failure details before continuing.
`.trim();
