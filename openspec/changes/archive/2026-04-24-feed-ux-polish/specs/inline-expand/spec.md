## MODIFIED Requirements

### Requirement: Expanded item renders Photo component
The expanded masonry item SHALL render `<Photo embedded={true} onHeightMeasured={updateCache} />` wrapped in a `PhotosListContext.Provider` that provides `removePhoto`. The collapse control SHALL use a close (X) icon to visually distinguish it from the scroll-to-top FOB.

#### Scenario: Collapse button uses close icon
- **WHEN** an item is expanded in the masonry grid
- **THEN** the collapse button SHALL display a `close` (X) icon instead of `chevron-up`
