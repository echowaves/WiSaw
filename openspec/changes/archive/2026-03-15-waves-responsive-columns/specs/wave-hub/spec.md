## MODIFIED Requirements

### Requirement: Albums-Style Wave Grid Display
The system SHALL display waves in a responsive grid of wave cards. On phones (screen width < 768px), waves display in a single-column full-width list. On tablets and wider screens (screen width ≥ 768px), waves display in a 2-column grid. Each card shows a horizontal photo strip of up to 4 thumbnail images, wave name, and photo count.

#### Scenario: User opens Waves Hub on a phone
- **WHEN** the user navigates to the Waves Hub screen on a device with screen width less than 768px
- **THEN** waves are displayed in a single-column full-width list
- **THEN** each card spans the full width of the screen

#### Scenario: User opens Waves Hub on a tablet
- **WHEN** the user navigates to the Waves Hub screen on a device with screen width of 768px or more
- **THEN** waves are displayed in a 2-column grid
- **THEN** each card occupies approximately half the screen width

#### Scenario: Device rotates or screen resizes
- **WHEN** the screen width changes (rotation, split-screen, window resize)
- **THEN** the column count updates automatically based on the new width
- **THEN** the grid re-renders with the appropriate number of columns

#### Scenario: Wave has fewer than 4 photos
- **WHEN** a wave has 1-3 photos
- **THEN** the card shows available thumbnails filling the horizontal photo strip partially

#### Scenario: Wave has no photos
- **WHEN** a wave has zero photos
- **THEN** the card shows a placeholder icon (water/wave icon) instead of a thumbnail strip
