## Context

The Waves drawer item in `app/(drawer)/_layout.tsx` currently shows the upload target wave name inline: `Waves — {name}`. The `drawerLabel` prop is a plain string. To support a two-line layout, we need to switch to a render function that returns a React element with two `Text` nodes stacked vertically.

The drawer uses `@react-navigation/drawer` via Expo Router. The `drawerLabel` prop accepts either a `string` or a render function `(props: { focused: boolean; color: string }) => React.ReactNode`.

## Goals / Non-Goals

**Goals:**
- Display the upload target wave name on a second line below "Waves" in the drawer
- Use smaller, muted styling for the target name to visually distinguish it from the main label
- Maintain the existing dot badge indicator on the icon

**Non-Goals:**
- Changing the dot badge behavior or styling
- Modifying how `uploadTargetWave` atom is read or managed
- Changing any other drawer items

## Decisions

**Use `drawerLabel` render function instead of string**
- The drawer accepts a render function `({ focused, color }) => ReactNode`
- This allows returning a `View` with two `Text` elements
- The first `Text` shows "Waves" using the passed `color` and standard drawer font size
- The second `Text` shows the wave name in a smaller font size with reduced opacity
- Alternative: Use `drawerLabel` string with newline character — rejected because it doesn't allow different styling per line

**Style the target name with smaller font and reduced opacity**
- Use `fontSize: 12` (vs default ~14-15 for drawer labels) and `opacity: 0.7` for the wave name line
- This creates a clear visual hierarchy without introducing new colors
- The wave name text uses the same `color` prop passed by the drawer for theme consistency

## Risks / Trade-offs

- [Longer wave names may truncate] → Use `numberOfLines={1}` with ellipsis on the wave name text
- [Two-line label increases drawer item height slightly] → Acceptable trade-off for better readability
