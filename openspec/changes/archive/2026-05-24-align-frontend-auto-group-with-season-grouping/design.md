## Context

The backend `autoGroupPhotosIntoWaves` mutation was updated with season-based wave boundaries, skip-non-matching behavior, and removal of the `groupingLevel` default fallback. The GraphQL schema is unchanged — same mutation signature, same return type. The frontend already has a `hasMore` loop that handles multi-iteration grouping. Three areas need alignment: a hardcoded grouping level in post-upload auto-group, stale UI copy, and mixed wave naming styles.

## Goals / Non-Goals

**Goals:**
- Ensure all `autoGroupPhotos` call sites use the user's configured grouping level
- Update GroupingSettings info text to accurately describe season-based behavior
- Normalize display of old date-range wave names alongside new season-based names

**Non-Goals:**
- Modifying the auto-group loop logic (skip-non-matching is handled server-side, client loop is unchanged)
- Renaming existing waves in the database (display-only normalization)
- Changing GroupingLevel options (DISTRICT/CITY/REGION/COUNTRY unchanged)

## Decisions

### Decision 1: Use `_groupingState.groupingLevel` in `flushUngroupedPhotos`

**Choice:** Replace `groupingLevel: 'CITY'` with `groupingLevel: _groupingState.groupingLevel || 'CITY'` in `photoUploadService.js`.

**Rationale:** `_groupingState` is already imported and checked (for `enabled`). The fallback `|| 'CITY'` is defense-in-depth for the case where state isn't hydrated yet — matching the existing default in `groupingStorage.js`.

### Decision 2: Update GroupingSettings info card text

**Choice:** Replace the current info text:
> "Auto-group triggers when you move beyond the selected field-matching and local timestamps."

With:
> "Photos are grouped into waves by location and season. Each wave covers one season (e.g. Winter, Spring) at the selected grouping level."

**Rationale:** The old text is vague and references "field-matching" which means nothing to users. The new text clearly describes the actual behavior.

### Decision 3: Client-side wave name normalization for display

**Choice:** Add a `normalizeWaveName(name)` utility that converts old date-range wave names to season format for display only. Apply it in the `WaveCard` component. The stored name in the database is never modified.

Old formats (from the removed `formatDateRange` function):
- `"NYC, Mar 5, 2026"` → `"NYC, Spring 2026"`
- `"NYC, Mar 2026"` → `"NYC, Spring 2026"`
- `"NYC, Mar – Jun 2026"` → `"NYC, Spring 2026"` (use start month)
- `"NYC, Mar 2025 – Jun 2026"` → `"NYC, Spring 2025"` (use start month/year)

Season mapping (same as backend):
- Dec, Jan, Feb → Winter (Jan/Feb use previous year: Jan 2026 → Winter 2025)
- Mar, Apr, May → Spring
- Jun, Jul, Aug → Summer
- Sep, Oct, Nov → Fall

**Alternative considered:** Backend migration to rename all old waves. Rejected — more invasive, requires coordination, and existing waves may have been manually renamed by users.

**Alternative considered:** Leave old names as-is. Rejected — user specifically requested consistency.

**Rationale:** Regex-based detection is reliable because auto-generated wave names follow a strict `"<Locality>, <DatePart>"` format. User-created or manually renamed waves won't match the date patterns, so they pass through unchanged. Names already in season format (`"NYC, Spring 2026"`) also won't match the date regex and pass through unchanged.

## Risks / Trade-offs

- **[Regex false positives]** → A manually named wave like "Photos, Mar 2026" would be normalized. Mitigated by the fact that this matches the auto-generated pattern exactly, so the result is still reasonable.
- **[Season year edge case]** → Dec/Jan/Feb names need year adjustment (Jan 2026 → Winter 2025). Must match the backend's `getSeasonKey` logic exactly.
- **[Display-only divergence]** → The displayed name and stored name differ for old waves. This only affects the card display; search, edit, and detail views show the stored name. Acceptable trade-off.
