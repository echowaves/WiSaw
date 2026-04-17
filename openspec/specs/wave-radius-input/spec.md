## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave radius input in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: Radius slider control
The wave radius input SHALL provide a slider for setting the geo-fence radius in miles.

#### Scenario: Default radius
- **WHEN** a wave has no radius set and the user sets a location
- **THEN** the radius slider SHALL default to 10 miles

#### Scenario: User adjusts radius
- **WHEN** the user moves the radius slider
- **THEN** the displayed value SHALL update in real time showing the selected value in miles
- **AND** the slider range SHALL be 1 to 50 miles with a step of 1 mile

#### Scenario: Radius saved in meters
- **WHEN** the radius is saved to the backend via `createWave` or `updateWave`
- **THEN** the radius value SHALL be converted from miles to meters (miles × 1609) before sending

#### Scenario: Radius loaded from backend
- **WHEN** a wave's radius is loaded from the backend (stored in meters)
- **THEN** the displayed value SHALL be converted to miles (meters ÷ 1609, rounded to nearest integer)

### Requirement: Radius visibility
The radius slider SHALL only be visible when a location is set on the wave.

#### Scenario: No location set
- **WHEN** the wave has no location
- **THEN** the radius slider SHALL NOT be displayed

#### Scenario: Location is set
- **WHEN** the wave has a location set
- **THEN** the radius slider SHALL be displayed below the location controls
