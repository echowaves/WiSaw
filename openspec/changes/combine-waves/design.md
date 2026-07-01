## Context

The WavesHub screen (`src/screens/WavesHub/index.js`) currently displays waves in a 2-column grid using `WaveCard` components. Merging waves uses a long-press context menu → "Merge Into Another Wave..." → `MergeWaveModal` (pick single target) → confirm → GraphQL mutation. The backend API (`../Wisaw.cdk`) already supports multi-wave merge via `sourceWaveUuids: [String!]!`, but the frontend only sends a single source wave.

Current state machine:
```
WavesHub (browse mode)
  └─ Long press wave → ContextMenu
       └─ "Merge Into..." → MergeWaveModal (single source, pick target)
            └─ Confirm → mergeWaves(target, [source], uuid)
```

## Goals / Non-Goals

**Goals:**
- Add multi-select mode to WavesHub with header "Select" button
- Allow selecting 2+ waves, then combine with one tap
- Auto-pick target wave (most photos) to reduce user decisions
- Update GraphQL mutation to send `sourceWaveUuids` array
- Keep existing single-wave merge flow working

**Non-Goals:**
- Rename waves during combine (backend supports it, but UI deferred)
- Select non-owned waves (backend requires owner role)
- Animated selection transitions
- Haptic feedback on selection

## Decisions

**1. Selection mode entry: Header "Select" button (not long-press)**
- Rationale: Pocket uses explicit mode toggle. Long-press is already used for context menu; adding dual behavior creates confusion. Header button is discoverable and matches the "Count: N / Deselect" pattern from Pocket.
- Alternatives considered: Long-press to enter selection (iOS Files pattern), FAB button

**2. Auto-pick target: Wave with most photos**
- Rationale: Minimizes user decisions. The wave with the most photos is intuitively the "main" wave. User still sees confirmation before merge.
- Alternatives considered: Let user pick target from modal, oldest wave, newest wave

**3. Selection state: Local React state (Set), not Jotai atom**
- Rationale: Selection state is screen-local, short-lived, and doesn't need persistence or cross-screen sharing. Local state avoids atom complexity.
- Alternatives considered: Jotai atom (overkill for screen-local ephemeral state)

**4. Combine flow: Confirm via Alert, not modal**
- Rationale: After selecting N waves, auto-picking target removes ambiguity. A simple confirmation alert ("Merge 3 waves into 'Target'? 45 photos will be moved.") is sufficient. No need for a full modal.
- Alternatives considered: MergeWaveModal with summary, inline confirmation

**5. Filter: Only owner waves selectable**
- Rationale: Backend requires owner role on all waves. Pre-filtering prevents confusing errors. Non-owned waves remain visible but can't be selected in selection mode.
- Alternatives considered: Allow select but show error on combine, show toast when tapping non-owned wave

## Risks / Trade-offs

- **User selects wave, then scrolls away**: Selection state persists across scroll/pagination. Selected waves that scroll out of view still count toward combine. This is intentional (matches Pocket behavior) but could be confusing if user forgets what they selected. → Mitigation: Show "Count: N" in header during selection mode.
- **Backend not deployed**: The `sourceWaveUuids` array parameter exists in the GraphQL schema but the backend lambda hasn't been deployed yet. → Mitigation: The mutation change is backward compatible (single-element array works with both old and new backend).
- **Large photo count recalculation**: Backend recalculates `photosCount` after merge. For waves with many photos, this could be slow. → Mitigation: Refresh waves list after merge completes (already done via `handleRefresh()`).