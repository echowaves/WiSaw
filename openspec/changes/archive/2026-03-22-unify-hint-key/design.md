## Context

The `InteractionHintBanner` component was created to unify per-screen hint banners into one shared component. During that work, backward compatibility was added by checking three SecureStore keys on mount (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`). The intent was to avoid re-showing the hint to users who had already dismissed the old per-screen hints. However, this adds unnecessary complexity — using a single key is simpler and achieves the same cross-screen unification goal.

## Goals / Non-Goals

**Goals:**
- Use exactly one SecureStore key (`interactionHintShown`) for both reading and writing hint status
- Remove the multi-key `HINT_KEYS` array and `Promise.all` pattern

**Non-Goals:**
- Migrating old keys (users who dismissed old hints may see the new hint once — acceptable)
- Changing visual design, text, or dismiss behavior of the banner

## Decisions

### 1. Drop backward compatibility with legacy keys
**Decision**: Only check `interactionHintShown`. Do not check `photoActionsHintShown` or `waveContextMenuTooltipShown`.

**Rationale**: The legacy keys were from per-screen implementations that have been removed. Some users who dismissed the old hints may see the unified hint once — this is acceptable and even desirable since the hint text and design are different now. Simplicity outweighs the minor UX cost of one extra hint display.

## Risks / Trade-offs

- [Users who dismissed old hints see the new hint once] → Acceptable; the new hint has different text and appears on all screens. One extra display is low-impact.
