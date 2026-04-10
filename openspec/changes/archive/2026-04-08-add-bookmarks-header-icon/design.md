## Context

The top nav bar (`PhotosListHeader`) currently shows `FriendsHeaderIcon` and `WaveHeaderIcon` on the right side. Both follow an identical pattern: 40×40 `TouchableOpacity`, 22px icon, color driven by a Jotai atom, navigation via `router.navigate()`. Bookmarks exist as a drawer-only item using `Ionicons bookmark` with `STATE.bookmarksCount` already fetched by `WaveHeaderIcon` on mount.

## Goals / Non-Goals

**Goals:**
- Add `BookmarksHeaderIcon` to the header, matching existing icon patterns exactly
- Position it left of Friends: Bookmarks → Friends → Waves
- Grey when empty, colored when bookmarks exist

**Non-Goals:**
- No badge/notification dot for bookmarks
- No changes to the drawer bookmark entry
- No new API calls or state atoms

## Decisions

### 1. Follow existing icon component pattern
Create `src/components/BookmarksHeaderIcon/index.js` mirroring `FriendsHeaderIcon` structure. Same 40×40 container, same 22px icon size, same color logic using `useAtom(STATE.bookmarksCount)`.

**Why**: Consistency. All three header icons should be interchangeable in structure.

### 2. Use Ionicons `bookmark` icon
Reuse the same icon library and name as the drawer entry (`Ionicons bookmark`).

**Why**: Visual consistency between drawer and header. Users recognize the same icon.

### 3. Keep 8px gap between icons
Three icons at 40px + 8px gaps = ~136px. Well within comfortable range for modern phone widths (360px+).

**Why**: Matches current spacing. No need to compress.

## Risks / Trade-offs

- **[Minor] Three icons on right side** → 136px is ~38% of a 360px-wide phone. Acceptable, but leaves less center space. No mitigation needed.
- **[None expected] State availability** → `bookmarksCount` atom is already populated by `WaveHeaderIcon`'s `useEffect`. `BookmarksHeaderIcon` just reads it. If `WaveHeaderIcon` mount order changes, the count may briefly be `null` — handled by treating `null` as grey (no bookmarks).
