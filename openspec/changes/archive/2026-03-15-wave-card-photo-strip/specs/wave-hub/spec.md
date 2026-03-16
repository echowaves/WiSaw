## MODIFIED Requirements

### Requirement: Albums-Style Wave Grid Display
The system SHALL display waves in a single-column full-width list of wave cards, each showing up to 4 photo thumbnails in a single horizontal strip, wave name, and photo count.

#### Scenario: User opens Waves Hub with existing waves
- **WHEN** the user navigates to the Waves Hub screen
- **THEN** waves are displayed in a single-column full-width list
- **THEN** each card shows up to 4 thumbnail images laid out in a single horizontal row
- **THEN** each card shows the wave name and total photo count

#### Scenario: Wave has fewer than 4 photos
- **WHEN** a wave has 1-3 photos
- **THEN** the card shows available thumbnails in the horizontal row with empty slots filling the remaining space

#### Scenario: Wave has no photos
- **WHEN** a wave has zero photos
- **THEN** the card shows a placeholder icon (water/wave icon) instead of the photo strip
