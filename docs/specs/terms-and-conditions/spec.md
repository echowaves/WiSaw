# Terms and Conditions Specification

## Purpose
The terms and conditions feature provides legal compliance through a modal overlay that displays the app's terms of service. Users must be able to view and accept the terms from within the application.

## Requirements

### Requirement: Terms and Conditions Modal Display
The system SHALL provide a modal overlay displaying the Terms and Conditions content that can be triggered from relevant screens.

#### Scenario: User views terms and conditions
- **WHEN** the user triggers the terms and conditions action
- **THEN** a modal overlay displays the full Terms and Conditions text

### Requirement: Terms Acceptance Flow
The system SHALL allow users to accept the Terms and Conditions through the modal interface, persisting acceptance via filesystem storage.

#### Scenario: User accepts terms
- **WHEN** the user reads and taps accept on the terms and conditions modal
- **THEN** the acceptance SHALL be recorded using `Storage.setItem()` from `expo-storage` and the modal closes

#### Scenario: Terms acceptance checked at startup
- **WHEN** the app checks if terms have been accepted
- **THEN** the system SHALL read the acceptance flag using `Storage.getItem()` from `expo-storage`

#### Scenario: User dismisses terms without accepting
- **WHEN** the user closes the terms modal without accepting
- **THEN** the modal closes and the user may be prompted again as needed
