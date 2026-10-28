## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave location input in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: Use My Location button
The wave location input SHALL provide a "Use My Location" button that captures the device's current coordinates.

#### Scenario: Device location available
- **WHEN** the user taps "Use My Location"
- **AND** `locationAtom` has `status: 'ready'` with valid coords
- **THEN** the system SHALL reverse-geocode the coords via `Location.reverseGeocodeAsync()`
- **AND** populate the location display text with the resolved city/region/country
- **AND** store the `lat` and `lon` values in component state

#### Scenario: Device location not available
- **WHEN** the user taps "Use My Location"
- **AND** `locationAtom` does not have `status: 'ready'`
- **THEN** the system SHALL show an alert indicating that location is not available

#### Scenario: Reverse geocoding fails
- **WHEN** the user taps "Use My Location" and reverse geocoding fails
- **THEN** the system SHALL display the raw coordinates as fallback text (e.g., "37.77, -122.42")
- **AND** still store the `lat` and `lon` values

### Requirement: Address text input
The wave location input SHALL provide a text input where users can type a city name or address.

#### Scenario: Valid address entered
- **WHEN** the user types an address or city name and submits (presses return)
- **THEN** the system SHALL geocode the text via `Location.geocodeAsync()`
- **AND** reverse-geocode the resulting coords to display a normalized location text
- **AND** store the resolved `lat` and `lon` in component state

#### Scenario: Geocoding fails or no results
- **WHEN** the user submits an address that cannot be geocoded
- **THEN** the system SHALL show an alert indicating the address could not be found
- **AND** NOT change the current location state

### Requirement: Location display text
The wave location input SHALL display the current location as human-readable text.

#### Scenario: Location is set
- **WHEN** a wave has a location set (lat/lon stored)
- **THEN** the system SHALL display the reverse-geocoded text (city, region, country)

#### Scenario: No location set
- **WHEN** a wave has no location
- **THEN** the system SHALL display "No location set"
