---
title: 'Silence iOS shadow-efficiency warnings with opaque fills'
type: 'bugfix'
ticket: ''
created: '2026-11-20'
status: 'built'
baseline_revision: '590acda718015d3372557a44d2a11b95e226ea8f'
route: 'full'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 2
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
- No `boxShadow` migration, no shadow-helper abstraction. New tokens are allowed only for the pair named in the Plan Change Log — `CHIP_SUCCESS_FILL`, `CHIP_ERROR_FILL` — added to both theme tables; renegotiated by the human on 2026-11-21 so the photo chips can keep their glow on an opaque fill.
- Do not touch dead fragments `src/screens/PhotosList/index.js:159-170`, the commented header block in `src/screens/Feedback/index.js:193-205`, or `src/zxcvbn.js`. No `eas`/deploy commands; never edit `../WiSaw.cdk`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Light card on app background | Any `CARD_BACKGROUND` + shadow site | Pixels identical (`rgba(255,255,255,.95)` over `#ffffff` composites to `#ffffff`); fast `shadowPath` used | n/a |
| Dark disabled surface | Feedback submit button, dark mode | Identical pixels (`rgba(255,255,255,.1)` over `#121212` = `#2A2A2A`); `TEXT_DISABLED` stays 14.35:1 | n/a |
| Scrim chip over a photo | Close / pinch-header buttons | Fill unchanged; invisible shadow removed; no warning | n/a |
| Card over an image | `ExpandableThumb`, `Photo` expanded card | Opaque fill sits behind the covering image; no visible delta | n/a |
| Photo action / AI chips | Expanded photo, either mode | Fill becomes the exact composite of today's 8% tint over `CARD_BACKGROUND` (`#EBF3F8` light / `#232D30` dark; moderation chip `#FAECEE` / `#312426`); pixels identical; fast `shadowPath` used | n/a |
| Photo-over-text modal, thumb missing or loading | `ModalInputText`, dark mode | Fill is `BACKGROUND`, the colour already painted there — not `CARD_BACKGROUND`, which would lighten the box to `#1E1E1E` on `#121212` | n/a |

</frozen-after-approval>

## Code Map

- `src/theme/sharedStyles.js` — `LIGHT_THEME.CARD_BACKGROUND` :29, `DARK_THEME.disabledBackground` :160 (the two token edits); `SHARED_INTERACTIVE.headerButton` :424-438 and its factory twin (~:549) pair `INTERACTIVE_BACKGROUND` (light `rgba(234,94,61,.05)`) with a shadow. Reuse `getTheme(isDark)`; do not restructure the preset tree.
- `scripts/theme-contrast-audit.js` — exports `parseColor`, `composite`, `contrast`, `loadThemeTokens`; use for proof and as the gate.
- The four chips left standing: `PhotoActionButtons/index.js:192 actionButton` (applied at :41, :69, :101, :118, :143), `Photo/index.js:316 addCommentButton`, `:437 aiTag`, `:458 aiModerationTag`. All four build styles through a private `createStyles(theme)` (:19 and :586 respectively) with **no `isDark` in scope**, which is why the fill must be a theme token rather than an inline pair. Their parent surface is `CARD_BACKGROUND`, so that is what each composite was taken against.
- `src/screens/ModalInputText/index.js` — container is `currentTheme.BACKGROUND` (:39); `photoContainer` renders bare whenever `isValidImageUri(photo.thumbUrl)` is false or the image is still loading (:199), so its fill must match `BACKGROUND`, not `CARD_BACKGROUND`.
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

**Execution (iteration 2 — the four chips above still logged advice at `534182fe`):**
- [x] `src/theme/sharedStyles.js` -- add `CHIP_SUCCESS_FILL: '#EBF3F8'` to `LIGHT_THEME` and `'#232D30'` to `DARK_THEME`; `CHIP_ERROR_FILL: '#FAECEE'` / `'#312426'` -- each the exact composite of the 8% tint it replaces over that theme's `CARD_BACKGROUND`.
- [x] `src/components/PhotoActionButtons/index.js:193`, `src/components/Photo/index.js:317`, `:438` -- replace `` `${theme.STATUS_SUCCESS}15` `` with `theme.CHIP_SUCCESS_FILL`; leave the `${…}40` / `${…}30` border alphas and every `shadow*` prop untouched.
- [x] `src/components/Photo/index.js:459` -- same swap using `theme.CHIP_ERROR_FILL`.
- [x] `src/screens/ModalInputText/index.js:44` -- change `photoContainer`'s fill from `CARD_BACKGROUND` to `currentTheme.BACKGROUND`, the colour already painted there (triage row 2).
- [x] `src/theme/sharedStyles.js:32` -- `LIGHT_THEME.SURFACE`: `rgba(255,255,255,0.98)` → `'#FFFFFF'`, so `actionCard`'s inherited card shadow gets a `shadowPath` too (triage row 11). Dark `SURFACE` was already opaque; only three sites use it.
- [x] `scripts/theme-contrast-audit.js:132` -- register `CHIP_SUCCESS_FILL` and `CHIP_ERROR_FILL` in `SURFACE_NAMES` so the gate measures chip labels (triage row 14).
- [x] `src/theme/__tests__/shadow-efficient-fills.test.js` -- extend the suite: both new tokens alpha-1 in both tables; each equals `composite(<tint>@0x15, CARD_BACKGROUND)` recomputed from live tokens, so a future token edit that drifts fails the test; and none of the four chip blocks pairs a shadow with an alpha < 1 fill.

**Acceptance Criteria (iteration 2):**
- Given an expanded photo in either mode, when its action row, AI tags and add-comment button render, then their painted colour matches `534182fe` pixel for pixel and no advice names those views.
- Given dark mode with the photo-over-text modal open before its thumb loads, then that box is the screen background colour, not a lighter card colour.
- Given either theme table gains the new keys, when `npm run audit:theme` runs, then it exits 0 with parity intact.

## Implementation Notes

- Iteration 1 was implemented directly because every subagent launch then failed with `400 The requested model is not supported`; iteration 2's review lens ran as a child fine, so that note is historical.
- Deviation from task 2: `SHARED_INTERACTIVE`'s themed factory twin (`getThemedStyles` → `interactive`) has **no** `headerButton` entry, so only the static preset at :424 needed the shadow removed. No other site pairs `INTERACTIVE_BACKGROUND` with a shadow except `AppHeader/index.tsx`, which task 3 covered.
- Files that looked offending in a raw scan were confirmed safe by reading their call sites: nine merge an opaque `backgroundColor` inline (listed in Code Map), and `Feedback/index.js:193-205` plus `PinchableView.js:127-140` are commented-out blocks. No edits made there, per the plan's Never list.
- Added `src/theme/__tests__/shadow-efficient-fills.test.js` (9 tests) to cover every row of the I/O matrix; it needs the repo's `/* eslint-env jest */` pragma to lint clean under `ts-standard`.
- Verification results: `npm run audit:theme` exit 0 with counts unchanged from baseline (`224 low, 59 hardcoded, 36 island`); `npx jest --watchman=false` → 110 passed, 1 failed, and that failure (`src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js:100`) reproduces on the untouched baseline tree; `ts-standard` clean on all changed files.
- The `rg -c "shadow(Color|Opacity)" …` check exits 0 rather than 1 because `PinchableView.js:135` keeps a commented-out `// shadowOpacity: 0,`; the `## Verification` command now counts live props instead. The test asserts per style block, so comments can neither satisfy nor break it.
- Iteration 2 must not touch border alphas (`${…}40`, `${…}30`) — only `backgroundColor` gates Fabric's `shadowPath`.
- Iteration 2 landed as specced: the two tokens (both tables, key parity intact), four `backgroundColor` swaps, and `photoContainer` → `currentTheme.BACKGROUND`. Nothing else in those files changed; `git diff` is 4 one-line fills + 1 token pair per table.
- The test suite grew 9 → 19 tests. `styleBlock` was hoisted to module scope and a `declaredFill` helper added so the chip guards resolve each block's own `backgroundColor` expression (`theme.TOKEN`, literal, or `` `${theme.TOKEN}aa` ``) against live tokens; the iteration-1 `photoContainer` assertion was re-pointed at `BACKGROUND` — the only existing expectation changed, because triage row 2 makes `CARD_BACKGROUND` wrong there.
- Drift guard proven by experiment: setting `LIGHT_THEME.CHIP_SUCCESS_FILL` to `#FFFDF0` fails 3 tests; restored afterwards (`#EBF3F8` confirmed in both tables).
- A fifth `` `${theme.STATUS_SUCCESS}15` `` exists at `src/components/Photo/index.js:353` (`inlineCommentInputRow`) — read and left alone: it declares no `shadow*` prop, so Fabric never warns for it and the plan's Never list bars out-of-scope edits. Both consumers of `PhotoActionButtons` (`Photo/index.js:1260`, `QuickActionsModal/index.js:190`) pass a full `getTheme(...)` object, so `theme.CHIP_*_FILL` can never resolve `undefined`.

## Design Notes

Rule: **a shadow lives only on an opaque fill.** Where translucency is by design (scrims over photos, 5%-tint chips, hairline bars) the shadow contributed nothing observable, so it is removed rather than forcing a fill that would change pixels. Where translucency was incidental, the token becomes the colour it already composited to, computed with the audit tool's own `composite()`:

```js
composite(parseColor('rgba(255,255,255,0.95)'), parseColor('#ffffff'))  // -> #ffffff
composite(parseColor('rgba(255,255,255,0.1)'),  parseColor('#121212'))  // -> #2a2a2a
```

Iteration 2 splits the chips by intent rather than by translucency: they are the app's only *decorative* translucent fills — a coloured glow that reads as lit — so their fill becomes the exact composite (two tokens, both tables) and the glow survives. The scrims and 5%-tint header chips stay shadow-free; the claim that those shadows were invisible overstates it (they cost a faint halo over whatever sat behind them), which the human accepted as shipped rather than restoring five shadow blocks to reclaim a warning-free console.

## Verification

**Commands:**
- `npm run audit:theme` -- expected: exit 0. Baseline was `224 low, 59 hardcoded, 36 island`; registering the two chip surfaces in `SURFACE_NAMES` (triage row 14) moves it to `234 low` — ten cross-product pairings (`INTERACTIVE_PRIMARY`, `TEXT_SECONDARY`, `TEXT_DISABLED` on chip fills) that no call site draws. The real labels (`STATUS_SUCCESS` / `STATUS_ERROR`) pass at 4.69–8.19:1 and must stay off this list.
- `npx jest --watchman=false` -- expected: the shadow suite green (9 tests from iteration 1, plus the new chip guards); the one pre-existing failure `src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js:100` reproduces on an untouched tree and is not this plan's.
- `node -e "const{parseColor:a,composite:c}=require('./scripts/theme-contrast-audit.js');const h=p=>'#'+[p.r,p.g,p.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();for(const[t,bg]of[['#0B72A8','#FFFFFF'],['#5DD3FD','#1E1E1E'],['#C81E33','#FFFFFF'],['#FF6B7D','#1E1E1E']]){const x=a(t);x.a=0x15/255;console.log(t,'->',h(c(x,a(bg))))}"` -- expected: `#ebf3f8`, `#232d30`, `#faecee`, `#312426` — the four token values.
- `rg -n "shadow(Color|Opacity)\s*:" src/components/ui/CloseButton.js src/components/ModernHeaderButton/index.js` -- expected: no matches. Not applied to `Photo/PinchableView.js`: its line 135 is a commented-out prop, so a count-based check there always fails.
- `HOME="$TMPDIR" npx ts-standard <changed files>` -- expected: no new findings versus a same-baseline run of those files.

**Manual checks:**
- iOS simulator, light mode: Home feed, photo detail, Wave settings, Secret — cards identical to baseline, Metro console free of shadow advice for them. Report any remaining warning that names a style this plan did not cover.

## Review Triage Log

| # | Finding (location + verified bad outcome) | Verdict | Route | Evidence |
|---|---|---|---|---|
| 1 | Four chip styles keep shadows on ~8%-alpha fills (`PhotoActionButtons/index.js:192`, `Photo/index.js:316/437/458`), so iOS still logs the advice when a photo expands — the exact report that reopened this plan. | `medium` | **intent_gap** (coverage gap itself is bad_plan) | Verified independently before the lens reported it: each fill resolves to α 0.082, shadow alpha 1, so `RCTViewComponentView.mm:1058-1076` takes the rasterise-and-warn branch; live at `Photo/index.js:991/1053/1231` and five `actionButton` call sites. Routes to intent_gap because keeping the glow needs a per-mode opaque fill, and both clean routes (new token pair, or an `isDark` argument into `createStyles`) are excluded by the frozen Never list. |
| 2 | `ModalInputText/index.js:43` — the added `CARD_BACKGROUND` fill paints `#1E1E1E` where nothing was painted, against a `BACKGROUND` `#121212` screen, visible whenever the thumb is absent or loading. | `low` | patch (fold into re-derivation) | Confirmed: container is `currentTheme.BACKGROUND` (:39), fill is `currentTheme.CARD_BACKGROUND` (:44), and the image renders only under `isValidImageUri(photo.thumbUrl)` (:199). `BACKGROUND` (`#ffffff`/`#121212`) is opaque and equals what was already painted, so it is the delta-free fill. |
| 3 | Removing shadows from the scrim/tint chips does move pixels — an iOS layer shadow composites outside the view, so those buttons lost a faint halo over the photo behind them. | `low` — rejected | — | Real but cosmetic, and the fix is not a direct correction: restoring five shadow blocks re-introduces the warnings this plan exists to remove, and contradicts the frozen Approach. Recorded so the human knows the Design Notes' "contributed nothing observable" overstates it. |
| 4 | The same five sites keep `elevation`, so Android still casts a shadow iOS no longer draws. | `low` — rejected | — | Real, caused by the change, but permitted by the frozen "no changes to `elevation`"; removing elevation is out of the intent's reach and unnoticed in everyday use. |
| 5 | Implementation Notes overstate the new tests: nothing asserts tasks 2–3 (header-button shadow removal), and the jest theme-mock claim describes one mock. | — | rejected | Its fix edits this build's plan, which the triage rules exclude. A real guard for the four chips is added to the re-derivation instead. |
| 6 | `rg -c "shadow(Color|Opacity)" … PinchableView.js` cannot exit 1 — line 135 is a commented `// shadowOpacity: 0,`. | — | rejected | Confirmed by running it; fix edits this build's plan (will be corrected in the amendment regardless). |
| 7 | The dark disabled-surface test composites against `dark.BACKGROUND` rather than the call-site parent, so moving that button would keep tests green while changing pixels. | `low` — rejected | — | Confirmed at `shadow-efficient-fills.test.js:40-44`; the sole consumer (`Feedback/index.js:339`) is a direct child of the `BACKGROUND` container today, and hardening it against hypothetical reparenting exceeds this plan's goal. |
| 8 | `Secret/styles.js:74-83` — disabled submit inherits shadow props from `submitButton` under an α .05 fill; silent only because the merged style sets `shadowOpacity: 0`. | `medium` (unverified impact) | defer | Confirmed: `BACKGROUND_DISABLED` is `rgba(85,95,97,.05)` / `rgba(255,255,255,.05)` (`sharedStyles.js:49,123`). Pre-existing and untouched by this change; settles either way by rendering that screen disabled on iOS. |

**Loopback note:** the route says revert code changes. Not applied — iteration 1's work is already committed on `main` at `534182fe`, so reverting would undo shipped work rather than reset an in-flight edit. The committed state is this iteration's baseline; re-derivation adds scope on top.
| 9 | Iteration-2 chip fills are composited against `CARD_BACKGROUND`, but the chips render on three different surfaces. Standalone photo screen: `addCommentButton` sits on `container` (`theme.BACKGROUND`, `Photo/index.js:189`, via `addCommentCard` :311 with no fill) → dark paint moves `#182225`→`#232D30`, +11/channel. `actionButton` sits on `actionCard`'s `theme.SURFACE` (:480-482, `#1A1A1A`) in both modes → +3/4/channel. Embedded/masonry mode is exact (root goes transparent :1351, wrapped in `expandedCardContainer`), and `aiTag`/`aiModerationTag` sit on `aiRecognitionCard` (`CARD_BACKGROUND`) in both modes → exact. | `medium` | **intent_gap — resolved** | Verified the tree by reading `Photo/index.js:189/311/480-482/842/989/1340-1360` and recomputing with `composite()`. One token cannot be pixel-exact across three parents, and `actionButton` is shared by two hosts, so no per-site choice exists without a new prop. |
| 10 | The new drift test composites against `CARD_BACKGROUND` for all four chips, so for the two mis-parented ones it proves an assumption rather than the painted result. | `low` | same entry as #9 | Confirmed at `shadow-efficient-fills.test.js:117-124`; a symptom of the parent question, not independent. |
| 11 | `actionCard` (`Photo/index.js:480-482`) spreads `SHARED_STYLES.containers.card` — which carries `shadowOpacity: .3` (`sharedStyles.js:197-204`) — over `theme.SURFACE`, whose light value is `rgba(255,255,255,0.98)` (alpha 0.98 ≤ 0.999). The standalone photo screen's action card therefore still rasterises its shadow and logs the advice in light mode. | `medium` | **bad_plan — fixed** | Verified: the style spreads shadows from the preset and overrides only the background; neither token edit nor the Code Map's verify-list covers a `SURFACE`-filled shadowed style. `ActionMenu/index.js` and `QuickActionsModal/index.js` also use `SURFACE` but declare no shadows today, so this is the only live site. |
| 12 | `LIGHT_THEME.CARD_BACKGROUND: '#FFFFFF'` (iteration 1) moves pixels on surfaces that float over scrims or photos rather than the page — e.g. `UploadQueueModal/index.js:233` over a `rgba(0,0,0,.5)` backdrop (`#F2F2F2`→`#FFFFFF`, Δ≈13), and `IdentityHeaderIcon/index.js:64` in a transparent Modal. | `low` — rejected | — | Real, and inherent to the frozen Approach (a translucent→opaque swap is by definition not identity wherever something other than the page sat behind). The only "fix" is reverting to translucency, which restores the warnings; the human accepted iteration 1 as shipped. |
| 13 | `ModalInputText`'s thumb box keeps `shadowOpacity: .7 / radius 16`, so in the missing-or-loading state it now casts a soft shadow around a box that painted nothing at baseline. | `low` — accept | — | Confirmed by reading :43-53 and :199. Transient (gone once the thumb paints) and arguably reads as an intentional placeholder; suppressing the shadow per state would add branching for a loading frame. |
| 14 | `scripts/theme-contrast-audit.js:132` `SURFACE_NAMES` does not list `CHIP_SUCCESS_FILL` / `CHIP_ERROR_FILL`, so the repo's only theme gate never measures chip labels against them. | `medium` | patch | Confirmed: every other paintable token is registered there and flattened over `BACKGROUND` for measurement; text on chips uses `STATUS_SUCCESS`/`STATUS_ERROR` (`PhotoActionButtons/index.js:222`, `Photo/index.js:451/473`). |

| 15 | `CARD_BACKGROUND` sheets over translucent scrims (`UploadQueueModal:233`, `MergeWaveModal:214`, `WaveSelectorModal:428`, `EditWaveModal:65`) paint `#FFFFFF` where ~`#F9F9F9` was composited. | `low` — rejected (carried) | — | carried — same claim as row 12, four more sites of it; inherent to the frozen Approach and accepted as shipped. |
| 16 | Iteration 3's light `SURFACE: '#FFFFFF'` moves the two overlay panels that paint it over a 60% scrim (`ActionMenu:107`, `QuickActionsModal:231`) from ≈`#FCFCFC` to `#FFFFFF`. | `low` — rejected | — | Confirmed by compositing; ~3 levels per channel on a panel over a dark scrim. Reverting reintroduces the `shadowPath` failure this edit exists to fix, and the human chose opaque knowing the cost. |
| 17 | Chip fills pinned to `CARD_BACKGROUND` are not exact for the `BACKGROUND` and `SURFACE` hosts in dark mode; the drift guard asserts the assumption rather than any live parent. | — (carried) | resolved by decision | carried — rows 9 and 10, unchanged code at those lines; the human accepted the ≤11/255 dark deltas rather than threading a host flag through `createStyles`. The light-mode equality guard is scoped to light mode in its own comment. |


## Plan Change Log

**Iteration 2 — trigger: finding 1 (iOS shadow advice still logs for the four chip styles when a photo expands).**

- **Amended:** `## Tasks & Acceptance` gained an Open block naming the four chip sites, their fills, and the composited opaque equivalents. Code Map and task list to be extended once the human settles which fill mechanism is allowed; `## Verification`'s `rg` expectation is wrong (see triage row 6) and will be corrected in the same pass.
- **Known-bad state avoided:** making the four chips opaque by reusing a token that differs from their parent (`CARD_BACKGROUND` over `BACKGROUND`) — the mistake finding 2 caught at `ModalInputText`. Any chip fill must be the exact composite over its own parent, and no site may gain a shadow on a translucent fill.
- **KEEP (must survive re-derivation):** `LIGHT_THEME.CARD_BACKGROUND: '#FFFFFF'` and `DARK_THEME.disabledBackground: '#2A2A2A'`; shadow props removed from `SHARED_INTERACTIVE.headerButton` (`sharedStyles.js:424`), `AppHeader/index.tsx`, `ui/CloseButton.js`, `Photo/PinchableView.js` (fills kept) and `ModernHeaderButton` (`rgba(255,255,255,0.9)` fill kept); inline shadow props removed from the `LinearProgress`; `photoInfoCardFlat` and friends left alone; the 9 tests in `src/theme/__tests__/shadow-efficient-fills.test.js` stay green and may only grow.
- **Renegotiated with the human (2026-11-21), so the frozen block changed by their hand:** the Never line "No new tokens" now permits exactly `CHIP_SUCCESS_FILL` and `CHIP_ERROR_FILL`, added to both theme tables; two rows were added to the I/O matrix (photo chips, and the photo-over-text modal's bare box). They also accepted findings 3 and 4 as shipped — no shadow restoration, no elevation edits — and declined to reopen finding 7.
- **Route:** left pinned at `full` from the original invocation despite iteration 2's delta being ~45 lines (the auto rule would pick `oneshot`), so step-04's patch route can still re-engage the step-03 implementer.

**Iteration 2 — implementation record (2026-11-21).**

- All five open tasks done as written; no boundary crossed. Verification: `npm run audit:theme` exit 0 with counts identical to baseline (`224 low, 59 hardcoded, 36 island`); the plan's `node -e` composite check prints exactly `#EBF3F8 / #232D30 / #FAECEE / #312426`; shadow suite 19/19 green; full jest 127 passed + the documented pre-existing `queueWriteLock.test.js:100` failure, re-confirmed failing with these edits stashed; `ts-standard` findings byte-identical before/after (11 pre-existing `no-unused-vars`, none on touched lines, none in the new tests); the plan's `rg` check exits 1 (no matches) on `CloseButton.js` and `ModernHeaderButton/index.js`.
- **Deviation recorded, not taken:** `actionButton` also renders inside `QuickActionsModal`, whose sheet is `theme.SURFACE` (`#1A1A1A` dark), not `CARD_BACKGROUND` (`#1E1E1E`). Light mode is unaffected — `SURFACE` composites to white, so the token is exact there too. In dark mode that one host now paints `#232D30`/`#312426` where it used to composite to `#20292D`/`#2D2122`: a 3/255 per-channel lift on two chips in a modal sheet. Fixing it would need a third and fourth token (beyond the renegotiated pair) or a per-host fill, so the frozen values stand; flagged for the human rather than silently absorbed.
- **Manual iOS check not run here** — no simulator was driven in this session; the console-free claim for the four chips rests on the fill now resolving alpha 1 (`RCTViewComponentView.mm:1058-1076` takes the `shadowPath` branch) plus the static per-block test, not on observed logs.

**Iteration 3 — trigger: triage rows 9 and 11 (iteration-2 review).**
- **Human decisions recorded:** the standalone-screen dark deltas are accepted rather than engineered away (`addCommentButton` `#182225`→`#232D30`, action buttons +3/4 per channel; expanded mode and both light-mode hosts are exact), so no host flag enters the style factories. Light `SURFACE` becomes opaque to finish the goal for `actionCard`.
- **Amended:** two tasks added above; `## Verification`'s advisory-count line updated for the `SURFACE_NAMES` registration (224 → 234 low, all hypothetical pairings); Code Map's "their parent surface is `CARD_BACKGROUND`" is superseded — the chips sit on `CARD_BACKGROUND` when embedded and in AI tags, `SURFACE` for action buttons, `BACKGROUND` for the standalone add-comment chip.
- **New guards:** `SURFACE` opaque in both themes, and light `SURFACE` equals light `CARD_BACKGROUND` so the shared `actionButton` fill stays exact on both of its light-mode hosts.
