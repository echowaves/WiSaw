## ADDED Requirements

### Requirement: Responsive segment control width
The photo feed segment control (Global, Starred, Search) SHALL dynamically adjust its width based on screen width, using the current fixed widths as maximum values.

#### Scenario: Standard screen width (≥410px)
- **WHEN** the screen width is 410px or greater
- **THEN** each segment button SHALL have a width of 90px (the current maximum)

#### Scenario: Narrow screen width (<410px)
- **WHEN** the screen width is less than 410px
- **THEN** each segment button width SHALL scale proportionally to the screen width
- **THEN** the segment control container width SHALL scale proportionally to match

#### Scenario: Screen width changes (rotation or resize)
- **WHEN** the device orientation changes or window is resized
- **THEN** the segment button widths SHALL recalculate to fit the new screen width
