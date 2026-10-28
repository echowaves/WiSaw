## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for scroll to top fob in WiSaw.

## Requirements

### Requirement: FOB appears on downward scroll past threshold
The ScrollToTopFob component SHALL appear when the user scrolls downward past 200px from the top of the masonry layout. The scroll direction SHALL be determined by comparing the current `contentOffset.y` with the previous value. A minimum delta of 5px SHALL be required to count as a directional scroll, preventing jitter from sub-pixel movements.

#### Scenario: User scrolls down past 200px
- **WHEN** the masonry `contentOffset.y` exceeds 200 and the scroll delta is greater than 5 (downward)
- **THEN** the FOB SHALL animate into view in the upper-left corner of the masonry layout
- **THEN** the FOB SHALL slide in from the left edge using a spring animation

#### Scenario: User scrolls down but is still within 200px
- **WHEN** the masonry `contentOffset.y` is less than or equal to 200
- **THEN** the FOB SHALL NOT appear regardless of scroll direction

#### Scenario: User scrolls upward
- **WHEN** the scroll delta is negative (upward scroll) and the FOB is currently visible
- **THEN** the FOB SHALL NOT immediately hide — it SHALL remain visible
- **THEN** the 3-second inactivity timer SHALL continue running

### Requirement: FOB auto-hides after 3 seconds of inactivity
The FOB SHALL automatically dismiss itself by sliding left off the screen edge after 3 seconds of no scroll activity. Each new downward scroll event past the threshold SHALL reset the 3-second timer.

#### Scenario: User stops scrolling for 3 seconds
- **WHEN** the FOB is visible and no scroll events occur for 3 seconds
- **THEN** the FOB SHALL animate out by sliding to the left and fading out
- **THEN** after the animation completes, the FOB SHALL not intercept touches

#### Scenario: User scrolls again before the 3-second timer expires
- **WHEN** the FOB is visible and a new downward scroll event past 200px occurs
- **THEN** the 3-second inactivity timer SHALL be reset
- **THEN** the FOB SHALL remain visible

### Requirement: FOB scrolls feed to top on tap
Tapping the FOB SHALL smoothly scroll the masonry layout to offset 0 and immediately hide the FOB.

#### Scenario: User taps the FOB
- **WHEN** the user taps the FOB
- **THEN** the masonry SHALL call `scrollToOffset(0, { animated: true })`
- **THEN** the FOB SHALL immediately begin its hide animation (slide left)
- **THEN** the 3-second inactivity timer SHALL be cleared

### Requirement: FOB re-appears only on next downward scroll
After the FOB auto-hides or is dismissed by tapping, it SHALL only re-appear when a new downward scroll past 200px is detected.

#### Scenario: FOB was auto-hidden, user scrolls down again
- **WHEN** the FOB has auto-hidden after 3 seconds of inactivity
- **AND** the user scrolls downward past 200px
- **THEN** the FOB SHALL animate in again from the left edge

#### Scenario: FOB was tapped, user scrolls down after reaching top
- **WHEN** the user tapped the FOB and the feed scrolled to top
- **AND** the user scrolls downward past 200px again
- **THEN** the FOB SHALL animate in again from the left edge

#### Scenario: Content offset returns below threshold
- **WHEN** the content offset drops below 200px (user is near the top)
- **THEN** the FOB SHALL hide immediately if currently visible

### Requirement: FOB visual presentation
The FOB SHALL be a 40×40px circle positioned absolutely in the upper-left corner of the masonry container, 12px from the top and 12px from the left edge. It SHALL use `theme.HEADER_BACKGROUND` for the background and display an `Ionicons chevron-up` icon in `theme.TEXT_SECONDARY` color. It SHALL have a subtle shadow consistent with the app's existing elevated components.

#### Scenario: FOB renders with correct styling
- **WHEN** the FOB is visible
- **THEN** it SHALL display as a 40×40px circle with borderRadius 20
- **THEN** it SHALL be positioned at top: 12, left: 12 within its parent container
- **THEN** it SHALL use `theme.HEADER_BACKGROUND` as background color
- **THEN** it SHALL show an `Ionicons chevron-up` icon sized 20 in `theme.TEXT_SECONDARY` color

### Requirement: FOB animation behavior
The FOB SHALL use `react-native-reanimated` for all animations. The enter animation SHALL use `withSpring` to slide `translateX` from -80 to 0. The exit animation SHALL use `withTiming` (200ms) to slide `translateX` from 0 to -80 with opacity fading to 0.

#### Scenario: FOB enter animation
- **WHEN** the FOB transitions from hidden to visible
- **THEN** `translateX` SHALL animate from -80 to 0 using `withSpring` with damping 18 and stiffness 120
- **THEN** opacity SHALL animate from 0 to 1

#### Scenario: FOB exit animation
- **WHEN** the FOB transitions from visible to hidden
- **THEN** `translateX` SHALL animate from 0 to -80 using `withTiming` (200ms)
- **THEN** opacity SHALL animate from 1 to 0
