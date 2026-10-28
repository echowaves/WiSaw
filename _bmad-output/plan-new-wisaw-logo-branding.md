---
title: 'Adopt the new WiSaw logo across app branding'
type: 'feature'
ticket: ''
created: '2026-10-27'
status: 'built'
baseline_revision: 'd03b58acb1dabddb7b6ad44801b07dc9ebc97c17'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A new WiSaw logo (`wisaw_logo.png` at the repo root, added in `352b006b`) is committed but used nowhere. Every brand surface still ships the old 2021 artwork: iOS/Android icon, Android adaptive foreground, splash, web favicon all point at `assets/*.png`, and no logo image appears anywhere in the UI — the only in-app brand mark is the text "WiSaw" in the drawer footer.

**Approach:** Treat the new PNG as the single source of truth: move it under `assets/brand/` as the master, derive the four platform assets from it with ImageMagick (correct sizes, alpha where required), point the existing `app.config.js` keys at them, and add a logo image to the in-app brand surfaces. Native `ios/` and `android/` folders are git-ignored prebuild output, so they pick the new art up on the next `expo prebuild`; nothing is hand-edited there.

**Decisions settled during planning (human):** the splash and adaptive-icon field becomes the logo's own navy `#01122D` rather than today's white; the logo appears in the drawer footer and centred at the top of the Terms / first-run card; `MAIN_COLOR` stays orange and the cyan-versus-orange brand-colour question is recorded as deferred work, not acted on.

## Boundaries & Constraints

**Always:** Keep the four existing `app.config.js` keys pointing at `assets/` paths; keep every derived asset within Expo's documented size/channel expectations (opaque square iOS icon, transparent adaptive foreground with the mark inside the ~66% safe zone); preserve the current file names so no other config or CI change is needed.

**Never:** No changes to `ios/`, `android/`, or `dist/` (generated). No marketing screenshots in `assets/ios/`. No redesign of the logo, no colour-token work, no new image dependencies (`expo-image` stays out), no backend repo edits.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| iOS icon build | `expo prebuild -p ios` reads `icon` | Full-bleed opaque square, no transparency, logo fills the frame edge-to-edge after the black source frame is cropped away | Build fails loudly if the file is missing or has alpha |
| Android adaptive icon | Launcher masks to circle/squircle | Mark fully visible inside the circular mask, nothing important clipped at the corners | n/a |
| Splash | Cold launch, `resizeMode: contain` | Logo centred on a background that matches its own field; no hard-edged box visible against the splash background colour | n/a |
| Web favicon | `expo export -p web` | 48×48 (plus Expo-derived sizes) renders recognisably at 16px | n/a |
| In-app logo | Drawer open, light and dark theme | Logo sized to fit its container, no stretch or layout shift of the rows above it | n/a |

</frozen-after-approval>

## Code Map

- `app.config.js` -- lines 92-94 (`android.adaptiveIcon.foregroundImage`, `backgroundColor: '#FFFFFF'`), 228 (`web.favicon`), 231 (`icon`), 234-238 (`splash.image`, `resizeMode: 'contain'`, `backgroundColor: '#ffffff'`). The only four references to branding assets in the whole repo.
- `wisaw_logo.png` -- new master, 1254×1254, **opaque RGB (no alpha)**: a rounded-square tile on a pure-black frame. Content bbox is +59+54 / 1134×1140; palette navy `#01122D`, near-black, cyan `#26D1D3`.
- `assets/icon.png` + `assets/adaptive-icon.png` -- currently the **same file** (identical md5), 1024×1024 with alpha; `splash.png` 1242×2436; `favicon.png` 48×48.
- `app/(drawer)/_layout.tsx` -- line 349 `<Text style={styles.appName}>WiSaw</Text>` inside `styles.versionContainer` (line 75) at the foot of the custom drawer, above version/build text; styles at line 88 use `CONST.MAIN_COLOR`. `Image` is **not** yet imported from `react-native`; imports start at line 1 and relative asset paths from here are `../../assets/…`.
- `package.json` -- `build-ios-for-simulator` / `build-android-for-simulator` do `rm -rf <dir> && npx expo prebuild`, which is how native icon/splash sets are (re)generated; `lint` runs `ts-standard`. No `test` script exists.
- `src/consts.js:36` -- `MAIN_COLOR = '#EA5E3D'` (orange), unrelated to the new logo's palette.

## Tasks & Acceptance

**Execution:**
- [x] `assets/brand/wisaw-logo.png` -- move the root master here and delete `wisaw_logo.png`, keeping it untouched at 1254×1254 as the derivation source.
- [x] `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`, `assets/favicon.png` -- regenerate from the master with ImageMagick (full-bleed opaque 1024 icon and adaptive foreground, centred emblem splash at 1242×2436, 48×48 favicon) via the new `assets/brand/build-brand-assets.sh`.
- [x] `src/types/assets.d.ts` -- ambient `*.png` / `*.jpg` module declarations so asset imports type-check.
- [x] `app.config.js` -- add `BRAND_FIELD` and point the adaptive-icon and splash backgrounds at it; key names and asset paths otherwise untouched.
- [x] `app/(drawer)/_layout.tsx` and `src/screens/TandC/index.tsx` -- show the mark in the drawer footer and as the Terms / first-run hero, using plain `react-native` `Image` (the `expo-cached-image` rule covers network images, not bundled assets).

**Acceptance Criteria:**
- Given the repo after the change, when `npx expo config --type prebuild` runs, then it resolves successfully and every branding key points at an existing file.
- Given the derived assets, when inspected with `magick identify`, then icon is 1024×1024 opaque, adaptive foreground is square with alpha and its mark inside the central 66%, splash is 1242×2436, favicon is 48×48. -- **Partial:** sizes pass; the adaptive foreground is full-bleed opaque instead of alpha-padded, see Implementation Notes item 1 and deferred work.
- Given a circular mask applied to the adaptive foreground, when previewed, then no part of the mark is clipped. -- **Pass** (mark outer radius 0.39 of canvas vs 0.5 mask).
- Given the drawer in light and dark theme, when opened, then the logo renders without distorting the rows above it and `npm run lint` stays clean.

## Implementation Notes

Oneshot route: single goal, four asset files plus two small config/UI edits, no schema or cross-layer risk.

### What shipped

- `assets/brand/wisaw-logo.png` -- master moved out of the repo root by `git mv` (history preserved), untouched at 1254x1254. Never imported by app code, so it costs nothing in the JS bundle (`dist/assetmap.json` only lists `require`d assets).
- `assets/brand/build-brand-assets.sh` -- checked-in generator for every derived asset, so the binaries are reproducible instead of hand-poked. Intermediates go to a temp file.
- `assets/icon.png` / `assets/adaptive-icon.png` -- 1024x1024 **opaque**, artwork full-bleed (same file, as before).
- `assets/splash.png` -- 1242x2436 transparent canvas with the circular emblem centred at 620px; the navy field comes from `splash.backgroundColor`.
- `assets/favicon.png` (48x48) and `assets/brand/wisaw-mark.png` (256x256) -- the feathered circular emblem, which reads better at small sizes than the full rounded tile with its black source frame.
- `app.config.js` -- `BRAND_FIELD = '#01122D'` feeds `android.adaptiveIcon.backgroundColor` and `splash.backgroundColor`; key names and asset paths unchanged.
- `app/(drawer)/_layout.tsx` -- 56pt mark above the "WiSaw" text in the drawer footer; `src/screens/TandC/index.tsx` -- the first-run/Terms hero now shows a 72pt mark instead of the generic shield icon.
- `src/types/assets.d.ts` -- ambient `*.png` / `*.jpg` module declarations typed as `ImageSourcePropType`; the repo had none, so importing an asset directly was previously untypeable.

### Decision log (deviations from the plan above)

1. **Adaptive icon is full-bleed, not safe-zone padded.** The planned "artwork scaled into the central 66% on a transparent canvas" produced a visible picture-in-picture seam: the artwork carries its own dark rounded tile and corner vignette, which reads as a box against a flat field at any padding colour. Full-bleed keeps the artwork exactly as designed and matches iOS pixel-for-pixel. Measured consequence: the outermost bright pixel of the mark sits at r = 0.39 of the canvas, so a circular launcher mask (r = 0.5) clips nothing; it is outside Google's conservative 0.33 "safe zone" guideline, which only bites if a launcher adds its own inset. `adaptiveIcon.backgroundColor` stays navy as the fallback for launchers that do inset -- harmless while the foreground is opaque.
2. **Splash/favicon/in-app use the feathered circular emblem**, not the full tile: the master's pure-black frame would render as a dead black square at 48-72pt and against the navy splash field.
3. **`adaptiveIcon.backgroundColor` / `splash.backgroundColor` are a new shared constant** rather than inlined hexes, so the brand field has one home.
4. **Drawer mark style is a module-level `ImageStyle` const**, not part of `createStyles`: `StylesShape = ReturnType<typeof StyleSheet.create>` widens every entry to `ViewStyle | TextStyle | ImageStyle`, which `<Image>` rejects (TS2769). Themed styles stay where they were.
5. **`MAIN_COLOR` stays orange** per the human decision; recorded in `_bmad-output/deferred-work.md`.

## Plan Change Log

- Post-planning (implementation): added `assets/brand/build-brand-assets.sh` and `src/types/assets.d.ts`, neither of which was in the task list; both proved necessary (reproducible binaries, asset typing). Adaptive-icon treatment changed from padded-transparent to full-bleed -- see Implementation Notes item 1.

## Review Triage Log

Quick lens run inline on the working tree against `d03b58ac`, then repeated by a delegated code-review subagent that was launched in parallel and reported after the first commit landed (it took ~50 minutes, which is why the initial pass claimed no reviewer was available). The delegation earned its keep: it caught an asset-pipeline bug the inline pass and every visual check had missed.

- **Fixed during verification:** `<Image style={styles.logoMark}>` failed `tsc` with TS2769 because `StylesShape` widens style entries to `ViewStyle | TextStyle | ImageStyle`. Replaced with a module-level `const logoMarkStyle: ImageStyle` (Implementation Notes item 4).
- **Checked, clean:** no remaining reference to the old root `wisaw_logo.png` outside this plan; no other Expo config file exists; no test, spec or snapshot references `heroIcon` or `shield-checkmark`; `src/types/assets.d.ts` is the only ambient image declaration in the repo, so it cannot collide with an existing one, and `tsconfig.json` has no `include`, so it is picked up by default; nothing under `ios/`, `android/` or `dist/` changed (all git-ignored).
- **Found by the delegated reviewer (arrived after the commit) and fixed -- real bug, high severity.** The emblem feather never produced an alpha channel: the inline `radial-gradient` mask carries an opaque matte, so `-compose CopyOpacity` copied "fully opaque" and ImageMagick dropped the channel. Every "transparent" derived asset (`wisaw-mark.png`, `favicon.png`, and the emblem region of `splash.png`) shipped as a hard-edged opaque square of artwork, which would have rendered as a dark box behind the mark on the light-theme drawer and Terms hero. Fixed by writing a matte-free mask to disk first, shaping it as an opaque core (r = 420) with a ~90px feathered rim so the mark keeps full colour instead of being washed out, and adding `-alpha off` for the iOS icon. Verified: `icon.png`/`adaptive-icon.png` are `TrueColor` opaque; `favicon.png`, `wisaw-mark.png`, `splash.png` are `TrueColorAlpha` with corner alpha 0 and mark-region alpha >= 0.97; previews over light, drawer-dark and brand-navy backgrounds show no seam.
- **Not covered:** no runtime check -- the app was not launched and `expo prebuild` was not run in this session, so the drawer footer's added 66pt of height and the native icon/splash output are unverified on a device or simulator.

## Design Notes

The recipe that actually shipped lives in `assets/brand/build-brand-assets.sh`; this is the reasoning behind it.

- The master is an opaque rounded tile sitting on a pure-black frame, so any padded composition inherits a dark vignette that reads as a pasted box. Full-bleed avoids the problem entirely; padding was tried at four scales and with blurred, flat-navy, and feathered-circle bases before being rejected (see Implementation Notes item 1).
- The circular emblem is a 1000x1000 crop centred on the mark's own bounding box (`+127+31` in master coordinates), masked by a white disc of radius 420 blurred by 50 so it fades to nothing before the artwork's tile edge. That is what makes it usable at 48pt and on any background colour.
- Feather masks must be written as matte-free grayscale files: an inline `radial-gradient` carries an opaque matte, and `CopyOpacity` copies that matte rather than the gradient, silently producing an opaque square.
- Splash uses `resizeMode: 'contain'` against a transparent full-size canvas, so the emblem stays centred at any device aspect ratio and the colour comes from config rather than being baked in twice.

## Verification

**Commands:**
- `magick identify assets/icon.png assets/adaptive-icon.png assets/splash.png assets/favicon.png` -- expected: 1024×1024 opaque, 1024×1024 alpha, 1242×2436, 48×48.
- `HOME="$TMPDIR/fakehome" CI=1 npx expo config --type prebuild` -- expected: exit 0 and the resolved `icon`, `adaptiveIcon.foregroundImage`, `splash.image`, `web.favicon` values (the sandbox needs a writable HOME for `~/.expo/state.json`).
- `npm run lint` -- expected: no new errors from `app/(drawer)/_layout.tsx`.

**Manual checks:**
- Composite the adaptive foreground over the configured background colour, mask it to a circle, and eyeball that the mark survives the mask.
- Confirm `git status` shows no changes under `ios/`, `android/`, or `dist/`.

## Verification Results (2026-10-28)

- `magick identify` -- `icon.png` 1024x1024 opaque, `adaptive-icon.png` identical, `splash.png` 1242x2436 with alpha, `favicon.png` 48x48, `wisaw-mark.png` 256x256. Bright-pixel bbox of the adaptive foreground is `560x608+254+201`, i.e. its furthest point sits at r = 0.39 of the canvas: inside a circular launcher mask (r = 0.5), outside Google's conservative 0.33 safe zone (see deferred work).
- `HOME="$TMPDIR/fakehome" CI=1 npx expo config --type prebuild` -- exit 0, splash and adaptive-icon backgrounds resolve to `#01122D`.
- `npx ts-standard <touched files>` -- only the two `explicit-function-return-type` errors that the baseline file already produced at `src/screens/TandC/index.tsx:38/111` (now 40/113). No new lint output.
- `npx tsc --noEmit` -- three errors, all pre-existing in files this change does not touch (`app/_layout.tsx` x2, `src/components/AppHeader/index.tsx`). The one error this change introduced is fixed.
- Visual: emblem previews at 48/56/72pt over the drawer background and at splash scale on navy; mark and dot survive a circular mask with ~23% margin.
- `git status` -- nothing under `ios/`, `android/`, or `dist/`.
