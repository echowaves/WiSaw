# Friends Search Specification

## Purpose
Provides client-side debounced search filtering of the friends list by display name.

## Requirements

### Requirement: Client-side friends search
The FriendsList screen SHALL provide a debounced text search input that filters the loaded friends list by display name. The search input SHALL be positioned at the bottom of the screen using KeyboardStickyView.

#### Scenario: User types a search term
- **WHEN** the user types text into the search input
- **THEN** the system SHALL debounce the input by 300ms and filter the displayed friends list to only those whose display name contains the search term (case-insensitive)

#### Scenario: User clears search
- **WHEN** the user taps the clear button on the search input or empties the text field
- **THEN** the full friends list SHALL be restored

#### Scenario: Search with no results
- **WHEN** the debounced search term matches no friends
- **THEN** the system SHALL display an EmptyStateCard with a "No friends found" message and a "Clear Search" action button

#### Scenario: Search bar visibility with empty list
- **WHEN** the friends list is empty (no friends at all) and no search term is active
- **THEN** the search bar SHALL NOT be displayed
