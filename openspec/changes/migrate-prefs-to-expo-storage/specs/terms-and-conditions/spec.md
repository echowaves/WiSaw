## MODIFIED Requirements

### Requirement: Terms Acceptance Flow
The system SHALL allow users to accept the Terms and Conditions through the modal interface, persisting acceptance via filesystem storage.

#### Scenario: User accepts terms
- **WHEN** the user reads and taps accept on the terms and conditions modal
- **THEN** the acceptance SHALL be recorded using `Storage.setItem()` from `expo-storage` and the modal closes

#### Scenario: Terms acceptance checked at startup
- **WHEN** the app checks if terms have been accepted
- **THEN** the system SHALL read the acceptance flag using `Storage.getItem()` from `expo-storage`
