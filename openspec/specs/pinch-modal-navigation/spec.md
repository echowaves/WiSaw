# Pinch Modal Navigation Specification

## Purpose
The pinch/zoom photo view is presented as a root-level full-screen modal so that back navigation always returns to the originating screen, regardless of which screen the user navigated from.

## Requirements

### Requirement: Pinch view presented as root-level modal
The pinch/zoom photo view SHALL be registered as a root-level route in `app/pinch.tsx` with `presentation: 'fullScreenModal'` so that it sits on top of the entire navigation tree.

#### Scenario: Pinch route resolves from any screen
- **WHEN** any screen calls `router.push({ pathname: '/pinch', params: { photo } })`
- **THEN** the pinch view SHALL open as a full-screen modal overlay on top of the current screen

### Requirement: Back navigation returns to originating screen
The pinch view back button SHALL dismiss the modal and return the user to the screen they navigated from.

#### Scenario: Back from pinch after opening from home feed
- **WHEN** user taps a photo on the home PhotosList and then presses the back button in the pinch view
- **THEN** the user SHALL be returned to the home PhotosList

#### Scenario: Back from pinch after opening from bookmarks
- **WHEN** user taps a photo on the BookmarksList and then presses the back button in the pinch view
- **THEN** the user SHALL be returned to the BookmarksList

#### Scenario: Back from pinch after opening from wave detail
- **WHEN** user taps a photo on a WaveDetail screen and then presses the back button in the pinch view
- **THEN** the user SHALL be returned to the WaveDetail screen

#### Scenario: Back from pinch after opening from friend detail
- **WHEN** user taps a photo on a FriendDetail screen and then presses the back button in the pinch view
- **THEN** the user SHALL be returned to the FriendDetail screen

#### Scenario: Back from pinch after opening from shared photo
- **WHEN** user taps a photo on PhotosDetailsShared and then presses the back button in the pinch view
- **THEN** the user SHALL be returned to the PhotosDetailsShared screen

### Requirement: Gesture conflicts prevented
The pinch modal SHALL have `gestureEnabled: false` to prevent iOS swipe-to-dismiss gesture from conflicting with the photo pan/zoom gestures.

#### Scenario: Swipe down does not dismiss modal
- **WHEN** user swipes down while interacting with the zoomed photo
- **THEN** the modal SHALL NOT be dismissed; the gesture SHALL be handled by the photo zoom controls

### Requirement: Pinch header uses explicit safe area insets
The pinch view custom header SHALL use `useSafeAreaInsets()` with explicit `paddingTop` instead of wrapping in `SafeAreaView`, to ensure the back button is correctly positioned below the status bar when presented as a full-screen modal.

#### Scenario: Back button visible and tappable in modal
- **WHEN** the pinch view is presented as a fullScreenModal
- **THEN** the back button SHALL be rendered below the system status bar and SHALL be fully tappable

### Requirement: GestureHandlerRootView at root level
The `GestureHandlerRootView` SHALL be placed in the root layout (`app/_layout.tsx`) so that gesture handlers work for all routes, including those outside the drawer navigator.

#### Scenario: Gesture handlers work on friendships routes
- **WHEN** a user views a photo on the FriendDetail screen (under `app/friendships/`)
- **THEN** tap and pinch gestures on `ImageView` SHALL function without error

#### Scenario: No duplicate GestureHandlerRootView in drawer
- **WHEN** the app navigation structure is initialized
- **THEN** `app/(drawer)/_layout.tsx` SHALL NOT contain a `GestureHandlerRootView` wrapper

### Requirement: Pinch route removed from tabs stack
The `pinch` screen SHALL NOT exist as a route within the `(tabs)` stack navigator.

#### Scenario: No duplicate pinch route in tabs
- **WHEN** the app navigation structure is initialized
- **THEN** `app/(drawer)/(tabs)/pinch.tsx` SHALL NOT exist and the `(tabs)` stack layout SHALL NOT define a `pinch` screen
