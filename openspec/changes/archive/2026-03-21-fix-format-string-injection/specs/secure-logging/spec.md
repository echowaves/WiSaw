## ADDED Requirements

### Requirement: Console statements SHALL use parameterized format strings
All `console.warn` and `console.error` calls in `src/utils/photoListHelpers.js` SHALL pass a literal string as the first argument, using `%s` and `%d` format tokens for variable substitution. Variables SHALL be passed as subsequent arguments rather than interpolated into template literals.

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
