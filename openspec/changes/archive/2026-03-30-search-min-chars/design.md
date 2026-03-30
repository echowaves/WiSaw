## Context

The SearchFab component (`src/components/SearchFab/index.js`) renders a floating action button that expands into an inline search bar. When expanded, the FAB icon changes to a send icon and pressing it calls `onSubmitSearch()`. The `onSubmitEditing` handler on the `TextInput` also triggers submission. Currently, both paths accept any input length — including empty strings — which leads to overly broad API queries.

## Goals / Non-Goals

**Goals:**
- Prevent search submission when the search term has fewer than 3 characters
- Provide clear visual feedback (disabled appearance) when the term is too short
- Guard both submission paths: FAB press and keyboard return key

**Non-Goals:**
- Changing the minimum character count dynamically or making it configurable
- Adding validation error messages or toast notifications
- Modifying the backend to reject short queries

## Decisions

### Derive disabled state inline

Compute `const canSubmit = searchTerm.length >= 3` inside the component and use it to:
1. Set `disabled` on the FAB `Pressable` (blocks press events natively)
2. Reduce FAB opacity to 0.4 when disabled
3. Short-circuit the `onSubmitEditing` callback

**Rationale:** A single derived boolean keeps the logic in one place with zero additional state. Using the `Pressable` `disabled` prop is idiomatic React Native — it prevents the press handler from firing and enables accessibility hints automatically. Using Reanimated for the opacity transition was considered but adds unnecessary complexity for a binary state change.

## Risks / Trade-offs

- [User confusion about why the button is greyed out] → The 3-character minimum is a well-understood pattern; no tooltip needed.
- [Tag-click search bypasses the FAB] → Tag navigation calls `setSearchTerm` + `onSubmitSearch` from the parent, not through the FAB button. Tag terms are always ≥ 1 character. This change only guards the FAB's own press/keyboard paths, so tag-click is unaffected.
