## MODIFIED Requirements

### Requirement: Responsive segment control width
The photo feed segment control (Global, Starred, Search) SHALL dynamically adjust its width based on screen width, using the current fixed widths as maximum values. Segment label text SHALL NOT wrap; it SHALL truncate with an ellipsis when it does not fit within the segment width.

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

#### Scenario: Segment label text overflow
- **WHEN** a segment label text does not fit within the segment button width
- **THEN** the text SHALL be truncated to a single line with a trailing ellipsis
- **THEN** the text SHALL NOT wrap to a second line
