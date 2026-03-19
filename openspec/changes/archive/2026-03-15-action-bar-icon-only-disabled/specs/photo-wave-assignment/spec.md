## ADDED Requirements

### Requirement: Disabled Action Buttons Show Icon Only
The system SHALL hide text labels on disabled action buttons in the expanded photo view, displaying only the icon.

#### Scenario: Action button is disabled
- **WHEN** an action button in the expanded photo action bar is in a disabled state
- **THEN** the button shows only its icon without a text label
- **THEN** the button renders as a circle (round shape) instead of a pill
- **THEN** the button retains its disabled visual styling (reduced opacity, muted colors)

#### Scenario: Action button is enabled
- **WHEN** an action button in the expanded photo action bar is in an enabled state
- **THEN** the button shows both its icon and text label
