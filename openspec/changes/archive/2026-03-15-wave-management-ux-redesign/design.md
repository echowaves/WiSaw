## Context

WiSaw's wave feature allows grouping photos into collections. Currently, waves are managed via a dedicated screen accessible only through the drawer menu. The UI is a flat text list with swipe gestures for edit/delete/share. A single `activeWave` Jotai atom controls both feed filtering and upload tagging simultaneously. The backend GraphQL schema already supports `Wave.photos: [String]`, `removePhotoFromWave`, and `addPhotoToWave`, but the frontend only uses `addPhotoToWave` during upload and never queries the `photos` field on waves.

Key constraints:
- Users have 50+ waves and growing — must scale visually
- No new dependencies without explicit approval
- Must use `expo-cached-image` for image display
- Must use `expo-storage` for key-value storage (note: `waveStorage.js` already uses SecureStore — this is for sensitive data persistence)
- Existing `ExpoMasonryLayout` + `ExpandableThumb` components must be reused for photo grids

## Goals / Non-Goals

**Goals:**
- Make waves accessible from the photo feed header (upper-right ≋ icon) without navigating the drawer
- Separate "upload target" (which wave new photos go to) from "viewing" (which wave's photos are displayed)
- Provide visual wave cards with 4-photo thumbnail collages and photo counts
- Enable adding existing photos to waves and removing photos from waves
- Enable creating waves from photo feed context (long-press on photo)
- Support 50+ waves with client-side search filtering
- Replace undiscoverable swipe gestures with explicit context menus

**Non-Goals:**
- Multi-user wave invitations/membership management (future feature)
- Server-side wave search API (client-side filtering is sufficient)
- "Ungrouped photos" virtual wave (backend doesn't support this query yet)
- Bottom tab bar navigation restructuring
- Wave sharing implementation (placeholder exists, remains TODO)

## Decisions

### 1. Wave access point: Header icon vs. bottom tabs

**Decision**: Add ≋ icon to the upper-right corner of the existing custom header in `renderCustomHeader()` (PhotosList).

**Why over bottom tabs**: The app has no bottom tab bar. Adding one would be a massive navigation restructuring affecting every screen. The header's right side is completely empty, making it a natural home. The drawer entry remains as a secondary access path.

**Alternatives considered**:
- Bottom tab bar — too invasive, reshapes entire app navigation
- Floating action button — conflicts with camera button paradigm
- Adding a 4th segment to the existing segmented control — semantically wrong, segments are feed filters not navigation

### 2. State split: `uploadTargetWave` vs. navigation-based viewing

**Decision**: Create a new `uploadTargetWave` atom (persisted in SecureStore via updated `waveStorage.js`). Wave viewing state is passed as route params when navigating to Wave Detail — no global atom needed.

**Why**: The current `activeWave` conflates two unrelated concerns. Users accidentally tag uploads to a wave they were just browsing. Separating them gives explicit control. The viewing state is inherently transient (tied to navigation stack) so it doesn't need persistence.

**Migration**: `activeWave` atom remains in `state.js` but is deprecated. Consumers are updated one by one. `loadActiveWave()` on app startup migrates any existing value to `uploadTargetWave` and clears the old key.

### 3. Wave card thumbnails: 4-photo collage from `Wave.photos` field

**Decision**: Add `photos` to the `listWaves` GraphQL response. Use the first 4 photo IDs to construct thumbnail URLs. Use `photos.length` for the count.

**Why over fetching N photos per wave**: The `Wave.photos` field already exists in the backend schema as `[String]` (array of photo IDs). Photo thumb URLs follow a predictable CDN pattern based on photo ID. This avoids N+1 queries per wave card.

**Fallback**: If `photos` is empty or null, show a placeholder icon (wave/water icon on a colored background).

### 4. New screens as Expo Router stack pushes

**Decision**: Add three new route files:
- `app/(drawer)/waves-hub.tsx` — Waves Hub (albums grid)
- `app/(drawer)/wave-detail.tsx` — Wave Detail (masonry photos view)
- `app/(drawer)/photo-selection.tsx` — Photo Selection Mode (add photos to wave)

These are Stack screens pushed from the drawer group, same pattern as the existing `feedback.tsx`, `friends.tsx` screens. The existing `waves.tsx` drawer entry is updated to navigate to `waves-hub` instead of rendering the old `Waves` screen inline.

**Why not nested under (tabs)**: Waves Hub is not a feed segment — it's a separate navigation flow. Keeping it at the drawer level matches the existing pattern.

### 5. Photo selection overlay on ExpandableThumb

**Decision**: Add an optional `selectionMode` prop to `ExpandableThumb`. When true, tap toggles a checkmark overlay instead of expanding the photo. A `selected` prop controls the visual state, and `onSelect` callback replaces `onToggleExpand`.

**Why modify ExpandableThumb**: Reusing the existing masonry + thumb infrastructure ensures visual consistency and avoids duplicating the complex expansion/rendering logic. The overlay is a simple absolute-positioned checkmark circle in the corner — similar to the existing comment overlay pattern.

### 6. Photo context menu via long-press

**Decision**: Add `onLongPress` handler to `ExpandableThumb` in the main feed. Opens a React Native `Alert`-style action sheet with options including "Add to Wave..." and "Start New Wave". No new dependency needed — use `ActionSheetIOS` on iOS and `Alert` with button list on Android, or the cross-platform `Alert.alert` with multiple buttons.

**Why not a custom bottom sheet component**: Avoids adding a dependency. The native action sheet pattern is familiar to users and requires zero new UI code. Can be upgraded to a custom sheet later if needed.

### 7. Wave management via context menus, not swipe gestures

**Decision**: Wave cards in Waves Hub use long-press to show a context menu (action sheet). Wave Detail uses a ⋮ header button for the same options.

**Why remove swipe gestures**: Swipe gestures are undiscoverable — users don't know they exist unless told. They also conflict with scroll gestures on long lists and add significant code complexity (the current `WaveItem` is ~300 lines of gesture animation code). Context menus are universally understood.

### 8. Client-side wave search

**Decision**: Add a `TextInput` search bar at the top of Waves Hub. Filter the loaded waves array by name match using `String.includes()`. No server-side search API needed.

**Why**: Even with 100+ waves, in-memory filtering is instant. The paginated `listWaves` query loads all waves into memory anyway. A server-side search would require a new backend endpoint for marginal benefit.

## Risks / Trade-offs

- **[Thumbnail URL construction]** → We assume photo thumb URLs can be derived from photo IDs. If the URL pattern isn't predictable (requires server lookup), we'll need a lightweight batch photo query. Mitigation: verify the CDN URL pattern from existing code before implementing.

- **[Wave.photos field size]** → For waves with hundreds of photos, the `photos` array returned by `listWaves` could be large. Mitigation: only the first 4 IDs are used for thumbnails; photo count can use `photos.length`. If performance is an issue, backend could add a `photoCount` field and paginate `photos`.

- **[activeWave migration]** → Existing users have `activeWave` persisted in SecureStore. Mitigation: on first load after update, read old key, write to new `uploadTargetWave` key, delete old key. One-time migration in `waveStorage.js`.

- **[ExpandableThumb modification scope]** → Adding selection mode to a widely-used component risks unintended side effects. Mitigation: selection mode is opt-in via prop (default false), guarded by conditionals, and only active in the PhotoSelectionMode screen.

- **[No "ungrouped photos" query]** → Backend doesn't support filtering photos NOT in any wave. Mitigation: explicitly out of scope for this change. Can be added as a future backend enhancement.

- **[Drawer + header icon redundancy]** → Two entry points to the same screen. Trade-off accepted: drawer remains for discoverability and tablet users; header icon adds quick access for the primary flow.
