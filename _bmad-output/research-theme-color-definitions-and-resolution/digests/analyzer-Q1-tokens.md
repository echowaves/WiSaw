## Digest — Q1: where colour values and theme definitions live

**Two definition modules, no others.** Theme token maps live in `src/theme/sharedStyles.js`; flat brand/legacy tokens in `src/consts.js`. Nothing re-exports them (`git grep -nE "export .*(LIGHT_THEME|DARK_THEME|THEME|SHARED_|getTheme)" @ 044c479b` returns only the `sharedStyles.js` definition lines).

### Module -> exported colour-bearing symbols

```
src/theme/sharedStyles.js
  :135 (getTheme)          getTheme(isDark) -> DARK_THEME | LIGHT_THEME   [load-bearing]
  :138 (THEME)             THEME = LIGHT_THEME alias
  :19 (LIGHT_THEME), :77 (DARK_THEME)                                    [load-bearing]
  :141 SHARED_CONTAINERS · :195 SHARED_TEXT · :228 SHARED_HEADER
  :325 SHARED_INTERACTIVE · :418 SHARED_LAYOUT   — built at module load from THEME, i.e. light values only
  :444 (SHARED_STYLES)    aggregates the five + theme: THEME (:450)
  :463 (getThemedStyles)  dark-aware style factory; sole call site src/components/NamePicker/index.js:36
  :455 (useCurrentTheme)  reads isDarkMode via require('../state'); no call sites in src at this commit
  :9 (HEADER_HEIGHTS)     numbers only, no colour
src/consts.js             51 importers; flat tokens MAIN_COLOR :36 '#EA5E3D', EMPHASIZED_COLOR :37,
                          SECONDARY_COLOR :38, NAV_COLOR :39, BG_COLOR :40, HEADER_GRADIENT_START :43 / _END :44,
                          HEADER_SHADOW_COLOR :45, HEADER_BORDER_COLOR :46, ACTIVE_SEGMENT_COLOR :47,
                          INACTIVE_SEGMENT_COLOR :48, SEGMENT_BACKGROUND_ACTIVE :49 / _INACTIVE :50,
                          FOOTER_COLOR :52, TEXT_COLOR :75, PLACEHOLDER_TEXT_COLOR :76, UNFILLED_COLOR :77,
                          TRANSPARENT_BUTTON_COLOR :78, TRANSPARENT_ICONS_COLOR :79
  :55 (WAVE_ROLES)        role colours inline: owner MAIN_COLOR, facilitator '#8B5CF6' :57, contributor '#6B7280' :58
  :62 (ROLE_CONFIG)       spreads WAVE_ROLES (:63-65), inherits colour; no new colour
src/utils/navigationStyles.js
  :9 (getDefaultHeaderStyle) CONST.HEADER_GRADIENT_END / HEADER_BORDER_COLOR / HEADER_SHADOW_COLOR (:11-14)
  :39 (getDefaultScreenOptions) CONST.TEXT_COLOR :46, headerTintColor CONST.MAIN_COLOR :49
  :60 (getTransparentHeaderStyle) literal 'rgba(0, 0, 0, 0.3)' :62  — all three are light-only, not dark-aware [load-bearing]
src/theme/screenIcons.tsx
  :13 (SCREEN_HEADER_ICONS) icon/title only, no colour
  :27 (ScreenIconTitle)     iconColor = CONST.MAIN_COLOR | theme.TEXT_PRIMARY :39; badge '#FF3B30' in StyleSheet :79
src/state.js — NOT a directory (brief said src/state/): isDarkMode atom false :11, followSystemTheme atom false :13. No colour values. [load-bearing]
src/utils/themeStorage.js  save/loadThemePreference :8/:17 ('dark'|'light' strings), save/loadFollowSystemPreference :28/:37,
  getSystemTheme :48 (Appearance.getColorScheme), subscribeToSystemTheme :59 — theme *mode*, no colour values
app.config.js  BRAND_FIELD '#01122D' :5 module-local const, not exported; used android adaptiveIcon :105 and splash :253;
  androidStatusBar backgroundColor '#FFFFFF' :126 (:124-127); userInterfaceStyle 'automatic' :248 (not a colour)
```

### LIGHT_THEME / DARK_THEME full key list — 33 keys each, `path:line` = light/dark

```
BACKGROUND :21/:79 · TEXT_PRIMARY :22/:80 · TEXT_SECONDARY :23/:81
CARD_BACKGROUND :26/:84 · CARD_BORDER :27/:85 · CARD_SHADOW :28/:86 · SURFACE :29/:87 · BORDER_LIGHT :30/:88
HEADER_BACKGROUND :33/:91 · HEADER_BORDER :34/:92 · HEADER_SHADOW :35/:93
INTERACTIVE_BACKGROUND :38/:96 · INTERACTIVE_BORDER :39/:97 · INTERACTIVE_PRIMARY :40/:98
INTERACTIVE_ACTIVE :41/:99 · INTERACTIVE_SECONDARY :42/:100
TEXT_DISABLED :45/:103 · BACKGROUND_DISABLED :46/:104 · BORDER_DISABLED :47/:105
STATUS_SUCCESS :50/:108 · STATUS_EDIT :51/:109 · STATUS_WARNING :52/:110 · STATUS_ERROR :53/:111 · STATUS_CAUTION :54/:112
STATUS_ERROR_BACKGROUND :57/:115 · STATUS_ERROR_BORDER :58/:116 · STATUS_SUCCESS_BACKGROUND :59/:117 · STATUS_SUCCESS_BORDER :60/:118
inputFooterBackground :63/:121 · helpCardBackground :66/:124 · helpCardBorder :67/:125
disabledBackground :70/:128 · interactiveBackground :73/:131
```

**Key sets are identical — no key exists in one and not the other.** Verified by extracting `^  Key:` from lines 20-73 and 78-131 and diffing sorted lists: 33 vs 33, empty diff. [load-bearing]

Value-level notes (both patterns coexist, unranked): light aliases consts.js (`BACKGROUND: CONST.BG_COLOR` :21, `disabledBackground: CONST.SECONDARY_COLOR` :70) while dark hardcodes equivalents (`'#121212'` :79). Five keys are camelCase among SCREAMING ones, and within one object `INTERACTIVE_BACKGROUND :38 'rgba(234,94,61,0.05)'` duplicates `interactiveBackground :73 'rgba(234,94,61,0.1)'` at a different value; both themes also share `INTERACTIVE_PRIMARY: CONST.MAIN_COLOR` (:40/:98) and `INTERACTIVE_ACTIVE: CONST.SEGMENT_BACKGROUND_ACTIVE` (:41/:99), so those two tokens never change with mode.

### Non-token colour literals (definition sites)

- Module-local named constants outside the token modules: `src/components/ActionMenu/index.js:17 DESTRUCTIVE_COLOR '#FF3B30'`; duplicated as `src/components/UploadQueueModal/index.js:24 DESTRUCTIVE_COLOR '#FF3B30'`; `src/screens/Secret/components/PasswordStrengthIndicator.js:7 strengthColors = ['#FF6B6B','#FF9500','#FFD93D','#4FC3F7','#50E3C2']`.
- StyleSheet literals in components: `src/components/ui/Badge.js:9,14`; `ui/Button.js:5,28,38,41,75` (`#2D9CDB` — no token carries it); `ui/CloseButton.js:28,33,34,41`; `Photo/PinchableView.js:34-56,86,98,113` (9 lines, most in `src/`); `Photo/index.js:127-170,511,760,769,1320,1328` (`#4FC3F7`/`#FFD700` repeat `STATUS_SUCCESS`/`STATUS_WARNING` values instead of the tokens); `ExpandableThumb/index.js:104,113`; `FriendsExplainerView/index.js:41,52,97,145,150` (`#EA5E3D` = MAIN_COLOR hardcoded); `ShareOptionsModal.js:95,96,102,122`; `ForceUpdateModal/index.tsx:97,109,139`.
- Screens/router: `screens/Feedback/index.js:142,143,362`; `screens/PhotoSelectionMode/index.js:263,284,285,323`; `screens/WaveDetail/index.js:314,448` (`#60A5FA`); `screens/Secret/components/{ActionRow.js:8,18,24,33; IdentityProfileCard.js:41,50,56; PrivacyNoticeCard.js:8,12,21,36; NicknameInputField.js:34; SecretInputField.js:56; PrivacyExplainerView.js:36,47,92,140,145}`; `app/(drawer)/_layout.tsx:331,342,398,477,494`; `app/(drawer)/waves/join.tsx:234,235,339`.
- Third consumption pattern: a styles factory taking the theme as an argument — `src/screens/Secret/styles.js:4 getStyles(theme)` reads `theme.*` but hardcodes `'rgba(234, 94, 61, 0.1)'` at :36.
- Test fixtures define their own theme mocks with colour: `src/components/UploadQueueModal/__tests__/index.test.js:75 (THEME)`; `src/components/GlobalUploadBanner/__tests__/index.test.js:66 (THEME)`.

### Looked for and did not find (at 044c479b, `_bmad-output/`, `_bmad/`, `docs/specs/` excluded)

- No React Native `Colors` import, no palette/theme config from a styling library, no `.json` colour token file: `git ls-tree -r --name-only | grep -iE "state|theme|color|style"` returns only `src/theme/sharedStyles.js`, `src/theme/screenIcons.tsx`, `src/utils/themeStorage.js`, `src/screens/Secret/styles.js` (+ skill assets and docs).
- No `useColorScheme` anywhere in `src` or `app`; system-scheme reads exist only at `src/utils/themeStorage.js:50,62`.
- No theme-symbol re-export barrel (`export * from` / `export { … } from sharedStyles`).
- No theme key present in one set and missing from the other (diff of sorted key lists is empty).
- `useCurrentTheme` has no call site; only `getTheme` (23+ importers), `SHARED_STYLES` (~10) and `getThemedStyles` (1) are imported.

Budget: 9 files opened; ~40 further files inspected at line level via git grep only.
