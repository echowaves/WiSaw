## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for waves navigation in WiSaw.

## Requirements

### Requirement: Waves Stack Navigation Group
The system SHALL provide a Stack navigator wrapping all wave-related screens under the `app/(drawer)/waves/` directory, enabling proper back-stack navigation between the waves list, wave detail, and photo selection screens.

#### Scenario: User navigates from waves list to wave detail
- **WHEN** the user taps a wave card in the Waves Hub list
- **THEN** the Wave Detail screen is pushed onto the waves Stack with the wave's UUID as the route segment

#### Scenario: User presses back from wave detail
- **WHEN** the user presses the back button (header or system gesture) on the Wave Detail screen
- **THEN** the Stack pops back to the Waves Hub list screen

#### Scenario: User presses back from photo selection
- **WHEN** the user presses the back button on the Photo Selection screen
- **THEN** the Stack pops back to the Wave Detail screen they came from

#### Scenario: User navigates through the full wave flow and back
- **WHEN** the user navigates Waves list → Wave detail → Photo selection → back → back
- **THEN** each back action returns to the immediately previous screen in the sequence, ending at the Waves list

### Requirement: Dynamic Wave Detail Route
The system SHALL use a dynamic route segment `[waveUuid]` for the Wave Detail screen so that each wave is addressed by a unique URL path (`/waves/<waveUuid>`).

#### Scenario: User opens two different waves in sequence
- **WHEN** the user opens Wave A, navigates back, then opens Wave B
- **THEN** Wave B's detail screen is a fresh instance showing Wave B's photos (not Wave A's cached data)

#### Scenario: Wave UUID is extracted from route segment
- **WHEN** the Wave Detail screen mounts
- **THEN** the `waveUuid` is extracted from the dynamic route segment via `useLocalSearchParams()`

### Requirement: Waves Drawer Entry Point
The system SHALL register the `waves` directory group as a visible Drawer screen entry with a water icon, replacing the previous flat `waves` screen entry.

#### Scenario: User opens Waves from the drawer
- **WHEN** the user taps "Waves" in the drawer menu
- **THEN** the waves Stack group is activated, showing the Waves Hub list as the initial screen
