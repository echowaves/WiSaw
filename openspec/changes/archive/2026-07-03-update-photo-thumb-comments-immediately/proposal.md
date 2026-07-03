# Update Photo Thumb Comments Immediately

## Problem

When a user adds or removes a comment from a photo, the photo thumb displayed in feeds and lists does not update to reflect the new comment count (`commentsCount`), watcher count (`watchersCount`), or last comment (`lastComment`) until the feed is manually refreshed.

## User Impact

Users see stale comment data in photo thumbs across multiple screens:
- Main feed (`PhotosList`)
- Wave Detail screen
- Friend Detail screen  
- Bookmarks screen

This creates confusion because:
1. The comment appears immediately in the Photo Details screen
2. But the feed still shows the old comment count
3. User must pull-to-refresh to see updated data

## Scope

This change affects all places where `ExpandableThumb` is used to display photo thumbs with comment metadata:

```
┌─────────────────────────────────────────────────┐
│  Main Feed                                      │
│  ├─ PhotosList → PhotosListMasonry              │
│  │   └─ ExpandableThumb (shows comments)        │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Wave Detail                                    │
│  ├─ WaveDetail → PhotosListMasonry              │
│  │   └─ ExpandableThumb (shows comments)        │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Friend Detail                                  │
│  ├─ FriendDetail → PhotosListMasonry            │
│  │   └─ ExpandableThumb (shows comments)        │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Bookmarks                                      │
│  ├─ BookmarksList → PhotosListMasonry           │
│  │   └─ ExpandableThumb (shows comments)        │
└─────────────────────────────────────────────────┘
```

## What This Change Does

1. Creates a new event bus `photoCommentBus` for comment update notifications
2. Updates `useFeedLoader` to subscribe to comment updates
3. Updates `submitComment` and `deleteComment` to emit comment update events
4. Updates feed state to refresh photo data when comments change

## What This Change Does NOT Do

- Does not change the backend API
- Does not change how comments are stored or retrieved
- Does not affect photo upload, deletion, or other operations
- Does not change the Photo Details screen behavior

## Acceptance Criteria

- [ ] Comment count updates immediately in feed after adding a comment
- [ ] Comment count updates immediately in feed after deleting a comment
- [ ] Last comment text updates immediately in feed after adding a comment
- [ ] Watcher count updates immediately in feed (from submitComment → watchPhoto)
- [ ] Works correctly in main feed
- [ ] Works correctly in Wave Detail
- [ ] Works correctly in Friend Detail
- [ ] Works correctly in Bookmarks screen
- [ ] Pull-to-refresh still works (backward compatibility)
- [ ] No duplicate network calls for same photo
- [ ] No console errors when comment is added/deleted