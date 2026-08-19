# Proposal: Migrate @expo/vector-icons to @react-native-vector-icons/* scoped packages

## Why

`@expo/vector-icons` (15.1.1) is the deprecated icon API; the `react-native-vector-icons` maintainers have moved all icon families to independently versioned scoped packages (`@react-native-vector-icons/<family>`, v13) with per-font Expo config plugins and an official codemod. SDK 56+ no longer re-exports the umbrella, so the app currently depends on a frozen 15.x line. This was explicitly deferred from `upgrade-to-expo-sdk-57` (design.md "Resolved Questions": decided *immediate follow-up*) to keep the SDK-upgrade diff reviewable — that change has now landed, so this is the scheduled next change.

## What Changes

- Run the official `@react-native-vector-icons/codemod` (v13.2.1) Expo path across the repo: 61 import sites in `app/`, `src/`, `src/components/` (path: `src/components/...` under `src/`) are rewritten from `import { X } from '@expo/vector-icons'` to per-family default imports.
- Icon families in use (6): `Ionicons`, `FontAwesome`, `FontAwesome5`, `MaterialIcons`, `MaterialCommunityIcons`, `AntDesign`. Note the codemod maps `MaterialCommunityIcons` → `@react-native-vector-icons/material-design-icons` (the actual package name on npm).
- **Dependency swap in `package.json`:** remove `@expo/vector-icons`; add 6 scoped packages at **exact pins** (`13.1.2`, verified on npm). The codemod writes `^13.1.2` + reformats `package.json` — both are reverted as part of the migration (repo exact-pin rule), and `expo-font`'s `FontProvider` is not affected.
- **Import style decision: dynamic (default) imports, NOT `/static`** — see design.md D1. WiSaw ships OTA updates (EAS Update, `runtimeVersion: appVersion`); dynamic imports keep icon fonts OTA-swappable and require no config plugins. The codemod's non-interactive default is `/static`, so it must be invoked with `--dynamic`.
- No icon-name changes, no behavior changes (icons render from the same glyphs/styles as before). Note (apply finding, design D6): v13 FA5 **requires** an explicit `iconStyle` prop — all 56 FA5 call sites + 2 shared components were updated with the legacy-resolved style via `src/utils/fa5IconStyle.js`.

## Capabilities

### New Capabilities
_None — this is an infrastructure/maintenance change with no new user-facing capabilities._

### Modified Capabilities
_None — no spec-level behavior changes. All existing features should continue to work identically after the migration (icons render from the same font files, same glyph names, same component props)._

## Impact

- **Code:** 61 files (4 in `app/**`, 57 in `src/**` spanning `src/components/**`, `src/screens/**`, `src/theme/screenIcons.tsx`) — import-line rewrite, plus `iconStyle` added to 56 FA5 call sites (design D6) and a new helper `src/utils/fa5IconStyle.js`. Top-level `components/`, `plugins/`, `scripts/` verified clean (no import sites).
- **Dependencies:** `- @expo/vector-icons@15.1.1`; `+ @react-native-vector-icons/{ant-design,fontawesome,fontawesome5,ionicons,material-design-icons,material-icons}@13.1.2` (exact pins). `package-lock.json` regenerated.
- **Native config:** none — dynamic imports need no `app.config.js` plugin entries and no prebuild change; dev-client rebuilds still required for the new native modules to link (autolinking picks them up at build time).
- **Toolchain:** codemod requires a clean git tree (precondition gate); lint (`ts-standard`) must show zero new errors; `expo-doctor` and both dev-client builds must pass post-migration.
- **Out of scope:** `expo-media-library` OO API, TypeScript 6, Android precompiled headers (recorded in `upgrade-to-expo-sdk-57` tasks 5.2); any icon replacement/renaming.
