## ADDED Requirements

### Requirement: Uploaded image content type matches payload
When a photo is uploaded to storage, the `Content-Type` header of the PUT request SHALL match the actual byte payload being sent. The object key and content type SHALL be derived from the real encoded image format (e.g., WebP bytes ⇒ `image/webp`), not hardcoded to a format that does not match the payload.

#### Scenario: WebP photo upload sends WebP content type
- **WHEN** a photo is encoded to WebP and uploaded
- **THEN** the PUT request `Content-Type` SHALL be `image/webp`
- **THEN** the object key SHALL reflect the actual stored format

#### Scenario: JPEG photo upload sends JPEG content type
- **WHEN** a photo is encoded to JPEG and uploaded
- **THEN** the PUT request `Content-Type` SHALL be `image/jpeg`
