## 1. ExpandableThumb ⋮ Pill Overlay

- [x] 1.1 Add ⋮ pill overlay to ExpandableThumb collapsed mode (absolutely positioned top-right, semi-transparent dark background, white Ionicons ellipsis-vertical icon)
- [x] 1.2 Wire ⋮ pill tap to trigger haptic feedback and call onLongPress(photo) — opening QuickActionsModal
- [x] 1.3 Ensure ⋮ pill is hidden when ExpandableThumb is in expanded mode
- [x] 1.4 Verify ⋮ pill does not overlap with existing comment overlay (bottom) or video play icon

## 2. Main Feed Hint Banner

- [x] 2.1 Add SecureStore check for `photoActionsHintShown` key in the main feed screen on mount
- [x] 2.2 Render dismissible hint banner above photo grid with text "Long-press any photo for quick actions" and ✕ button
- [x] 2.3 On ✕ tap, hide the banner and set SecureStore key `photoActionsHintShown` to `"true"`
- [x] 2.4 Style banner consistently with existing app design (semi-transparent background, appropriate padding and typography)
