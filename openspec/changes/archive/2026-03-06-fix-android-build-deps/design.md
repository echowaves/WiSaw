## Context

The Android release build fails during Gradle dependency resolution. Three packages were updated beyond what Expo 55 SDK supports, causing native module incompatibilities. The most critical is `@react-native-async-storage/async-storage@3.0.1` whose Android native module artifact doesn't exist in any Maven repository yet.

## Goals / Non-Goals

**Goals:**
- Fix the Android release build by downgrading 3 packages to Expo 55-compatible versions
- Ensure all packages pass `npx expo install --check` without warnings for these dependencies

**Non-Goals:**
- Upgrading to Expo 56 or newer SDK
- Modifying any application code
- Addressing other dependency warnings unrelated to the build failure

## Decisions

1. **Use Expo-recommended versions** — Run `npx expo install --fix` or manually install the exact versions Expo 55 expects: async-storage@2.2.0, netinfo@11.5.2, get-random-values@~1.11.0. These are the versions tested and validated with the SDK.

2. **Pin exact versions** — Per project convention, use `--save-exact` to avoid `^` or `~` prefixes in package.json.

3. **No code changes** — These are backward-compatible downgrades within the same major API surface. The consuming code uses standard APIs that haven't changed between versions.

## Risks / Trade-offs

- **[Missing features from newer versions]** → Acceptable trade-off. The newer versions were installed prematurely and don't work with the current native binary. Features can be adopted when upgrading to a compatible Expo SDK.
- **[Rollback]** → Simple: revert package.json and package-lock.json, run `npm install`.
