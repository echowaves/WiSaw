# Tag Click Search Specification

## Purpose

Defines the behavior of AI tag chips on the detailed image card: in the photo feed, tapping a tag fills the feed's search bar with the tag and filters the current feed in place; in contexts without a feed search, the chips are non-interactive.

## Requirements

### Requirement: Tag tap in feed starts in-context search
The system SHALL allow the user to tap an AI label chip or an AI text detection chip on an expanded photo card within the photo feed to start a search for that term in the current feed. The search bar SHALL be populated with the tag term, the search bar SHALL be in its expanded (visible) state, and the current feed SHALL be reloaded with photos matching that term.

#### Scenario: User taps an AI label chip
- **WHEN** the user taps an AI label chip (e.g., "sunset") on the expanded photo card in the photo feed
- **THEN** the feed's search bar SHALL contain "sunset" and be visible
- **THEN** the current feed SHALL be filtered to photos matching "sunset"

#### Scenario: User taps an AI text detection chip
- **WHEN** the user taps a text detection chip (e.g., "MENU") on the expanded photo card in the photo feed
- **THEN** the feed's search bar SHALL contain the detected text and be visible
- **THEN** the current feed SHALL be filtered to photos matching that text

#### Scenario: Short tag term still searches
- **WHEN** the user taps a tag chip whose term is shorter than the minimum length required for manually typed search input
- **THEN** the feed SHALL still be filtered by that tag term

### Requirement: Expanded card collapses on tag search
When a tag tap triggers a search, the expanded photo card SHALL collapse so that the search bar with the new term and the filtered results are the visible focus.

#### Scenario: Expanded card collapses after tag tap
- **WHEN** the user taps a tag chip on the expanded photo card in the photo feed
- **THEN** the expanded photo card SHALL collapse
- **THEN** the feed SHALL display the filtered results with the tag term visible in the search bar

### Requirement: Moderation label chips are non-interactive
The system SHALL render content moderation label chips as non-interactive. Tapping a moderation chip SHALL NOT start a search.

#### Scenario: User taps a moderation label chip
- **WHEN** the user taps a content moderation label chip on the expanded photo card
- **THEN** no search SHALL be triggered
- **THEN** the feed SHALL remain unchanged

### Requirement: Tag chips outside the feed are non-interactive
In contexts without a feed search experience (shared photo detail, wave detail, friend detail), the system SHALL render AI tag chips as non-interactive. Tapping a chip SHALL NOT trigger a search, SHALL NOT emit search events, and SHALL NOT alter the state of any feed.

#### Scenario: User taps a tag on the shared photo detail screen
- **WHEN** the user taps an AI tag chip on the shared photo detail screen
- **THEN** no search SHALL be triggered
- **THEN** the state of the photo feed SHALL remain unchanged

#### Scenario: Chips in non-feed contexts show no press affordance
- **WHEN** an AI tag chip is rendered in a non-feed context
- **THEN** the chip SHALL NOT provide press feedback or other clickable affordance
