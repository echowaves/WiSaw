## Why

The segment button labels (Global, Starred, Search) in the photo feed header can wrap to multiple lines when the segment width shrinks on narrow screens. This looks broken — the text should truncate with an ellipsis instead of wrapping.

## What Changes

- Add `numberOfLines={1}` to all three segment title `Text` components to prevent wrapping and enable ellipsis truncation

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `photo-feed`: Segment button text truncates with ellipsis instead of wrapping

## Impact

- `src/screens/PhotosList/index.js`: Three segment title `Text` components
