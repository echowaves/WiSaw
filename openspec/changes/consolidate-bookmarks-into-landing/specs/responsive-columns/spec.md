## Modified Requirements

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
