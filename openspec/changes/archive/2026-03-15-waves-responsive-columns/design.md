## Context

The WavesHub FlatList was recently changed from a 2-column grid to a single-column full-width list with horizontal photo strips. This works well on phones but leaves excessive whitespace on tablets (≥ 768px). The codebase already has a `isSmallDevice = screenWidth < 768` breakpoint in `sharedStyles.js` and a `getResponsiveColumns` pattern in `PhotosList/index.js`.

## Goals / Non-Goals

**Goals:**
- Responsive column count: 1 column on phones, 2 on tablets
- Automatic re-layout on screen rotation or resize
- Consistent with existing responsive breakpoint conventions

**Non-Goals:**
- Supporting 3+ columns on very large screens (keep it simple: 1 or 2)
- Changing WaveCard internal layout or aspect ratios per column count
- Adding responsive behavior to other screens in this change

## Decisions

### Decision 1: Use `useWindowDimensions` width with 768px breakpoint

Compute `numColumns` from screen width using the same 768px threshold already established in `sharedStyles.js`. This keeps responsive behavior consistent across the app.

Alternative considered: Using `Dimensions.get('window')` — rejected because `useWindowDimensions` is a hook that automatically re-renders on dimension changes (rotation, split-screen).

### Decision 2: Use FlatList `key` prop to force re-render on column change

React Native's FlatList requires a `key` prop change when `numColumns` changes at runtime, otherwise it throws an error. Setting `key={numColumns}` forces a clean re-mount when switching between 1 and 2 columns.

### Decision 3: Keep WaveCard styles unchanged

The WaveCard already uses `flex: 1` and percentage-based sizing, so it naturally adapts to whatever width the FlatList column gives it. No WaveCard modifications needed.

## Risks / Trade-offs

- [FlatList re-mount on rotation] → Acceptable since waves rarely rotate and re-mount is instant with cached data. The `key` prop approach is React Native's recommended pattern.
- [768px as sole breakpoint] → Simple and matches existing codebase convention. Can revisit if 3-column support is needed later.
