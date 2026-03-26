## Context

Both the Photos and Waves screens use `KeyboardStickyView` from `react-native-keyboard-controller` to position their search bars. The component applies a `translateY` transform based on keyboard state:

```
translateY = keyboardHeight + interpolate(closed, opened)
```

When the keyboard is closed, `keyboardHeight = 0`, so `translateY = closed`. A positive `closed` value pushes the view **down** from its natural document-flow position. The Photos search bar has `closed: 94`, pushing it 94px below the screen — completely off-screen. The Waves search bar has `closed: 4`, which barely moves it but provides no safe-area clearance.

## Goals / Non-Goals

**Goals:**
- Photos search bar visible at all times when the search segment is active (keyboard open or closed)
- Waves search bar has proper clearance from the device safe area (home indicator)
- Both search bars continue to follow the keyboard when it opens

**Non-Goals:**
- Changing `KeyboardStickyView` internals or replacing it with a custom solution
- Changing the visual design or layout of either search bar
- Modifying footer positioning

## Decisions

### Use negative `closed` offset to push search bars UP

The `KeyboardStickyView` `closed` offset adds to `translateY`. Positive = down, negative = up. Both search bars need to move **up** from their natural positions:

- **Photos**: Natural position is at the flex layout bottom edge. Needs `closed: -(FOOTER_HEIGHT + FOOTER_GAP)` = `-94` to clear the absolute-positioned footer.
- **Waves**: Natural position is at the flex layout bottom edge. Needs `closed: -(insets.bottom + GAP)` to clear the safe area.

**Why negative offset over absolute positioning**: The search bar already participates in document flow via `KeyboardStickyView`. Adding absolute positioning would conflict with the transform-based animation. Negative offset is the simplest fix that works with the existing transform math.

### Use `useSafeAreaInsets()` for Waves bottom clearance

Rather than a hardcoded offset, read `insets.bottom` from `useSafeAreaInsets()` to dynamically account for the device's safe area. This handles all device types (notched, non-notched, tablets).

A fixed 8px gap above the safe area gives a comfortable visual separation.

### Pass `insets.bottom` as prop to `PhotosListSearchBar`

`PhotosListSearchBar` is a pure component receiving props. Rather than calling `useSafeAreaInsets()` inside it, pass `bottomInset` from the parent (`PhotosList`) which already has access to safe area context. This avoids adding a new hook dependency to the search bar component.

For `PhotosListEmptyState`, the same prop needs to flow through so the search bar renders consistently.

## Risks / Trade-offs

- [Risk] Different Android keyboard behaviors may affect transform values → The `useKeyboardAnimation` hook from `react-native-keyboard-controller` already normalizes cross-platform keyboard height; we rely on that.
- [Trade-off] Negative offsets are less intuitive than positive ones → Acceptable since this matches the transform math (`translateY` direction) and avoids restructuring.
