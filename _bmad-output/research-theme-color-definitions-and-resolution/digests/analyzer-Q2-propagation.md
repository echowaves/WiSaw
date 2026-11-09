## Q2 — How a runtime light/dark choice reaches component styles

Single source of truth: one Jotai boolean atom. No React Context, no `ThemeProvider`, no `useColorScheme` anywhere in the tree (negative searches below). `getTheme(isDark)` swaps between two frozen module-level colour tables; every themed style object is rebuilt per render from that table.

### End-to-end path A — user gesture (drawer switcher)

- **Gesture** — `app/(drawer)/_layout.tsx:311` CustomDrawerContent `onPress={() => { void handleThemeChange(mode) }}`, one button per entry of `THEME_MODES = ['light','dark','system']` @ 044c479b (`:21` THEME_MODES, mapped at `:308`)
- **State write** — `app/(drawer)/_layout.tsx:204` handleThemeChange; light: `:207` `setIsDark(false)` + `:208` `setFollowSystemTheme(false)`; dark: `:213`/`:214`; system: `:219` `setFollowSystemTheme(true)` then `:220` `setIsDark(getSystemTheme())` @ 044c479b — **load-bearing**
- **Atom** — `src/state.js:11` `export const isDarkMode = atom(false)`; `src/state.js:13` `followSystemTheme = atom(false)` @ 044c479b — **load-bearing**. Jotai write re-renders every mounted `useAtom(STATE.isDarkMode)` subscriber.
- **Persistence (side effect, not on the render path)** — `app/(drawer)/_layout.tsx:209`/`:215` `saveThemePreference`, `:210`/`:216`/`:221` `saveFollowSystemPreference` → `src/utils/themeStorage.js:8` saveThemePreference, `:28` saveFollowSystemPreference @ 044c479b
- **Render** — `app/(drawer)/_layout.tsx:196` `const [isDark, setIsDark] = useAtom(STATE.isDarkMode)` (CustomDrawerContent), `:452` same read in DrawerLayout @ 044c479b
- **Style object** — `app/(drawer)/_layout.tsx:200` `const styles = createStyles(isDark)` (unmemoised, every render) → `:54` createStyles → `:55` `getTheme(isDark)`; plus `:201`/`:454` `theme = getTheme(isDark)` @ 044c479b
- **Table lookup** — `src/theme/sharedStyles.js:135` `export const getTheme = (isDark) => (isDark ? DARK_THEME : LIGHT_THEME)`; tables at `:19` LIGHT_THEME, `:77` DARK_THEME @ 044c479b — **load-bearing**
- **Prop** — `app/(drawer)/_layout.tsx:312-321` `style={[styles.themeButton, { backgroundColor: getCurrentThemeMode() === mode ? theme.INTERACTIVE_PRIMARY : theme.INTERACTIVE_BACKGROUND }]}`; `:472` `drawerStyle.backgroundColor: theme.BACKGROUND`; `:477` `drawerInactiveTintColor: isDark ? '#BBB' : '#666'` @ 044c479b

### End-to-end path B — OS appearance change (follow-system)

- **OS event** — `src/utils/themeStorage.js:62` `Appearance.addChangeListener(({ colorScheme }) => ...)` → `:64` `callback(colorScheme === 'dark')` @ 044c479b
- **State write** — callback *is* the setter: `app/_layout.tsx:237` `subscribeToSystemTheme(setIsDarkMode)`, inside an effect gated by `:232 if (followSystemTheme)`; effect also re-seeds at `:234 setIsDarkMode(getSystemTheme())`; teardown guard `:241` checks `typeof subscription.remove === 'function'` @ 044c479b — **load-bearing**
- Native side allows automatic appearance: `app.config.js:248 userInterfaceStyle: 'automatic'`
- **Render → style object → prop** — as path A, per subscriber; e.g. `app/_layout.tsx:50` read → `:256 <StatusBar style={isDarkMode ? 'light' : 'dark'} />`; `src/theme/screenIcons.tsx:28` read → `:30 getTheme` → `:39 iconColor` → `:48 color=` prop and `:54` `style={[styles.title, { color: theme.TEXT_PRIMARY }]}` @ 044c479b

### End-to-end path C — cold start (hydrated choice)

- `app/_layout.tsx:173` initialize → `:185 Promise.allSettled([...])` with `:188 loadThemePreference()` and `:189 loadFollowSystemPreference()` → `:199` followSystem, `:202` themePreference → **`:203 setIsDarkMode(followSystem ? getSystemTheme() : themePreference)`** @ 044c479b — **load-bearing**. Until this resolves, the atom is still its initial `false`, so first paint is light.
- Representative screen: `src/screens/FriendsList/index.js:37` read → `:40 theme = getTheme(isDarkMode)` → `:44`/`:45` in-component `createStyles(theme)`/`StyleSheet.create` → `:80 styles = createStyles(theme)` → `style={styles.*}` props @ 044c479b
- Representative component: `src/components/ActionMenu/index.js:20` read → `:21 theme` → `:22 useMemo(() => createStyles(theme), [theme])` → module-level factory `:98 createStyles` (`StyleSheet.create`) → `styles.card` props @ 044c479b

### Values computed at module import, not per render

- `src/theme/sharedStyles.js:5` `Dimensions.get('window')`, `:6 isSmallDevice`, `:9 HEADER_HEIGHTS` — geometry only.
- `src/theme/sharedStyles.js:138 THEME = LIGHT_THEME` — **load-bearing**: an alias permanently bound to the light table.
- Presets built from that alias at import, therefore permanently light: `:141 SHARED_CONTAINERS`, `:195 SHARED_TEXT`, `:228 SHARED_HEADER`, `:325 SHARED_INTERACTIVE`, `:418 SHARED_LAYOUT`, and the aggregate `:444 SHARED_STYLES` whose `theme:` field is `THEME` at `:450`. Consumers (counts of `SHARED_*` refs): `src/components/Photo/index.js` (25), `src/components/NamePicker/index.js` (8), `app/(drawer)/(tabs)/_layout.tsx` (5), `app/modal-input.tsx` (4), plus 2–3 each in WavesHub, ModalInputText, WaveDetail, FriendDetail, FriendsList, ConfirmFriendship, PhotosDetailsShared, WaveSelectorModal, UploadQueueModal.
- Live example of a baked value reaching a prop: `app/(drawer)/(tabs)/_layout.tsx:24`/`:26`/`:27`/`:39` set `headerStyle.backgroundColor/borderBottomColor/shadowColor` and title colour from `SHARED_STYLES.theme.*`; that file never reads the atom, so the *confirm-friendship* header stays light in dark mode @ 044c479b — **load-bearing**.
- `src/utils/navigationStyles.js:9 getDefaultHeaderStyle` re-runs per call but its colours come from `CONST.HEADER_GRADIENT_END`/`HEADER_BORDER_COLOR`/`HEADER_SHADOW_COLOR` (`:11-14`); `src/consts.js` contains no dark-mode awareness (search below). Used by `app/(drawer)/(tabs)/_layout.tsx:8`.
- Module-level `StyleSheet.create` sheets in files that *also* read the atom — harmless where they hold only geometry (`src/components/FriendsHeaderIcon/index.js:34`, `src/theme/screenIcons.tsx:61`) or fixed accents (`src/screens/WaveSettings/index.js:525`, e.g. `:540 color:'#60A5FA'`); same shape in `src/components/BookmarksHeaderIcon/index.js:34`, `IdentityHeaderIcon/index.js:95`, `WaveHeaderIcon/index.js:68`, `UploadQueueModal/index.js:306`, `ExpandableThumb/index.js:239`, `app/(drawer)/waves/join.tsx:277`, `src/screens/FriendDetail/index.js:283`, `PhotoSelectionMode/index.js:257`, `WaveDetail/index.js:556`, `WaveMembers/index.js:300`, `WaveModeration/index.js:208`, `WavesHub/index.js:731`.
- Not import-time but per-render cost on the theming path: `src/components/AppHeader/index.tsx:32` calls `StyleSheet.create` inside the component body (no memo), unlike ActionMenu's memoised `:22`; same for FriendsList `:45`/`:80` and drawer `_layout.tsx:200`.

### Reads the mode without using its value to re-theme

- `app/(drawer)/waves/members.tsx:11`, `app/(drawer)/waves/moderation.tsx:11`, `app/(drawer)/waves/settings.tsx:11` — each declares `const [isDarkMode] = useAtom(STATE.isDarkMode)` and the identifier occurs exactly once in the file (verified by per-file occurrence count); they subscribe and re-render on every theme flip while passing no colour down. The theming instead happens inside the child screen / `AppHeader` @ 044c479b — **load-bearing**.
- Contrast (does re-theme correctly): `src/components/FriendsHeaderIcon/index.js:12-17`, `src/theme/screenIcons.tsx:28-39`, `src/screens/ModalInputText/index.js:34-35`, `app/(drawer)/waves/join.tsx:104-105`.
- Adjacent mode consumer that isn't a style: `src/components/NamePicker/index.js:186 barStyle={isDarkMode ? 'light-content' : 'dark-content'}`; `app/_layout.tsx:256` StatusBar.

### Checks / fallbacks that reject a value, with the default

- `src/utils/themeStorage.js:19-20` — only the exact string `'dark'` yields dark; any other stored value (including a legacy `'true'`, or `null` when unset) → light.
- `src/utils/themeStorage.js:21-24` catch on load → logs, `showErrorToast('Theme Loading Error', … 'Using default light theme')`, returns `false` (light).
- `src/utils/themeStorage.js:39-40` — only literal `'true'` means follow-system; anything else → manual control.
- `src/utils/themeStorage.js:41-45` catch → toast + `return false` (manual control).
- `src/utils/themeStorage.js:50-52` — `Appearance.getColorScheme()` must equal `'dark'`; `null`/`'light'` → light. `:53-56` catch → `false`, no toast.
- `src/utils/themeStorage.js:67-71` subscribe failure → toast + `return null`; caller tolerates it via the `subscription && typeof subscription.remove === 'function'` guard at `app/_layout.tsx:241`.
- `app/_layout.tsx:168-171 getResolvedValue` — a rejected promise, or a fulfilled `null`/`undefined`, is replaced by the default; used with `false` for both theme inputs (`:199`, `:202`).
- `app/_layout.tsx:193 if (isCancelled) return` — discards the hydrated theme if the layout unmounted mid-load.
- `app/_layout.tsx:214-221` outer catch → `setIsDarkMode(false)` (`:219`) and `setFollowSystemTheme(false)` (`:220`).
- Write path has no rejection of state: `src/utils/themeStorage.js:11-14`/`:31-34` swallow save failures into a toast, so the in-memory mode can diverge from storage; `app/(drawer)/_layout.tsx:209-221` awaits those helpers and has no try/catch of its own (they cannot reject).
- Gating check that rejects live OS values: `app/_layout.tsx:232 if (followSystemTheme)` — when false, no subscription exists and OS changes are ignored.

### Two patterns doing the same thing (unranked)

1. **Module-level factory + memo:** `src/components/ActionMenu/index.js:98` `createStyles(theme)` called from `:22 useMemo(…, [theme])`; also `ErrorDetailModal/index.js:41`, `ForceUpdateModal/index.tsx:41`, `src/screens/TandC/index.tsx:46`, `src/components/SortOrderPicker/index.js:30` (prop-driven, default `false` at `:28`).
2. **Rebuild inline every render:** in-component `createStyles` + `StyleSheet.create` (`src/screens/FriendsList/index.js:44-80`, `src/components/AppHeader/index.tsx:32`, `app/(drawer)/_layout.tsx:54`/`:200`), or bare literals from `theme` in JSX (`src/theme/screenIcons.tsx:54`, `app/(drawer)/_layout.tsx:312-321`).

Atom access also has two spellings, unranked: namespace read `useAtom(STATE.isDarkMode)` (majority) vs named atom import, e.g. `src/components/EmptyStateCard/index.js:6`+`:119`, `MergeWaveModal/index.js:20`+`:33`, `Photo/index.js:42`+`:584`, `Photo/ImageView.js:12`+`:20`, `Photo/PinchableView.js:22`+`:73`, `WaveSelectorModal/index.js:24`+`:47`, `NamePicker/index.js:25`+`:34`.

### Looked for and did not find (at 044c479b, excluding `_bmad/`, `_bmad-output/`, `docs/specs/`)

- `git grep -n "useColorScheme" …` → no results.
- `git grep -n "ThemeProvider|NavigationContainer.*theme|DarkTheme" …` → no results (react-navigation's theme object is never themed; only `drawerActiveTintColor: 'white'`/`CONST.MAIN_COLOR` at `app/(drawer)/_layout.tsx:475-476`).
- `git grep -n "useCurrentTheme|getThemedStyles" -- src app` → `src/theme/sharedStyles.js:455 useCurrentTheme` (which lazy-`require`s jotai and the atom at `:456-458`) has **zero callers**; `getThemedStyles` (`:463`, rebuilds a themed style tree per call) is called from exactly one site, `src/components/NamePicker/index.js:36`, unmemoised.
- `git grep -n "isDark|DARK|getTheme" -- src/consts.js` → no results; constants in `src/consts.js` are mode-independent.
- No `userInterfaceStyle`/`colorScheme` dark handling beyond `app.config.js:248 userInterfaceStyle: 'automatic'`.

Budget used: 14 of 15 files opened (`themeStorage.js`, `state.js`, `app/_layout.tsx`, `app/(drawer)/_layout.tsx`, `src/theme/sharedStyles.js`, `FriendsList/index.js`, `ActionMenu/index.js`, `FriendsHeaderIcon/index.js`, `app/(drawer)/(tabs)/_layout.tsx`, `src/theme/screenIcons.tsx`, `src/utils/navigationStyles.js`, `AppHeader/index.tsx`, `WaveSettings/index.js` (partial, :525-560), `app/(drawer)/waves/settings.tsx`). Not opened: the remaining ~14 `SHARED_STYLES`/`SHARED_*` consumers listed above (only their reference counts and the two `_layout`/`modal-input` colour sites were verified by search).