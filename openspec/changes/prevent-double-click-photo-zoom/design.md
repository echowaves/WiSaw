## Context

Photos in the WiSaw feed are rendered as masonry grid items using `ExpandableThumb`, which wraps each photo with an `ImageView` component. `ImageView` uses `TapGestureHandler` from `react-native-gesture-handler` with `numberOfTaps={1}` to detect single taps. When a tap fires, `onSingleTapEvent` navigates to `/pinch` to open the zoomed photo view.

Currently there is no guard against rapid successive taps. A double-click fires the handler twice — the first tap opens the zoom view and the second tap pushes a duplicate navigation onto the stack.

## Goals / Non-Goals

**Goals:**
- Prevent the zoom view from opening on the second tap of a double-click
- Preserve normal single-tap-to-zoom behavior
- Minimal code change with no new dependencies

**Non-Goals:**
- Adding gesture-based zoom (pinch-to-zoom) within the feed — that already exists on the `/pinch` screen
- Changing `TapGestureHandler` configuration (e.g., `numberOfTaps={2}`)
- Modifying `PinchableView` or any other photo rendering component

## Decisions

### Decision 1: Use `Date.now()` debounce in the tap handler callback

**Choice:** Add a `useRef`-backed timestamp (`lastTapTime`) and a constant debounce window (500ms) inside `ImageView`. The `onSingleTapEvent` handler checks elapsed time before calling `router.push('/pinch')`.

**Rationale:**
- Simplest possible fix — two lines of state + one conditional
- No need to change `TapGestureHandler` props or add gesture recognizers
- Works with the existing single-tap pattern
- The 500ms window is longer than typical double-tap intervals (~200-350ms) but shorter than intentional repeated navigation

**Alternatives considered:**
- `PanResponder` with `onSingleTapConfirm` and `tapTimeoutDelta`: Built-in React Native way to distinguish single vs double tap, but more boilerplate and replaces `TapGestureHandler`
- `numberOfTaps={2}` on a separate `TapGestureHandler` set to no-op: Would require two gesture handlers on the same view, which is more complex
- A custom hook `useDebounceTap`: Would be useful for reuse but over-engineering for a single-usage case

### Decision 2: Debounce at the component level, not global

**Choice:** The debounce state lives in `ImageView` via `useRef`, not in a shared Jotai atom or utility.

**Rationale:**
- Each photo thumbnail is independently debounced — tapping one photo rapidly won't prevent tapping another photo from opening
- No cross-component synchronization needed
- `useRef` survives re-renders without triggering them

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| User genuinely wants to open the zoom view twice quickly (e.g., to close and re-open) | Extremely unlikely interaction; the 500ms window is generous |
| `lastTapTime` persists across re-renders of the same photo | Intentional — ensures rapid taps are caught |
| `lastTapTime` persists if photo component unmounts and remounts with same ref | `useRef` is per-component-instance; each `ImageView` gets its own ref |

## Migration Plan

No migration needed. This is a pure client-side behavior change with no API or data model impact. Deploy as-is.

## Open Questions

None.