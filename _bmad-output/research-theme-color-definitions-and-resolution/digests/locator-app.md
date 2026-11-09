**Digest — area `app/` @ 044c479b** (27 files under `app/`; only 5 contain any colour/style code: `app/_layout.tsx`, `app/(drawer)/_layout.tsx`, `app/(drawer)/(tabs)/_layout.tsx`, `app/(drawer)/waves/join.tsx`, `app/modal-input.tsx`)

## Q1 — where colour values / theme definitions live, which modules export them

Nothing in `app/` defines a palette; every route file imports tokens from outside the area. Import sites naming the exporting modules:
- `app/(drawer)/_layout.tsx:31 (getTheme import) @ 044c479b` — pulls `getTheme` from `src/theme/sharedStyles`.
- `app/(drawer)/(tabs)/_layout.tsx:3 (SHARED_STYLES import) @ 044c479b` and `app/modal-input.tsx:9 (SHARED_STYLES import) @ 044c479b` — same module, fixed-preset entry point.
- `app/(drawer)/waves/join.tsx:23 (getTheme import) @ 044c479b` — third `sharedStyles` consumer.
- `app/(drawer)/_layout.tsx:32 (SCREEN_HEADER_ICONS import) @ 044c479b`, `app/(drawer)/identity.tsx:4 (ScreenIconTitle import) @ 044c479b` — icon+title theme module `src/theme/screenIcons`.
- `app/_layout.tsx:18-23 (themeStorage import block) @ 044c479b` and `app/(drawer)/_layout.tsx:34-37 (themeStorage import block) @ 044c479b` — `src/utils/themeStorage` exports `getSystemTheme`, `loadThemePreference`, `loadFollowSystemPreference`, `saveThemePreference`, `saveFollowSystemPreference`, `subscribeToSystemTheme`.
- `app/(drawer)/(tabs)/_layout.tsx:4 (getDefaultScreenOptions import) @ 044c479b`, also `app/(drawer)/waves/_layout.tsx:2`, `app/friendships/_layout.tsx:2` — app-wide header style factory in `src/utils/navigationStyles`.
- `app/(drawer)/(tabs)/_layout.tsx:2 (CONST import) @ 044c479b` — brand colour `CONST.MAIN_COLOR` comes from `src/consts`, not a theme module.
- Only colour-ish constant *declared* in the area: `app/(drawer)/_layout.tsx:45 (THEME_MODES) @ 044c479b` — `['light','dark','system']` mode names, no values.

## Q2 — light/dark detection and propagation into styles

Detection is delegated to `themeStorage`; the atom `STATE.isDarkMode` is the in-app carrier.
- `app/_layout.tsx:50 (RootLayout isDarkMode atom) @ 044c479b` — `useAtom(STATE.isDarkMode)`; `app/_layout.tsx:51-53 (followSystemTheme atom) @ 044c479b`.
- `app/_layout.tsx:203 (initialize) @ 044c479b` — startup resolve: `setIsDarkMode(followSystem ? getSystemTheme() : themePreference)`; `app/_layout.tsx:219 (initialize catch) @ 044c479b` — falls back to light.
- `app/_layout.tsx:234,237 (system-theme effect / subscribeToSystemTheme(setIsDarkMode)) @ 044c479b`, deps and teardown at `:239-249` — live OS changes pushed into the atom only while `followSystemTheme`.
- `app/_layout.tsx:256 (StatusBar style) @ 044c479b` — atom → `'light'|'dark'` prop directly; comment at `:254-255` notes RN edge-to-edge dropped the background colour option.
- `app/(drawer)/_layout.tsx:196,200-201 (CustomDrawerContent) @ 044c479b` — atom → `createStyles(isDark)` + `getTheme(isDark)` per render; `app/(drawer)/_layout.tsx:54-55 (createStyles) @ 044c479b` — whole stylesheet rebuilt from the flag.
- `app/(drawer)/_layout.tsx:204-224 (handleThemeChange) @ 044c479b` — manual light/dark/system choice writes atom + persists; `:226-229 (getCurrentThemeMode) @ 044c479b` reads it back.
- `app/(drawer)/_layout.tsx:452,454,472,477 (DrawerLayout) @ 044c479b` — atom → `theme.BACKGROUND` drawer style and inline `isDark ? '#BBB' : '#666'`.
- `app/(drawer)/waves/join.tsx:104-105 (WaveJoinScreen) @ 044c479b` — atom → `getTheme`, applied via inline arrays on each element (`:194,201,210`).
- Read-but-unused theme subscriptions (force re-render only): `app/(drawer)/waves/members.tsx:11`, `moderation.tsx:11`, `settings.tsx:11` @ 044c479b.
- Propagation into screen bodies is not done here — routes render `src/screens/*` with no theme prop (e.g. `app/(drawer)/waves/members.tsx:26 (WaveMembers) @ 044c479b`, `app/modal-input.tsx:93 (ModalInputText) @ 044c479b`); headers go through `AppHeader` (`members.tsx:19`, `identity.tsx:15`, `join.tsx:187`) which themes itself outside the area.

## Q3 — colours/opacities set outside shared theme tokens

`app/(drawer)/_layout.tsx`:
- `:79 (createStyles.themeText) @ 044c479b`, `:98 (createStyles.appName) @ 044c479b` — `color: CONST.MAIN_COLOR`.
- `:331,343 (CustomDrawerContent theme-switcher icon/label) @ 044c479b` — inline `'#FFFFFF' : CONST.MAIN_COLOR`.
- `:385 (IdentityDrawerIcon iconColor) @ 044c479b`, `:410 (FriendsDrawerIcon) @ 044c479b`, `:423 (ActivityDrawerIcon) @ 044c479b` — `CONST.MAIN_COLOR` overriding the navigation-supplied `color`.
- `:398 (IdentityDrawerIcon badge) @ 044c479b` — hardcoded `'#FF3B30'`.
- `:150-154 (DrawerRow) @ 044c479b` — `'transparent'` fallbacks for tint/background.
- `:273 (CustomDrawerContent root View) @ 044c479b` — inline literal style object wrapping a token.
- `:461 (DrawerLayout offlineItemStyle) @ 044c479b` — `opacity: 0.4`.
- `:475,476,477 (Drawer screenOptions) @ 044c479b` — `'white'`, `CONST.MAIN_COLOR`, `'#BBB'|'#666'`; `:493 (overlayColor) @ 044c479b` — `'rgba(0, 0, 0, 0.5)'`.

`app/(drawer)/waves/join.tsx`:
- `:197 (WaveJoinScreen iconCircle) @ 044c479b` — `` `${CONST.MAIN_COLOR}15` `` alpha-by-string-concat; `:198,212 (icon color props) @ 044c479b`; `:243 (joinButton inline) @ 044c479b`.
- `:234 (errorCard inline) @ 044c479b` — `'#FFF0F0'`, `'#FFCCCC'`.
- `:249,252 (ActivityIndicator / icon color='white') @ 044c479b`.
- local stylesheet at `:277 (styles = StyleSheet.create) @ 044c479b`: `:339 (errorText) '#CC0000'`, `:354 (joinButtonText) 'white'`, `:359 (disabledButton) opacity: 0.6`.

`app/(drawer)/(tabs)/_layout.tsx`:
- `:21 (headerTintColor) @ 044c479b` — `CONST.MAIN_COLOR`; `:28-34 (headerStyle shadow literals) @ 044c479b` — `shadowOpacity: 1`, `shadowRadius: 4`, `elevation: 3`, cast `as any`; `:36-40 (headerTitleStyle) @ 044c479b` — literal font metrics.

`app/modal-input.tsx`:
- `:75 (rightSlot TouchableOpacity) @ 044c479b` — inline `opacity: 0.6 : 1`.

Remaining 22 files in `app/` carry no colour, opacity or style-token code at all (file list from the token grep; e.g. `app/+not-found.tsx:29 (NotFound) @ 044c479b` renders an unstyled `<View />`).

## Q4 — how `SHARED_*` presets compose and where overridden

- Only one preset object is used in the area: `SHARED_STYLES`, 8 hits across 2 files (`git grep -nE "SHARED_[A-Z_]+" … -- app`); sub-objects touched are `.theme.*` and `.interactive.headerButton`.
- Preset + inline override (array merge, later element wins): `app/modal-input.tsx:73-76 (rightSlot style) @ 044c479b` — `SHARED_STYLES.interactive.headerButton` then `{ opacity: … }`; token swap for disabled state at `:81-85 (Ionicons color) @ 044c479b` (`TEXT_DISABLED` vs `TEXT_PRIMARY`).
- Preset tokens lifted into a bespoke, non-preset header style: `app/(drawer)/(tabs)/_layout.tsx:23-40 (confirm-friendship headerStyle/headerTitleStyle) @ 044c479b`, overriding the baseline from `getDefaultScreenOptions()` applied at `:8 (Stack screenOptions) @ 044c479b`; `headerTintColor` replaced wholesale at `:21`.
- Elsewhere in the area presets are bypassed entirely: `app/(drawer)/_layout.tsx:57-122 (createStyles) @ 044c479b` builds its own themed sheet from `getTheme`, composed per element as `[styles.x, { inline }]` and further merged with navigation-supplied options in `:166,173,180 (DrawerRow) @ 044c479b`; `app/(drawer)/waves/join.tsx:277-360 (styles) @ 044c479b` is a parallel local sheet merged with `getTheme` inline objects at `:194,210,243,261`.

## Q5 — why both `getTheme(isDark)` and a fixed default

The definition file is outside this area, so only usage evidence here; no comment in `app/` states the reason.
- Reactive call sites pass the atom value: `app/(drawer)/_layout.tsx:55 (createStyles) @ 044c479b`, `:201,454 (CustomDrawerContent / DrawerLayout) @ 044c479b`, `app/(drawer)/waves/join.tsx:105 (WaveJoinScreen) @ 044c479b` — all inside hooks that can read `STATE.isDarkMode`.
- Fixed-preset call sites take no mode input at all, so their values cannot vary with the mode: `app/(drawer)/(tabs)/_layout.tsx:24,26,27,39 (SHARED_STYLES.theme.*) @ 044c479b` — module-level `screenOptions` in a component with no theme atom read; `app/modal-input.tsx:74,83-84 (SHARED_STYLES) @ 044c479b` — header callback that reads neither atom nor flag.
- Related design note in the area: `app/(drawer)/_layout.tsx:125-127 (DrawerRow comment) @ 044c479b` — explicit tints in screen options mean "no theme lookup is required here", i.e. some surfaces intentionally avoid the selector.

## Searched, found nothing (all at `044c479b`, path `app`)

- `git grep -nEi "useColorScheme|appearance"` → no hits: no React Native scheme API in the area; detection is entirely via the imported `themeStorage` helpers.
- `git grep -nE "THEME"` → only `THEME_MODES` (`app/(drawer)/_layout.tsx:45,46,308`); no reference to a `THEME`, `LIGHT_THEME` or `DARK_THEME` export anywhere in `app/`.
- `git grep -cE "#[0-9a-fA-F]{3,8}"` → 2 files only (`app/(drawer)/_layout.tsx`: 4, `app/(drawer)/waves/join.tsx`: 3); no hex literals in the other 25 route files.
- `git grep -nE "SHARED_[A-Z_]+" | sort -u` → single name `SHARED_STYLES`; no other `SHARED_*` preset is consumed here.
- `git grep -nE "theme=\{|isDark=|darkMode=|colors="` → exit 1: no route passes a theme/flag as a prop; propagation is atom-based or component-local.
- `git grep -nE "\.\.\.SHARED"` → no spread-composition of presets in the area (composition is array-style only).