## Why

Codacy/Opengrep flags `validateSecretConfirm` in `src/screens/Secret/utils/validation.js` for using `!==` to compare secrets (timing-safe comparison rule). This is a false positive: the comparison is a client-side UX check where the user compares their own "secret" input against their own "confirm secret" input in the same React Native form. No server-stored secret is involved, no network boundary exists, and no attacker can observe timing.

## What Changes

- Add `// nosemgrep` inline suppression comment to the `secret !== secretConfirm` comparison with a justification explaining why it's safe

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- `src/screens/Secret/utils/validation.js` — single line annotation added
- No behavior change
