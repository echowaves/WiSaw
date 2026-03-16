## Why

The drawer Waves item currently displays the upload target wave name inline with an em dash (`Waves — WaveName`). This becomes hard to read for longer wave names and doesn't visually distinguish the label from the target info. Showing the target wave name on a second line improves readability and makes the upload target status more prominent.

## What Changes

- Change the Waves drawer item label from a single-line `Waves — {name}` format to a two-line layout: "Waves" on the first line and the upload target wave name on a second line below it
- Use a custom `drawerLabel` render function to support multi-line text with distinct styling (smaller/muted text for the target name)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `auto-group-photos`: The drawer label format changes from inline em-dash to a two-line layout showing the upload target wave name below "Waves"

## Impact

- `app/(drawer)/_layout.tsx`: Waves drawer screen options — replace string `drawerLabel` with a render function returning a `View` with two `Text` components
