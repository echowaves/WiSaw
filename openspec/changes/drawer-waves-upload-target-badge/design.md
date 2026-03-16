## Context

The Waves drawer item currently fetches the ungrouped photo count via `getUngroupedPhotosCount` and subscribes to `autoGroupDone` events to display a red numeric badge. This duplicates the header nav bar badge. The `uploadTargetWave` Jotai atom (`STATE.uploadTargetWave`) already stores `{ waveUuid, name }` and is loaded from SecureStore on app startup in `app/_layout.tsx`. The drawer component already imports `useAtom` and `STATE`.

## Goals / Non-Goals

**Goals:**
- Show a visual indicator on the Waves drawer icon when an upload target wave is set
- Display the target wave name in the drawer label
- Remove ungrouped photo count logic from the drawer

**Non-Goals:**
- Changing the header nav bar auto-group badge behavior
- Adding ability to set/clear the upload target from the drawer

## Decisions

**Read `uploadTargetWave` atom directly instead of fetching via API**

The atom is already initialized on app startup and kept in sync by WavesHub and WaveDetail. No additional fetch or subscription is needed — `useAtom(STATE.uploadTargetWave)` provides reactive updates automatically when the target changes.

**Use `CONST.MAIN_COLOR` for the badge indicator**

The WaveHeaderIcon already uses `CONST.MAIN_COLOR` (coral/orange) when an upload target is set. Using the same color for the drawer badge keeps visual consistency. The badge will be a small filled circle (no number), matching the "status dot" pattern rather than a count badge.

**Show wave name in `drawerLabel`**

Use a dynamic `drawerLabel` that appends the wave name: `Waves — {name}`. If no target is set, just show `Waves`. This keeps the name visible even when the drawer is open and icons are less prominent.

## Risks / Trade-offs

- [Long wave names may truncate in drawer] → Acceptable; drawer labels naturally truncate with ellipsis. The wave name is user-provided and typically short.
- [Removing ungrouped count from drawer reduces visibility] → The header badge still shows the count. The drawer was a secondary location for this info.
