## Context

The SearchFab component is a floating action button at the bottom-right of screens (PhotosList, BookmarksList) that expands into a search bar when tapped. The Photo component has its own `showCommentInput` state that controls an inline comment input field. These two components operate independently with no communication channel, causing the FAB to overlap the keyboard when comment editing is active.

## Goals / Non-Goals

**Goals:**
- SearchFab fades out when comment input opens on any photo
- SearchFab fades back in when comment input closes or submits
- Clean, minimal prop-based communication between Photo → Screen → SearchFab

**Non-Goals:**
- No new Context or global state (prop-based only)
- No changes to keyboard animation behavior (existing translateY logic preserved)
- No hiding FAB for other interactions (comment editing only)

## Decisions

### Decision: Prop-based callback instead of Context
**Choice:** Use `onCommentInputToggle` callback prop passed from Screen → Photo, with Screen managing `isCommentEditing` state.

**Rationale:**
- Simpler than creating a new Context for a single-screen concern
- Photo already receives many props via `usePhotoActions` hook
- No cross-screen sharing needed (comment input is per-photo, within PhotosList)

**Alternatives considered:**
- Context-based approach (Option A) — overkill for single-screen state
- Keyboard event listener (Option D) — heuristic, could hide FAB incorrectly
- Existing PhotosListContext (Option C) — mixes concerns

### Decision: Opacity animation instead of slide
**Choice:** Use `opacity` transition (0 → 1) with `pointerEvents: 'none'` when hidden.

**Rationale:**
- Simpler than animating transform/position
- Doesn't interfere with existing keyboard translateY animation
- `pointerEvents: 'none'` ensures FAB is unresponsive while invisible
- Consistent with React Native best practices for show/hide animations

**Alternatives considered:**
- Slide off-screen (translateX) — more complex, could conflict with FAB's existing horizontal expansion animation
- Scale to 0 — changes layout footprint unexpectedly

### Decision: Screen-level state management
**Choice:** Each screen (PhotosList, BookmarksList) manages its own `isCommentEditing` state.

**Rationale:**
- Comment input is scoped to PhotosList's Photo components
- BookmarksList needs same behavior but independent state
- No cross-screen coordination needed

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Photo component prop drilling depth increases | Use existing `usePhotoActions` hook or destructured props pattern |
| FAB fade conflicts with keyboard animation | `pointerEvents: 'none'` prevents interaction during transition; opacity is independent of translateY |
| Multiple photos with comment input open simultaneously | State is boolean — any photo opening hides FAB, any closing shows it (or track count) |
| BookmarksList not updated consistently | Document the pattern; both screens use identical SearchFab usage pattern |

## Open Questions

- Should the state be boolean (any photo open = hide) or counter-based (only hide when count > 0, show when count = 0)? Current design uses boolean, which is simpler but may show FAB prematurely if multiple comments open.
