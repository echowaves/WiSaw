## Context

The Waves list header uses a `dots-vertical` (MaterialCommunityIcons) icon inside a styled TouchableOpacity with `SHARED_STYLES.interactive.headerButton`, background, and border. The Wave Detail header uses `ellipsis-horizontal` (Ionicons) with only `padding: 8`. Both open platform-native context menus (ActionSheetIOS / Alert).

## Goals / Non-Goals

**Goals:**
- Make the Wave Detail header right button visually identical to the Waves list kebab button (minus the badge)

**Non-Goals:**
- Adding a badge to the Wave Detail header
- Changing menu options or behavior
- Extracting a shared header button component (single use case, not worth the abstraction)

## Decisions

### 1. Replace icon library and name
**Choice**: Switch from `Ionicons` `ellipsis-horizontal` (size 24) to `MaterialCommunityIcons` `dots-vertical` (size 22).
**Rationale**: Direct match with the Waves list header icon.

### 2. Apply styled button pattern
**Choice**: Apply `SHARED_STYLES.interactive.headerButton` with `backgroundColor: theme.INTERACTIVE_BACKGROUND`, `borderWidth: 1`, `borderColor: theme.INTERACTIVE_BORDER` — identical to the Waves list header button.
**Rationale**: Visual consistency. The `SHARED_STYLES.interactive.headerButton` already defines the standard header button dimensions/border-radius.

## Risks / Trade-offs

- None — purely visual change with no logic impact.
