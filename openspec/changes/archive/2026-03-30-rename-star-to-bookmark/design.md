## Context

The app currently uses "star" as the UI metaphor for the backend "watcher" concept. This rename touches 7 source files across 4 directories, plus 2 route files. The backend API remains unchanged — only the UI layer maps "watcher" → "bookmark."

## Goals / Non-Goals

**Goals:**
- Rename all user-visible "star"/"starred" text and icons to "bookmark"/"bookmarks"
- Rename internal file paths, component names, and variable names to match
- Remove text labels from Bookmark, Share, Delete, and Report action buttons (icon-only)
- Keep photo stats count next to the bookmark icon (no text label)

**Non-Goals:**
- Changing any backend API names (watchers, flipWatch, isPhotoWatched, feedForWatcher, watchersCount)
- Changing the `#FFD700` gold accent color
- Changing the Wave button (it keeps its text label since it shows the wave name)
- Modifying any component APIs or data flow — this is purely a rename + icon swap + label removal

## Decisions

### Rename files and directories, not just UI strings

**Chosen:** Rename `StarredList/` → `BookmarksList/`, `starred.tsx` → `bookmarks.tsx`, and all internal variable names (`isStarred` → `isBookmarked`, etc.).

**Alternative considered:** Only change user-visible strings. Rejected — creates a confusing split where the code says "star" but the UI says "bookmark."

### Icon-only action buttons for Bookmark, Share, Delete, Report

**Chosen:** Remove `<Text>` labels from these 4 buttons. Keep the icon and color cues as the sole affordance.

**Alternative considered:** Keep text for Bookmark only. Rejected — inconsistent; if one button is icon-only, all similar buttons should match.

**Exception:** Wave button keeps its text label because it displays the wave name (informational, not just a verb).

### Photo stats: icon + count, no text

**Chosen:** Change from `⭐ 5 Stars` to `🔖 5` (bookmark icon + count only). Consistent with the icon-only pattern on action buttons.

### Expo Router drawer route name change

**Chosen:** Rename route file from `starred.tsx` to `bookmarks.tsx` and Drawer.Screen name from `'starred'` to `'bookmarks'`. This changes the route URL but there are no deep links targeting the starred/bookmarks screen.

## Risks / Trade-offs

- **[User confusion]** Users accustomed to "star" may not immediately recognize the bookmark icon. → Mitigated by the bookmark icon being universally understood; the gold color provides continuity.
- **[Route URL change]** `/(drawer)/starred` → `/(drawer)/bookmarks`. → No deep links point to this route, only the drawer navigates here.
- **[Import path changes]** Renaming `StarredList/` to `BookmarksList/` changes import paths in `bookmarks.tsx`. → Single import, straightforward.
