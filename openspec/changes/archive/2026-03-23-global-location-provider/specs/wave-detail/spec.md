## MODIFIED Requirements

### Requirement: Wave Detail Photo Upload Location
The system SHALL obtain valid GPS coordinates from the global `locationAtom` for photo capture in the Wave Detail screen. Wave browsing (viewing wave photos, navigating, editing) SHALL work normally regardless of location state.

#### Scenario: WaveDetail camera with location available
- **WHEN** the user opens WaveDetail and `locationAtom.status` is `ready`
- **THEN** camera and video buttons SHALL be enabled
- **THEN** photos captured from WaveDetail SHALL include coordinates from `locationAtom.coords`

#### Scenario: WaveDetail camera without location
- **WHEN** the user opens WaveDetail and `locationAtom.status` is `pending` or `denied`
- **THEN** camera and video buttons SHALL be visible but disabled (opacity 0.4)
- **THEN** wave browsing (photo grid, pagination, search, editing, merging) SHALL work normally
- **THEN** the `useLocationInit` hook SHALL NOT be called — location comes from the atom
