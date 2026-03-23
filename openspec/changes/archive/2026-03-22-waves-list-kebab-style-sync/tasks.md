## Tasks

### Task 1: Replace static SHARED_STYLES.theme with reactive theme in Waves list header
- **File**: `app/(drawer)/waves/index.tsx`
- **Changes**:
  - Change import from `{ SHARED_STYLES }` to `{ SHARED_STYLES, getTheme }` from `sharedStyles`
  - Add `const [isDarkMode] = useAtom(STATE.isDarkMode)` to the component
  - Add `const theme = getTheme(isDarkMode)` to the component
  - Replace `SHARED_STYLES.theme.INTERACTIVE_BACKGROUND` → `theme.INTERACTIVE_BACKGROUND`
  - Replace `SHARED_STYLES.theme.INTERACTIVE_BORDER` → `theme.INTERACTIVE_BORDER`
  - Replace `SHARED_STYLES.theme.TEXT_PRIMARY` → `theme.TEXT_PRIMARY`
  - Keep `SHARED_STYLES.interactive.headerButton` unchanged (it's not theme-dependent)
- **Depends on**: None
