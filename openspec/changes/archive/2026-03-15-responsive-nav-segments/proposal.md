## Why

The three segment buttons (Global, Starred, Search) in the photo feed header have hardcoded widths (`width: 90` each, container `width: 220`). On smaller screens — narrow phones or split-screen mode — these fixed widths can cause the header to clip or not fit properly between the left and right header icons. The current 90px width should be the maximum, scaling down proportionally on narrower screens.

## What Changes

- Replace hardcoded `width: 90` on each segment button with a dynamic value that scales based on screen width, capped at 90
- Replace hardcoded `width: 220` on `buttonGroupContainer` with a dynamic value capped at 220
- Use the already-available `useWindowDimensions()` width to compute proportional segment sizes

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `photo-feed`: Segment control widths become responsive to screen width instead of fixed

## Impact

- `src/screens/PhotosList/index.js`: Segment button inline styles and `buttonGroupContainer` style in the stylesheet
