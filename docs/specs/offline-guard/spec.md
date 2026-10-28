# Offline Guard Specification

## Purpose
The offline guard system provides a centralized network connectivity state via a single Jotai atom, replacing per-component NetInfo listeners. When the device is offline, screens display an in-place offline card instead of attempting API calls, and drawer navigation items are visually disabled.

## Requirements

### Requirement: Global network state atom
The app SHALL maintain a single `STATE.netAvailable` Jotai atom (default `true`) representing current network connectivity. A single `NetInfo.addEventListener` in the root layout (`app/_layout.tsx`) SHALL update this atom. No other component SHALL create its own `NetInfo` listener.

#### Scenario: Root layout initializes network listener
- **WHEN** the root layout mounts
- **THEN** it SHALL subscribe to `NetInfo.addEventListener`
- **THEN** the callback SHALL set `STATE.netAvailable` to `state.isConnected && state.isInternetReachable !== false`

#### Scenario: Network becomes unavailable
- **WHEN** the device loses network connectivity
- **THEN** `STATE.netAvailable` SHALL be set to `false`
- **THEN** all screens reading the atom SHALL re-render

#### Scenario: Network is restored
- **WHEN** the device regains network connectivity
- **THEN** `STATE.netAvailable` SHALL be set to `true`

#### Scenario: Root layout unmounts
- **WHEN** the root layout unmounts
- **THEN** the `NetInfo` subscription SHALL be cleaned up

### Requirement: Screen offline card policy
Every screen that makes network calls SHALL read `STATE.netAvailable`. When `netAvailable` is `false`, the screen SHALL render an in-place offline card (using `EmptyStateCard` with `icon='wifi-off'`) instead of attempting API calls. The screen's header and navigation SHALL remain functional. When `netAvailable` returns to `true`, the screen SHALL resume normal rendering.

#### Scenario: Screen renders offline card
- **WHEN** a screen mounts and `netAvailable` is `false`
- **THEN** the screen SHALL display an `EmptyStateCard` with `icon='wifi-off'` and a screen-appropriate message
- **THEN** the screen SHALL NOT fire any API calls

#### Scenario: Network restored while on screen
- **WHEN** `netAvailable` transitions from `false` to `true` while a screen is mounted
- **THEN** the screen SHALL remove the offline card and render its normal content

### Requirement: Drawer items disabled when offline
The drawer layout SHALL read `STATE.netAvailable`. When `netAvailable` is `false`, drawer items for Identity, Friends, Waves, and Feedback SHALL be visually disabled (reduced opacity) and navigation to those screens SHALL be prevented.

#### Scenario: Drawer items greyed out offline
- **WHEN** the user opens the drawer and `netAvailable` is `false`
- **THEN** the Identity, Friends, Waves, and Feedback drawer items SHALL have reduced opacity
- **THEN** tapping those items SHALL NOT navigate to the corresponding screen

#### Scenario: Drawer items re-enabled online
- **WHEN** `netAvailable` transitions to `true`
- **THEN** all drawer items SHALL return to full opacity and normal behavior
