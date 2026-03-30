## Why

The "star" metaphor for saving/watching photos is ambiguous — it can mean "favorite" or "rate." Renaming to "bookmark" better communicates the intent of personal curation ("save for later"). Additionally, action buttons (Share, Delete, Report, Bookmark) currently show redundant text labels alongside their icons; removing the text labels creates a cleaner, more compact action bar.

## What Changes

- Rename all user-facing "Star"/"Starred" text to "Bookmark"/"Bookmarks" throughout the app
- Replace star icons (`Ionicons star`/`star-outline`, `AntDesign star`) with bookmark icons (`Ionicons bookmark`/`bookmark-outline`) everywhere
- Rename internal file/component/variable names: `StarredList` → `BookmarksList`, `starred.tsx` → `bookmarks.tsx`, `isStarred` → `isBookmarked`, etc.
- Remove text labels from the Bookmark, Share, Delete, and Report action buttons in `PhotoActionButtons` — keep icon-only for all four
- Keep the Wave button text label (it shows the wave name, which is informational)
- Drawer item shows bookmark icon + "Bookmarks" text
- Screen header shows "Bookmarks" title
- Toast messages use "bookmark" terminology
- Photo stats line shows bookmark icon + count (no text label, matching the icon-only pattern)
- Backend API names remain unchanged: `watchers`, `flipWatch`, `isPhotoWatched`, `feedForWatcher`, `watchersCount`
- Keep `#FFD700` gold accent color for bookmarked state

## Capabilities

### New Capabilities

### Modified Capabilities
- `photo-feed`: Starred screen references become Bookmarks screen; star terminology → bookmark in feed-related specs
- `quick-actions-modal`: Star action button becomes icon-only bookmark; Report, Delete, Share buttons lose text labels

## Impact

- `src/screens/StarredList/` → renamed to `src/screens/BookmarksList/`
- `app/(drawer)/starred.tsx` → renamed to `app/(drawer)/bookmarks.tsx`
- `app/(drawer)/_layout.tsx` — drawer screen name, label, icon updated
- `src/components/PhotoActionButtons/index.js` — icon swap, variable renames, text label removal for 4 buttons
- `src/components/Photo/index.js` — stats icon swap, label removal
- `src/components/Photo/reducer.js` — toast message text
- `src/hooks/usePhotoActions.js` — toast message text
- No backend, API, or dependency changes
