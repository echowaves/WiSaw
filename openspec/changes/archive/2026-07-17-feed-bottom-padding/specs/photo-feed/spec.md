## ADDED Requirements

### Requirement: Feed scroll content clears floating action buttons
The photos feed SHALL apply sufficient bottom padding to scroll content so that the last photos are fully visible and not obscured by the SearchFab and FeedModeToggleFAB when scrolled to the end of the feed. The `PhotosListMasonry` component SHALL accept an optional `contentPaddingBottom` prop that, when provided, overrides the default `FOOTER_HEIGHT + 20` padding. When omitted, the default padding behavior is preserved for consumers without FABs (WaveDetail, FriendDetail). The PhotosList screen SHALL pass a `contentPaddingBottom` value computed as `FOOTER_HEIGHT + FAB_SIZE + 32` (footer height + FAB height + breathing room) to ensure the last row of photos sits comfortably above the FABs.

#### Scenario: Feed screen passes FAB-aware padding
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `contentPaddingBottom` equal to `FOOTER_HEIGHT + 56 + 32` (approximately 178px)
- **THEN** the last photos in the feed SHALL end at least 16px above the bottom edge of the FABs

#### Scenario: Masonry uses custom padding when provided
- **WHEN** `contentPaddingBottom` prop is provided to `PhotosListMasonry`
- **THEN** the masonry `contentContainerStyle.paddingBottom` SHALL use the provided value
- **THEN** the default `FOOTER_HEIGHT + 20` SHALL NOT be applied

#### Scenario: Masonry falls back to default padding when prop is omitted
- **WHEN** `contentPaddingBottom` prop is NOT provided to `PhotosListMasonry`
- **THEN** the masonry `contentContainerStyle.paddingBottom` SHALL default to `FOOTER_HEIGHT + 20`
- **THEN** behavior for WaveDetail and FriendDetail SHALL be unchanged
