# Plan: no invisible text in light or dark mode

- **Route**: `bmad-build`, route `full` (touches the shared theme consumed by ~50 modules)
- **Date**: 2026-11-08
- **Research input**: [_bmad-output/research-theme-color-definitions-and-resolution](./research-theme-color-definitions-and-resolution/research-theme-color-definitions-and-resolution.md)
- **Decision this serves**: ship a release where no text in WiSaw becomes unreadable when the user flips between light and dark mode.

## Goal

Every piece of text in the app stays legible against whatever it sits on, in both modes, and the repo gains an automated gate so the property cannot silently regress.

## How the theme works today (verified)

- One Jotai boolean (`src/state.js:11`) carries the mode; `getTheme(isDark)` swaps two 33-key token tables (`src/theme/sharedStyles.js:19`, `:77`). Key sets are identical, so no consumer can be missing a token.
- Two legacy paths ignore the mode entirely: the module-load-baked `SHARED_*` presets (`sharedStyles.js:141-451`, built from `THEME = LIGHT_THEME` at `:138`) and `src/utils/navigationStyles.js`, which reads light-only `CONST.*` values.
- Text colour does not have to come from a token at all: 124 sites in `app/` + `src/` hardcode hex/rgba/keyword colours for `color` / `placeholderTextColor`. A hardcoded colour is mode-blind by construction, so it is legible in exactly one mode whenever its background follows the theme.

## Defect classes to fix

| # | Class | Example | Effect |
|---|---|---|---|
| 1 | Mode-blind text on themed surface | `src/screens/Feedback/index.js:347` `color: 'white'` over `theme.disabledBackground` (`#C0C0C0`, `sharedStyles.js:70`) | disabled submit label, 1.28:1 in light mode |
| 2 | Near-white placeholder | `src/consts.js:76` `PLACEHOLDER_TEXT_COLOR = '#ececec'` used at `Feedback/index.js:437` | placeholder text invisible on white input |
| 3 | Status colours too light to be text in light mode | `STATUS_ERROR '#FF4757'`, `STATUS_SUCCESS '#4FC3F7'`, `STATUS_CAUTION '#FF9500'` (`sharedStyles.js:50-54`) used as text/icon colour, e.g. `src/screens/PhotosList/index.js:582` | 1.5–3.6:1 on light surfaces and on their own tinted backgrounds |
| 4 | Hardcoded greys in un-themed modals | `src/components/WaveShareModal.js`, `src/components/ShareOptionsModal.js` (31 sites, e.g. `#333`, `#999`, `'white'`) | dark mode renders a white sheet; any themed text inside it disappears |
| 5 | Hardcoded light chips under dark text tokens | `src/components/WaveCard/index.js:91-92` `#FEF3C7` / `#D97706` | readable but off-theme; tokenised so the pair is guaranteed |

## Approach

1. **Token foundation** (`src/theme/sharedStyles.js`, `src/consts.js`)
   - Add to both tables, keeping key sets identical: `TEXT_ON_PRIMARY`, `TEXT_PLACEHOLDER`, `STATUS_PENDING_BACKGROUND`, `STATUS_PENDING_TEXT`.
   - Darken the light-mode status colours until each passes WCAG AA as text on every light surface; dark values already pass and stay.
   - Retune light `disabledBackground` from `#C0C0C0` to a light grey that carries muted text, and give disabled labels `theme.TEXT_SECONDARY` instead of white.
   - Replace the single `CONST.PLACEHOLDER_TEXT_COLOR` use with `theme.TEXT_PLACEHOLDER`; drop the now-unused near-white const.
2. **Tokenise hardcoded text colours** across the 43 flagged files: on-brand labels → `TEXT_ON_PRIMARY`, reds → `STATUS_ERROR`, greys → `TEXT_PRIMARY` / `TEXT_SECONDARY`, chips → the new pending tokens. The two fully un-themed modals get `useAtom(STATE.isDarkMode)` + `getTheme(isDark)` like every other surface.
3. **Gate it** in `scripts/theme-contrast-audit.js` (already added): token-pair contrast per mode, foreground/background pairs found in source, and a hardcoded-text-colour check that fails the build outside a documented allowlist of media-overlay components (`Photo/*`, overlay chrome) whose background is user imagery rather than a theme surface. Wire `npm run audit:contrast` and `audit:theme`.
4. **Document** the rule and the allowlist in [docs/DARK_MODE_IMPLEMENTATION.md](../docs/DARK_MODE_IMPLEMENTATION.md).

## Out of scope (recorded, not silently skipped)

- The frozen `SHARED_*` preset layer and `src/utils/navigationStyles.js`: converting them is a refactor of ~300 lines plus every navigator, and their colours are light-on-light — readable in both modes today. Recorded as follow-up; the gate now prevents new hardcoded text colours from landing on top of them.
- Below-AA-but-readable pairs (reported by the audit, not gated): listed in the closing report for a design pass.
- Native chrome (`app.config.js` splash/adaptive-icon/status-bar colours) — outside JS theming.

## Verification

- `npm run audit:theme` exits 0: no token pair invisible, no hardcoded text colour outside the allowlist.
- `npm run lint` clean; `npx tsc --noEmit` clean.
- Existing Jest suites still pass (`src/utils/__tests__`, component suites that mock the theme).
- Spot-check of every finding class above before and after, from the audit output.

## Results (2026-11-08)

`npm run audit:theme` exits **0**: 0 invisible, 0 token-parity failures. Advisory counts after the fixes: 224 `low`, 59 `hardcoded`, 36 `island`.

Before/after evidence — the same gate script run against a clean worktree of the pre-fix commit `044c479b` reports **12 `INVISIBLE` findings and exits 1** (`#FFF` on `#F0F0F0` in `EditWaveModal` at 1.14:1, `CONST.PLACEHOLDER_TEXT_COLOR` on a card in `Feedback` at 1.18:1, `#FFD700` on `light.BACKGROUND` in `QuickActionsModal` at 1.40:1, `#50E3C2` on its own tint in the two `Secret` cards at ~1.53:1, `#ccc` on near-white in both share modals, and three token-on-token pairings inside `sharedStyles.js`: `STATUS_SUCCESS`, `STATUS_CAUTION` and `TEXT_DISABLED` on `disabledBackground`). On the fixed tree those classes are empty and the gate exits 0: 12 → 0 invisible, 271 → 224 low, 81 → 59 hardcoded, 40 → 36 island.

Fixed (each finding hand-checked against source before editing):

- Tokens added to **both** tables in `src/theme/sharedStyles.js`: `TEXT_PLACEHOLDER`, `TEXT_ON_PRIMARY`, `STATUS_PENDING_{,_BACKGROUND,_TEXT}`, `STATUS_INFO{,_BACKGROUND}`, `ACCENT_SECONDARY{,_BACKGROUND,_BORDER}`, `TEXT_LINK{,_BACKGROUND}`. Light `TEXT_PLACEHOLDER` and `TEXT_DISABLED` alphas raised so they clear 4.5:1 and 3.4:1 on their surfaces (they were 2.4:1 and 2.8:1).
- Mode-blind iOS-system-blue labels (`#007AFF`) in `src/screens/WavesHub/index.js` and `src/components/UngroupedPhotosCard/index.js` → `theme.TEXT_LINK` (23 `#007AFF` sites remain as borders/backgrounds or inside components with no theme binding; see follow-up).
- `CONST.PLACEHOLDER_TEXT_COLOR` (`#ececec`, near-white) is now unreferenced and marked deprecated in favour of `theme.TEXT_PLACEHOLDER`. The audit script itself was refactored to satisfy the repo's max-cyclomatic-complexity-8 rule (verified: findings byte-identical before and after).
- `src/screens/Secret/components/PrivacyNoticeCard.js`, `IdentityProfileCard.js` — hardcoded mint/status colours → tokens.
- `src/components/QuickActionsModal/index.js` (`#FFD700` → `STATUS_WARNING`), `EditWaveModal/index.js` (spinner `#FFF` → `TEXT_PRIMARY`).
- `src/screens/Feedback/index.js` — placeholder, character-count colours, disabled-submit label (was white on a disabled button), help-card bullets/title; duplicated conditions collapsed into `submitDisabled` / `submitContentColor`.
- `src/components/WaveShareModal.js`, `ShareOptionsModal.js` — `#ccc` chevrons/QR icons → `CONST.TEXT_COLOR`.
- `src/screens/WaveDetail/index.js`, `WaveSettings/index.js` — frozen-banner blue → `STATUS_INFO{,_BACKGROUND}` at the JSX sites (their sheets are module-level statics, so the override is inline).
- `src/components/PhotoActionButtons/index.js` — `#4FC3F7` → `STATUS_INFO`.

## Verification actually run

- `npm run audit:theme` → exit 0. Parity check proven live: commenting one dark token out makes the gate fail with an `INVISIBLE` line, restoring it makes it pass.
- `npx ts-standard --no-cache <changed files>` → no new findings; the same unused-var / `jsx-indent` / `jsx-handler-names` findings exist at baseline in those files (verified by stashing, before and after counts equal). The audit script itself lints clean. Note: `npm run lint` cannot run under the agent sandbox because ts-standard writes its cache to `~/.cache/ts-standard`; redirecting `HOME` works.
- `npx jest --watchman=false` → 78/79 pass. The one failure, `src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js`, fails identically at baseline (file-lock timing under the sandbox), unrelated to colours. Watchman must be disabled in the sandbox (`--watchman=false`).
- `npx tsc --noEmit` → 3 pre-existing errors in `.tsx` files (`app/_layout.tsx` JSX namespace + `appConfig`, `AppHeader` `trackStyle`); no new ones, and none is in a file this change touched.

## Plan Change Log

- 2026-11-08: created from the codebase research run; scope trimmed to keep `SHARED_*`/navigation chrome as recorded follow-up.
- 2026-11-08: gate policy settled — only `INVISIBLE` (measured contrast < 1.6:1, or a token missing from one table) blocks. `low`, `hardcoded` and `island` are advisory, because WCAG exempts disabled controls, white-on-brand is an accepted brand decision, and a gate that blocks on ~300 pre-existing advisories gets disabled rather than fixed. Migration of the 64 hardcoded sites and the 36 island components is recorded follow-up, not silently dropped.
- 2026-11-08: the audit's pairing pass was rewritten twice before landing. A ±12-line "nearest background" heuristic produced 62 findings that were mostly cross-element false positives; brace-matched style objects with stem-related names got it to 13 and still mixed sibling elements. Final approach parses each file with Babel and resolves the real JSX ancestor chain, which is why the counts (62 → 38 → 20 → 13 → 5 → 1) moved as the resolver got *more correct*, not because findings were suppressed.
- 2026-11-08: token-parity check added after this change introduced its own regression — `ACCENT_SECONDARY*` landed in the light table only, so the Secret cards rendered `undefined` colours in dark mode. Parity is now a blocking class, which is exactly the failure mode it catches.
- 2026-11-08: `PasswordStrengthIndicator`'s semantic red→green ramp left as-is (one `low` finding at 2.79:1 for the weakest label); re-theming a severity ramp is a design call, out of scope for an invisibility fix.
- 2026-11-08: lint/typecheck/test baselines recorded above so future runs compare against reality rather than an assumed clean tree.
- 2026-11-08: `TEXT_LINK` added after the first fix pass, when the advisory list showed mode-blind `#007AFF` action labels at 2.83:1 in dark mode — invisible-text fixes surface adjacent readability defects, and a token is cheaper than another hardcoded shade.
