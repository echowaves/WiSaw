## Context

WaveDetail's root container uses `theme.BACKGROUND` while WavesHub and PhotosList use `theme.INTERACTIVE_BACKGROUND`. The theming spec already mandates all three screens use `INTERACTIVE_BACKGROUND`. This is a one-line fix.

## Goals / Non-Goals

**Goals:**
- Align WaveDetail container background with the theming spec

**Non-Goals:**
- Changing any theme token values
- Modifying other screens

## Decisions

### 1. Change `theme.BACKGROUND` → `theme.INTERACTIVE_BACKGROUND` on WaveDetail container
**Rationale**: Direct compliance with existing theming spec requirement. No alternative needed — the spec is explicit.

## Risks / Trade-offs

- None — this is a single style property change with zero logic impact.
