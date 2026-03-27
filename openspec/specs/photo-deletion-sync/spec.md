### Requirement: Photo deletion event bus
The system SHALL provide a `photoDeletionBus` module in `src/events/photoDeletionBus.js` that follows the Set-based listener pattern used by other event buses (`uploadBus`, `waveAddBus`, etc.). The bus SHALL expose `emitPhotoDeletion({ photoId })` and `subscribeToPhotoDeletion(listener)`. `subscribeToPhotoDeletion` SHALL return an unsubscribe function that removes the listener from the Set. Listener errors SHALL be caught and logged without affecting other listeners.

#### Scenario: Emitting a deletion event
- **WHEN** `emitPhotoDeletion({ photoId })` is called
- **THEN** all registered listeners SHALL be invoked with `{ photoId }`
- **THEN** if a listener throws, the error SHALL be caught and logged, and remaining listeners SHALL still be called

#### Scenario: Subscribing to deletion events
- **WHEN** `subscribeToPhotoDeletion(listener)` is called with a function
- **THEN** the listener SHALL be added to the internal Set
- **THEN** a function SHALL be returned that, when called, removes the listener from the Set

#### Scenario: Subscribing with a non-function
- **WHEN** `subscribeToPhotoDeletion` is called with a non-function argument
- **THEN** a `TypeError` SHALL be thrown

### Requirement: Deletion event emission from usePhotoActions
The `usePhotoActions` hook SHALL emit a `photoDeletionBus` event after a successful `deletePhoto` mutation. The emission SHALL occur after the mutation succeeds and before the existing `onDeleted` callback is invoked, ensuring all bus subscribers are notified regardless of the callback chain. The emitted payload SHALL be `{ photoId }`.

#### Scenario: Photo deleted successfully
- **WHEN** `handleDelete` is called and the `deletePhoto` mutation succeeds
- **THEN** `emitPhotoDeletion({ photoId })` SHALL be called
- **THEN** the existing `onDeleted(photoId)` callback SHALL still be invoked after emission

#### Scenario: Photo deletion mutation fails
- **WHEN** `handleDelete` is called and the `deletePhoto` mutation fails
- **THEN** `emitPhotoDeletion` SHALL NOT be called
