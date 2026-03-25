## MODIFIED Requirements

### Requirement: Merge wave modal keyboard avoidance
The MergeWaveModal SHALL use keyboard avoidance from `react-native-keyboard-controller` so the search input remains visible when the keyboard is open.

#### Scenario: Searching waves to merge with keyboard open
- **WHEN** a user taps the search input in the merge wave modal
- **THEN** the modal content SHALL reposition so the search input and wave list remain usable above the keyboard
