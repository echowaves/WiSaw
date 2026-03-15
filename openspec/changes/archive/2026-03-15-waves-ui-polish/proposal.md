## Why

The Waves Hub screen has four UI inconsistencies: its dark-mode background uses `INTERACTIVE_BACKGROUND` (an orange-red tint) instead of the standard `BACKGROUND` color, the auto-group button in the upper-right nav bar should always display the ungrouped photo count, the auto-group confirmation dialog doesn't tell users how many photos will be grouped, and the Waves drawer item gives no visual hint that ungrouped photos exist.

## What Changes

- Fix the WavesHub container to use `theme.BACKGROUND` instead of `theme.INTERACTIVE_BACKGROUND`, matching the standard screen background used across the app
- Ensure the auto-group button in the upper-right nav bar always displays the number of ungrouped photos available for grouping
- Pass the ungrouped photo count into the auto-group confirmation dialog so the alert text reads e.g. "You have 42 ungrouped photos. This will automatically group them into waves. Continue?"
- Add a badge to the Waves drawer item showing the ungrouped photo count, matching the same visual treatment as the header auto-group button

## Capabilities

### New Capabilities

_(none — all changes modify existing capabilities)_

### Modified Capabilities

- `theming`: WavesHub background color corrected to use standard `BACKGROUND` theme token
- `auto-group-photos`: Header nav bar button shows ungrouped photo count; confirmation dialog includes count; drawer item shows count badge

## Impact

- `src/screens/WavesHub/index.js` — container background color change
- `src/screens/WavesHub/index.js` — `handleAutoGroup` alert text updated to include count
- `app/(drawer)/_layout.tsx` — Waves drawer item gets custom `drawerIcon` with badge
- `app/(drawer)/waves.tsx` / `app/(drawer)/waves-hub.tsx` — may need to pass count to WavesHub or use event bus for the alert
- `src/events/autoGroupBus.js` — may need to carry count data to WavesHub
