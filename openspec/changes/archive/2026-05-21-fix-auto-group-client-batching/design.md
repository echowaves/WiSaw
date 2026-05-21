## Context

The backend `autoGroupPhotosIntoWaves` mutation is being updated to process photos in batches of 200 instead of all at once. Previously `hasMore` was hardcoded to `false` and `photosRemaining` to `0`. Now these fields carry real values. The client already loops on `hasMore`, but the loop body has two bugs: (1) it counts each API call as one wave created, and (2) it sets ungrouped count to 0 without checking `photosRemaining`. The progress overlay only shows "N photos grouped, M waves created" but never shows how many remain.

The relevant code is entirely within `handleAutoGroup` in `src/screens/WavesHub/index.js` (lines ~391–446). The state used is `autoGroupProgress` (`{ photosGrouped, wavesCreated }`).

## Goals / Non-Goals

**Goals:**
- Accurate wave count across multiple batch calls
- Progress text that includes remaining photos count
- Correct ungrouped count after completion (from API, not hardcoded 0)

**Non-Goals:**
- Changing the GraphQL query or response fields (already sufficient)
- Changing the progress overlay component structure
- Aligning client drift thresholds with backend distance thresholds (different purpose)

## Decisions

### Decision 1: Track unique waveUuids with a Set

**Choice:** Use a `Set<string>` to collect `result.waveUuid` values across loop iterations. The final wave count is `set.size`.

**Why:** A single batch can create multiple waves internally, but it only returns the *last* `waveUuid`. Across batches, the last wave from batch N may continue as the active wave in batch N+1, returning the same `waveUuid`. A Set naturally deduplicates. When a batch returns `waveUuid: null` (0 photos processed), it won't be added.

**Alternatives considered:**
- *Ask backend to return wavesCreated count:* Would require a schema change. Avoided since the client can derive this from existing fields.
- *Increment only when waveUuid changes:* Fragile — misses cases where batch N creates waves A and B, then batch N+1 continues B and creates C.

**Limitation:** The Set approach undercounts — if batch 1 creates waves A, B, C internally, it only returns C. We get an accurate count of *waves that were the "last wave" in some batch*, which is a lower bound. This is acceptable because the toast message is informational, not critical.

### Decision 2: Add photosRemaining to progress state

**Choice:** Extend `autoGroupProgress` state to include `photosRemaining` from the API response. Update progress text to show: "N photos grouped into M waves — R remaining".

**Why:** With batching, users with many photos will see multiple progress updates. Showing remaining count provides a meaningful progress signal.

### Decision 3: Use photosRemaining for ungrouped count on completion

**Choice:** After the loop finishes, set `ungroupedPhotosCount` to `result.photosRemaining` from the final API call instead of hardcoded `0`.

**Why:** With batching + errors, the final state may not be zero. Even on success, the final batch's `photosRemaining` is the authoritative count from the database.

## Risks / Trade-offs

- **[Wave count undercount]** → The Set tracks waveUuids returned by the API, but internal wave splits within a batch are invisible. Mitigation: Acceptable for a toast message; the waves list refresh shows the real count.
- **[Progress text complexity]** → Adding "remaining" makes the text longer on small screens. Mitigation: Keep it concise; the overlay is a temporary modal.
