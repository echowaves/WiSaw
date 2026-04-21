## Context

The app has several permission-denied alerts (camera, photo library, location). Camera and photo library alerts use a consistent `[Cancel (style: cancel), Open Settings]` button pattern. The location-denied alert in `useLocationProvider.js` uses `[Open Settings, OK]` — breaking the pattern.

Additionally, the photo feed's location-denied `EmptyStateCard` shows an "Enable Location" button but no way to dismiss. Users who don't want to enable location are stuck viewing the nudge card.

Two files are affected:
- `src/hooks/useLocationProvider.js` — the `Alert.alert` call on line ~168
- `src/screens/PhotosList/index.js` — the denied-state `EmptyStateCard` around line ~603

## Goals / Non-Goals

**Goals:**
- Make the location-denied alert button order and styling match camera/photo library alerts
- Add a dismiss option to the location-denied EmptyStateCard in the photo feed
- Show a neutral "unable to show photos" state after dismissal

**Non-Goals:**
- Persisting dismissal state across navigations or app restarts
- Changing the EmptyStateCard component API (it already supports `secondaryActionText`)
- Changing the pending or unavailable empty states

## Decisions

### 1. Alert button order: `[Cancel, Open Settings]`

Match the exact pattern from `useCameraCapture.js` and `WaveDetail/index.js`:
```js
[{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]
```

*Why:* Consistency. On iOS, `style: 'cancel'` renders the button on the left with regular weight, while the second button gets bold emphasis — nudging users toward "Open Settings" which is the preferred action.

### 2. EmptyStateCard dismiss via `secondaryActionText` prop

The `EmptyStateCard` already supports `secondaryActionText` and `onSecondaryActionPress`. Use these to add a "Cancel" button below the primary "Enable Location" button. No component changes needed.

### 3. Dismissed state as local `useState`

Add a `locationDismissed` boolean via `useState(false)` in PhotosList. When Cancel is tapped, set it to `true`. The render logic becomes:

```
if (isDenied && !locationDismissed) → show "Location Access Needed" card with Enable + Cancel
if (isDenied && locationDismissed)  → show "Unable to show..." card (no action buttons)
```

*Why local state:* This is a minor UI preference, not worth persisting to storage or a Jotai atom. Resetting on navigation return provides a gentle re-nudge without being intrusive.

## Risks / Trade-offs

- **[Dismissed state resets on remount]** → Acceptable. The card is informational, not blocking. A gentle re-nudge on next visit is reasonable UX.
- **[Two empty state cards for denied]** → Minimal complexity. It's a simple ternary on a boolean.
