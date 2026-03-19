## ADDED Requirements

### Requirement: Drawer menu button badge for upload target wave
The navigation menu button (navicon) in the photo feed footer SHALL display a small colored dot badge when an upload target wave is set, providing at-a-glance visibility of the upload target status without opening the drawer.

#### Scenario: Upload target wave is set
- **WHEN** the photo feed is displayed and an upload target wave is set
- **THEN** the nav menu button SHALL display a small filled circle badge in `CONST.MAIN_COLOR` at its top-right corner

#### Scenario: No upload target wave
- **WHEN** the photo feed is displayed and no upload target wave is set
- **THEN** the nav menu button SHALL NOT display any badge

#### Scenario: Badge updates reactively
- **WHEN** the upload target wave is set or cleared while the photo feed is visible
- **THEN** the nav menu button badge SHALL update immediately
