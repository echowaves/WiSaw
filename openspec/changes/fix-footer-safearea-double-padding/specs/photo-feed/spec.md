## ADDED Requirements

### Requirement: Footer SafeAreaView constrained to bottom edge only
The `PhotosListFooter` SafeAreaView wrapper SHALL be constrained to `edges={['bottom']}` to prevent unwanted top padding that pushes footer buttons downward. The outer View SHALL NOT apply redundant `paddingBottom: insets.bottom` since SafeAreaView handles bottom insets.

#### Scenario: Footer buttons are vertically centered
- **WHEN** the `PhotosListFooter` component renders
- **THEN** the SafeAreaView SHALL use `edges={['bottom']}`
- **THEN** the outer View SHALL NOT have `paddingBottom: insets.bottom`
- **THEN** footer buttons SHALL be vertically centered within the footer bar

#### Scenario: Bottom safe area is handled correctly
- **WHEN** the `PhotosListFooter` renders on a device with a home indicator
- **THEN** the SafeAreaView SHALL apply bottom safe area padding
- **THEN** footer buttons SHALL remain visible above the home indicator

## REMOVED Requirements

### Requirement: Footer uses all-edge SafeAreaView with manual paddingBottom
**Reason**: The `react-native-safe-area-context` SafeAreaView applies insets on all edges by default, causing double padding when combined with manual `paddingBottom: insets.bottom` and `paddingTop: 10` on inner views. This breaks vertical centering.
**Migration**: Constrain SafeAreaView to `edges={['bottom']}` and remove manual `paddingBottom` from the outer View.
