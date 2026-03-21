### Requirement: Console statements SHALL use parameterized format strings
All `console.log`, `console.warn`, and `console.error` calls across the codebase SHALL pass a literal string as the first argument, using `%s` and `%d` format tokens for variable substitution. Variables SHALL be passed as subsequent arguments rather than interpolated into template literals.

#### Scenario: Proxy mutation guard logs property set attempt
- **WHEN** a mutation is attempted on a protected photo via Proxy `set` trap
- **THEN** `console.error` SHALL be called with a literal format string containing `%s` tokens and the property name, value, and photo ID as separate arguments

#### Scenario: Proxy property definition guard logs attempt
- **WHEN** a `defineProperty` is attempted on a protected photo
- **THEN** `console.error` SHALL be called with a literal format string and property name and photo ID as separate arguments

#### Scenario: Proxy delete property guard logs attempt
- **WHEN** a `deleteProperty` is attempted on a protected photo
- **THEN** `console.error` SHALL be called with a literal format string and property name and photo ID as separate arguments

#### Scenario: Dimension change detected during freeze
- **WHEN** photo dimensions change during `createFrozenPhoto`
- **THEN** `console.warn` SHALL be called with a literal format string and photo ID, original dimensions, and new dimensions as separate arguments

#### Scenario: Unfrozen photo validation warning
- **WHEN** `validateFrozenPhotosList` finds a photo without protection
- **THEN** `console.warn` SHALL be called with a literal format string and context, index, and photo ID as separate arguments

#### Scenario: Invalid dimension type validation warning
- **WHEN** a photo has non-number width or height properties
- **THEN** `console.warn` SHALL be called with a literal format string containing `%d` and `%s` tokens, with index and photo ID as separate arguments, followed by an object with actual values

#### Scenario: NaN dimension validation warning
- **WHEN** a photo has NaN width or height values
- **THEN** `console.warn` SHALL be called with a literal format string, index and photo ID as separate arguments, followed by an object with actual values

#### Scenario: Override property validation warnings
- **WHEN** a photo has `overrideWidth`, `overrideHeight`, or `isExpanded` properties
- **THEN** `console.warn` SHALL be called with a literal format string, index and photo ID as separate arguments, followed by an object with the unexpected property value

#### Scenario: Upload service logs upload retry failure
- **WHEN** a photo upload attempt fails and is retried
- **THEN** `console.error` SHALL be called with a literal format string and attempt number, retry limit as separate arguments, followed by an error object

#### Scenario: Upload service logs pending upload queue status
- **WHEN** pending uploads are discovered in the queue
- **THEN** `console.log` SHALL be called with a literal format string and the pending count as a separate argument

#### Scenario: Upload service logs stuck upload items
- **WHEN** potentially stuck upload items are detected
- **THEN** `console.warn` SHALL be called with a literal format string and the stuck item count as a separate argument

#### Scenario: Upload service logs missing original file
- **WHEN** a pending upload has a missing original file
- **THEN** `console.warn` SHALL be called with a literal format string and the local image name as a separate argument

#### Scenario: Upload service logs file status check failure
- **WHEN** file status cannot be checked for a pending upload
- **THEN** `console.warn` SHALL be called with a literal format string and the local image name as a separate argument, followed by the error

#### Scenario: Chat subscription logs subscribe and unsubscribe
- **WHEN** subscribing to or unsubscribing from a chat UUID
- **THEN** `console.log` SHALL be called with a literal format string and the chat UUID as a separate argument

#### Scenario: Chat subscription logs active status
- **WHEN** a subscription becomes active for a chat UUID
- **THEN** `console.log` SHALL be called with a literal format string and the chat UUID as a separate argument

#### Scenario: Friends list logs contact name save
- **WHEN** saving a contact name for a friendship
- **THEN** `console.log` SHALL be called with a literal format string and the contact name and friendship UUID as separate arguments

#### Scenario: Friends helper logs friendship processing error
- **WHEN** an error occurs processing a friendship
- **THEN** `console.error` SHALL be called with a literal format string and the friendship UUID as a separate argument, followed by the error

#### Scenario: Friends helper logs successful contact name save
- **WHEN** a contact name is successfully saved for a friendship
- **THEN** `console.log` SHALL be called with a literal format string and the contact name and friendship UUID as separate arguments

#### Scenario: ExpandableThumb logs missing original dimensions
- **WHEN** no original dimensions are stored for a photo in ExpandableThumb
- **THEN** `console.error` SHALL be called with a literal format string and the photo ID as a separate argument
