## Context

`WavePhotoStrip` currently accepts `onPhotoLongPress` — when provided, each thumbnail is wrapped in a `Pressable` with only `onLongPress`. There is no `onPress` handler, so tapping a thumbnail does nothing. The wave can only be opened by tapping the info area below the photo strip in `WaveCard`.

## Goals / Non-Goals

**Goals:**
- Allow tapping a wave photo thumbnail to open that wave
- Follow the existing `onPhotoLongPress` pattern for consistency

**Non-Goals:**
- Changing navigation behavior or destination
- Adding visual feedback beyond `Pressable` defaults

## Decisions

### Decision 1: Mirror the onPhotoLongPress prop pattern

**Choice**: Add an `onPhotoPress` prop to `WavePhotoStrip`, following the exact same pattern as `onPhotoLongPress`. Wrap thumbnails in `Pressable` if *either* callback is provided.

**Rationale**: Consistent API. The component already has the `Pressable` wrapping logic — it just needs the `onPress` handler wired up alongside `onLongPress`.

**Alternative considered**: Adding `onPress` directly on the existing `Pressable` without a new prop — rejected because the `Pressable` is conditionally rendered based on `onPhotoLongPress` existing, and other consumers of `WavePhotoStrip` might want press without long-press or vice versa.

### Decision 2: No gesture conflict with horizontal scroll

React Native's gesture system distinguishes between tap and swipe. The horizontal `FlatList` scroll gesture will not conflict with `Pressable` `onPress` — this is standard React Native behavior and requires no special handling.

## Risks / Trade-offs

- [Minimal risk] The change is additive and follows an established pattern. No regressions expected.
