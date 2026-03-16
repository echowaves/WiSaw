## Context

The expanded photo view (`Photo/index.js`) renders 5 action buttons (Report, Delete, Star, Wave, Share) with ~150 lines of JSX and ~120 lines of handler logic. Long-pressing a thumbnail in the feed (`PhotosList/index.js`) currently opens a platform-specific wave-only picker (ActionSheetIOS on iOS, limited Alert on Android). These are completely separate code paths with no shared components.

The action buttons depend on `photoDetails` (fetched via `getPhotoDetails` GraphQL query), which provides `isPhotoWatched`, `waveName`, `waveUuid`, and other fields. In the feed, only the basic `photo` object is available at long-press time.

## Goals / Non-Goals

**Goals:**
- Extract action buttons and handlers into reusable components shared by both expanded view and long-press modal
- Provide all 5 actions from the feed via long-press without expanding the photo
- Show the modal instantly with a loading state while photo details are fetched
- Preserve all existing confirmation dialogs (Alert.alert for Delete, Ban)
- Replace the platform-specific wave picker entirely

**Non-Goals:**
- Changing the visual design of the action buttons (already styled with icon-only disabled state)
- Adding new actions beyond the existing 5
- Modifying the `getPhotoDetails` GraphQL query or backend
- Changing the expanded photo view's layout or behavior (only extracting shared code)

## Decisions

### Decision 1: Extract `PhotoActionButtons` component

Extract the 5-button JSX from `renderActionCard()` in `Photo/index.js` into `src/components/PhotoActionButtons/index.js`. This component receives all state and callbacks as props — it is purely presentational.

Props: `photo`, `photoDetails`, `uuid`, `theme`, `isOwnPhoto`, `isPhotoBannedByMe`, `onBan`, `onDelete`, `onFlipWatch`, `onWavePress`, `onShare`, `toastTopOffset`.

The component owns the button styles (`actionButton`, `actionButtonDisabled`, `actionButtonText`) and the conditional icon-only/round disabled rendering.

**Why not just pass `photoDetails` and derive everything?** Some state like `bans` lives outside `photoDetails`. Keeping props explicit makes the component testable and self-documenting.

### Decision 2: Extract `usePhotoActions` custom hook

Extract handler logic into `src/hooks/usePhotoActions.js`. This hook encapsulates the mutation calls, confirmation Alerts, guard toasts, optimistic updates, and local state (`bans`, `waveModalVisible`).

```
usePhotoActions({ photo, photoDetails, setPhotoDetails, uuid, toastTopOffset, onDeleted })
```

Returns: `{ handleBan, handleDelete, handleFlipWatch, handleWaveButtonPress, handleWaveSelect, handleWaveRemove, handleCreateWave, isPhotoBannedByMe, isOwnPhoto, waveModalVisible, setWaveModalVisible, bans }`

The only context-dependent parameter is `onDeleted` — a callback that differs between expanded view (no-op, already commented-out `router.back()`) and the modal (close modal, remove photo from feed).

**Why a hook instead of a utility module?** The handlers depend on React state (`bans`, `photoDetails`), Jotai atoms (`uuid`), and `useCallback`. A hook naturally encapsulates this.

### Decision 3: `QuickActionsModal` component

New component at `src/components/QuickActionsModal/index.js`. Semi-transparent overlay modal with:

1. Photo thumbnail preview (using `photo.thumbUrl` from the feed data)
2. Loading spinner while `getPhotoDetails` is in flight
3. `PhotoActionButtons` — hidden during loading, shown only after details arrive
4. `WaveSelectorModal` rendered inside and controlled by the hook's `waveModalVisible` state

The modal fetches `photoDetails` via `getPhotoDetails` on mount (when `visible` becomes true). The modal opens instantly showing only the thumbnail and a spinner. Once details load, the spinner is replaced by the action buttons in their correct state.

Post-action behaviors:
- **Delete**: Close modal, call `onPhotoDeleted(photoId)` to remove from feed
- **Ban/Report**: Stay open, button updates to disabled/banned state
- **Star**: Stay open, button toggles between Star/Starred
- **Wave**: WaveSelectorModal opens on top, QuickActionsModal stays behind
- **Share**: Share sheet opens over everything, modal stays

### Decision 4: Replace `handlePhotoLongPress` in PhotosList

Remove the existing `handlePhotoLongPress` with its ActionSheetIOS/Alert code. Replace with state to track the long-pressed photo and render `QuickActionsModal`. The `onPhotoDeleted` callback filters `photosList` (same Jotai atom update the current delete handler uses).

Remove the `ActionSheetIOS` import, `listWavesForPicker` call, and related `require('../Waves/reducer')` from PhotosList.

## Risks / Trade-offs

- [Network latency on modal open] → Modal shows immediately with thumbnail preview and spinner. Action buttons appear only after details load. Perceived performance is good because the user sees instant feedback. `getPhotoDetails` is a fast query (single photo lookup).
- [Alert.alert from inside modal] → System-level Alert dialogs overlay everything including the modal. Tested and works correctly on both iOS and Android.
- [Refactor scope] → Extracting ~270 lines from Photo/index.js is significant. Mitigated by keeping the extraction mechanical — same code, same logic, just moved to shared location. Photo component calls the hook and renders the component with identical props.
- [WaveSelectorModal layering] → WaveSelectorModal opens on top of QuickActionsModal. Both use React Native `Modal` which handles z-ordering correctly when nested.
