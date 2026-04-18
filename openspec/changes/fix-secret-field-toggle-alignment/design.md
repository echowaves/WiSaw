## Context

The `SecretInputField` component renders a `FontAwesome5` eye icon as the `rightIcon` prop of the shared `Input` component. The `Input` component wraps `rightIcon` in a `View` styled with `marginLeft: 8, alignItems: 'center', justifyContent: 'center'` — this already vertically centres the icon in the input row. However, `SecretInputField` also applies `position: 'absolute', right: 12, top: 12` directly to the icon, which pulls it out of flex flow and fixes it at a pixel offset that doesn't adapt to the actual input height, causing visible misalignment.

## Goals / Non-Goals

**Goals:**
- Fix the vertical alignment of the show/hide toggle so it is centered within the input field row on all three secret input instances.
- Preserve a comfortable tap target (at least 44×44 logical points per Apple HIG / Material guidelines).

**Non-Goals:**
- Changing the shared `Input` component layout.
- Modifying icon sizes, colors, or the show/hide toggle behaviour.

## Decisions

### Decision 1: Remove absolute positioning, rely on flex centering from Input
**Choice:** Delete the `position: 'absolute'`, `right`, and `top` properties from `passwordToggle`. Keep `padding: 8` so the tap target remains generous. The `Input` component's `iconRight` wrapper already centers the icon vertically and positions it to the right of the text input via flex.

**Alternatives considered:**
- *Fix the `top` value to match a measured input height.* Rejected — fragile, breaks if font size or padding changes.
- *Move the toggle outside the Input's rightIcon and position it as an overlay on the View wrapper.* Rejected — over-engineered for a styling fix; also duplicates layout logic the `Input` component already handles.

**Rationale:** Removing the conflicting absolute style lets the existing flex layout do its job. The simplest fix with zero risk of side-effects.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Removing the style could shift the icon slightly from its previous (misaligned) position, which may briefly look different to existing users. | This is the intended fix; the new position is the *correct* one. |
| Tap target could shrink if padding is removed. | Keeping `padding: 8` on the icon ensures a ~36px icon+padding zone, plus the `iconRight` wrapper's own centering gives ample space. |
