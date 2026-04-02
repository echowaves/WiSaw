## Context

The chat system was the original way friends interacted in the app. With the redesign (Phases 1-2), friends now view each other's photos instead. Chat is fully orphaned — no route navigates to it, no UI triggers it. This is a clean removal of dead code.

The chat system spans: a `GiftedChat`-based screen with 6 custom hooks, a route, GraphQL operations (queries, mutations, subscriptions), unread count tracking, and references across the friends system and header icons.

## Goals / Non-Goals

**Goals:**
- Remove all chat code to eliminate dead code
- Remove the `react-native-gifted-chat` dependency
- Clean all chat references from the friends system, header, and other screens
- Remove unread count tracking entirely

**Non-Goals:**
- Preserving chat data on the backend (backend changes are out of scope)
- Adding any replacement functionality
- Modifying the backend GraphQL schema

## Decisions

### Decision 1: Full deletion, no feature flag

**Choice**: Delete all chat code outright. No feature flag or soft removal.

**Rationale**: Chat is completely orphaned after Phase 2. No route leads to it. Keeping dead code behind a flag adds complexity with zero benefit.

### Decision 2: Remove unread tracking entirely

**Choice**: Remove the `friendsUnreadCount` atom, `getUnreadCountsList` calls, and the badge indicator on `FriendsHeaderIcon`.

**Rationale**: Unread counts only existed for chat messages. With chat gone, there's nothing to count. The friends header icon badge becomes unnecessary.

### Decision 3: Update explainer text to remove chat mentions

**Choice**: Update `FriendsExplainerView` text to reference photo sharing instead of chat.

**Rationale**: The empty-state explainer currently mentions chat as a friend feature. It should reflect the new photo-focused experience.

## Risks / Trade-offs

- [Destructive — cannot undo easily] → Acceptable. Git preserves history. The code can be recovered if ever needed.
- [Backend still has chat APIs] → Out of scope. Backend endpoints remain but are simply no longer called by the client.
