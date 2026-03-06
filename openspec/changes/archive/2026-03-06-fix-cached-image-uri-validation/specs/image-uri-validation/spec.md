## ADDED Requirements

### Requirement: Image URIs are validated before download
The system SHALL validate that image URIs are absolute URLs with an `http://` or `https://` scheme before passing them to the image caching library.

#### Scenario: Valid absolute URI
- **WHEN** a photo has a `thumbUrl` or `imgUrl` starting with `http://` or `https://`
- **THEN** the image SHALL be rendered using `CachedImage` as normal

#### Scenario: Undefined or null URI
- **WHEN** a photo has an `undefined` or `null` value for `thumbUrl` or `imgUrl`
- **THEN** the system SHALL NOT attempt to download the image and SHALL show placeholder content instead

#### Scenario: Empty string URI
- **WHEN** a photo has an empty string `""` for `thumbUrl` or `imgUrl`
- **THEN** the system SHALL NOT attempt to download the image and SHALL show placeholder content instead

#### Scenario: Non-absolute URI string
- **WHEN** a photo has a URI string that does not start with `http://` or `https://` (e.g., `"undefined"`, `"null"`, `/relative/path`)
- **THEN** the system SHALL NOT attempt to download the image and SHALL show placeholder content instead
