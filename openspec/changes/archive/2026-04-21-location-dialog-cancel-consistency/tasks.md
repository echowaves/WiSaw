## 1. Location Alert Dialog

- [x] 1.1 In `src/hooks/useLocationProvider.js`, replace the Alert.alert buttons from `[{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK' }]` to `[{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]`

## 2. Photo Feed Location-Denied Empty State

- [x] 2.1 In `src/screens/PhotosList/index.js`, add a `locationDismissed` local state via `useState(false)`
- [x] 2.2 Add `secondaryActionText="Cancel"` and `onSecondaryActionPress` handler (sets `locationDismissed` to `true`) to the existing location-denied `EmptyStateCard`
- [x] 2.3 Add a second `EmptyStateCard` branch for the dismissed state: icon `location-off`, subtitle "Unable to show nearby photos without location access", no action buttons — rendered when `isDenied && locationDismissed`
