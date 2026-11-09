## Digest — area `src/components/` + `src/contexts/` @ 044c479b

### Q1 — where color values / theme definitions live, which modules export them

Two external modules are the only color sources this area imports; nothing under `src/components/` or `src/contexts/` defines a colors or theme module (`git ls-tree -r --name-only … -- src/components/ src/contexts/` lists no theme/colors file).

- `src/components/ActionMenu/index.js:15` getTheme import @ 044c479b — imports `getTheme` from `../../theme/sharedStyles`; definitions themselves live outside this area.
- `src/components/NamePicker/index.js:26` NamePicker @ 044c479b — the widest import surface in the area: `getTheme`, `getThemedStyles`, `SHARED_STYLES`.
- `src/components/Photo/index.js:43` imports @ 044c479b — `getTheme` + `SHARED_STYLES`.
- `src/components/UploadQueueModal/index.js:19` imports @ 044c479b — same pair.
- `src/components/WaveSelectorModal/index.js:25` imports @ 044c479b — same pair.
- Brand color second source: `../../consts` `MAIN_COLOR` — 21 files, 45 hits; e.g. `src/components/ActionMenu/index.js:85` ActionMenu @ 044c479b (`color={CONST.MAIN_COLOR}`), also `src/components/WaveSelectorModal/index.js:533` makeStyles @ 044c479b (alpha derived by string concat `` `${CONST.MAIN_COLOR}15` ``; same trick at `src/components/PendingFriendsCard/index.js:12` PendingFriendsCard).
- Local module-level color constants instead of tokens: `src/components/ActionMenu/index.js:17` DESTRUCTIVE_COLOR @ 044c479b (`'#FF3B30'`); `src/components/UploadQueueModal/index.js:24` DESTRUCTIVE_COLOR @ 044c479b; `src/components/PhotoActionButtons/index.js:27` PhotoActionButtons @ 044c479b (prop default `bookmarkAccentColor = '#FFD700'`); `src/components/ui/LinearProgress.js:11` LinearProgress @ 044c479b (prop defaults `color='#2D9CDB'`, `trackColor='rgba(0,0,0,0.1)'`).
- Token names are only enumerated in test fixtures here: `src/components/GlobalUploadBanner/__tests__/index.test.js:66` THEME @ 044c479b (CARD_BACKGROUND, CARD_BORDER, CARD_SHADOW, TEXT_PRIMARY, INTERACTIVE_PRIMARY, TEXT_DISABLED); `src/components/UploadQueueModal/__tests__/index.test.js:75` THEME @ 044c479b (adds BACKGROUND, TEXT_SECONDARY, INTERACTIVE_BACKGROUND, BACKGROUND_DISABLED).

### Q2 — runtime light/dark detection and propagation into styles

Detection is not performed in this area; it is consumed from a Jotai atom. `useAtom(STATE.isDarkMode)` / `useAtom(isDarkMode)` — 19 files: `src/components/ActionMenu/index.js:20` ActionMenu, `src/components/AppHeader/index.tsx:29` AppHeader, `src/components/BookmarksHeaderIcon/index.js:12`, `src/components/ErrorDetailModal/index.js:37`, `src/components/ForceUpdateModal/index.tsx:40`, `src/components/FriendsHeaderIcon/index.js:12`, `src/components/GlobalUploadBanner/index.js:31`, `src/components/IdentityHeaderIcon/index.js:17`, `src/components/QuickActionsModal/index.js:32` (aliased `darkMode`), `src/components/UploadQueueModal/index.js:53`, `src/components/WaveHeaderIcon/index.js:13` — all @ 044c479b, each immediately followed by `getTheme(isDark)` (e.g. `ActionMenu/index.js:21`).

Named-import variant of the same atom (`from '../../state'`): `src/components/EmptyStateCard/index.js:6`, `src/components/ExpandableThumb/index.js:15`, `src/components/MergeWaveModal/index.js:20`, `src/components/NamePicker/index.js:25` (as `isDarkModeAtom`), `src/components/Photo/ImageView.js:12`, `src/components/Photo/PinchableView.js:22`, `src/components/Photo/index.js:42`, `src/components/WaveSelectorModal/index.js:24` @ 044c479b.

Propagation chain inside the area is atom → theme object → style factory → prop drilling:
- `src/components/ActionMenu/index.js:22` ActionMenu @ 044c479b — `useMemo(() => createStyles(theme), [theme])`; factory at `:98`.
- `src/components/ErrorDetailModal/index.js:41` ErrorDetailModal @ 044c479b — memoised `getTheme(isDarkMode)`; `createStyles(theme)` at `:206`.
- `src/components/ForceUpdateModal/index.tsx:41` ForceUpdateModal @ 044c479b — same, factory `:89`.
- `src/components/Photo/index.js:586` Photo @ 044c479b — `createStyles(theme)` (`:187`), static module styles avoided.
- `src/components/MergeWaveModal/index.js:105` MergeWaveModal @ 044c479b — `makeStyle(theme)`→`makeStyles` at `:207`; also `src/components/WaveSelectorModal/index.js:199` (`:420`), `src/components/FriendsExplainerView/index.js:31` (`getStyles` `:79`), `src/components/WavesExplainerView/index.js:25` (`:73`), `src/components/EmptyStateCard/index.js:121` (`:11`).
- Theme object re-passed down as a plain prop (no theme context): `src/components/Photo/index.js:1264` Photo @ 044c479b, `src/components/QuickActionsModal/index.js:194`, `src/components/WaveCard/index.js:47`, `src/components/PhotosListMasonry/index.js:256` (guarded `{theme && …ScrollToTopFob … theme={theme}}`), `src/components/FriendCard/index.js:27`, `src/components/UngroupedPhotosCard/index.js:201` @ 044c479b. Receiving side takes it as a prop with no fallback: `src/components/WaveCard/index.js:11`, `src/components/SearchFab/index.js:23`, `src/components/PhotoActionButtons/index.js:11`, `src/components/PhotosListFooter/index.js:16`, `src/components/PhotosListHeader/index.js:12`, `src/components/FeedModeToggleFAB/index.js:19`, `src/components/WavesExplainerView/index.js:23` @ 044c479b.
- Two components re-create `StyleSheet.create` per render from the prop theme rather than a factory: `src/components/AppHeader/index.tsx:32` AppHeader @ 044c479b, `src/components/PhotosListFooter/index.js:29` PhotosListFooter @ 044c479b.
- Divergent path — boolean prop instead of atom/theme object: `src/components/SortOrderPicker/index.js:28` SortOrderPicker @ 044c479b (`isDarkMode = false` default) → `createStyles(isDark)` at `:181`, which defines its own palette.
- Non-style dark side-effect: `src/components/NamePicker/index.js:186` NamePicker @ 044c479b — status-bar `barStyle` toggled off the same atom.
- Contexts are style-free: `src/contexts/PhotosListContext.js:3` PhotosListContext @ 044c479b (only `removePhoto`), `src/contexts/UploadContext.js:10` UploadContext @ 044c479b / provider `:24` — upload-queue state only.

### Q3 — text/background colors and opacities set outside shared tokens

Color literals (`'#hex'`, `rgba(`): 198 matching lines across 26 files in the area @ 044c479b. Heaviest, with one cited hit each:
- `src/components/WaveShareModal.js` — ~25 literal sites, static `styles` block; `src/components/WaveShareModal.js:330` styles.title @ 044c479b (`color: '#333'`); also inline icon colors at `:183`, `:262`.
- `src/components/ShareOptionsModal.js` — ~20 sites; `src/components/ShareOptionsModal.js:176` styles.title @ 044c479b (`color: '#333'`), inline `#666`/`#ccc` at `:73`, `:102`, brand `'#ff6b35'` at `:122`.
- `src/components/SortOrderPicker/index.js` — ~18 sites; `src/components/SortOrderPicker/index.js:182` createStyles @ 044c479b (five local light/dark hex vars), inline ternaries at `:57`, `:80`, `:107`, `:267`.
- `src/components/Photo/PinchableView.js` — 9 sites; `src/components/Photo/PinchableView.js:34` createStyles @ 044c479b (`rgba(0,0,0,0.6)` overlay), prop colors `color='rgba(255,255,255,0.95)'` at `:86`, `:98`.
- `src/components/Photo/index.js` — 13 sites; `src/components/Photo/index.js:127` renderLoadingOverlay @ 044c479b (`rgba(0,0,0,0.8)`), icon colors `#4FC3F7`/`#FFD700` at `:760`, `:769`, `:1320`.
- `src/components/UngroupedPhotosCard/index.js` — ~10 inline literals; `src/components/UngroupedPhotosCard/index.js:176` UngroupedPhotosCard @ 044c479b (`<Text style={{ color: '#007AFF' }}>`), brand `#EA5E3D` at `:166`, `:244`.
- `src/components/ui/` — 6 files, 21 sites; one hit: `src/components/ui/Button.js:5` styles @ 044c479b (`backgroundColor: '#2D9CDB'`). Also `ui/Badge.js:9`, `ui/CloseButton.js:28`, `ui/Input.js:14`, `ui/InteractionHintBanner.js:46`.
- `src/components/WaveCard/index.js` — 6 sites; `src/components/WaveCard/index.js:91` WaveCard @ 044c479b (`backgroundColor: '#FEF3C7'`, text `#D97706` at `:92`), selection blue at `:67`, `:169`.
- `src/components/WavePhotoStrip/index.js` — 5 sites; `:197` styles @ 044c479b (`backgroundColor: '#007AFF'`).
- `src/components/FriendsExplainerView/index.js` / `src/components/WavesExplainerView/index.js` — brand literals despite receiving `theme`; `FriendsExplainerView/index.js:145` getStyles @ 044c479b (`#EA5E3D`), `WavesExplainerView/index.js:139` getStyles @ 044c479b.
- Modal backdrops hardcoded per screen: `src/components/ActionMenu/index.js:104` createStyles, `src/components/ErrorDetailModal/index.js:213`, `src/components/ForceUpdateModal/index.tsx:97`, `src/components/MergeWaveModal/index.js:210`, `src/components/QuickActionsModal/index.js:226`, `src/components/UploadQueueModal/index.js:309`, `src/components/WaveSelectorModal/index.js:424`, `src/components/SortOrderPicker/index.js:191` @ 044c479b.
- Theme-token-with-literal-fallback (token may be undefined): `src/components/EditWaveModal/index.js:65` EditWaveModal @ 044c479b — 11 sites of `theme.X || '#…'`; `src/components/ScrollToTopFob/index.js:43` styles @ 044c479b (`theme.HEADER_SHADOW || '#000'`).
- Named color keywords: 11 sites, e.g. `src/components/ShareOptionsModal.js:157` styles @ 044c479b (`backgroundColor: 'white'`), plus `EmptyStateCard/index.js:86`, `PendingFriendsCard/index.js:116`, `Photo/index.js:163`.

Opacity literals: 37 matching lines across 14 files @ 044c479b; representative `src/components/WaveShareModal.js:453` styles @ 044c479b (`opacity: 0.5`), `src/components/ui/Button.js:44` styles @ 044c479b (`opacity: 0.6` / `0.85` at `:47`), `src/components/ActionMenu/index.js:139`, `src/components/EmptyStateCard/index.js:48`, `src/components/PhotoActionButtons/index.js:220`, `src/components/UngroupedPhotosCard/index.js:214`, `src/components/UploadQueueModal/index.js:189`, `src/components/WaveSelectorModal/index.js:287`, `src/components/NamePicker/index.js:214`, `src/components/Photo/index.js:979` (inline `{ opacity: … 0.4 }`). Animated/shared-value opacities (not literals): `src/components/SearchFab/index.js:51`, `src/components/ScrollToTopFob/index.js:29`, `src/components/ErrorDetailModal/index.js:93`, `src/components/GlobalUploadBanner/index.js:196`.

Files with no theme reference at all (fully static styling, 15 files): `src/components/ModernHeaderButton/index.js` (`:13 rgba(255,255,255,0.9)`), `src/components/QuickActionsModalWrapper/index.js`, `src/components/SafeAreaView/index.js`, `src/components/Photo/reducer.js`, plus the Q3 list above and both context files @ 044c479b.

### Q4 — how `SHARED_*` presets compose with screen/component styles, where overridden

Only 4 non-test files import them (all from `theme/sharedStyles`), all inside a per-render `createStyles(theme)`-shaped factory:
- `src/components/NamePicker/index.js:26` NamePicker @ 044c479b — mixes both preset families: `themedStyles.containers.main` (`:49`), `themedStyles.text.heading/secondary/primary` (`:72`, `:78`, `:100`) alongside raw `SHARED_STYLES.header.title` (`:52`).
- `src/components/Photo/index.js:187` createStyles @ 044c479b — ~25 spreads of `SHARED_STYLES.containers.card/infoCard`, `.text.heading/subheading/secondary/caption`, `.layout.row/spaceBetween/separator`, `.interactive.statItem/statText` (e.g. `:196`, `:209`, `:231`, `:248`), each followed by local layout keys; colors come from the `theme` argument, not the preset.
- `src/components/WaveSelectorModal/index.js:443` makeStyles @ 044c479b — override order: `...SHARED_STYLES.text.subheading`, then `color: theme.TEXT_PRIMARY`, then local `fontSize`/`fontWeight`.
- `src/components/UploadQueueModal/index.js:238` UploadQueueModal @ 044c479b — array composition `[SHARED_STYLES.text.subheading, styles.headerTitle, { color: theme.TEXT_PRIMARY }]`: preset → screen style → inline color, last wins.
Override/fallback specifics: `src/components/NamePicker/index.js:115` createStyles @ 044c479b — `...(themedStyles.interactive.buttonContainer || SHARED_STYLES.interactive.buttonContainer)`; presets then recolored per theme at `:118` (`backgroundColor: currentTheme.STATUS_SUCCESS`, comment "Use theme color for better dark mode support"), `:127`, `:131`; literal override after spread at `:123` (`color: '#FFFFFF'`, comment "Ensure white text on colored background"); preset used raw with no color layer at `:52`.
- Test doubles show the same split contract: `src/components/UploadQueueModal/__tests__/index.test.js:89` jest.mock @ 044c479b (`SHARED_STYLES: { text: { subheading: {} } }`).
- Name collision, unrelated local constant: `src/components/WavesExplainerView/index.js:7` SHARED_CARDS @ 044c479b — module-local card data array, not the shared style preset.

### Q5 — why `getTheme(isDark)` and a fixed `THEME = LIGHT_THEME` default coexist (evidence from call sites in this area)

- Every in-area call passes the mode: 19 sites listed under Q2 (`ActionMenu/index.js:21`, `Photo/index.js:585`, etc.) @ 044c479b; zero-argument calls do not occur here, and no file imports a bare `THEME` — so the default export is consumed by modules outside this area.
- The split is visible in how the two exports are used together: static presets carry layout/typography while mode-dependent values are layered on at each site — `src/components/WaveSelectorModal/index.js:443` @ 044c479b, `src/components/UploadQueueModal/index.js:238` @ 044c479b, `src/components/NamePicker/index.js:115` @ 044c479b (`|| SHARED_STYLES…` fallback when a themed variant is absent).
- A second class of consumers never calls anything and hardcodes light values, i.e. needs a non-callable default or none at all: `src/components/ui/Button.js:5`, `src/components/ui/Input.js:14`, `src/components/ShareOptionsModal.js:176`, `src/components/WaveShareModal.js:330`, `src/components/ModernHeaderButton/index.js:13` @ 044c479b.
- In-code comments state the intent of layering theme colors onto presets: `src/components/NamePicker/index.js:118` and `:123` createStyles @ 044c479b ("Use theme color for better dark mode support", "Ensure white text on colored background"); `src/components/EditWaveModal/index.js:25` docblock @ 044c479b documents `theme` as "Theme object from useTheme or getTheme" and its call sites (`:65`–`:97`) defend against missing tokens with literal fallbacks — the only place in the area where a theme object's completeness is treated as uncertain.
- Tests treat them as separate contracts, mocking the selector and the static object independently: `src/components/UploadQueueModal/__tests__/index.test.js:87` jest.mock @ 044c479b, `src/components/GlobalUploadBanner/__tests__/index.test.js:76` jest.mock @ 044c479b.

### Searched and found nothing (all at commit 044c479b)

- `git grep -n -E "useColorScheme|Appearance|colorScheme|prefers-color" … -- src/components/ src/contexts/` — no hits; the area performs no OS appearance detection itself.
- `git grep -n -E "getTheme\(\)"` in area — no zero-arg calls.
- `git grep -n -E "(import[^;]*\bTHEME\b|{ *THEME *})"` in area — only test-local fixture consts (`GlobalUploadBanner/__tests__/index.test.js:66`, `UploadQueueModal/__tests__/index.test.js:75`); no import of a fixed default theme.
- `git grep -n -E "(export )?const [A-Z_]*COLOR[A-Z_]* ="` in area — no exported color constants; only non-exported module consts (`ActionMenu/index.js:17`, `UploadQueueModal/index.js:24`).
- `git ls-tree -r --name-only … -- src/components/ src/contexts/` — no theme/colors file or provider anywhere in the area.
- `git grep -n -i -E "color|theme|style" … -- src/contexts/` — no hits; both context files are style-free (the only context usage in the area is upload queue / photo removal: `GlobalUploadBanner/index.js:29`, `Photo/index.js:591`).
- `git grep -n -E "StyleSheet\.compose"` in area — no hits; composition is object spread and style arrays only.
- `git grep -n -E "(isDark|isDarkMode|darkMode)=\{"` in area — no hits; dark state is drilled as a whole `theme` object, never as a boolean prop (except `SortOrderPicker`, whose caller is outside the area).
