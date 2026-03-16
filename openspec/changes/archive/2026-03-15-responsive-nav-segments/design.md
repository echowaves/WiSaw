## Context

The photo feed header has a left icon (WaveHeaderIcon, 40px + margins), a right icon area (~44px), and the center segment control. The segments are currently hardcoded to 90px each with a 220px container. The component already has `useWindowDimensions()` providing `width`.

## Goals / Non-Goals

**Goals:**
- Make segment button widths scale down on narrow screens while keeping 90px as the maximum
- Keep the segment control visually centered and well-proportioned at all sizes

**Non-Goals:**
- Changing the segment control layout, icons, or text
- Making other header elements responsive
- Adding breakpoints or entirely different layouts for small screens

## Decisions

**Compute segment width from screen width using a ratio, capped at 90**
- Use `Math.min(90, Math.floor(width * 0.22))` for each segment button — at 410px width this gives 90px (the current value); at 320px it gives 70px
- Container width follows: `Math.min(220, segmentWidth * 2 + 40)` — proportional to segments plus padding
- Alternative: use flex instead of width — rejected because the animated segment control relies on absolute width values for the sliding indicator
- The `buttonGroupContainer` (used elsewhere) follows the same pattern with its own cap at 220

## Risks / Trade-offs

- [Very narrow screens may make text hard to read] → The ratio ensures text remains legible down to ~300px screen width; `paddingHorizontal` adjusts proportionally too
- [Segment animations may need width values] → The computed width is stable per render (from `useWindowDimensions`), so animations work the same way
