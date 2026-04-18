## Context

The backend (WiSaw.cdk, commit b01b73a) added an explicit `freezeMode` field to the Wave model with a `WaveFreezeMode` enum: `AUTO`, `FROZEN`, `UNFROZEN`. The backend's `_isWaveFrozen` helper applies precedence: `FROZEN` → always frozen, `UNFROZEN` → always unfrozen, `AUTO` → date-derived (`now < splashDate OR now > freezeDate`). The backend's `updateWave` controller already accepts `freezeMode` as an optional parameter and restricts it to wave owners.

The frontend currently has no awareness of `freezeMode`. The `isFrozen` field returned by the backend now incorporates the `freezeMode` override, but the frontend treats it as purely date-derived.

The WaveSettings screen currently uses `isFrozen` to disable all controls except freeze date. This creates a mismatch: when `freezeMode` is `FROZEN` but dates are within range, the backend `updateWave` controller (which gates on `isDateFrozen`, not effective `isFrozen`) would accept updates, but the frontend disables the controls.

## Goals / Non-Goals

**Goals:**
- Give wave owners a UI to set `freezeMode` to AUTO, FROZEN, or UNFROZEN
- Wire `freezeMode` through the existing `updateWave` mutation
- Fix control disable logic to align with backend gating behavior
- Include `freezeMode` in Wave query responses so UI reflects current state

**Non-Goals:**
- Changing backend freeze logic (already complete)
- Adding freeze mode indicators to wave cards or wave detail headers
- Distinguishing visually between date-frozen and mode-frozen for non-owners
- Adding confirmation dialogs for freeze mode changes (simple toggle, unlike destructive actions)

## Decisions

### Decision 1: Tri-state button group for freeze mode control

Use a three-button segmented control (Auto / Frozen / Unlocked) matching the existing theme switcher pattern in the drawer layout. The label "Unlocked" is used instead of "Unfrozen" for clarity.

**Alternatives considered:**
- Dropdown/picker: Less discoverable, requires extra tap
- Two separate toggles (manual freeze + auto override): Confusing state space, easy to set conflicting values
- Single toggle with auto-detect: Cannot express "always unfrozen" state

**Rationale:** The three-button pattern already exists in the app for theme selection (light/dark/system) and communicates tri-state intent clearly.

### Decision 2: Disable logic uses date-frozen, not effective frozen

The WaveSettings screen will compute `isDateFrozen` client-side from `splashDate` and `freezeDate` using the same logic as the backend: `now < splashDate || now > freezeDate`. This determines which controls are disabled.

The `freezeMode` selector and `freezeDate` picker are always enabled for owners, regardless of frozen state. Other controls (name, description, open/closed, splash date, geo) are disabled only when `isDateFrozen` is true.

**Alternatives considered:**
- Keep using `isFrozen` for disable logic: Creates mismatch with backend which uses `isDateFrozen` for gating
- Never disable controls: Backend would reject invalid mutations, but poor UX

**Rationale:** Matches the backend's actual gating logic in `updateWave` controller, which uses `isDateFrozen` (not effective frozen) to determine which fields are editable.

### Decision 3: Local component state for freezeMode

Store `freezeMode` as local React state in WaveSettings (alongside existing `isFrozen`, `isOpen`, etc.), not as a Jotai atom. It's loaded from `getWave` response and sent via `updateWave` mutation.

**Rationale:** Freeze mode is wave-specific, not global. Follows existing WaveSettings pattern where all fields are local state populated on screen load.

### Decision 4: Position freeze mode control after freeze date picker

Place the freeze mode selector immediately after the freeze date picker, within the same logical section. This groups all freeze-related controls together.

**Rationale:** Freeze mode semantically extends freeze date behavior. Grouping them together helps owners understand the relationship.

## Risks / Trade-offs

- **[Date computation drift]** Client-side `isDateFrozen` computation could differ from server due to clock skew → Low risk; the computation uses coarse date comparison (day-level) and only affects UI enable/disable, not authorization
- **[Stale freezeMode on concurrent edit]** If two owners edit freeze mode simultaneously, the last write wins → Acceptable; matches existing behavior for all wave settings. Only one owner is expected.
- **[freezeMode not in existing Wave fragments]** Adding `freezeMode` to Wave query fields means all list queries also fetch it → Minimal overhead; it's a single enum string field
