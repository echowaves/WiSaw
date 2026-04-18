## MODIFIED Requirements

### Requirement: Identity Management Screen
The system SHALL provide an identity screen with two distinct visual states: an attach flow when no identity exists on the device, and an active-identity profile view when an identity is attached. The attach flow SHALL be framed as binding the device to either a new or pre-existing identity (not as account creation), since the backend `registerSecret` mutation is idempotent on `(nickName, secret)`.

#### Scenario: User opens identity screen with no identity attached
- **WHEN** the user navigates to the identity screen from the drawer menu and has no stored nickname
- **THEN** the system SHALL display an attach flow with an icon circle, title "Attach Identity to This Device", a subtitle that explains the form handles both new identities and reconnecting on a new device, and inline form fields for nickname, secret, and secret confirmation

#### Scenario: User opens identity screen with established identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has a stored nickname
- **THEN** the system SHALL display an `IdentityProfileCard` showing the nickname and the status text "Attached to this device", followed by action rows for "Change Secret" and "Detach from This Device"

#### Scenario: Attach flow uses EmptyStateCard visual pattern
- **WHEN** the identity attach flow renders
- **THEN** it SHALL use the same visual language as `EmptyStateCard` — centered card with icon circle (`borderRadius: 60`, orange-tinted background), heading text, subtitle, and themed card styling (`CARD_BACKGROUND`, `borderRadius: 24`, shadows)

#### Scenario: Active identity view uses card-based layout
- **WHEN** the active identity view renders
- **THEN** all sections SHALL use card-based layouts with `borderRadius: 16`, `theme.CARD_BACKGROUND`, `theme.CARD_SHADOW`, and `theme.BORDER_LIGHT` consistent with the Waves feature styling

#### Scenario: Submit button label reflects attach action
- **WHEN** the attach flow renders the submit button
- **THEN** the button label SHALL read "Attach Identity" and SHALL switch to "Attaching..." while the mutation is in flight
- **THEN** the button icon SHALL convey attachment (e.g. a `link` glyph), not document creation

#### Scenario: Confirm-secret field is required in all flows
- **WHEN** either the attach flow or the change-secret flow renders
- **THEN** a "Confirm secret" field SHALL be displayed alongside the secret field
- **THEN** submission SHALL be blocked until the confirm value matches the secret

## ADDED Requirements

### Requirement: Context-aware success toast
After a successful submit, the success toast SHALL describe the action that just completed: attaching an identity to the device versus updating an existing identity's secret.

#### Scenario: Toast after first-time attach or re-attach
- **WHEN** the submit succeeds and the user did not previously have a stored nickname on this device
- **THEN** the success toast SHALL read "Identity attached to this device."

#### Scenario: Toast after secret update
- **WHEN** the submit succeeds and the user already had a stored nickname (i.e. the change-secret flow was used)
- **THEN** the success toast SHALL read "Your secret has been updated."

### Requirement: Detach action and confirmation copy
The destructive action on the active-identity view SHALL be labeled "Detach from This Device" and SHALL present a confirmation alert that explicitly states the action removes the identity from the current device only and that the same nickname and secret continue to work elsewhere.

#### Scenario: Action row label and icon
- **WHEN** the active identity view renders the destructive action row
- **THEN** the row label SHALL read "Detach from This Device"
- **THEN** the icon SHALL convey unbinding (e.g. an `unlink` glyph)
- **THEN** the row SHALL retain the destructive color accent

#### Scenario: Confirmation alert copy
- **WHEN** the user taps the detach action row
- **THEN** an alert SHALL be presented with the title "Detach Identity from This Device?"
- **THEN** the body SHALL state that the identity is removed from this device only, that the nickname and secret continue to work elsewhere, and that forgetting either the nickname or the secret makes the identity unrecoverable
- **THEN** the destructive button SHALL be labeled "Detach"

#### Scenario: Toast after detach
- **WHEN** the user confirms detach and the local secrets are cleared
- **THEN** a toast SHALL be displayed with title "Identity detached" and subtitle prompting the user to enter a nickname and secret to re-attach
