## Context

`SHARED_STYLES.theme` is exported as `THEME = LIGHT_THEME` in `src/theme/sharedStyles.js` (line 138). It's a static constant that never changes. The Wave detail screen correctly uses `getTheme(isDarkMode)` which returns the appropriate theme based on the Jotai atom. The Waves list screen only imports `SHARED_STYLES` and uses `SHARED_STYLES.theme.*` for the button colors.

## Goals / Non-Goals

**Goals:**
- Make the Waves list header button use reactive dark mode-aware theme colors
- Match the exact theme access pattern used by the Wave detail screen

**Non-Goals:**
- Fixing `SHARED_STYLES.theme` globally (it's used elsewhere and changing it would be a larger refactor)
- Changing any visual styling beyond the theme access method

## Decisions

### 1. Add `getTheme` import and local theme variable
**Choice**: Import `getTheme` from `sharedStyles`, add `const [isDarkMode] = useAtom(STATE.isDarkMode)` and `const theme = getTheme(isDarkMode)`, then replace `SHARED_STYLES.theme.*` with `theme.*` in the header button.
**Rationale**: Exact same pattern as `[waveUuid].tsx`. The component already imports `STATE` and `useAtom`, so adding one more atom read is minimal.

## Risks / Trade-offs

- None. One additional atom read per render, negligible cost.
