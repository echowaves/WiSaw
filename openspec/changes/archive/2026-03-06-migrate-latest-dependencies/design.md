## Context

WiSaw currently runs on Expo SDK 54 with React Native 0.81.5 and React 19.1.0. The dependency tree includes 87 production and 30 dev dependencies, many using range specifiers (`^`, `~`) rather than the project's convention of exact pinning. A major SDK upgrade cycle is available: Expo 55, React Native 0.84, and React 19.2.

Key version jumps:
- **Expo**: 54.0.25 → 55.0.5 (all `expo-*` packages move to 55.x namespace)
- **React Native**: 0.81.5 → 0.84.1 (3 minor versions)
- **React**: 19.1.0 → 19.2.4
- **react-native-gifted-chat**: 2.8.1 → 3.3.2 (major version bump)
- **react-native-get-random-values**: 1.11.0 → 2.0.0 (major version bump)
- **ESLint**: 8.57.1 → 10.0.2 (major version bump, flat config migration)
- **Jest/babel-jest**: 29.7.0 → 30.2.0 (major version bump)

## Goals / Non-Goals

**Goals:**
- Update all dependencies to their latest stable versions
- Pin all dependencies to exact versions (remove `^` and `~` prefixes)
- Fix any breaking API changes from major version bumps
- Ensure the app builds and runs on iOS, Android, and Web
- Maintain all existing feature functionality

**Non-Goals:**
- Adding new features or capabilities
- Refactoring code beyond what's required for compatibility
- Migrating to a new architecture (e.g., New Architecture / Fabric) unless required by the SDK
- Upgrading the backend API

## Decisions

### 1. Use Expo's upgrade tooling for SDK migration
**Decision**: Use `npx expo install --fix` after updating the Expo SDK to automatically resolve compatible versions for Expo-ecosystem packages.
**Rationale**: Expo packages are tightly coupled to the SDK version. Manual version selection risks incompatibilities. The Expo CLI resolves the correct peer dependency matrix.
**Alternative**: Manual version pinning — rejected because the Expo 54→55 jump changes the versioning scheme for all expo-* packages (from semver to SDK-aligned 55.x).

### 2. Handle ESLint 8→10 migration separately
**Decision**: Keep ESLint at 8.x for now, only update patch/minor within the 8.x line. The flat config migration (ESLint 9+) is a significant change that warrants its own change proposal.
**Rationale**: ESLint 9+ removes `.eslintrc` support and requires flat config. The project uses `ts-standard` which may not yet support flat config. This is a separate migration effort.
**Alternative**: Upgrade to ESLint 10 now — rejected due to scope creep and risk of breaking linting setup.

### 3. Handle Jest 29→30 migration cautiously
**Decision**: Upgrade Jest to 30.x only if `babel-preset-expo` and `react-test-renderer` are compatible. Fall back to 29.x if issues arise.
**Rationale**: Jest 30 has breaking changes in configuration and module resolution. The project has minimal test infrastructure, so risk is low but compatibility must be verified.

### 4. Exact version pinning strategy
**Decision**: Use `npm install --save-exact` for all installs. After the Expo upgrade resolves versions, manually strip any remaining `^`/`~` prefixes from package.json.
**Rationale**: Project convention requires exact versions. `--save-exact` ensures npm writes exact versions, but `expo install --fix` may reintroduce range specifiers.

### 5. react-native-gifted-chat 2.x→3.x
**Decision**: Upgrade and adapt to the new API. Review changelog for breaking changes in component props and message format.
**Rationale**: The Chat screen is a core feature. Staying on 2.x while the rest of the ecosystem moves forward creates increasing incompatibility risk.

## Risks / Trade-offs

- **[Expo SDK 55 breaking changes]** → Follow the Expo 55 changelog and migration guide. Test all native modules after upgrade.
- **[React Native 0.84 incompatibility]** → Third-party native modules may not yet support 0.84. Check compatibility of `react-native-gifted-chat`, `react-native-zoomable-view`, and `react-native-keyboard-controller`.
- **[expo-cached-image compatibility]** → This is a community package (v54.0.7) that may not have an SDK 55-compatible release. May need to fork or find an alternative.
- **[expo-storage compatibility]** → Only moves from 54.0.8 → 54.0.9, may be SDK-54-specific. Verify it works with Expo 55.
- **[EAS Build configuration]** → `eas.json` may need updates for new SDK. Build profiles should be tested before production deployment.
- **[Rollback plan]** → Git branch provides full rollback. Keep `package-lock.json` from before the upgrade available for quick revert.

## Migration Plan

1. Create a dedicated branch for the migration
2. Update `expo` to 55.0.5 first, then run `npx expo install --fix`
3. Update remaining non-Expo dependencies manually with `--save-exact`
4. Strip any remaining range prefixes from package.json
5. Fix compilation errors and breaking API changes
6. Test on iOS simulator, Android emulator, and Web
7. Run lint and existing tests
8. Deploy via EAS Update to a test channel before production
