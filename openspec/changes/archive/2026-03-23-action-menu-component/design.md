## Context

The app has three context menus using `ActionSheetIOS` (iOS) + `Alert.alert` (Android) with manual `Platform.OS` branching:

1. **Waves header kebab** (`app/(drawer)/waves/index.tsx`) — 7 items: Cancel, Create New Wave, Auto Group, 4 sort options with text-prefix checkmarks
2. **Wave detail header** (`src/screens/WaveDetail/index.js`) — 5 items: Cancel, Rename, Edit Description, Merge, Delete (destructive)
3. **Wave card long-press** (`src/screens/WavesHub/index.js`) — conditional items based on ownership, with destructive Delete

The app already has a custom modal pattern in `QuickActionsModal` (center-card with `Modal transparent`, overlay dismiss, themed styling). The same `Modal` + overlay pattern is used by `ShareOptionsModal`, `WaveSelectorModal`, and `MergeWaveModal`. Icons are available via `MaterialCommunityIcons` from `@expo/vector-icons`.

## Goals / Non-Goals

**Goals:**
- Create a single reusable `ActionMenu` component that handles all three menu use cases
- Support item types: regular (icon + label), checked, destructive, disabled, and separator
- Theme-aware (light/dark mode via `getTheme(isDarkMode)`)
- Dismiss on overlay tap or Cancel item press
- Eliminate all `Platform.OS === 'ios'` branching for menus
- Follow the existing center-card modal pattern (like `QuickActionsModal`)

**Non-Goals:**
- Replacing `QuickActionsModal` itself (it's a photo-specific component, not a menu)
- Animation beyond React Native `Modal`'s built-in `fade`
- Submenus or nested menus
- Swipe-to-dismiss or gesture handling
- Web-specific rendering concerns

## Decisions

### 1. Component API: Data-driven items array

**Decision**: Accept an `items` array where each element is either an item object or the string `'separator'`.

**Item object shape**:
```
{
  key: string,           // unique identifier
  icon: string,          // MaterialCommunityIcons name
  label: string,         // display text
  onPress?: function,    // tap handler (auto-closes menu after)
  checked?: boolean,     // shows checkmark on trailing edge
  destructive?: boolean, // renders label in red
  disabled?: boolean,    // dims the row, disables onPress
}
```

**Rationale**: Declarative, easy to compose dynamically (e.g., conditional items based on ownership). Mirrors the pattern used by the existing `ActionSheetIOS` options arrays but richer. The string `'separator'` literal is simple and readable inline.

**Alternative considered**: Compound components (`<ActionMenu.Item>`, `<ActionMenu.Separator>`) — rejected as more verbose for the simple flat menus used in this app, and inconsistent with how the existing menus construct their options arrays.

### 2. Props interface

**Decision**:
```
{
  visible: boolean,      // controls modal visibility
  onClose: function,     // called on overlay tap or item press
  title?: string,        // optional header text
  items: Array<Item | 'separator'>,
}
```

**Rationale**: Matches the `visible`/`onClose` pattern used by `QuickActionsModal`, `WaveSelectorModal`, `MergeWaveModal`, etc. Auto-close on item press (calling `onClose` then `item.onPress`) keeps the caller simple.

### 3. Styling: Center card matching existing modal pattern

**Decision**: Use the same overlay + centered card layout as `QuickActionsModal`:
- Overlay: `rgba(0, 0, 0, 0.6)`
- Card: `theme.SURFACE`, `borderRadius: 16`, `width: '85%'`, `maxWidth: 360`
- Row: `paddingVertical: 12`, `paddingHorizontal: 16`, `flexDirection: 'row'`, `alignItems: 'center'`
- Icon: `MaterialCommunityIcons`, size 22, `theme.TEXT_PRIMARY` (or red for destructive)
- Label: `fontSize: 16`, `theme.TEXT_PRIMARY` (or red for destructive)
- Checked indicator: `MaterialCommunityIcons` `check` icon, `CONST.MAIN_COLOR`, trailing position
- Separator: 1px line using `theme.INTERACTIVE_BORDER`
- Title (optional): `fontSize: 14`, `theme.TEXT_SECONDARY`, centered, `paddingBottom: 8`

**Rationale**: Consistent with the established visual language. All colors come from the reactive theme system (`getTheme(isDarkMode)`), ensuring proper dark mode support.

### 4. Close behavior

**Decision**: Menu closes on overlay tap AND on any item press (before firing `onPress`). The caller only needs to manage `visible` state and the `onClose` callback.

**Rationale**: Every existing modal in the app follows this pattern. Items that need confirmation (like Delete) already show their own `Alert.alert` confirmation dialog after the menu closes — this existing UX is preserved.

### 5. Icon choices for existing menus

| Action | Icon |
|--------|------|
| Create New Wave | `plus-circle-outline` |
| Auto Group | `view-grid-plus-outline` |
| Rename | `pencil-outline` |
| Edit Description | `text-box-edit-outline` |
| Merge | `call-merge` |
| Delete | `trash-can-outline` |
| Sort descending | `sort-descending` |
| Sort ascending | `sort-ascending` |
| Cancel | `close` |

All from `MaterialCommunityIcons`, already available via `@expo/vector-icons`.

## Risks / Trade-offs

- [Center card looks different from native ActionSheet] → Intentional trade-off for icon support and cross-platform consistency. The app already uses center cards for other modals.
- [No haptic feedback on long-press trigger] → Could add later if needed; the wave card long-press already handles haptics in the caller if applicable.
- [7+ items in waves menu may require scrolling on small screens] → The card uses `maxWidth: 360` and rows are compact (48px height); 7 items = ~336px which fits most screens. Could add `ScrollView` if menus grow further.
