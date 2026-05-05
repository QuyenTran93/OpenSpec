## ADDED Requirements

### Requirement: <!-- requirement name -->
<!-- requirement text -->

#### Scenario: <!-- scenario name -->
- **WHEN** <!-- condition -->
- **THEN** <!-- expected outcome -->

---

## MODIFIED Requirements

### Requirement: <!-- same header as in the existing spec -->
<!-- full updated requirement text — including SHALL or MUST -->

#### Scenario: <!-- scenario name (can be added or updated) -->
- **WHEN** <!-- condition -->
- **THEN** <!-- expected outcome -->

---

## REMOVED Requirements

<!--
Remove an existing Requirement. MUST include Reason and Migration so reviewers
understand why it is removed and how existing references should migrate.
-->

### Requirement: <!-- header to remove, exactly matching the existing spec -->

**Reason**: <!-- why it is removed -->

**Migration**: <!-- how existing callers/dependents should adjust -->

---

## RENAMED Requirements

<!--
Rename a Requirement header. Fixed format: use code-fenced headers for FROM / TO.
If both name and content change, list the name change in RENAMED and also include
a complete updated requirement in MODIFIED using the **new** header.

Apply order during archive: RENAMED → REMOVED → MODIFIED → ADDED
-->

- FROM: `### Requirement: <Old Name>`
- TO: `### Requirement: <New Name>`