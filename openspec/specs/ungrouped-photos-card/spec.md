## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for ungrouped photos card in WiSaw.

## Requirements

### Requirement: Ungrouped photos card displays ungrouped photos
The `UngroupedPhotosCard` component SHALL render a visually distinct card containing a `WavePhotoStrip` that loads photos via `requestUngroupedPhotos`. The card SHALL display the title "Ungrouped Photos" with the count, and SHALL have an accent background (MAIN_COLOR at 10% opacity) with a dashed border to distinguish it from regular wave cards.

#### Scenario: Card renders with ungrouped photos
- **WHEN** `UngroupedPhotosCard` mounts with `ungroupedCount > 0`
- **THEN** the card SHALL display "Ungrouped Photos (N)" as the title
- **THEN** a `WavePhotoStrip` SHALL be rendered with `fetchFn` set to `requestUngroupedPhotos`
- **THEN** the strip SHALL immediately fetch page 0 on mount

#### Scenario: Card visual distinction
- **WHEN** the ungrouped card is rendered
- **THEN** the background SHALL use `MAIN_COLOR` at 10% opacity
- **THEN** the border SHALL be dashed style
- **THEN** the card SHALL be visually distinguishable from regular wave cards

### Requirement: Ungrouped photos card provides auto-group CTA
The card SHALL include a prominent button labeled "Auto Group Into Waves" with subtitle text "You can fine-tune waves later". Pressing the button SHALL trigger `emitAutoGroup(ungroupedCount)`.

#### Scenario: Auto-group button press
- **WHEN** the user presses the "Auto Group Into Waves" button
- **THEN** `emitAutoGroup(ungroupedCount)` SHALL be called
- **THEN** the existing auto-group confirmation dialog and progress flow SHALL execute

#### Scenario: Card hides after auto-group completes
- **WHEN** auto-grouping completes and `ungroupedPhotosCount` becomes 0
- **THEN** the ungrouped card SHALL no longer be rendered

#### Scenario: Card re-fetches after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the UngroupedPhotosCard component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL reset `fetchedRef.current = false` to allow re-fetching
- **THEN** the listener SHALL call `requestUngroupedPhotos()` to fetch fresh ungrouped photos
- **THEN** the thumbnails SHALL display correctly (no more empty placeholders)

### Requirement: Ungrouped Photos Count Updates
When auto-grouping completes, the ungrouped photos count SHALL update in real-time via the `ungroupedPhotosCount` atom.

#### Scenario: Ungrouped count updates after auto-group
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the `ungroupedPhotosCount` atom SHALL be updated via `fetchCounts()`
- **THEN** the UngroupedPhotosCard prop `ungroupedCount` SHALL reflect the new value
- **THEN** the card title SHALL display the updated count (e.g., "Ungrouped Photos (5)")
