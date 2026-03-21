## Context

Two close buttons exist in the codebase for overlaying photo content:
1. `QuickActionsModal` — 28×28, theme-colored icon, `rgba(0,0,0,0.4)` background, no border/shadow
2. `Photo/index.js` (expanded view) — 40×40, white icon with text shadow, `rgba(0,0,0,0.6)` background, white border, drop shadow

Both float over photos and need reliable contrast. The expanded view design handles this well; the modal's does not.

## Goals / Non-Goals

**Goals:**
- Single `CloseButton` component reusable across both contexts
- Match the expanded photo view's proven design exactly
- Allow position overrides via `style` prop for different right-offset needs

**Non-Goals:**
- Theming the close button (white-on-dark works universally over photo content)
- Supporting different sizes or icon variants
- Changing close button behavior or callbacks

## Decisions

**1. Place in `src/components/ui/CloseButton.js`**
The `ui/` folder already contains shared primitives (`Badge.js`, `Button.js`, `Input.js`, `LinearProgress.js`). A close button fits this pattern.

**2. Accept `onPress` and optional `style` prop only**
The component needs no other configuration. The `style` prop allows consumers to override positioning (e.g., `{ right: 20 }` for the expanded view vs default `right: 10`). Using `StyleSheet.flatten` or array merging keeps it simple.

**3. Use the expanded view's exact visual spec**
40×40 circle, `rgba(0,0,0,0.6)` background, 1px `rgba(255,255,255,0.2)` border, Ionicons `close` at 24px in `rgba(255,255,255,0.95)`, text shadow, drop shadow with elevation 5. This is the design that already works over any photo background.

## Risks / Trade-offs

- [Larger button in modal] The 40×40 button is larger than the old 28×28 in the modal context → Acceptable because the modal content area is wide enough and the larger hit target improves usability
- [Hardcoded colors] No theme awareness for the button itself → This is intentional — the button always sits over photo content where white-on-dark is the correct choice regardless of light/dark mode
