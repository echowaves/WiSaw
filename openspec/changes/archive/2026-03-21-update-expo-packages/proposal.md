## Why

21 Expo packages are behind the versions recommended for the installed Expo SDK 55. Running mismatched versions risks runtime bugs, build failures, and incompatibilities that worsen over time. Updating now keeps the dependency tree healthy and unblocks Expo Go compatibility.

## What Changes

- Update 21 Expo packages in `package.json` to their SDK 55-compatible versions (exact versions, no `^` or `~`)
- Run `npm install` to regenerate `package-lock.json`
- Run Codacy/trivy security scan on updated dependencies

## Capabilities

### New Capabilities

(none — no new features introduced)

### Modified Capabilities

(none — no spec-level behavior changes, purely dependency version bumps)

## Impact

- `package.json` — 21 dependency version fields updated
- `package-lock.json` — regenerated
- All platforms (iOS, Android, Web) — updated native modules via Expo managed workflow
