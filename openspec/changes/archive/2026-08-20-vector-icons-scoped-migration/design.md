# Design: Migrate @expo/vector-icons to @react-native-vector-icons/* scoped packages

## Context

- The app imports icons only as **named barrel imports** from `@expo/vector-icons` (61 sites, 6 families: `Ionicons`, `FontAwesome`, `FontAwesome5`, `MaterialIcons`, `MaterialCommunityIcons`, `AntDesign`). No subpath (`@expo/vector-icons/X`), no `/build/`, no aliased local names, no `createIconSetFrom*`, and **no FontAwesome boolean style props** (`solid`/`regular`/…) — all verified by search.
- `@expo/vector-icons@15.1.1` (current pin) is a frozen compatibility shim: its `createIconSet` attaches a `static font = { [fontName]: assetId }` that the app spreads into `useFonts`.
- The v13 scoped packages (`@react-native-vector-icons/<family>@13.1.2`, all confirmed on npm) **remove the `.font` property** and instead use **dynamic font loading** via `expo-font` (SDK ≥ 54; WiSaw is 57). Each package exports the component as a **named + default** export (`export const X` and `export default X`). The codemod rewrites named barrel imports to per-family **default** imports.
- The one place the app couples to the old API is `app/_layout.tsx` lines ~167–174: `const [fontsLoaded, fontError] = useFonts({ ...FontAwesome.font, ...FontAwesome5.font, ...MaterialIcons.font, ...Ionicons.font, ...AntDesign.font })`. **`fontsLoaded`/`fontError` are declared but never read, and the root `return` renders unconditionally** (no `if (!fontsLoaded) return …`, no `SplashScreen`). This block is already dead code — it preloads fonts that nothing gates on.
- The official codemod (`@react-native-vector-icons/codemod@13.2.1`) has an **Expo path** that auto-detects `@expo/vector-icons` in `package.json`, requires a **clean git tree**, rewrites imports, rewrites `package.json` (removes `@expo/vector-icons`, adds only the families actually imported), and — for dev builds — prints plugin instructions. It does **not** touch the `useFonts`/`.font` block. It writes `^<version>` specifiers and reformats `package.json` via `JSON.stringify(…, 2)`.
- Repo rules (openspec/config.yaml): **exact version pins** (no `^`/`~`), npm, cyclomatic complexity ≤ 8, never perform git operations (user commits), `.env` never committed.

## Goals / Non-Goals

**Goals:**
- Replace the deprecated `@expo/vector-icons` dependency with the 6 independently-versioned `@react-native-vector-icons/*` scoped packages at exact pins, with zero user-visible icon/behavior change.
- Keep the migration mechanical and reviewable; use the official codemod for the import rewrite and handle the single non-import coupling (`useFonts`/`.font`) by hand.
- Leave a verified-clean state: `expo-doctor` clean, `ts-standard` zero new, `tsc --noEmit` no new (icon-rename) errors, iOS + Android dev-client builds pass, manual regression pass.

**Non-Goals:**
- No icon-name changes or icon swaps (the codemod does not rename; any upstream rename is surfaced by `tsc` and fixed by hand if found).
- No switch to `/static` imports (see D1).
- No changes to `app.config.js` plugins (dynamic imports need none).
- No adoption of the other deferred candidates (`expo-media-library` OO API, TS 6, Android precompiled headers).
- No removal of `expo-font` (it stays a direct dep and is required by v13 dynamic loading).

## Decisions

### D1 — Dynamic (default) imports, NOT `/static`

Use the codemod's default (dynamic) import style: `import Ionicons from '@react-native-vector-icons/ionicons'`.

- **Why:** WiSaw ships **OTA updates** (EAS Update, `runtimeVersion: appVersion`). Dynamic imports bundle the `.ttf` into the JS bundle and register it at runtime via `expo-font`, so icon fonts remain **OTA-swappable** and require **no config plugins** and **no native rebuild** for font changes. `/static` embeds fonts in the native binary, removes them from the JS bundle, and then cannot be updated by an OTA release.
- **Dev-client note:** in a dev build the `.ttf` is also copied into the native binary by autolinking, so a dynamic import ships the font twice (native + JS). That duplication is harmless and is the documented trade-off for keeping OTA capability. (The alternative to de-dupe without `/static` — excluding the package from autolinking — is a `react-native.config.js` change that adds complexity for a dev-only benefit; not worth it.)
- **Mechanism:** the codemod **auto-detects a dev build** (WiSaw has `expo-dev-client` + `android/`+`ios/`), so in non-interactive mode it would **default to `/static`**. We must therefore invoke it explicitly with **`--dynamic`** to get the default imports. This is the single most important invocation detail.
- *Alternative considered:* `/static`. Rejected — breaks OTA font updates, requires adding 6 packages to the `plugins` array + `prebuild --clean` + rebuild, and is the wrong default for an OTA-released app.

### D2 — Official codemod for the import rewrite; hand-fix only the `useFonts`/`.font` block

Run `npx @react-native-vector-icons/codemod --dynamic` at the repo root. It:
- rewrites all 61 named barrel imports to per-family default imports (preserving local names — there are none aliased);
- maps `MaterialCommunityIcons` → `@react-native-vector-icons/material-design-icons` (the actual npm package name — not `material-community-icons`);
- runs the FontAwesome boolean-style-prop transform (no-ops here, none in use);
- rewrites `package.json` (see D4) and prints the dev-build plugin note (ignored under D1).

It does **not** rewrite the `useFonts({ ...X.font })` block in `app/_layout.tsx`. That is the only manual code edit (D3).

- *Why the codemod over a hand/sed rewrite:* it is the maintainer-sanctioned path, encodes the exact family→package mapping (including the `material-design-icons` surprise), preserves local names, and is the same tool every Expo app is expected to use. A regex rewrite would risk the `MaterialCommunityIcons`→`material-design-icons` mapping and default-vs-named export shape.

### D3 — Remove the dead `useFonts`/`.font` block and its `expo-font` import in `app/_layout.tsx`

After the codemod, `app/_layout.tsx` would import 6 scoped components but still contain `useFonts({ ...FontAwesome.font, ... })`, where `.font` no longer exists in v13 → **runtime `undefined` spread / type error**. Since `fontsLoaded`/`fontError` are never consumed and the root render is unconditional, the block is dead code. **Delete the `useFonts` call, the `fontError`/`fontsLoaded` bindings, and the now-unused `import { useFonts } from 'expo-font'` line.** Keep the `expo-font` **package** (direct dep + plugin) — v13 dynamic loading depends on it.

- *Why delete rather than adapt:* v13 deliberately removed the `.font` API in favor of automatic dynamic loading (fonts self-register on first icon render). Rebuilding a manual preload list would add startup work for a gate that doesn't exist and duplicate what dynamic loading already does. Deletion is the minimal, behavior-preserving change (the block already did nothing observable).
- *Alternative considered:* keep a hand-written `useFonts` map using the v13 `fonts/*.ttf` exports. Rejected — more code, still dead, and re-couples startup to fonts the new model loads lazily.

### D4 — Normalize `package.json` to exact pins + original formatting after the codemod

The codemod writes the new deps as `^13.1.2` and rewrites the whole file via `JSON.stringify(packageJson, null, 2)` (reordering/normalizing whitespace). To honor the repo **exact-pin** rule and keep the diff minimal:
- set all 6 new deps to exact `13.1.2`;
- restore the original dependency ordering and 2-space formatting the file already uses;
- confirm `@expo/vector-icons` is gone and nothing else changed.
Then `npm install` to sync `package-lock.json` (exact pins resolve cleanly).

- *Why manual normalization:* the codemod's `^` + reformat would (a) violate the exact-pin rule and (b) produce a noisy whole-file diff. Normalizing keeps the reviewable diff to the 6 added lines + 1 removed line.
- *Alternative considered:* accept the codemod's `^13.1.2`. Rejected — violates the explicit config rule and the established convention from `upgrade-to-expo-sdk-57`.

### D6 — v13 FontAwesome5 requires `iconStyle`; fix all 56 call sites with the legacy-resolved style (discovered during apply, 2026-08-19)

The proposal assumed the FontAwesome style-prop transform was a no-op ("no call sites use the affected props"). That was true of the *old* boolean props, but v13 changed FA5's API: `Props` is now a **discriminated union** that effectively **requires** `iconStyle: 'regular' | 'solid' | 'brand'` (the other 5 families are unaffected — verified 0 `iconStyle` refs in their d.ts). Omitting it is a type error, and at runtime v13 renders the **Regular** face by default — blank (with a `noSuchGlyph` warning) for solid-only glyphs.

- **Blast radius:** 56 FA5 JSX sites in 26 files (only 1 is `.tsx`, so `tsc` caught just 4; the 25 `.js` files are not type-checked and would have failed silently), plus 2 shared components that render FA5 via a variable (`ScreenIconTitle` in `src/theme/screenIcons.tsx`, `EmptyStateCard`).
- **Behavior-preserving value:** the legacy `@expo/vector-icons@15.1.1` FA5 set was multi-style with `defaultStyle: 'regular'` + per-glyph fallback (metadata order brands → regular → solid), and its regular family is set-equal to v13's. Simulating that resolution for the 37 distinct FA5 names used in WiSaw gives: **24 names → `solid`** (camera, check, chevron-right, home, info-circle, lock, plus, qrcode, share, share-alt, times, user-friends, user-secret, user-shield, users, video, water, mobile-alt, user-plus, link, exclamation-triangle, exclamation-circle, shield-alt, key) and **13 → `regular`** (check-circle, clock, comments, edit, eye, eye-slash, hourglass, images, moon, paper-plane, sun, user, user-circle); none are brand.
- **Implementation:** literal `name='x'` sites get a hardcoded `iconStyle='solid'|'regular'`. Sites whose name is an expression (ternaries, `card.icon` maps, `getThemeIcon`, `leftIconName`, `icon` props) use a small helper `fa5IconStyle(name)` (new file `src/utils/fa5IconStyle.js`) that encodes the regular-priority resolution. The two shared components pass `iconStyle` conditionally only when the component is FA5. One residual `as any` cast is needed where a name union spans both styles (`getThemeIcon`: `sun`/`moon` regular, `mobile-alt` solid) — runtime resolution is still per-glyph correct.
- **Scope note:** this extends the diff beyond the originally planned "mechanical import rewrites only." It is required for correctness (otherwise 50+ icons render blank) and keeps rendering identical to the pre-migration app. Surfaced to the user, who chose "fix all 56 sites."

### D5 — Verification gates (match the SDK-upgrade methodology)

Order: clean-tree check → baseline (`tsc --noEmit`, `ts-standard`) → codemod → manual `useFonts` edit → `package.json` normalize → `npm install` → `expo-doctor` + `expo install --check` (clean) → `ts-standard` (zero new) → `tsc --noEmit` (no new; any new error is an icon-name rename to fix by hand) → iOS dev-client build → Android dev-client build → manual regression pass (icons across drawer, waves hub, photo detail/pinch, friends, identity, empty states, modals). Each gate is a task in tasks.md.

## Risks / Trade-offs

- **[Upstream icon renames/removals between the 15.x fonts and v13 fonts]** (the codemod does not rename) → `tsc --noEmit` is the primary detector (icon `name` props are typed unions in v13); any error is fixed by hand to the new glyph name, then visually confirmed. Secondary: the regression pass.
- **[Dynamic font loading unavailable at runtime → icons blank]** → requires SDK ≥ 54 (WiSaw 57 ✓) and `expo-font` present (✓, direct dep + plugin). Mitigation: verify icons render on cold start on both simulators; an optional `setDynamicLoadingErrorCallback` can be wired if a failure is ever observed (not expected).
- **[Removing the `useFonts` block changes first-frame icon rendering]** → the block was already dead (no render gate on `fontsLoaded`), so there is no observable change; confirm icons appear at startup in the regression pass.
- **[Codemod rewrites `package.json` with `^` + reformat → noisy/invalid diff]** → D4 manual normalization; `git diff` review before commit.
- **[Codemod refuses to run on a dirty tree]** → Gate 1.1 enforces a clean tree (the repo is clean as of Phase 3 commit `6f93c035`).
- **[`MaterialCommunityIcons` maps to a differently-named package (`material-design-icons`)]** → documented here and in the proposal; the codemod handles the mapping; verify the installed package name in `package.json`/lock.
- **[Dev-build font duplication (native + JS) with dynamic imports]** → accepted, documented in D1; OTA capability is worth the minor bundle overlap.

## Migration Plan

1. **Gate 1.1 — Preconditions:** `git status` clean; capture baselines: `npx tsc --noEmit` (icon-name baseline) and `npx ts-standard` (lint baseline), stored in `$TMPDIR`.
2. **Run codemod:** `npx @react-native-vector-icons/codemod --dynamic` at repo root (network: npm cache workaround). Review the full import diff (61 files).
3. **Manual code edit:** `app/_layout.tsx` — remove the dead `useFonts`/`.font` block + the unused `expo-font` import (D3).
4. **Normalize `package.json`:** exact `13.1.2` pins, original formatting/ordering, `@expo/vector-icons` removed (D4).
5. **Install:** `npm install` (sync `package-lock.json`; exact pins).
6. **Gates:** `npx expo-doctor@latest` (clean) → `npx expo install --check` (clean) → `npx ts-standard` (zero new vs baseline) → `npx tsc --noEmit` (no new; fix any icon-rename by hand) → iOS dev-client build (`build-ios-for-simulator`) → Android dev-client build (JDK 17 + `-Xmx6g -XX:MaxMetaspaceSize=2g`) → manual regression pass (icon rendering across key screens, dark mode).
7. **Commit (USER):** per the Version Control rule, leave the final state uncommitted; provide a suggested message (e.g. `refactor: migrate @expo/vector-icons to @react-native-vector-icons scoped packages`).

**Rollback:** the change is a single commit — `git revert` restores `@expo/vector-icons@15.1.1` and all 61 original import lines. No persisted-data or native-config changes; OTA is unaffected (`runtimeVersion: appVersion`, existing clients keep their native build until the next release).

## Open Questions

_None._ All material ambiguities were resolved during research: import style (D1, dynamic for OTA), the `.font`/`useFonts` handling (D3, dead-code removal — verified `fontsLoaded` is unconsumed and render is unconditional), package naming (`material-design-icons`), exact-pin normalization (D4), and the codemod's clean-tree + `--dynamic` requirements.
