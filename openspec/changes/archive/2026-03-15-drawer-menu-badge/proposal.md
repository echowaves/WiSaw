## Why

The drawer menu button (navicon) in the bottom-left corner of the photo feed has no visual indicator when an upload target wave is set. The drawer's Waves item already shows a red dot badge and target name, but users must open the drawer to see this. Adding a matching red dot badge on the menu button itself provides at-a-glance visibility of the upload target status without opening the drawer.

## What Changes

- Add a small red dot badge (`CONST.MAIN_COLOR`) to the drawer menu button in `PhotosListFooter` when `uploadTargetWave` is set
- Pass `uploadTargetWave` (or a boolean) from `PhotosList` to `PhotosListFooter` as a new prop

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `photo-feed`: The drawer menu button in the photo feed footer gains a badge indicator for upload target wave status

## Impact

- `src/screens/PhotosList/components/PhotosListFooter.js`: Add badge overlay to the nav menu button
- `src/screens/PhotosList/index.js`: Pass `uploadTargetWave` prop to `PhotosListFooter` (already has the atom)
