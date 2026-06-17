## ADDED Requirements

### Requirement: showToast utility SHALL provide standardized toast notifications

The system SHALL provide a `showToast()` utility function in `src/utils/showToast.js` that replaces all direct `Toast.show()` calls with a consistent interface. The utility SHALL accept the same parameter shape as `Toast.show()` but apply standardized defaults for `position`, `topOffset`, `visibilityTime`, and `autoHide`.

#### Scenario: Success toast with minimal params
- **WHEN** `showToast('Wave updated')` is called
- **THEN** the toast displays with `type: 'success'`, `position: 'top'`, `topOffset: 60`, `visibilityTime: 2000`, `autoHide: true`

#### Scenario: Error toast with custom duration
- **WHEN** `showToast('Error removing friend', { type: 'error', visibilityTime: 3000 })` is called
- **THEN** the toast displays with the provided overrides applied

#### Scenario: Toast with detail message
- **WHEN** `showToast('Photos grouped', { text2: 'Created 3 waves with 12 photos' })` is called
- **THEN** the toast displays both text1 and text2

#### Scenario: All existing Toast.show calls SHALL be replaced
- **WHEN** the migration is complete
- **THEN** zero direct `Toast.show()` calls remain in the codebase

### Requirement: showConfirmAlert utility SHALL standardize confirmation dialogs

The system SHALL provide a `showConfirmAlert()` utility function in `src/utils/showConfirmAlert.ts` that replaces `Alert.alert()` calls for confirmation dialogs. The utility SHALL provide pre-configured button labels, consistent styling, and support optional custom callbacks.

#### Scenario: Delete confirmation
- **WHEN** `showConfirmAlert('Delete Wave', 'Are you sure? This cannot be undone.')` is called
- **THEN** the alert displays with a "Cancel" button and a destructive "Delete" button

#### Scenario: Merge confirmation with dynamic content
- **WHEN** `showConfirmAlert('Merge Waves', `Merge "${name}" into "${target}"?`)` is called
- **THEN** the alert displays with the interpolated values

#### Scenario: Custom onConfirm callback
- **WHEN** `showConfirmAlert('Delete', 'Are you sure?', () => deleteWave())` is called and user taps "Delete"
- **THEN** the `onConfirm` callback is invoked

#### Scenario: All existing Alert.alert calls SHALL be replaced
- **WHEN** the migration is complete
- **THEN** zero direct `Alert.alert()` calls remain in the codebase
