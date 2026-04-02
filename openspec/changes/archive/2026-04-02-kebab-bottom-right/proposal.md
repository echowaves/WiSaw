## Why

The ⋮ kebab pill on photo thumbnails is positioned at the top-right, while similar kebab menus on WaveCard and FriendCard sit at the right side of their bottom info rows. Moving the pill to the bottom-right of the thumbnail creates visual consistency across all card types and places the action affordance closer to the user's thumb during scrolling.

## What Changes

- Move the ⋮ pill on `ExpandableThumb` from `top: 6, right: 6` to `bottom: 6, right: 6`
- Add `zIndex: 2` so the pill layers above the comments overlay when both are present

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `photo-thumb-context-hint`: Change the ⋮ pill position from top-right to bottom-right on collapsed thumbnails

## Impact

- `src/components/ExpandableThumb/index.js` — two style properties changed on the kebab `TouchableOpacity`
- Affects every screen that renders photo thumbnails: main feed, bookmarks, wave detail, friend detail
