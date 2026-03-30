### Requirement: Waves explainer view with ungrouped photos
The system SHALL display a multi-card educational view when the waves list is empty and the user has ungrouped photos. The view SHALL explain what waves are, highlight that photos are ready to organize, and provide an auto-group CTA.

#### Scenario: Empty waves with ungrouped photos
- **WHEN** the waves list is empty and `ungroupedPhotosCount > 0`
- **THEN** the system SHALL display the WavesExplainerView with the "has ungrouped" content variant
- **THEN** the view SHALL show a header with a wave icon circle, title, and subtitle
- **THEN** the view SHALL show info cards explaining: (1) what waves are — collections of photos organized by time and location, (2) that the user has N photos ready to organize, (3) how auto-group works — the system sorts photos into waves automatically
- **THEN** the view SHALL show a primary CTA button "Auto Group N Photos" that triggers the auto-group flow

#### Scenario: Auto group CTA pressed
- **WHEN** the user taps the "Auto Group N Photos" button on the explainer
- **THEN** the system SHALL emit `emitAutoGroup(ungroupedPhotosCount)` to trigger the auto-group confirmation dialog

### Requirement: Waves explainer view with no photos
The system SHALL display a multi-card educational view when the waves list is empty and the user has no ungrouped photos (no photos taken on this device). The view SHALL explain what waves are, encourage taking photos, and provide a navigation CTA.

#### Scenario: Empty waves with no photos
- **WHEN** the waves list is empty and `ungroupedPhotosCount === 0`
- **THEN** the system SHALL display the WavesExplainerView with the "no photos" content variant
- **THEN** the view SHALL show a header with a wave icon circle, title, and subtitle
- **THEN** the view SHALL show info cards explaining: (1) what waves are — collections of photos organized by time and location, (2) how to start — take photos and they will be ready to group into waves later, (3) two ways to add photos to waves — shoot directly into a wave or add existing photos later
- **THEN** the view SHALL show a primary CTA button "Take a Photo" that navigates back to the home screen

#### Scenario: Take a Photo CTA pressed
- **WHEN** the user taps the "Take a Photo" button on the explainer
- **THEN** the system SHALL navigate to the home screen via `router.navigate('/')`

### Requirement: Waves explainer visual design
The WavesExplainerView component SHALL follow the same visual pattern as `PrivacyExplainerView` — a ScrollView with themed card design tokens, icon header circle, and styled CTA button.

#### Scenario: Themed rendering
- **WHEN** the WavesExplainerView renders in light or dark mode
- **THEN** all cards and text SHALL use the current theme's tokens for backgrounds, borders, shadows, and text colors
- **THEN** the layout SHALL match the PrivacyExplainerView pattern: ScrollView with padding, icon circle header, info cards, and bottom CTA button
