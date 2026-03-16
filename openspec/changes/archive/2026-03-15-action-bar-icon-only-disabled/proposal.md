## Why

The expanded photo action bar has 5 buttons (Report, Delete, Star, Wave, Share). On smaller screens, disabled buttons still show their text labels, consuming space without adding value since the user can't interact with them. Hiding the text on disabled buttons reduces visual clutter and frees horizontal space, making the active buttons more prominent.

## What Changes

- Disabled action buttons in the expanded photo view show only their icon, no text label
- Active/enabled buttons continue to show icon + text as before
- Applies to all 5 action buttons: Report, Delete, Star, Wave, Share

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `photo-wave-assignment`: The wave action button's disabled state (non-owner photos) now shows icon-only instead of icon + "Add to Wave" text

## Impact

- `src/components/Photo/index.js` — conditionally render `<Text>` labels only when each button is enabled
