## ADDED Requirements

### Requirement: Log output SHALL NOT contain full secret material
Console log statements SHALL NOT emit full secret material, including wave invite tokens, API keys, or user secrets. When a token or secret must appear in a log for diagnostic purposes, it SHALL be redacted to a short prefix plus the total length (e.g., `invite: ab12… (len 48)`). This applies to all `console.log`, `console.warn`, and `console.error` call sites that handle invite tokens or other credentials.

#### Scenario: Invite token creation is logged
- **WHEN** a wave invite token is created and the event is logged
- **THEN** the log SHALL NOT contain the full token
- **THEN** the log SHALL contain only a redacted form (short prefix plus length)

#### Scenario: Log output scan finds no full tokens
- **WHEN** the codebase's log call sites are inspected
- **THEN** no `console.*` statement SHALL interpolate a full invite token, API key, or user secret into the output
