## Digest — area: `src/theme/`, `src/consts.js`, `src/utils/`, `src/atoms/`, `src/hooks/`, `src/events/`, `src/types/`, repo root files @ 044c479b

### 1. Where color values and theme definitions live; which modules export them
- `src/consts.js:36` (MAIN_COLOR) … `src/consts.js:79` (TRANSPARENT_ICONS_COLOR) — flat brand/UI hex+rgba tokens exported individually: MAIN_COLOR, EMPHASIZED_COLOR, SECONDARY_COLOR, NAV_COLOR, BG_COLOR, HEADER_GRADIENT_START/END (`src/consts.js:43-44`), HEADER_SHADOW_COLOR, HEADER_BORDER_COLOR (`:45-46`), ACTIVE/INACTIVE_SEGMENT_COLOR (`:47-48`), SEGMENT_BACKGROUND_ACTIVE/INACTIVE (`:49-50`), FOOTER_COLOR (`:52`), TEXT_COLOR, PLACEHOLDER_TEXT_COLOR, UNFILLED_COLOR, TRANSPARENT_BUTTON_COLOR, TRANSPARENT_ICONS_COLOR (`:75-79`).
- `src/consts.js:55` (WAVE_ROLES) — role colors, incl. `#8B5CF6`, `#6B7280`; `src/consts.js:62` (ROLE_CONFIG) — same colors + icons.
- `src/theme/sharedStyles.js:19` (LIGHT_THEME) — ~40-key light token set; some keys re-export consts (`:21-22`, `:33-35`, `:40-41`, `:70`), rest are rgba literals.
- `src/theme/sharedStyles.js:77` (DARK_THEME) — dark token set, all literals (`:79-131`).
- `src/theme/sharedStyles.js:135` (getTheme), `:138` (THEME), `:455` (useCurrentTheme), `:463` (getThemedStyles) — theme selectors/bridge exported from the same module.
- `src/theme/sharedStyles.js:141` (SHARED_CONTAINERS), `:195` (SHARED_TEXT), `:228` (SHARED_HEADER), `:325` (SHARED_INTERACTIVE), `:418` (SHARED_LAYOUT), `:444` (SHARED_STYLES, aggregates the five plus `theme: THEME` at `:450`) — preset style objects carrying theme colors.
- `src/theme/sharedStyles.js:9` (HEADER_HEIGHTS) — non-color geometry tokens exported beside the theme.
- `src/utils/navigationStyles.js:9` (getDefaultHeaderStyle), `:39` (getDefaultScreenOptions), `:60` (getTransparentHeaderStyle) — second style factory module, built only from `CONST.*` header/text tokens.
- `src/theme/screenIcons.tsx:13` (SCREEN_HEADER_ICONS), `:27` (ScreenIconTitle) — exports a themed header component; `:79` badge color literal.
- `app.config.js:5` (BRAND_FIELD `#01122D`) with uses at `:105` adaptiveIcon backgroundColor, `:253` splash backgroundColor; `:124-127` (androidStatusBar) `barStyle: 'dark-content'`, `backgroundColor: '#FFFFFF'`; `:248` (userInterfaceStyle) `'automatic'` — native/brand colors outside the JS theme.
- `src/utils/fa5IconStyle.js:30` (fa5IconStyle) — icon *face* resolver, no color; included to rule it out.

### 2. Light/dark detection at runtime and propagation into styles
- `src/utils/themeStorage.js:48` (getSystemTheme) — `Appearance.getColorScheme() === 'dark'`, defaults light on error (`:55`).
- `src/utils/themeStorage.js:59` (subscribeToSystemTheme) — `Appearance.addChangeListener` → `callback(colorScheme === 'dark')`, returns subscription.
- `src/utils/themeStorage.js:8` (saveThemePreference), `:17` (loadThemePreference) — persisted `'dark'/'light'` under `THEME_KEY` (`:5`); `:28`/`:37` follow-system flag (`FOLLOW_SYSTEM_KEY`, `:6`) via `expo-storage`.
- `app.config.js:248` (userInterfaceStyle) — `'automatic'`, the precondition for a system scheme to exist.
- `src/theme/sharedStyles.js:135` (getTheme) — the mode→token mapping every consumer uses.
- `src/theme/sharedStyles.js:455` (useCurrentTheme) — lazy `require('jotai')` + `require('../state').isDarkMode`, `useAtom(isDarkMode)` → `getTheme(isDark)`; the atom itself is defined outside this area (`../state`).
- `src/theme/screenIcons.tsx:28` (ScreenIconTitle) — `useAtom(STATE.isDarkMode)` → `:30` `getTheme(isDark)` → `:39` `iconColor` → applied at `:48` `color={iconColor}` and `:54` inline `{ color: theme.TEXT_PRIMARY }`; complete atom→prop path in one file.
- `src/theme/sharedStyles.js:463` (getThemedStyles) — rebuilds container/text/interactive presets from `getTheme(isDark)` for call sites needing dynamic styles.
- Non-reactive side of the same design: `src/theme/sharedStyles.js:141-451` bake `THEME.*` at module import, and `src/utils/navigationStyles.js:11-14`, `:46`, `:49` read light-only consts with no `isDark` parameter — neither path changes when the atom flips.

### 3. Text colors / backgrounds / opacities set outside shared theme tokens
- `src/theme/sharedStyles.js:280` (SHARED_HEADER.modalStyle) — `rgba(0, 0, 0, 0.9)`; `:286` (modalTitleStyle) — `color: '#fff'`; `:291` (transparentStyle) — `rgba(0, 0, 0, 0.3)`.
- `src/theme/sharedStyles.js:50-54`, `:57-60`, `:63-67`, `:73` (LIGHT_THEME) and `:79-81`, `:84-96`, `:103-105`, `:108-112`, `:115-118`, `:121-125`, `:128-131` (DARK_THEME) — token values themselves are literals, not derived from a palette.
- `src/theme/sharedStyles.js:170`, `:188` (SHARED_CONTAINERS.card / infoCard), `:238` (SHARED_HEADER.container), `:274` (drawerStyle), `:347` (SHARED_INTERACTIVE.primaryButton), `:404` (headerButton), `:493` (getThemedStyles containers.card) — numeric `shadowOpacity` 0.3/1/0.2.
- `src/theme/screenIcons.tsx:79` (styles.badge) — `backgroundColor: '#FF3B30'`; `:54` inline array override `{ color: theme.TEXT_PRIMARY }`; `:48` inline `color` prop.
- `src/utils/navigationStyles.js:62` (getTransparentHeaderStyle) — `rgba(0, 0, 0, 0.3)`; `:19` (getDefaultHeaderStyle) `shadowOpacity: 1`; `:11-14`, `:46`, `:49` hardwire light-only consts into nav chrome regardless of mode.
- `src/consts.js:36-40`, `:43-52`, `:75-79` — hex/rgba literals at the token source; `:57-58` (WAVE_ROLES) role hexes.
- `app.config.js:5` (BRAND_FIELD), `:105`, `:253` (splash/adaptive icon), `:125-126` (androidStatusBar barStyle + backgroundColor) — colors fixed outside any theme lookup.
- Nothing else in area: 11 files under `src/hooks/`, 8 under `src/events/`, `src/atoms/errorAtom.js`, `src/types/assets.d.ts`, and the remaining 31 of 34 `src/utils/` files carry no color, opacity or style-object code.

### 4. How `SHARED_*` composes with per-screen/per-component styles, and where overridden
- Definitions: `src/theme/sharedStyles.js:141`, `:195`, `:228`, `:325`, `:418`; aggregate namespace `:444` (SHARED_STYLES) with `theme: THEME` at `:450`.
- Internal composition: `src/theme/sharedStyles.js:370` (secondaryButtonTitle) spreads `SHARED_TEXT.secondary`; presets read the module-load-baked `THEME.*` throughout (`:144`, `:149`, `:153`, `:158-165`, `:197-221`, `:230-233`, `:244-250`, `:266-269`, `:303`, `:327-332`, `:365`, `:384-389`, `:395-399`, `:410`, `:437`); `CONST.MAIN_COLOR` used directly at `:336`, `:344-345`.
- Override seams in area: `src/utils/navigationStyles.js:22` (`...customStyle`), `:42` (nested `getDefaultHeaderStyle(customOptions.headerStyle)`), `:47` (`...customOptions.headerTitleStyle`), `:52` (`...customOptions`), `:63` (`...customStyle`) — caller-supplied objects win last.
- Dynamic override path: `src/theme/sharedStyles.js:463` (getThemedStyles) re-emits containers/text/interactive only — no header/layout equivalents, so overrides there must be hand-written; `src/utils/navigationStyles.js:9-32` and `:60-73` additionally merge Android `StatusBar.currentHeight` last.
- Local-style override example: `src/theme/screenIcons.tsx:61` (styles) + `:54` array-with-inline-object override of `styles.title`.
- No file in this area imports `SHARED_*`: searched `git grep -n "SHARED_" 044c479b -- src/theme src/consts.js src/utils src/atoms src/hooks src/events src/types` → 9 hits, all inside `src/theme/sharedStyles.js`; per-screen/per-component composition and overrides therefore live outside this area.

### 5. Why both `getTheme(isDark)` and a fixed `THEME = LIGHT_THEME`
- `src/theme/sharedStyles.js:137-138` (THEME) — the code's own comment reads "Default theme (for backward compatibility)" above `export const THEME = LIGHT_THEME`.
- `src/theme/sharedStyles.js:141-451` (SHARED_*) — every preset dereferences `THEME.*` at module load, so the presets cannot follow a mode switch; they were written before dark mode existed: `git log -S"SHARED_CONTAINERS" 044c479b -- src/theme/sharedStyles.js` first hits `003d5149` (buildNumber 409).
- `git log -S"DARK_THEME" / -S"export const getTheme" / -S"export const THEME = LIGHT_THEME" 044c479b -- src/theme/sharedStyles.js` all resolve to the single commit `2ce80f3c` (buildNumber 416) — dark mode arrived with `getTheme` *and* the `THEME` alias in one change, i.e. `THEME` was retained so the already-shipped preset objects kept compiling unchanged rather than being rewritten.
- `src/theme/sharedStyles.js:453-460` (useCurrentTheme) — comment "Hook to get current theme based on dark mode state / This will be used by components that need dynamic theming"; `:462-464` (getThemedStyles) — comment "for components that need dynamic styles": the two documented escape hatches from the frozen presets.
- Corroborating history: `b4db560c` "chore: Refactor components to use shared styles; remove unused code…", `9675df31` "Update shared styles and theme configurations for consistency", `10772010` "update DARK_THEME.INTERACTIVE_BACKGROUND color for improved dark mode styling".
- In-area consequence of the split: `SHARED_STYLES.theme` (`:450`) hands out the light theme even in dark mode, and `getThemedStyles` duplicates only part of the preset surface (`:466-526`).

### Searched for and found nothing (all at 044c479b)
- `git grep -n "useColorScheme" -- <area>` — no hits; detection is via `Appearance` in `src/utils/themeStorage.js` only.
- `git grep -n -i "opacity|color|rgba?(|StyleSheet|style=" -- src/hooks src/atoms src/events src/types src/utils` (excluding `src/theme`) — hits only `src/utils/navigationStyles.js` and `src/utils/themeStorage.js`; no theme or style code in hooks, atoms, events, types.
- `git grep -n "SHARED_" -- <area>` — 9 hits, all `src/theme/sharedStyles.js`; no in-area importer of the presets.
- `git grep -n "themeStorage|getSystemTheme|subscribeToSystemTheme|loadThemePreference" -- <area>` — only the defining lines in `src/utils/themeStorage.js:8-59`; consumers are outside this area.
- `git grep -n -i "theme|dark mode|isDark|sharedStyles" -- README.md AGENTS.md CLAUDE.md package.json tsconfig.json eas.json` — no hits; root docs say nothing about theming.
- `git ls-tree -r --name-only <commit> -- src/theme src/consts.js src/utils src/atoms src/hooks src/events src/types` — 35 files total; no theme/color code in `src/utils/__tests__/` (3 files), `src/utils/semver.ts`, `src/utils/notifications.js`, `src/utils/grouping*`, `src/utils/showToast.js`, `src/utils/showErrorToast.js`, `src/utils/showConfirmAlert.ts`.
- `git ls-tree --name-only <commit>` — no `app.json` at this commit; root Expo config is `app.config.js`.