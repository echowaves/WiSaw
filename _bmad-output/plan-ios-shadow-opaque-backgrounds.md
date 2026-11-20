---
title: 'Silence iOS shadow-efficiency warnings with opaque fills'
type: 'bugfix'
ticket: ''
created: '2026-11-20'
status: 'in-review'
baseline_revision: '590acda718015d3372557a44d2a11b95e226ea8f'
route: 'full'
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

**Problem:** iOS logs `View #N ... has a shadow set but cannot calculate shadow efficiently` across the app. Fabric builds a cheap geometric `shadowPath` only when the view declaring `shadowColor`/`shadowOpacity` also has a background with alpha > 0.999 (`node_modules/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm:1058-1075`); otherwise it rasterises the shadow from pixels on every redraw — costly in scrolling photo lists.

**Approach:** Make the fill of every shadowed view opaque, picking replacement colours that composite to exactly what is painted today, and delete shadow props from translucent scrims and hairline tints where a shadow cannot be seen at all.

## Boundaries & Constraints

**Always:**
- Prove each colour change colour-preserving by compositing the current rgba over its real parent with `scripts/theme-contrast-audit.js` exports before writing it.
- Token edits keep `LIGHT_THEME`/`DARK_THEME` key parity (blocking check in `npm run audit:theme`).
- A shadow stays only where that view's own `backgroundColor` resolves opaque.

**Never:**
- No changes to geometry, radii, borders, `elevation`, z-index, or component structure.
- No new tokens, no `boxShadow` migration, no shadow-helper abstraction.
- Do not touch dead fragments `src/screens/PhotosList/index.js:159-170`, the commented header block in `src/screens/Feedback/index.js:193-205`, or `src/zxcvbn.js`. No `eas`/deploy commands; never edit `../WiSaw.cdk`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Light card on app background | Any `CARD_BACKGROUND` + shadow site | Pixels identical (`rgba(255,255,255,.95)` over `#ffffff` composites to `#ffffff`); fast `shadowPath` used | n/a |
| Dark disabled surface | Feedback submit button, dark mode | Identical pixels (`rgba(255,255,255,.1)` over `#121212` = `#2A2A2A`); `TEXT_DISABLED` stays 14.35:1 | n/a |
| Scrim chip over a photo | Close / pinch-header buttons | Fill unchanged; invisible shadow removed; no warning | n/a |
| Card over an image | `ExpandableThumb`, `Photo` expanded card | Opaque fill sits behind the covering image; no visible delta | n/a |

</frozen-after-approval>

## Code Map

- `src/theme/sharedStyles.js` — `LIGHT_THEME.CARD_BACKGROUND` :29, `DARK_THEME.disabledBackground` :160 (the two token edits); `SHARED_INTERACTIVE.headerButton` :424-438 and its factory twin (~:549) pair `INTERACTIVE_BACKGROUND` (light `rgba(234,94,61,.05)`) with a shadow. Reuse `getTheme(isDark)`; do not restructure the preset tree.
- `scripts/theme-contrast-audit.js` — exports `parseColor`, `composite`, `contrast`, `loadThemeTokens`; use for proof and as the gate.
- Already fine after the token swap — verify, don't edit: inline opaque fills merged into shadowed styles at `FriendCard/index.js:23`, `WaveCard/index.js:40`, `PhotoSelectionMode/index.js:238`, `IdentityHeaderIcon/index.js:64`, `PhotosListFooter/index.js:61`, `FeedModeToggleFAB/index.js:51`, `SearchFab/index.js:114`, `ScrollToTopFob/index.js:42`, `ErrorDetailModal/index.js:223`. Leave `photoInfoCardFlat` (`src/components/Photo/index.js:524-536`) alone — it already zeroes shadow and elevation.

## Tasks & Acceptance

**Execution:**
- [x] `src/theme/sharedStyles.js` -- set `LIGHT_THEME.CARD_BACKGROUND: '#FFFFFF'`, `DARK_THEME.disabledBackground: '#2A2A2A'` -- each is the exact composite of what it replaces; clears ~20 sites at once.
- [x] `src/theme/sharedStyles.js` -- delete `shadowColor/Offset/Opacity/Radius` (keep `elevation`) from `SHARED_INTERACTIVE.headerButton` and its factory twin -- 5%-tint chip over an opaque header; shadow invisible.
- [x] `src/components/AppHeader/index.tsx:74-88` -- same removal in its duplicated header-button style.
- [x] `src/components/ui/CloseButton.js:22-39`, `src/components/Photo/PinchableView.js:31-46` -- delete shadow props from the `rgba(0,0,0,.6)` scrim buttons -- black shadow behind a black scrim renders nothing.
- [x] `src/components/ModernHeaderButton/index.js:4-23` -- delete shadow props, leave the `rgba(255,255,255,0.9)` fill -- zero-delta alternative to forcing white over photos.
- [x] `src/screens/ModalInputText/index.js:43-52` -- add `backgroundColor: currentTheme.CARD_BACKGROUND` to `photoContainer` -- fully covered by a same-size image, and its shadow is heavy (opacity .7, radius 16).
- [x] `src/components/Photo/index.js:1320-1330` -- delete the inline `shadow*` props on that `LinearProgress` -- decorative glow on a 4px bar.

**Acceptance Criteria:**
- Given light mode with cards visible, when a screen renders, then card pixels match `590acda7` and no shadow advice is logged for card surfaces.
- Given dark mode, when Feedback renders its disabled submit button, then its colour is unchanged and no advice is logged.
- Given a scrim or tint chip over a photo, when it renders, then its fill is unchanged and it declares no `shadow*` props.
- Given completion, when `npm run audit:theme` runs, then it exits 0 with parity intact.

## Implementation Notes

- Implemented directly in this session: every subagent launch (explore, task) failed with `400 The requested model is not supported`, so step-03's "implement directly" fallback applies. Same reason the review lenses cannot run as children — see the handoff file beside this plan.
- Deviation from task 2: `SHARED_INTERACTIVE`'s themed factory twin (`getThemedStyles` → `interactive`) has **no** `headerButton` entry, so only the static preset at :424 needed the shadow removed. No other site pairs `INTERACTIVE_BACKGROUND` with a shadow except `AppHeader/index.tsx`, which task 3 covered.
- Files that looked offending in a raw scan were confirmed safe by reading their call sites: nine merge an opaque `backgroundColor` inline (listed in Code Map), and `Feedback/index.js:193-205` plus `PinchableView.js:127-140` are commented-out blocks. No edits made there, per the plan's Never list.
- Added `src/theme/__tests__/shadow-efficient-fills.test.js` (9 tests) to cover every row of the I/O matrix; it needs the repo's `/* eslint-env jest */` pragma to lint clean under `ts-standard`.
- Verification results: `npm run audit:theme` exit 0 with counts unchanged from baseline (`224 low, 59 hardcoded, 36 island`); `npx jest --watchman=false` → 110 passed, 1 failed, and that failure (`src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js:100`) reproduces on the untouched baseline tree; `ts-standard` clean on all changed files.
- The plan's `rg -c "shadow(Color|Opacity)" …` check exits 0 rather than 1 because `PinchableView.js:135` still contains a commented-out `// shadowOpacity: 0,`. The new test asserts per style block precisely so comments cannot satisfy or break it.

## Design Notes

Rule: **a shadow lives only on an opaque fill.** Where translucency is by design (scrims over photos, 5%-tint chips, hairline bars) the shadow contributed nothing observable, so it is removed rather than forcing a fill that would change pixels. Where translucency was incidental, the token becomes the colour it already composited to, computed with the audit tool's own `composite()`:

```js
composite(parseColor('rgba(255,255,255,0.95)'), parseColor('#ffffff'))  // -> #ffffff
composite(parseColor('rgba(255,255,255,0.1)'),  parseColor('#121212'))  // -> #2a2a2a
```

## Verification

**Commands:**
- `npm run audit:theme` -- expected: exit 0; advisory counts must not rise above baseline.
- `npx jest --watchman=false` -- expected: unchanged from baseline (their theme mocks already use `CARD_BACKGROUND: '#FFFFFF'`).
- `rg -c "shadow(Color|Opacity)" src/components/ui/CloseButton.js src/components/Photo/PinchableView.js src/components/ModernHeaderButton/index.js` -- expected: exit 1, no matches.
- `HOME="$TMPDIR" npx ts-standard <changed files>` -- expected: no new findings versus a same-baseline run of those files.

**Manual checks:**
- iOS simulator, light mode: Home feed, photo detail, Wave settings, Secret — cards identical to baseline, Metro console free of shadow advice for them. Report any remaining warning that names a style this plan did not cover.
