# Thumb Comment Section Specification

## Purpose
Below-photo comment section on thumbnails in the bookmarked segment, using masonry layout's native `getExtraHeight` for height allocation. Provides at-a-glance comment and watcher stats without opening the photo.

## Requirements

### Requirement: Comment section below thumbnail in bookmarked segment
Photo thumbnails in the bookmarked segment (segment 1 of PhotosList, all of BookmarksList) SHALL display a comment section below the image when the photo has comments, watchers, or a last comment. The section SHALL have a fixed height of 44 pixels, a theme-aware background (`theme.CARD_BACKGROUND`), and bottom border radius matching the thumbnail (20px).

#### Scenario: Thumbnail with comments shows comment section
- **WHEN** a photo in the bookmarked segment has `commentsCount > 0` OR `lastComment` is non-empty OR `watchersCount > 0`
- **THEN** a 44px comment section SHALL render below the image
- **THEN** the image SHALL have flat bottom corners (`borderBottomLeftRadius: 0`, `borderBottomRightRadius: 0`)
- **THEN** the comment section SHALL have rounded bottom corners (`borderBottomLeftRadius: 20`, `borderBottomRightRadius: 20`)

#### Scenario: Comment section displays last comment
- **WHEN** the photo has a non-empty `lastComment`
- **THEN** the comment section SHALL display the last comment text truncated to 1 line with ellipsis
- **THEN** the text color SHALL be `theme.TEXT_PRIMARY`

#### Scenario: Comment section displays stats
- **WHEN** the photo has `commentsCount > 0`
- **THEN** a comment icon (FontAwesome `comment`, 11px, `#4FC3F7`) and count SHALL be displayed
- **WHEN** the photo has `watchersCount > 0`
- **THEN** a bookmark icon (Ionicons `bookmark`, 11px, `#FFD700`) and count SHALL be displayed
- **THEN** stat text color SHALL be `theme.TEXT_SECONDARY`

#### Scenario: Thumbnail without comments has no comment section
- **WHEN** a photo has `commentsCount === 0` AND `lastComment` is empty AND `watchersCount === 0`
- **THEN** no comment section SHALL render
- **THEN** the image SHALL have full border radius (20px all corners)

#### Scenario: Non-bookmarked segment shows no comment sections
- **WHEN** a photo is displayed in the global feed segment (segment 0)
- **THEN** no comment section SHALL render regardless of comment data

#### Scenario: Comment section dark mode
- **WHEN** dark mode is active
- **THEN** the comment section background SHALL use the dark theme's `CARD_BACKGROUND` (`#1E1E1E`)
- **THEN** text colors SHALL use dark theme values

### Requirement: Masonry layout uses getExtraHeight for comment sections
The `PhotosListMasonry` component SHALL pass a `getExtraHeight` callback to `ExpoMasonryLayout` that returns 44 for photos with comment data in the bookmarked segment and 0 otherwise. This height SHALL be allocated natively by the masonry layout engine below the image area.

#### Scenario: getExtraHeight returns comment section height
- **WHEN** `activeSegment === 1` and the item has `commentsCount > 0` or `lastComment` or `watchersCount > 0`
- **THEN** `getExtraHeight` SHALL return `COMMENT_SECTION_HEIGHT` (44)

#### Scenario: getExtraHeight returns zero for non-bookmarked
- **WHEN** `activeSegment !== 1`
- **THEN** `getExtraHeight` SHALL return 0 for all items

#### Scenario: extraHeight passed to renderItem
- **WHEN** the masonry layout renders an item with `extraHeight > 0`
- **THEN** `dimensions.height` SHALL include the extra height
- **THEN** `extraHeight` SHALL be passed separately to the render callback
- **THEN** `ExpandableThumb` SHALL use `extraHeight` to split image height from comment section height
