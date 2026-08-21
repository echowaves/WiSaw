## MODIFIED Requirements

### Requirement: Tag-Based Search Navigation
The system SHALL allow users to tap AI-generated label tags or detected text tags to search for photos matching that term. In the photo feed, a tag tap SHALL search within the current feed: the feed's search bar SHALL be populated with the term and made visible, and the current feed SHALL be filtered to matching photos. Content moderation labels SHALL be excluded from tap-to-search. In contexts without a feed search experience, tag chips SHALL be non-interactive and tapping them SHALL NOT trigger a search.

#### Scenario: User taps an AI label tag
- **WHEN** the user taps an AI label (e.g., "sunset") in the photo feed
- **THEN** the feed's search bar SHALL contain "sunset" and be visible
- **THEN** the current feed SHALL be filtered to matching photos

#### Scenario: User taps a text detection tag
- **WHEN** the user taps a detected text tag in the photo feed
- **THEN** the current feed SHALL be filtered to photos matching that text content
- **THEN** the feed's search bar SHALL contain the detected text and be visible

#### Scenario: User taps a tag in a non-feed context
- **WHEN** the user taps an AI tag in a context without a feed search experience (e.g., shared photo detail, wave detail, friend detail)
- **THEN** no search SHALL be triggered

#### Scenario: Moderation labels are not tappable
- **WHEN** the user taps a content moderation label chip
- **THEN** no search SHALL be triggered

### Requirement: Content Moderation Labels
The system SHALL display server-generated content safety/moderation labels to identify potentially inappropriate content. Moderation labels SHALL be display-only and SHALL NOT be interactive.

#### Scenario: Photo has moderation labels
- **WHEN** a photo with content moderation labels is displayed
- **THEN** the moderation labels are visually displayed on the photo
- **THEN** the labels SHALL NOT respond to tap or provide press feedback
