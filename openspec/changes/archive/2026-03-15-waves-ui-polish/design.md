## Context

The Waves Hub screen (`WavesHub/index.js`) uses `theme.INTERACTIVE_BACKGROUND` as its container background. This is an orange-tinted color (`rgba(234,94,61,0.15)` in dark mode) meant for interactive elements like buttons — not screen backgrounds. Other screens such as PhotosList use the same incorrect token, but the mismatch is most visible on the Waves Hub because it sits alongside the Photos feed in the user's workflow.

The auto-group header button already shows an ungrouped photo count badge (implemented in a prior change), but the confirmation dialog triggered by tapping the button does not display this count. The count is fetched in the route files (`waves.tsx`/`waves-hub.tsx`) via `getUngroupedPhotosCount`, but the `handleAutoGroup` function inside `WavesHub/index.js` has no access to it.

The Waves drawer item is a plain icon+label with no state indicator, while the header auto-group button clearly shows a red badge with the ungrouped count.

## Goals / Non-Goals

**Goals:**
- Correct the WavesHub container background to use `theme.BACKGROUND`
- Ensure the auto-group header button in the upper-right nav bar shows the ungrouped photo count badge, refreshing after auto-group and on mount
- Show the ungrouped photo count in the auto-group confirmation dialog text
- Display an ungrouped photo count badge on the Waves drawer icon, matching the header button's visual treatment

**Non-Goals:**
- Fixing PhotosList background (separate concern, same token — can be done later)
- Changing the auto-group mutation logic or loop behavior
- Adding a badge to any other drawer items

## Decisions

### 1. Background fix: swap `INTERACTIVE_BACKGROUND` → `BACKGROUND` in WavesHub container style
**Rationale**: `BACKGROUND` (`#121212` dark / `#ffffff` light) is the standard screen background token used throughout the app. One-line fix with zero side effects.

### 2. Pass ungrouped count into WavesHub via the autoGroupBus event
**Rationale**: The ungrouped count is already fetched in the route files. Rather than duplicating the API call inside WavesHub, the `emitAutoGroup` call will be extended to carry the count as a payload. The `subscribeToAutoGroup` listener in WavesHub receives it and forwards it to `handleAutoGroup(count)`, which uses it in the Alert text.
**Alternative considered**: Adding a Jotai atom for ungrouped count — rejected because the count is transient, screen-local state that doesn't need global sharing. The event payload is simpler and avoids atom sprawl.

### 3. Drawer badge: fetch ungrouped count in `_layout.tsx` via the same `getUngroupedPhotosCount` query
**Rationale**: The drawer layout is always mounted. Fetching the count there and rendering a custom `drawerIcon` with a badge gives the drawer its own lifecycle, independent of whether waves.tsx is active. The drawer subscribes to `autoGroupDone` events to refresh the count, matching the pattern already used in waves.tsx.
**Alternative considered**: Sharing count via Jotai atom from waves.tsx — rejected because the drawer layout mounts before the Waves route component, so it can't rely on the route to populate the atom.

## Risks / Trade-offs

- **[Extra API call]** → The drawer fetches `getUngroupedPhotosCount` on mount. This is a lightweight integer query; the cost is negligible. It also re-fetches on `autoGroupDone` events.
- **[Event bus payload change]** → `autoGroupBus.js` listeners now receive a count argument. Existing listeners that ignore arguments are unaffected (JavaScript ignores extra params). No breaking change.
- **[Stale drawer badge after photo upload]** → The badge won't live-update when photos are uploaded outside of waves. Acceptable because the badge refreshes when navigating to Waves or after auto-grouping.
