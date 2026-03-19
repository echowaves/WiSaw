## Context

The photo feed footer (`PhotosListFooter`) renders a nav menu button (hamburger icon) in the bottom-left. The parent `PhotosList` already reads `uploadTargetWave` from the Jotai atom. The badge should match the same visual pattern used on the drawer's Waves icon — a small filled circle in `CONST.MAIN_COLOR`.

## Goals / Non-Goals

**Goals:**
- Show a red dot badge on the nav menu button when an upload target wave is set
- Pass the minimum needed info (boolean) from parent to footer component

**Non-Goals:**
- Showing the wave name on the footer button
- Changing the existing badge in the drawer's Waves icon
- Modifying any other footer buttons

## Decisions

**Pass `hasUploadTarget` boolean prop instead of the full atom object**
- The footer only needs to know whether to show the dot, not the wave name or details
- This keeps the component decoupled from the wave data shape
- Alternative: pass the full `uploadTargetWave` object — rejected as unnecessary coupling

**Position the badge at top-right of the menu button, matching the drawer icon badge**
- Uses `position: 'absolute'`, `top: 2`, `right: 2` relative to the button's 50×50 container
- 10×10 circle with `CONST.MAIN_COLOR` background, matching the drawer icon badge size

## Risks / Trade-offs

- [Badge may overlap with other elements on small screens] → The 50×50 button provides enough space; the 10×10 dot at top-right won't interfere with the 22px icon centered in the button
