## MODIFIED Requirements

### Requirement: FOB appears on downward scroll past threshold
The ScrollToTopFob component SHALL appear when the user scrolls downward past 200px from the top of the masonry layout. The scroll direction SHALL be determined by comparing the current `contentOffset.y` with the previous value. A minimum delta of 5px SHALL be required to count as a directional scroll, preventing jitter from sub-pixel movements.

#### Scenario: User scrolls down past 200px
- **WHEN** the masonry `contentOffset.y` exceeds 200 and the scroll delta is greater than 5 (downward)
- **THEN** the FOB SHALL animate into view in the upper-left corner of the masonry layout
- **THEN** the FOB SHALL slide in from the left edge using a spring animation

### Requirement: FOB auto-hides after 3 seconds of inactivity
The FOB SHALL automatically dismiss itself by sliding left off the screen edge after 3 seconds of no scroll activity. Each new downward scroll event past the threshold SHALL reset the 3-second timer.

#### Scenario: User stops scrolling for 3 seconds
- **WHEN** the FOB is visible and no scroll events occur for 3 seconds
- **THEN** the FOB SHALL animate out by sliding to the left and fading out
- **THEN** after the animation completes, the FOB SHALL not intercept touches

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

### Requirement: FOB scrolls feed to top on tap
Tapping the FOB SHALL smoothly scroll the masonry layout to offset 0 and immediately hide the FOB.

#### Scenario: User taps the FOB
- **WHEN** the user taps the FOB
- **THEN** the masonry SHALL call `scrollToOffset(0, { animated: true })`
- **THEN** the FOB SHALL immediately begin its hide animation (slide left)
- **THEN** the 3-second inactivity timer SHALL be cleared
