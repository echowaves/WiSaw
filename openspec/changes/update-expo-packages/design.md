## Context

The app depends on three packages authored by the same ecosystem (`expo-cached-image`, `expo-storage`, `expo-masonry-layout`) that are currently behind their latest releases. The app also carries an unused `expo-image` dependency. This change performs a straightforward version bump and dependency cleanup with no architectural modifications.

Current versions:
- `expo-cached-image`: 54.0.7
- `expo-storage`: 54.0.8
- `expo-masonry-layout`: 1.1.11
- `expo-image`: 55.0.6 (unused)

## Goals / Non-Goals

**Goals:**
- Update `expo-cached-image`, `expo-storage`, and `expo-masonry-layout` to their latest published versions
- Remove the unused `expo-image` package
- Verify no breaking API changes affect existing imports

**Non-Goals:**
- Refactoring any consuming code beyond what's required for compatibility
- Adding new features or capabilities from the updated packages
- Updating any other dependencies

## Decisions

1. **Update via npm and pin exact versions** — The project convention is exact versions (no `^` or `~`). Run `npm install <pkg>@latest --save-exact` for each package to get the latest version pinned exactly.

2. **Remove expo-image by uninstalling** — Use `npm uninstall expo-image` since no source files import it. This is a clean removal with zero code changes.

3. **No code changes expected** — These packages maintain backward-compatible APIs. If a breaking change is detected during implementation, handle it in the affected files at that point.

## Risks / Trade-offs

- **[Breaking API change in new version]** → Mitigated by reviewing changelogs before installing and testing imports after update. The consuming code uses standard `CachedImage`, `CacheManager`, `Storage`, and `ExpoMasonryLayout` exports which are stable APIs.
- **[Version incompatibility with Expo 55 SDK]** → Low risk since these are community packages that track Expo SDK releases. Verify compatibility after install.
- **[Rollback needed]** → Simple rollback: revert `package.json` and `package-lock.json` changes, run `npm install`.
