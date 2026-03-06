## ADDED Requirements

### Requirement: Package versions are current
The app SHALL use the latest published versions of `expo-cached-image`, `expo-storage`, and `expo-masonry-layout` with exact version pinning (no `^` or `~`).

#### Scenario: Updated packages resolve correctly
- **WHEN** `npm install` is run after updating package.json
- **THEN** all three packages install without errors and their latest versions are pinned exactly

### Requirement: Unused dependencies are removed
The app SHALL NOT include `expo-image` as a dependency since no source files import it.

#### Scenario: expo-image is absent from package.json
- **WHEN** the dependency update is complete
- **THEN** `expo-image` does not appear in `package.json` dependencies

#### Scenario: No remaining imports of expo-image
- **WHEN** searching the source tree for `expo-image` imports (excluding `expo-image-manipulator` and `expo-image-picker`)
- **THEN** zero matches are found
