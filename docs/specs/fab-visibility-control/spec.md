## Purpose

Define how the SearchFab component dynamically hides when comment input is active, preventing keyboard overlap.

## Requirements

### Requirement: SearchFab hides when comment input opens

The SearchFab component SHALL hide (fade out with opacity transition) when the `isCommentEditing` prop is `true`. The component SHALL become unresponsive to touch events while hidden.

#### Scenario: FAB hides when comment input opens

- **WHEN** `isCommentEditing` prop changes from `false` to `true`
- **THEN** SearchFab opacity animates to `0` and `pointerEvents` is set to `'none'`

#### Scenario: FAB shows when comment input closes

- **WHEN** `isCommentEditing` prop changes from `true` to `false`
- **THEN** SearchFab opacity animates to `1` and `pointerEvents` is set to `'auto'`

#### Scenario: FAB remains visible when not editing

- **WHEN** component mounts with `isCommentEditing` prop as `false` (default)
- **THEN** SearchFab is fully visible and responsive

### Requirement: Parent screen manages comment editing state

The parent screen (PhotosList) SHALL manage an `isCommentEditing` boolean state and pass it to SearchFab as a prop. The screen SHALL provide an `onCommentInputToggle` callback to child Photo components.

#### Scenario: Screen initializes with editing state false

- **WHEN** screen mounts
- **THEN** `isCommentEditing` state is initialized to `false`

#### Scenario: Photo notifies screen of comment input open

- **WHEN** user taps to open comment input on a Photo component
- **THEN** Photo calls `onCommentInputToggle(true)` which updates screen state

#### Scenario: Photo notifies screen of comment input close

- **WHEN** user submits or dismisses comment input on a Photo component
- **THEN** Photo calls `onCommentInputToggle(false)` which updates screen state
