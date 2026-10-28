## Purpose
This specification defines the responsive column breakpoint system used by `PhotosListMasonry` across all screens in WiSaw.

## Requirements

### Requirement: Responsive column breakpoint configuration
The `PhotosListMasonry` component SHALL accept a `columns` prop of type `ColumnsConfig` (`number | { default: number, [breakpoint: number]: number }`). When `columns` is an object, the masonry grid SHALL use `resolveColumnCount()` from expo-masonry-layout to determine the column count based on screen width. Breakpoints SHALL be evaluated ascending: the first breakpoint where `screenWidth <= breakpoint` determines the column count; if no breakpoint matches, the `default` value SHALL be used.

#### Scenario: Phone screen (width ≤ 402px) with comment-screen config
- **WHEN** the screen width is 390px and columns is `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- **THEN** the masonry grid SHALL render 2 columns

#### Scenario: Pro Max phone (width ≤ 440px) with comment-screen config
- **WHEN** the screen width is 430px and columns is `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- **THEN** the masonry grid SHALL render 3 columns

#### Scenario: Tablet (width ≤ 834px) with comment-screen config
- **WHEN** the screen width is 744px and columns is `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- **THEN** the masonry grid SHALL render 5 columns

#### Scenario: Large tablet (width ≤ 1024px) with comment-screen config
- **WHEN** the screen width is 1024px and columns is `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- **THEN** the masonry grid SHALL render 7 columns

#### Scenario: Very large screen (width > 1024px) with comment-screen config
- **WHEN** the screen width is 1366px and columns is `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- **THEN** the masonry grid SHALL render 9 columns

#### Scenario: Numeric columns value (backward compatibility)
- **WHEN** columns is the number `2`
- **THEN** the masonry grid SHALL render 2 columns on all screen sizes

### Requirement: Feed column profile
The PhotosList screen SHALL pass columns `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` to `PhotosListMasonry`, targeting approximately 140-190px column width across all device sizes to accommodate comment sections below thumbnails. This profile is used for both geo feed and bookmarks mode.

#### Scenario: PhotosList passes comment-screen columns config
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass the comment-screen column profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`) as the `columns` prop
- **THEN** the column profile SHALL be the same regardless of the active feed mode (geo or bookmarks)

### Requirement: Comment-screen column profile
The PhotosList, WaveDetail, and FriendDetail screens SHALL pass columns `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` to `PhotosListMasonry`, targeting approximately 140-190px column width to accommodate comment sections below thumbnails.

#### Scenario: PhotosList passes comment columns config
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass the comment-screen column profile as the `columns` prop

#### Scenario: WaveDetail passes comment columns config
- **WHEN** the WaveDetail screen renders `PhotosListMasonry`
- **THEN** it SHALL pass the comment-screen column profile as the `columns` prop

#### Scenario: FriendDetail passes comment columns config
- **WHEN** the FriendDetail screen renders `PhotosListMasonry`
- **THEN** it SHALL pass the comment-screen column profile as the `columns` prop
