# Photo Feed Specification

## Purpose
The photo feed is the core browsing experience of WiSaw, presenting location-based photos in a masonry layout with multiple segments for discovery, favorites, and search. Users browse anonymous, nearby photo content without accounts or profiles.

## Requirements

### Requirement: Multi-Segment Feed Display
The system SHALL provide a three-segment tabbed photo feed consisting of Global (all nearby photos), Starred (user favorites), and Search (keyword-filtered results).

#### Scenario: User opens the app
- **WHEN** the user launches the app
- **THEN** the Global feed segment is displayed by default showing nearby photos in a masonry layout

#### Scenario: User switches to Starred segment
- **WHEN** the user taps the Starred tab
- **THEN** only photos the user has starred are displayed

#### Scenario: User switches to Search segment
- **WHEN** the user taps the Search tab and enters a search term
- **THEN** photos matching the search keyword are displayed in the masonry layout

### Requirement: Masonry Layout Rendering
The system SHALL display photos in a unified masonry (Pinterest-style) grid layout with dynamic column configurations appropriate to each feed segment.

#### Scenario: Photos load in the feed
- **WHEN** photos are fetched from the server
- **THEN** they are rendered in a masonry grid layout with variable-height tiles

#### Scenario: Feed adapts to device dimensions
- **WHEN** the user views the feed on different device sizes
- **THEN** the masonry layout adjusts column count and tile sizing responsively

### Requirement: Photo Interaction from Feed
The system SHALL allow users to tap on a photo in the feed to view its details, including comments, AI labels, and sharing options.

#### Scenario: User taps a photo
- **WHEN** the user taps on a photo tile in the masonry grid
- **THEN** the photo detail view is presented with full-size image and metadata

### Requirement: Photo Editing and Deletion
The system SHALL allow users to edit captions or delete their own uploaded photos from the feed.

#### Scenario: User edits their own photo
- **WHEN** the user taps edit on a photo they uploaded
- **THEN** they can modify the photo caption and save changes

#### Scenario: User deletes their own photo
- **WHEN** the user taps delete on a photo they uploaded
- **THEN** the photo is removed from the feed after confirmation

### Requirement: Content Moderation
The system SHALL allow users to flag or delete inappropriate content to maintain community standards.

#### Scenario: User reports inappropriate content
- **WHEN** the user taps the delete button on another user's photo
- **THEN** the content is removed or flagged for moderation

### Requirement: Location-Based Feed Filtering
The system SHALL filter the Global feed to show only photos taken near the user's current GPS location.

#### Scenario: User has location permission granted
- **WHEN** the app has location access and fetches the feed
- **THEN** only photos within the configured proximity radius are displayed

#### Scenario: User denies location permission
- **WHEN** the user denies location access
- **THEN** the app handles gracefully and shows an appropriate message or fallback
