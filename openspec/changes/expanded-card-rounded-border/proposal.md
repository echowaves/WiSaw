## Why

The expanded photo card (from `expanded-photo-card-design`) has `borderRadius: 20` on its inner `expandedCardContainer`, but the outer container `View` has `backgroundColor: theme.BACKGROUND`, `overflow: 'hidden'`, and no border radius. This creates a visible rectangular background box around the rounded card, undermining the card's rounded appearance. The QuickActionsModal (long-press modal) floats cleanly with `borderRadius: 16` — the expanded card should match that visual quality.

## What Changes

- Make the outer `container` View transparent and remove its `overflow: 'hidden'` when in embedded mode, so the inner `expandedCardContainer`'s rounded corners and shadow are fully visible
- Match the expanded card's shadow to the collapsed thumb exactly: `shadowColor: '#000'`, `shadowOpacity: 0.4`, `shadowRadius: 6` (currently uses themed shadow with opacity 0.3 and radius 8)
- Remove `borderWidth: 1` / `borderColor` from the expanded card — the collapsed thumb has no visible border, only shadow
- Remove `marginVertical: 8` / `marginHorizontal: 8` from the expanded card — the masonry `spacing` prop already handles inter-item gaps; the collapsed thumb uses zero explicit margin
- Update `CARD_CHROME_HEIGHT` in `photoListHelpers.js` from 18px to 0px since margins and border are removed

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `expanded-photo-card`: The outer container must not obscure the card's rounded border. The expanded card's shadow, border, and margins must match the collapsed thumb exactly so the transition feels seamless.
- `inline-expand`: Height estimation `CARD_CHROME_HEIGHT` must be updated to 0 since card no longer adds margins/border

## Impact

- `src/components/Photo/index.js` — Outer container transparency fix + `expandedCardContainer` style: shadow, border, and margin changes
- `src/utils/photoListHelpers.js` — `CARD_CHROME_HEIGHT` drops to 0
