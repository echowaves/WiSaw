## ADDED Requirements

### Requirement: usePendingAnimation hook encapsulates banner animations
The `usePendingAnimation` hook SHALL manage the `pendingPhotosAnimation` and `uploadIconAnimation` Animated values, animating them based on pending photo count and network availability.

#### Scenario: Hook returns animation values
- **WHEN** `usePendingAnimation` is called with `{ pendingPhotosCount, netAvailable }`
- **THEN** it SHALL return `{ pendingPhotosAnimation, uploadIconAnimation }`

### Requirement: Banner animates in when photos are added
The hook SHALL spring-animate `pendingPhotosAnimation` to 1 when pending count transitions from 0 to >0.

#### Scenario: First pending photo added
- **WHEN** `pendingPhotosCount` changes from 0 to a positive number
- **THEN** `pendingPhotosAnimation` SHALL animate to 1 using a spring animation

### Requirement: Banner animates out when queue empties
The hook SHALL timing-animate `pendingPhotosAnimation` to 0 when pending count transitions from >0 to 0.

#### Scenario: All pending photos uploaded
- **WHEN** `pendingPhotosCount` changes from a positive number to 0
- **THEN** `pendingPhotosAnimation` SHALL animate to 0 over 300ms

### Requirement: Upload icon pulses when uploading with network
The hook SHALL start a looping pulse animation on `uploadIconAnimation` (between 0.6 and 1.0) when there are pending photos and network is available.

#### Scenario: Pending photos with network
- **WHEN** `pendingPhotosCount` > 0 and `netAvailable` is true
- **THEN** `uploadIconAnimation` SHALL loop between 0.6 and 1.0

#### Scenario: No pending photos
- **WHEN** `pendingPhotosCount` is 0
- **THEN** `uploadIconAnimation` SHALL be set to 1 (no animation)

### Requirement: Animation cleanup on dependency change
The hook SHALL stop running animations when dependencies change or the component unmounts.

#### Scenario: Network becomes unavailable during animation
- **WHEN** `netAvailable` changes to false while pulse animation is running
- **THEN** the pulse animation SHALL stop and `uploadIconAnimation` SHALL reset to 1
