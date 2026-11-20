# Quick review lens — handoff (run this in a separate session, ideally a different LLM)

Subagent launch failed in the planning session (`400 The requested model is not supported`), so per the workflow this is the reviewer's child prompt with every file it points to replaced inline by that file's contents. Paste everything below into a fresh session and return the findings to the planning session.

---

Read the plan below (inlined under `## PLAN`) — the plan holding the acceptance criteria and intent — and the files its frontmatter `context:` lists (`context: []`, so none). Read the agent instruction files inlined under `## AGENTS.md` and `## CLAUDE.md` (repository root; no nested ones exist in the directories the diff touches); those are the rules. Then read the unified diff inlined below under `## DIFF` — it is the change under review.

Report unmet acceptance criteria, broken rules, and bugs. Each finding: the location, what goes wrong, and evidence checked against the surrounding code. Output a Markdown list of findings only — no severity, priority, or ranking.

Review by inspection only. Do not modify code, run builds or tests, or invoke quality gates. Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer.

Repository root: /Users/dmitry/hacks/wisaw/WiSaw (read-only inspection of surrounding code there is allowed and expected).

## AGENTS.md
# BMad Workflow

This project uses the [BMad Method](https://bmadcode.com) for all structured development work. Features, fixes, and meaningful changes flow through BMad skills. OpenSpec was removed on 2026-10-27; do not look for `openspec/` or `/opsx:*` commands — the behaviour specs it held now live in [docs/specs/](./docs/specs) as ordinary reference documentation, not as a workflow gate.

## How work flows

| Stage | Skill | Output |
|---|---|---|
| Research a decision, or how this repo works | `bmad-deep-recon` | `_bmad-output/research-<topic>/` |
| Requirements / scope | `bmad-prd`, `bmad-product-brief`, `bmad-prfaq` | `_bmad-output/prd-*/`, `brief-*/` |
| Technical design | `bmad-architecture` | `_bmad-output/architecture-*/` |
| UX | `bmad-ux` | `_bmad-output/ux-*/` (`DESIGN.md`, `EXPERIENCE.md`) |
| Tickets, epics, stories | `bmad-agent-po` (Sofia) | `_bmad-output/tickets/` |
| Implement a change | `bmad-build` | plan in `_bmad-output/plan-<slug>.md`, then code |
| Validate | `bmad-code-review`, `bmad-walkthrough`, `bmad-qa-generate-e2e-tests` | findings in chat, tests in the repo |

Rules that matter:

- **One goal per plan.** `bmad-build` plans a single user-facing change; split genuinely independent deliverables into separate plans.
- **The plan is the spec.** Write it to `_bmad-output/plan-<slug>.md`, implement against it, and record deviations in its Plan Change Log instead of silently diverging.
- **Small changes still get reviewed.** `bmad-build` with route `oneshot` covers ordinary changes; use `full` for anything risky or wide-reaching. Trivial maintenance (typos, formatting, ignore-file hygiene) needs no plan.
- **Initiatives are optional.** With none active, artifacts land loose in `_bmad-output/`; ask before creating one.

## Tooling notes

- BMad skills run Python scripts through `uv` (`uv run <script>`). `_bmad/` holds the installed config and scripts; `_bmad/render/` is regenerated per run and is git-ignored.

<!-- bmad:context -->
<!-- Verified 2026-11-18 against e1da5cbc. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## WiSaw

Photo-and-wave social app in React Native — Expo SDK 58, React Native 0.88, Expo Router, Jotai for state, Apollo Client over GraphQL. Mostly plain JavaScript; TypeScript only in route files. Structured work follows the BMad Method below; behaviour reference lives in `docs/specs/`.

## Policy

- Never run `eas build`, `eas update`, `npm run publish:prod`, or any deploy — builds and releases are done by hand.
- Never edit `../WiSaw.cdk` (the backend, checked out beside this repo). When a change needs backend work, emit a copy-paste-ready prompt for that workspace instead.
- Never commit `.env`; never hardcode a secret. `.env.sample` is the key list and `app.config.js`'s `extra` block is the only route into the app.
- Maximum cyclomatic complexity of 8 — extract helpers, return early, split conditionals. Nothing enforces this: there is no CI.
- Never hand-edit `ios/` or `android/` — both are git-ignored `expo prebuild` output. Change `app.config.js` and the `assets/brand/` generator instead.
- Do not modify vendored `src/zxcvbn.js`.

## Where things are

- Screens live in `src/screens/<Name>/index.js`; a file under `app/` is a thin wrapper that mounts one, so put logic in the screen, not the route.
- GraphQL queries are inline `gql` literals in `src/screens/*/reducer.js`. Despite the name these are plain async service functions imported as `import * as reducer from './reducer'` — this repo has no `useReducer`, and no Redux.
- Theme tokens: `LIGHT_THEME` and `DARK_THEME` in `src/theme/sharedStyles.js`.
- GraphQL schema: `../WiSaw.cdk/graphql/schema.graphql`.
- Specs: `docs/specs/<feature>/spec.md` is current EARS-style, but some name deleted files — trust the source over a spec. Top-level `docs/*.md` are dated fix summaries, not guidance.

## Running and verifying

- There is no `test` script and no jest config: run `npx jest --watchman=false`.
- `npm run lint` exits 1 at baseline with ~570 pre-existing findings, and crashes in a sandboxed shell because eslint's cache lands outside the repo. Lint only your changed files with `HOME="$TMPDIR" npx ts-standard <files>` and compare against that baseline instead of expecting clean.
- Run `npm run audit:theme` after any theme-token or text-colour change — it gates on invisible contrast and on a token present in only one theme table. Nothing runs it for you; there is no CI.
- Load the environment before running the app: `source .env && npx expo start`. `app.config.js` reads `API_URI`, `API_KEY` and `PRIVATE_IMG_HOST` from `process.env`, so an unsourced start gets `undefined`.

## Conventions that differ from defaults

- Pin non-Expo packages exactly; `~` is correct for Expo-SDK-managed modules (expo, expo-router, the `expo-*` set, gesture-handler, screens, web) because Expo's own tooling writes it.
- Identity and device secrets go to `expo-secure-store`, not `expo-storage`; grouping state uses AsyncStorage in `src/utils/groupingStorage.js`.
- Images use `expo-cached-image`, except bundled assets and `file://` paths, which `CachedImage` rejects.
- Namespace imports are the idiom — `import * as CONST from '../../src/consts'`, `* as STATE from '../state'` — and imports are relative: no path aliases are configured.

## Known pitfalls

- A token added to only one theme table renders `undefined` colours in the other mode; add to both and let `npm run audit:theme` prove it.
- `docs/DARK_MODE_IMPLEMENTATION.md` is half-stale (SecureStore, a deleted Chat screen, two modes instead of the current `light|dark|system`); only its contrast-gate section is current.
- BMad's `uv run` needs `UV_PYTHON_INSTALL_DIR="$TMPDIR/uv-python"` in a sandboxed shell.

<!-- /bmad:context -->

## CLAUDE.md
# Agent Instructions

@AGENTS.md

Hard rules live in [AGENTS.md](./AGENTS.md) — read it first.

## PLAN
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

## DIFF
diff --git a/src/components/AppHeader/index.tsx b/src/components/AppHeader/index.tsx
index 774df167..c07bcd8c 100644
--- a/src/components/AppHeader/index.tsx
+++ b/src/components/AppHeader/index.tsx
@@ -78,13 +78,6 @@ export default function AppHeader({
       marginHorizontal: 8,
       borderWidth: 1,
       borderColor: theme.INTERACTIVE_BORDER,
-      shadowColor: theme.CARD_SHADOW,
-      shadowOffset: {
-        width: 0,
-        height: 2
-      },
-      shadowOpacity: 0.2,
-      shadowRadius: 4,
       elevation: 4
     }
   })
diff --git a/src/components/ModernHeaderButton/index.js b/src/components/ModernHeaderButton/index.js
index 26a31e17..7507606b 100644
--- a/src/components/ModernHeaderButton/index.js
+++ b/src/components/ModernHeaderButton/index.js
@@ -15,13 +15,6 @@ const styles = StyleSheet.create({
     borderColor: CONST.HEADER_BORDER_COLOR,
     alignItems: 'center',
     justifyContent: 'center',
-    shadowColor: CONST.HEADER_SHADOW_COLOR,
-    shadowOffset: {
-      width: 0,
-      height: 1
-    },
-    shadowOpacity: 1,
-    shadowRadius: 2,
     elevation: 2
   }
 })
diff --git a/src/components/Photo/PinchableView.js b/src/components/Photo/PinchableView.js
index 8fdd6003..6346de02 100644
--- a/src/components/Photo/PinchableView.js
+++ b/src/components/Photo/PinchableView.js
@@ -35,13 +35,6 @@ const createStyles = (theme) =>
       marginHorizontal: 8,
       borderWidth: 1,
       borderColor: 'rgba(255, 255, 255, 0.2)',
-      shadowColor: '#000',
-      shadowOffset: {
-        width: 0,
-        height: 2
-      },
-      shadowOpacity: 0.3,
-      shadowRadius: 4,
       elevation: 5
     },
     headerIcon: {
diff --git a/src/components/Photo/index.js b/src/components/Photo/index.js
index 8c6fdadb..a5efbb8d 100644
--- a/src/components/Photo/index.js
+++ b/src/components/Photo/index.js
@@ -1325,13 +1325,6 @@ const Photo = ({
               marginVertical: 0,
               height: 4,
               borderRadius: 2,
-              shadowColor: '#4FC3F7',
-              shadowOffset: {
-                width: 0,
-                height: 2
-              },
-              shadowOpacity: 0.3,
-              shadowRadius: 4,
               elevation: 5
             }
           ]}
diff --git a/src/components/ui/CloseButton.js b/src/components/ui/CloseButton.js
index b492c862..17475cd1 100644
--- a/src/components/ui/CloseButton.js
+++ b/src/components/ui/CloseButton.js
@@ -31,10 +31,6 @@ const styles = StyleSheet.create({
     zIndex: 1000,
     borderWidth: 1,
     borderColor: 'rgba(255, 255, 255, 0.2)',
-    shadowColor: '#000',
-    shadowOffset: { width: 0, height: 2 },
-    shadowOpacity: 0.3,
-    shadowRadius: 4,
     elevation: 5
   },
   icon: {
diff --git a/src/screens/ModalInputText/index.js b/src/screens/ModalInputText/index.js
index bf65591f..66c109e9 100644
--- a/src/screens/ModalInputText/index.js
+++ b/src/screens/ModalInputText/index.js
@@ -41,6 +41,7 @@ const ModalInputText = ({ route }) => {
         backgroundColor: currentTheme.BACKGROUND
       },
       photoContainer: {
+        backgroundColor: currentTheme.CARD_BACKGROUND,
         alignSelf: 'center',
         marginBottom: 20,
         borderRadius: 16,
diff --git a/src/theme/sharedStyles.js b/src/theme/sharedStyles.js
index 3b0de700..fa90e96d 100644
--- a/src/theme/sharedStyles.js
+++ b/src/theme/sharedStyles.js
@@ -26,7 +26,7 @@ export const LIGHT_THEME = {
   TEXT_ON_PRIMARY: '#FFFFFF',
 
   // Card and container styles
-  CARD_BACKGROUND: 'rgba(255, 255, 255, 0.95)',
+  CARD_BACKGROUND: '#FFFFFF',
   CARD_BORDER: 'rgba(0, 0, 0, 0.06)',
   CARD_SHADOW: 'rgba(0, 0, 0, 0.25)',
   SURFACE: 'rgba(255, 255, 255, 0.98)',
@@ -157,7 +157,7 @@ export const DARK_THEME = {
   helpCardBorder: 'rgba(93, 211, 253, 0.3)',
 
   // Disabled button state
-  disabledBackground: 'rgba(255, 255, 255, 0.1)',
+  disabledBackground: '#2A2A2A',
 
   // Aliases for theme consistency
   interactiveBackground: 'rgba(234, 94, 61, 0.15)'
@@ -428,13 +428,6 @@ export const SHARED_INTERACTIVE = {
     marginHorizontal: 8,
     borderWidth: 1,
     borderColor: THEME.INTERACTIVE_BORDER,
-    shadowColor: THEME.CARD_SHADOW,
-    shadowOffset: {
-      width: 0,
-      height: 2
-    },
-    shadowOpacity: 0.2,
-    shadowRadius: 4,
     elevation: 4
   },
 

=== UNTRACKED FILES ===
--- /dev/null
+++ b/src/theme/__tests__/shadow-efficient-fills.test.js
+/**
+ * Guards the fills behind iOS shadow rendering: Fabric can only build an
+ * efficient shadowPath when a shadowed view's own background is opaque, so the
+ * theme surfaces that carry shadows must stay alpha-1 — and swapping them from
+ * translucent to opaque must not move a single pixel.
+ */
+/* eslint-env jest */
+const fs = require('fs')
+const path = require('path')
+const {
+  parseColor,
+  composite,
+  contrast,
+  loadThemeTokens
+} = require('../../../scripts/theme-contrast-audit.js')
+
+const root = path.join(__dirname, '..', '..', '..')
+const readSrc = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')
+
+const { light, dark } = loadThemeTokens()
+const toHex = (c) =>
+  '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
+
+describe('card and disabled surfaces are opaque', () => {
+  it('light CARD_BACKGROUND is fully opaque', () => {
+    expect(parseColor(light.CARD_BACKGROUND).a).toBe(1)
+  })
+
+  it('dark disabledBackground is fully opaque', () => {
+    expect(parseColor(dark.disabledBackground).a).toBe(1)
+  })
+})
+
+describe('opaque swaps preserve the painted colour', () => {
+  it('light card paints what rgba(255,255,255,0.95) over the page used to', () => {
+    const before = composite(parseColor('rgba(255, 255, 255, 0.95)'), parseColor(light.BACKGROUND))
+    expect(toHex(before)).toBe(toHex(parseColor(light.CARD_BACKGROUND)))
+  })
+
+  it('dark disabled surface paints what rgba(255,255,255,0.1) over the page used to', () => {
+    const before = composite(parseColor('rgba(255, 255, 255, 0.1)'), parseColor(dark.BACKGROUND))
+    expect(toHex(before)).toBe(toHex(parseColor(dark.disabledBackground)))
+  })
+
+  it('dark disabled label keeps its contrast ratio', () => {
+    const before = composite(parseColor('rgba(255, 255, 255, 0.1)'), parseColor(dark.BACKGROUND))
+    expect(contrast(parseColor(dark.TEXT_DISABLED), before)).toBeCloseTo(
+      contrast(parseColor(dark.TEXT_DISABLED), parseColor(dark.disabledBackground)),
+      4
+    )
+  })
+})
+
+describe('shadows are gone from surfaces that stay translucent by design', () => {
+  // [file, style key] — the block is read by brace matching so commented-out
+  // styles elsewhere in the file cannot satisfy or break the assertion.
+  // [file, style key, fill that must survive] — the block is read by brace
+  // matching so commented-out styles elsewhere cannot satisfy or break it.
+  const scrimStyles = [
+    ['src/components/ui/CloseButton.js', 'button', 'rgba(0, 0, 0, 0.6)'],
+    ['src/components/Photo/PinchableView.js', 'headerButton', 'rgba(0, 0, 0, 0.6)'],
+    ['src/components/ModernHeaderButton/index.js', 'button', 'rgba(255, 255, 255, 0.9)']
+  ]
+
+  const styleBlock = (rel, key) => {
+    const src = readSrc(rel)
+    const start = src.indexOf(`${key}: {`)
+    if (start < 0) throw new Error(`${key} not found in ${rel}`)
+    let depth = 0
+    for (let i = src.indexOf('{', start); i < src.length; i++) {
+      if (src[i] === '{') depth++
+      if (src[i] === '}') depth--
+      if (depth === 0) return src.slice(start, i + 1)
+    }
+    throw new Error(`unbalanced braces in ${key} of ${rel}`)
+  }
+
+  it.each(scrimStyles)('%s › %s keeps its fill and drops the shadow', (rel, key, fill) => {
+    const block = styleBlock(rel, key)
+    expect(block).toContain(fill)
+    expect(block).not.toMatch(/\bshadow(Color|Opacity|Radius)\s*:/)
+  })
+
+  it('a framed photo gets an opaque fill behind its shadow', () => {
+    const src = readSrc('src/screens/ModalInputText/index.js')
+    const block = src.slice(src.indexOf('photoContainer: {'), src.indexOf('photoContainer: {') + 300)
+    expect(block).toMatch(/backgroundColor:\s*currentTheme\.CARD_BACKGROUND/)
+  })
+})
