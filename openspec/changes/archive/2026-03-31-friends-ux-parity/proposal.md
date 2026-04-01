## Why

The friends list lacks the UX polish that the waves hub already has — no search, no sorting, no loading indicator, no interaction hints, no onboarding explainer, and a header that doesn't adapt to dark mode. The swipe-based actions (share/edit/delete) are not discoverable — users don't know they can swipe. Bringing friends up to parity with waves using the same shared components creates a consistent, polished experience across the app.

## What Changes

- **Remove swipe gesture system** from FriendItem — replace PanGestureHandler-based swipe actions with long-press + inline ⋮ menu button triggering ActionMenu (same pattern as WaveCard)
- **Add client-side search** to friends list — debounced text filter over already-loaded friends, with KeyboardStickyView search bar at bottom
- **Add sort options** to friends list via header ActionMenu — alphabetical (A-Z/Z-A), recently added, most recent chat, with pending friends always pinned to top regardless of sort
- **Add LinearProgress loading bar** during friend list fetch
- **Add InteractionHintBanner** with friends-specific hint text ("Long-press a friend for options, or tap ⋮")
- **Add FriendsExplainerView** — rich onboarding card (matching WavesExplainerView pattern) shown when no friends exist
- **Fix header dark mode** — replace static `SHARED_STYLES.theme` references with dynamic `getTheme(isDarkMode)` in friends.tsx header

## Capabilities

### New Capabilities
- `friends-search`: Client-side debounced search filtering over loaded friends list by display name
- `friends-sort`: Sort options for friends list (alphabetical, recently added, recent chat) with pending-first pinning
- `friends-explainer`: Rich onboarding/educational view shown when friends list is empty, matching WavesExplainerView pattern
- `friends-context-menu`: Long-press and ⋮ button on friend cards triggering ActionMenu with share/edit/delete actions, replacing swipe gestures
- `friends-loading-progress`: LinearProgress bar displayed during friends list data fetch

### Modified Capabilities
- `friendships`: Friend list display changes from swipe-based actions to ActionMenu-based actions; add search bar, sort menu, loading indicator, and interaction hint
- `interaction-hint-banner`: Make hint text configurable via prop (currently hardcoded to waves-specific text)

## Impact

- **src/screens/FriendsList/index.js** — Major refactor: remove PanGestureHandler swipe system (~150 lines), add ActionMenu integration, search state, sort state, LinearProgress, InteractionHintBanner
- **app/(drawer)/friends.tsx** — Add dark mode theming, sort menu via ActionMenu in header (matching waves/index.tsx pattern)
- **src/components/ui/InteractionHintBanner.js** — Add configurable `hintText` prop with current text as default
- **New: src/components/FriendsExplainerView/index.js** — Educational empty state component
- **Possibly removable**: react-native-gesture-handler PanGestureHandler import from FriendsList (if no other usage in that file)
