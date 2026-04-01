## Context

The friends list screen (`src/screens/FriendsList/index.js`) currently uses PanGestureHandler-based swipe gestures for friend actions (share, edit, delete). This is a non-discoverable interaction pattern — users don't know they can swipe. Meanwhile, the waves hub (`src/screens/WavesHub/index.js`) uses a consistent, discoverable pattern: long-press + visible ⋮ menu button → ActionMenu modal. The waves hub also has search, sort, loading indicators, and interaction hints that friends lacks entirely.

The friends header (`app/(drawer)/friends.tsx`) references `SHARED_STYLES.theme` directly, which always returns light theme colors — a dark mode bug.

All shared components needed (ActionMenu, LinearProgress, EmptyStateCard, InteractionHintBanner) already exist and are generic. The only component modification needed is making InteractionHintBanner's hint text configurable.

## Goals / Non-Goals

**Goals:**
- Replace swipe gestures with ActionMenu (long-press + ⋮ button) matching waves pattern
- Add client-side search with debounced filtering
- Add sort options with pending-first pinning
- Add LinearProgress loading bar
- Add InteractionHintBanner with friends-specific text
- Add FriendsExplainerView for rich empty state
- Fix header dark mode bug

**Non-Goals:**
- Server-side search (friend counts are small enough for client-side filtering)
- Pagination / infinite scroll (all friends loaded at once — adequate for expected scale)
- Tablet-responsive multi-column layout (friends are a single-column list by nature)
- Changes to the friendship creation/confirmation flow
- Changes to chat navigation from friend taps

## Decisions

### 1. Replace swipes with ActionMenu (not inline buttons)

**Decision:** Use the existing ActionMenu modal triggered by long-press on the friend row AND a visible ⋮ button on each FriendCard.

**Alternatives considered:**
- *Inline action buttons always visible* — Clutters the UI, wastes space for rarely-used actions
- *Keep swipes but add hint* — Hints help, but swipe is still less discoverable than a visible button
- *Bottom sheet actions* — Would need a new component; ActionMenu already exists and works well

**Rationale:** Matches waves pattern exactly. ActionMenu is proven, generic, and supports destructive action styling. The ⋮ button provides immediate discoverability while long-press provides power-user speed.

### 2. Client-side search with inline debounce

**Decision:** Filter the already-loaded friends array in-memory using a 300ms debounced search term. Search bar positioned at bottom via KeyboardStickyView (same as waves).

**Alternatives considered:**
- *Server-side search* — Would need a new GraphQL query parameter; overkill for < 200 item lists
- *Top-positioned search bar* — Pushes content down; bottom position keeps list visible and matches waves

**Rationale:** Friends are loaded all at once already. Client-side filter is instant, requires no backend changes, and the UX (debounced input + filtered list) is identical to the waves search from the user's perspective.

### 3. Sort with pending-first pinning via Jotai atoms

**Decision:** Sort state managed with Jotai atoms (`friendsSortBy`, `friendsSortDirection`). Pending friends are always partitioned to the top regardless of sort selection. Sort options: Alphabetical A-Z, Alphabetical Z-A, Recently Added, Most Recent Chat.

**Alternatives considered:**
- *SecureStore persistence* — Waves sort resets on restart (session-only); friends should match
- *Mixing pending into sort order* — Pending requests are actionable items; burying them under alphabetical confirmed friends would hurt UX

**Rationale:** Consistent with waves sort pattern (session-only Jotai atoms). Pending-first pinning ensures action items are always visible.

### 4. FriendsExplainerView following WavesExplainerView pattern

**Decision:** New component `src/components/FriendsExplainerView/index.js` matching the visual pattern of WavesExplainerView — ScrollView with icon circle, explanatory cards, and CTA button.

**Alternatives considered:**
- *Reusing EmptyStateCard* — Already used for the basic empty state, but too sparse for onboarding
- *Generic ExplainerView component* — Could extract a shared base, but the content is different enough that this adds abstraction without reducing code

**Rationale:** Pattern consistency matters more than code reuse here. Each explainer has domain-specific educational content. Following the same visual structure gives consistency.

### 5. Make InteractionHintBanner text configurable

**Decision:** Add a `hintText` prop to InteractionHintBanner with the current text as default value. Friends will pass `"Long-press a friend for options, or tap ⋮"`.

**Alternatives considered:**
- *Separate SecureStore key per screen* — Current design uses one key (`interactionHintShown`) so the hint shows only once across the whole app. This is acceptable — once a user learns the pattern on any screen, they know it everywhere.

**Rationale:** Minimal change. Backward compatible (default preserves current behavior). Single SecureStore key means the hint educates once, not repeatedly.

## Risks / Trade-offs

- **[Swipe removal breaks muscle memory]** → Users who learned swipe will need to adjust. Mitigation: long-press is intuitive and the ⋮ button is always visible.
- **[Client-side search won't scale]** → If a user somehow accumulates thousands of friends, filtering slows down. Mitigation: unlikely for this app's use case; can add server-side search later.
- **[Single SecureStore key for hint]** → If a user sees the hint on waves first, they won't see friends-specific text. Mitigation: acceptable — the interaction pattern is identical.
- **[Sort state lost on restart]** → Matches waves behavior; users may expect persistence. Mitigation: can add later if requested.
