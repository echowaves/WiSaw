## MODIFIED Requirements

### Requirement: Waves drawer label shows upload target wave name
The Waves drawer label SHALL display "Waves" as the primary label. When an upload target wave is set, the drawer item SHALL display the wave name on a second line below "Waves" in smaller, muted styling. The wave name line SHALL truncate with ellipsis if the name is too long.

#### Scenario: Upload target wave is set
- **WHEN** the drawer is opened and an upload target wave is set
- **THEN** the drawer item SHALL display "Waves" on the first line
- **THEN** the drawer item SHALL display the upload target wave name on a second line below "Waves"
- **THEN** the second line SHALL use a smaller font size and reduced opacity compared to the primary label

#### Scenario: No upload target wave
- **WHEN** the drawer is opened and no upload target wave is set
- **THEN** the drawer label SHALL display only "Waves" with no second line

#### Scenario: Long wave name truncation
- **WHEN** the upload target wave name exceeds the available drawer width
- **THEN** the wave name line SHALL truncate with an ellipsis
