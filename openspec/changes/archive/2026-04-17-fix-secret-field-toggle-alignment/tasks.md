## 1. Fix toggle alignment (`src/screens/Secret/components/SecretInputField.js`)

- [x] 1.1 Remove `position: 'absolute'`, `right: 12`, and `top: 12` from the `passwordToggle` style, keeping only `padding: 8` for tap target
- [x] 1.2 Verify with `get_errors` that no compile/lint errors are introduced

## 2. Verification

- [x] 2.1 Visual smoke test: confirm the eye icon is vertically centered in the "New secret", "Confirm secret", and "Current secret" fields on the identity screen
