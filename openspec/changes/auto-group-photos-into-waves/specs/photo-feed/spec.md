## MODIFIED Requirements

### Requirement: Location-Based Feed Filtering
The system SHALL filter the Global feed to show only photos taken near the user's current GPS location. After auto-grouping, newly wave-assigned photos SHALL continue to appear in the Global feed as before; wave assignment does not remove photos from the location-based feed.

#### Scenario: User has location permission granted
- **WHEN** the app has location access and fetches the feed
- **THEN** only photos within the configured proximity radius are displayed

#### Scenario: User denies location permission
- **WHEN** the user denies location access
- **THEN** the app handles gracefully and shows an appropriate message or fallback

#### Scenario: Photos remain in feed after auto-grouping
- **WHEN** photos are assigned to waves via auto-grouping
- **THEN** those photos SHALL still appear in the Global feed based on location proximity
- **THEN** the wave-filtered feed (when a wave is active) SHALL include the newly grouped photos
