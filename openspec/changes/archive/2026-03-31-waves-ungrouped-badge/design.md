## Context

The Waves drawer item currently renders a plain `FontAwesome5` water icon with no badge. The ungrouped photos count is already tracked globally via the `STATE.ungroupedPhotosCount` Jotai atom (populated by `WaveHeaderIcon` on mount and kept in sync by `usePhotoActions` and auto-group subscriptions). The kebab menu badge on the Waves screen displays the raw count with no upper bound.

## Goals / Non-Goals

**Goals:**
- Show a numeric badge on the Waves drawer icon reflecting ungrouped photo count
- Cap displayed count at "99+" in both the drawer badge and the kebab menu badge
- Follow the existing `IdentityDrawerIcon` inline component pattern

**Non-Goals:**
- Fetching ungrouped count from the drawer layout (relies on existing atom population)
- Changing badge visibility logic (still hidden when count is 0 or null)
- Adding badge to the drawer label text

## Decisions

### 1. Inline `WavesDrawerIcon` component in drawer layout
**Decision**: Create a `WavesDrawerIcon` function component in `app/(drawer)/_layout.tsx`, following the `IdentityDrawerIcon` pattern.

**Rationale**: Keeps drawer customizations co-located. The component reads `STATE.ungroupedPhotosCount` via `useAtom` and renders the water icon with or without a badge. No new file needed.

**Alternatives considered**: Separate component file — rejected because the identity icon uses the inline pattern and there's no reuse need.

### 2. Badge positioned on the icon (not the label)
**Decision**: Render the numeric badge as an absolutely-positioned element on the icon container, top-right corner.

**Rationale**: Consistent with app badge conventions (notification dots, app icon badges). The icon area provides a fixed-size anchor for positioning.

### 3. Count capped at "99+"
**Decision**: Display `count > 99 ? '99+' : String(count)` in both the drawer icon badge and the kebab menu badge.

**Rationale**: Prevents layout breakage with large numbers. Three characters ("99+") is the maximum that fits comfortably in a small badge. This is a standard pattern across iOS and Android.

### 4. Badge styling
**Decision**: Use `#FF3B30` background, white bold text, `borderRadius: 10`, `minWidth: 18`, `height: 18`, `paddingHorizontal: 4`. Same visual language as the existing kebab badge.

**Rationale**: Consistency across the app. The existing kebab badge uses the same red color and similar sizing.

## Risks / Trade-offs

**[Atom may be null on first drawer open]** → Badge simply doesn't render when count is null. The `WaveHeaderIcon` populates the atom on app start, so this is brief.

**[Badge overlaps icon at small sizes]** → Using `position: 'absolute'` with negative offsets keeps it contained. The drawer icon container is consistently 24×24.
