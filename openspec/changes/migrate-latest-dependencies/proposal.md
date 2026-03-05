## Why

The project's dependencies have drifted behind their latest releases. Staying current reduces security vulnerabilities, ensures compatibility with the latest Expo SDK and React Native tooling, and gives access to bug fixes and performance improvements. Several dependencies also use range specifiers (^ and ~) which should be pinned to exact versions per project convention.

## What Changes

- Update all production dependencies (`dependencies`) to their latest stable versions with exact version pinning
- Update all development dependencies (`devDependencies`) to their latest stable versions with exact version pinning
- Remove `^` and `~` version prefixes from all dependency entries to enforce exact versioning
- Resolve any breaking API changes introduced by major version bumps
- Validate that the app builds and runs correctly on iOS, Android, and Web after the migration

## Capabilities

### New Capabilities
_None — this is an infrastructure/maintenance change with no new user-facing capabilities._

### Modified Capabilities
_None — no spec-level behavior changes. All existing features should continue to work identically after the migration._

## Impact

- **package.json**: All dependency versions updated, range prefixes removed
- **package-lock.json**: Fully regenerated with new dependency tree
- **Source code**: Potential breaking changes from major version bumps may require code adjustments across screens, components, and utility modules
- **Build configuration**: `app.config.js`, `babel.config.js`, `metro.config.js` may need updates for new SDK requirements
- **Platforms**: iOS, Android, and Web builds must be validated
- **CI/CD**: EAS build configuration may need adjustment for new Expo SDK version
