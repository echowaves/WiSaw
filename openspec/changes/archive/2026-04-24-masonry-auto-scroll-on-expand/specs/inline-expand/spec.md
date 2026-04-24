## ADDED Requirements

### Requirement: Auto-scroll to expanded item
The masonry grid SHALL automatically scroll to position the expanded item at the top of the viewport (with a small offset for visual breathing room) when a thumbnail is tapped to expand.

#### Scenario: Expand scrolls item into view
- **WHEN** a user taps a collapsed thumbnail to expand it
- **THEN** the masonry grid SHALL animate a scroll so the expanded item's top edge is positioned near the top of the viewport with an 8px offset

#### Scenario: Collapse does not scroll
- **WHEN** a user taps the collapse button on an expanded item
- **THEN** the masonry grid SHALL scroll to the position of the collapsed item so it remains visible

#### Scenario: Scroll is animated
- **WHEN** auto-scroll triggers on expand or collapse
- **THEN** the scroll SHALL be animated (not instant)

## MODIFIED Requirements

### Requirement: Expansion state management hook
The `usePhotoExpansion` hook SHALL manage `expandedPhotoId` state and provide `expandedItemIds` array, `getExpandedHeight` callback, and `toggleExpand` function to the masonry component.

#### Scenario: Hook returns expand API
- **WHEN** `usePhotoExpansion` is called
- **THEN** it returns `{ expandedItemIds, getExpandedHeight, toggleExpand, updateExpandedHeight, masonryRef }`
