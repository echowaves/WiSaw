## Why

The show/hide password toggle button on the identity screen's secret fields is misaligned. The `SecretInputField` component applies `position: 'absolute'` with fixed `right: 12, top: 12` to the eye icon, but the parent `Input` component already renders it inside a flex-aligned `iconRight` wrapper (`marginLeft: 8, alignItems: 'center', justifyContent: 'center'`). The absolute positioning fights the flex layout and produces inconsistent vertical alignment across the "New secret", "Confirm secret", and "Current secret" fields.

## What Changes

- Remove the `position: 'absolute'` style from the `passwordToggle` in `SecretInputField` and replace it with padding-based sizing that works within the `Input` component's existing flex layout.

## Capabilities

### New Capabilities
*(none)*

### Modified Capabilities
- `user-identity`: The secret input field's right-icon alignment behavior is corrected so the show/hide toggle is vertically centered within the input row.

## Impact

- **Code touched:** `src/screens/Secret/components/SecretInputField.js` — remove absolute positioning from `passwordToggle` style, use padding for a comfortable tap target instead.
- **APIs/dependencies:** none.
- **Risk:** minimal — single component, no behavior change, styling only.
