## Context

The expanded photo view's action bar has 4 buttons (Report, Delete, Star, Share). The `getPhotoDetails` backend query now returns `waveName` and `waveUuid` fields. The `addPhotoToWave` and `removePhotoFromWave` mutations already exist in `src/screens/Waves/reducer.js`. The `listWaves` query returns the user's waves with name and photo count.

## Goals / Non-Goals

**Goals:**
- Add "Wave" action button to the photo detail action bar
- Build reusable wave selector modal with search
- Show wave membership state on the button (wave name vs "Add to Wave")
- Restrict wave assignment to own photos only

**Non-Goals:**
- Replacing the existing long-press wave picker in PhotosList (can be refactored to use the new modal later)
- Multi-wave assignment (backend enforces single-wave)
- Complex wave editing (rename, delete) from the modal — use Waves Hub for that

## Decisions

### Decision 1: Reusable WaveSelectorModal component

Create a standalone `WaveSelectorModal` component rather than embedding the modal directly in Photo. This keeps the Photo component from growing further and allows the modal to be reused by the long-press handler later.

Props: `visible`, `onClose`, `onSelectWave(wave)`, `onRemoveFromWave()`, `onCreateWave(name)`, `currentWaveUuid`, `uuid`.

Alternative: Inline modal in Photo component — rejected to avoid further bloating the already large Photo component.

### Decision 2: Optimistic UI update after wave assignment

After selecting a wave in the modal, update `photoDetails` state immediately with the new `waveName`/`waveUuid` rather than re-fetching from the server. On error, revert and show toast. This gives instant button label feedback.

Alternative: Re-fetch `getPhotoDetails` — rejected because it adds latency for a simple state change.

### Decision 3: Single-wave model with "None" and "Create New Wave" options

Since backend enforces single-wave, the modal shows a flat list of waves. If the photo is already in a wave, include a "None (remove from wave)" option at the top. A "Create New Wave" option is always shown at the top of the list (before wave items). Tapping it reveals an inline text input for the wave name — no separate modal needed. After creating, the photo is immediately assigned to the new wave. Selecting a different wave calls `removePhotoFromWave` then `addPhotoToWave` (or just `addPhotoToWave` if backend handles replacement).

### Decision 4: Button placement — 4th position (before Share)

Place the Wave button between Star and Share: Report | Delete | Star | Wave | Share. The Wave action is an organization action (like Star), so it groups naturally next to Star. Share stays at the end as the outward-facing action.

## Risks / Trade-offs

- [5 buttons on small screens] → Mitigated by existing `flexWrap: 'wrap'` on the action bar container. Buttons wrap to second row on screens < 360px. Acceptable degradation.
- [Race condition on remove+add] → If backend `addPhotoToWave` auto-removes from previous wave (single-wave enforcement), we only need one mutation call. Need to verify backend behavior. If not, call remove then add sequentially.
- [Wave list pagination] → `listWaves` supports pagination but the modal fetches page 0 only. Users with 50+ waves may not see all. Acceptable for v1; can add infinite scroll later.
