## Context

The `PhotosListFooter` component renders the bottom navigation bar with three buttons: hamburger menu (left), video recording (center-left), and photo capture (center). The footer uses a nested View structure:

```
┌─ View (height: 90, paddingBottom: insets.bottom) ─────┐
│   ┌─ SafeAreaView (edges: ALL by default) ─────────┐   │
│   │   ┌─ View (paddingTop: 10, alignItems: center) ─┐│   │
│   │   │  hamburger  video  camera                    ││   │
│   │   └──────────────────────────────────────────────┘│   │
│   └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

After migrating `SafeAreaView` from `react-native` to `react-native-safe-area-context`, the component started applying safe area insets on all edges by default, causing excessive top padding that pushes buttons down.

## Goals / Non-Goals

**Goals:**
- Restore footer buttons to their intended vertically centered position
- Eliminate double-safe-area padding
- Keep the SafeAreaView wrapper for bottom safe area handling on devices with home indicators

**Non-Goals:**
- No changes to button layout, sizing, or horizontal positioning
- No changes to other screens or components
- No changes to header SafeAreaView handling

## Decisions

### 1. Constrain SafeAreaView to bottom edge only

**Decision**: Add `edges={['bottom']}` to the SafeAreaView wrapper in `PhotosListFooter`.

**Rationale**: The footer only needs bottom safe area handling (for the home indicator on iPhones). Top safe area is irrelevant at the bottom of the screen. Constraining to bottom edge prevents the unwanted top padding.

**Alternatives considered**:
- Remove SafeAreaView entirely: Simpler but loses bottom safe area handling on devices with home indicators.
- Keep all edges and remove `paddingTop: 10` from inner View: Would work but leaves the semantic intent unclear — SafeAreaView at the bottom should only handle bottom insets.

### 2. Remove redundant paddingBottom from outer View

**Decision**: Remove `paddingBottom: insets.bottom` from the outer View since SafeAreaView now handles it.

**Rationale**: With `edges={['bottom']}`, SafeAreaView applies the bottom inset automatically. The manual `paddingBottom: insets.bottom` was a workaround for when SafeAreaView wasn't handling bottom insets, and now it's double-counting.

## Risks / Trade-offs

[Risk] Bottom safe area might not be handled correctly on all devices.
→ Mitigation: `edges={['bottom']}` explicitly tells SafeAreaView to handle bottom insets, which is the standard pattern.

[Risk] Visual regression on devices with different safe area sizes.
→ Mitigation: SafeAreaView adapts to the device's actual safe area insets, which is the correct behavior.

## Open Questions

None.
