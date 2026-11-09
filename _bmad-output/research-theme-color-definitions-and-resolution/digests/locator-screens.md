## Digest — area `src/screens/` @ 044c479b

### Q1 — Where color values / theme definitions live (in-area evidence)

- `src/screens/Secret/styles.js:4` (getStyles) @ 044c479b — the only module inside `src/screens/` that exports a style object; factory `(theme) => StyleSheet.create(...)`, tokens passed in.
- Shared-theme module identified at its import sites (all read `getTheme` from `../../theme/sharedStyles`): `src/screens/Feedback/index.js:31`, `FriendDetail/index.js:18`, `FriendsList/index.js:31`, `ModalInputText/index.js:20`, `PhotoSelectionMode/index.js:22`, `PhotosDetailsShared/index.js:20`, `PhotosList/index.js:45`, `Secret/index.js:26`, `TandC/index.tsx:16`, `WaveDetail/index.js:19`, `WaveMembers/index.js:18`, `WaveModeration/index.js:19`, `WaveSettings/index.js:25`, `WavesHub/index.js:27` — 14 files, each names the selector (some also `SHARED_STYLES`).
- Second color source is `../../consts`, not the theme dir: `src/screens/WaveMembers/index.js:17` (MAIN_COLOR), `WaveModeration/index.js:18` (MAIN_COLOR), `Feedback/index.js:144` (CONST.TEXT_COLOR), `Feedback/index.js:437` (CONST.PLACEHOLDER_TEXT_COLOR).
- `src/screens/Feedback/index.js:32`, `FriendsList/index.js:32`, `WavesHub/index.js:28` (ScreenIconTitle) — third theme module, `../../theme/screenIcons`, exports a themed title/icon component.
- `src/screens/TandC/index.tsx:111` (ThemeShape) — token shape is defined as `ReturnType<typeof getTheme>`, i.e. the token list is whatever the selector returns.
- Dark/light signal module: `src/screens/ModalInputText/index.js:19` and `PhotosDetailsShared/index.js:19` import `isDarkMode` from `../../state`.

### Q2 — Light/dark detection and propagation into styles

Detection (one source, a Jotai atom; no RN color-scheme API in this area):
- `src/screens/Feedback/index.js:39` (FeedbackScreen) — `useAtom(STATE.isDarkMode)` → `getTheme(isDarkMode)` at :43. Same two-step pair: `FriendDetail/index.js:38,68`; `FriendsList/index.js:37,40`; `ModalInputText/index.js:34,35`; `PhotoSelectionMode/index.js:62,74`; `PhotosDetailsShared/index.js:43,45`; `PhotosList/index.js:136,151`; `Secret/index.js:51,56`; `WaveDetail/index.js:50,118`; `WaveMembers/index.js:33,34`; `WaveModeration/index.js:31,33`; `WaveSettings/index.js:35,36`; `WavesHub/index.js:56,109` — 14 files.
- `src/screens/TandC/index.tsx:46` (TandCModal) — only site that memoises the theme (`useMemo(..., [isDarkMode])`).

Propagation into stylesheets:
- Theme-as-argument factories: `src/screens/FriendsList/index.js:44` + call at :80 (createStyles); `ModalInputText/index.js:37` + :101; `PhotosDetailsShared/index.js:23` + :46; `Secret/index.js:209` (getStyles(theme)); `TandC/index.tsx:47` (createStyles(theme, insets)).
- `src/screens/PhotosList/index.js:153` (styles) — comment "Dynamic styles based on current theme", sheet rebuilt per render.
- Prop drilling to children: `src/screens/Secret/index.js:255` (theme={theme}; 14 such props in file), `PhotosList/index.js:486` (LocationDriftBanner), `WaveDetail/index.js:484`, `WavesHub/index.js:547`, `FriendDetail/index.js:249`, `FriendsList/index.js:389`; children read tokens off the prop: `PhotosList/components/LocationDriftBanner.js:10` (LocationDriftBanner), `Secret/components/ActionRow.js:18`, `Secret/components/PasswordStrengthIndicator.js:23`.
- Module-level sheets that never receive the theme — searched `theme.` after each block start, no hits in any: `src/screens/WaveSettings/index.js:525` (styles), `WaveDetail/index.js:556`, `WavesHub/index.js:731`, `WaveMembers/index.js:300`, `WaveModeration/index.js:208`, `PhotoSelectionMode/index.js:257`, `FriendDetail/index.js:283`; their mode-dependent color arrives as inline overrides, e.g. `WaveSettings/index.js:295` (ScrollView backgroundColor theme.INTERACTIVE_BACKGROUND).
- Mode-independent chrome: `src/screens/ModalInputText/index.js:177` (ModalInputText) and `PhotosDetailsShared/index.js:135`, `:154` — `barStyle='dark-content'` fixed while `backgroundColor` is theme-driven.

### Q3 — Text/background colors and opacities set outside shared tokens

- `src/screens/Feedback/index.js:142,143` (getCharacterCountColor) — `'#FF6B6B'`, `'#FFD93D'`; `:149,150` (getInputBorderColor) — `rgba(255,255,255,.3/.1)`; `:159` opacity 0.5/1; `:347` `color:'white'`; `:362`, `:485`, `:492`, `:499`, `:506` — inline `'#4FC3F7'`.
- `src/screens/FriendsList/index.js:75` (createStyles) — `rgba(128,128,128,0.2)` inside the theme factory.
- `src/screens/ModalInputText/index.js:177` (StatusBar `backgroundColor='transparent'`), `:228` (icon `color='white'`), `:165` (commented-out `rgba(0,0,0,0.9)`).
- `src/screens/PhotoSelectionMode/index.js:179`, `:248` (`'#FFF'` props); static sheet literals at `:263`, `:284`, `:285`, `:305` (`shadowColor:'#000'`), `:323`; inline token props `:232`, `:243`, `:272`.
- `src/screens/Secret/components/` — directory full of matches: 23 literal-color hits across 7 files; one cited hit `src/screens/Secret/components/PasswordStrengthIndicator.js:7` (strengthColors) local palette array, used at `:50`, `:60`, `:70`. Same pattern in `ActionRow.js:8,18,24,33` (`'#FF9500'`, rgba), `IdentityProfileCard.js:26,41,50,56`, `PrivacyExplainerView.js:36,47,92,140,145,152`, `PrivacyNoticeCard.js:8,12,21,36`, `NicknameInputField.js:34` (`errorStyle {'#FF6B6B'}`), `SecretInputField.js:56`.
- `src/screens/Secret/styles.js:36` (rgba), `:95` (`color:'white'`) — in the screen's own exported sheet.
- `src/screens/Secret/index.js:310`, `:418` (`color='white'`), `:367` (`'#EA5E3D'`).
- `src/screens/TandC/index.tsx:204` (createStyles, `opacity: 0.85`), `:209` (`color:'#FFFFFF'`).
- `src/screens/WaveDetail/index.js:314`, `:448` (`'#60A5FA'` props), `:329` (`roleConfig.color` from `ROLE_CONFIG`); sheet literals `:569`, `:612`, `:620`.
- `src/screens/WaveMembers/index.js:157` (string-concatenated alpha `roleInfo.color + '20'`), `:190`, `:198`, `:199` (`'#EF4444'`, `'#EF444420'`).
- `src/screens/WaveModeration/index.js:163`, `:164`; sheet `:282` (`color:'#FFF'`).
- `src/screens/WaveSettings/index.js:298`, `:478`, `:442`, `:447` (`'#60A5FA'`, `'#fff'`, conditional `'#FFFFFF'`) + 26 inline color objects overall, mostly tokens; sheet literals `:532`, `:540`, `:628`.
- `src/screens/WavesHub/index.js:208` (inline `{color:'#007AFF'}`), `:682` (`opacity 0.4`), `:683`, `:688`; sheet literals `:757`, `:769`, `:831`.
- Contrast, token-only files in area: `src/screens/PhotosList/index.js:568–582` (inline objects using `theme.CARD_BACKGROUND`/`TEXT_SECONDARY`/`STATUS_ERROR`), `PhotosList/components/LocationDriftBanner.js:10–37`.

### Q4 — How `SHARED_*` presets compose and where overridden

- Array composition with a later inline override (preset wins only on unlisted keys): `src/screens/FriendDetail/index.js:166` (FriendDetail), `FriendsList/index.js:106`, `WaveDetail/index.js:344`, `WavesHub/index.js:198`, `:218` — all `SHARED_STYLES.interactive.headerButton` followed by `{ backgroundColor: theme.INTERACTIVE_BACKGROUND, ... }`.
- Spread composition into a local sheet with additions: `src/screens/ModalInputText/index.js:92` (submitButton, adds `margin`), `:97` (submitButtonTitle, verbatim); `PhotosDetailsShared/index.js:35` (headerTitle, then `textShadowColor: theme.CARD_SHADOW` etc. layered on top).
- Spread as whole-style alias: `src/screens/FriendsList/ConfirmFriendship.js:36` (styles.container = `...SHARED_STYLES.containers.main`).
- Coverage: 7 files use `SHARED_`; the other screen entry points (`Feedback`, `PhotosList`, `PhotoSelectionMode`, `Secret`, `TandC`, `WaveMembers`, `WaveModeration`, `WaveSettings`) build only from theme tokens, `CONST` or literals.

### Q5 — Why both `getTheme(isDarkMode)` and a fixed `THEME = LIGHT_THEME` default

- No file in `src/screens/` references the fixed export: searched `git grep -n -E "\bTHEME\b|LIGHT_THEME|DARK_THEME" 044c479b -- src/screens/` → no hits; searched `git grep -n "getTheme()" 044c479b -- src/screens/` → no hits. All 14 call sites (listed under Q2) pass the mode explicitly.
- `src/screens/TandC/index.tsx:111` (ThemeShape) — consumers type themselves against the selector's return, so the selector, not the constant, is the token contract screens depend on.
- No in-area comment explains the default: searched `git grep -n -E "//.*(theme|Theme|dark|light)" 044c479b -- src/screens/` → only `src/screens/PhotosList/index.js:153` ("Dynamic styles based on current theme"). The rationale itself would sit in `src/theme/sharedStyles.js`, outside this area.

### Searched and found nothing (all at 044c479b)

- `git grep -n -E "#[0-9A-Fa-f]{3,8}\b" -- src/screens/` → 0 hits: false negative, `\b` is not ERE in git grep; re-run without it returned the literals cited under Q3.
- `git grep -n -E "useColorScheme|colorScheme|Appearance" -- src/screens/` → no hits (dark/light reaches this area only via the `isDarkMode` atom).
- `git grep -n "^export" -- src/screens/ | grep -iE "style|color|theme"` → 1 hit (`Secret/styles.js:4`); no color palette or theme object is defined anywhere else in `src/screens/`.
- `git ls-tree -r --name-only 044c479b -- src/screens/Waves/` → 2 entries (`reducer.js`, one test); no screen component there to style.
- Of the 39 files listed by `git ls-tree -r --name-only 044c479b -- src/screens/`, 14 carry no `theme|color|style|opacity` text at all: `FriendDetail/reducer.js`, `FriendsList/reducer.js`, `FriendsList/friends_helper.js`, `PhotosList/reducer.js`, `PhotosList/upload/usePhotoUploader.js`, `Secret/reducer.js`, `Secret/utils/validation.js`, `WaveDetail/reducer.js`, `WavesHub/reducer.js`, `Waves/reducer.js`, and the 4 test files (`PhotosList/upload/__tests__/*3`, `Waves/__tests__/autoGroupPhotosIntoWaves.test.js`).
- `git ls-tree` rejects `:(exclude)` pathspec magic ("pathspec magic not supported"); exclusion was moot since every search was scoped to `-- src/screens/`.