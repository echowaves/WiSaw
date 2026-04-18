## ADDED Requirements

### Requirement: Secret field show/hide toggle alignment
The show/hide password toggle icon in `SecretInputField` SHALL be vertically centered within the input row using the `Input` component's built-in `rightIcon` flex layout. The toggle icon SHALL NOT use absolute positioning.

#### Scenario: Toggle icon is vertically centered
- **WHEN** any secret input field renders (new secret, confirm secret, or current secret)
- **THEN** the eye/eye-slash toggle icon SHALL be vertically centered within the input row, aligned with the left icon and the text baseline

#### Scenario: Toggle icon has adequate tap target
- **WHEN** the toggle icon renders
- **THEN** it SHALL have at least `padding: 8` to ensure a comfortable tap target without relying on absolute positioning
