## Why

After setting up identity for the first time, two bugs occur: (1) the privacy explainer dismissal leaves a blank screen instead of showing the creation form, requiring an app reload; (2) the watchers tab, waves, and friends list don't refresh with identity-aware data until the app is reloaded. Both issues break the first-time identity setup experience.

## What Changes

- Fix blank screen after privacy explainer dismissal by re-triggering the fade-in animation when the creation form appears
- Create an `identityChangeBus` event emitter (following the existing `friendAddBus` pattern) that fires after successful identity registration or update
- Subscribe PhotosList, WavesHub, and FriendsList to the identity-change event so they reload data when identity is established

## Capabilities

### New Capabilities
- `identity-change-event`: Event bus that broadcasts identity changes (registration, update, reset) so other screens can react without coupling to Jotai atom internals

### Modified Capabilities
- `privacy-explainer`: After dismissing the explainer, the creation form must animate in visibly (fade animation must re-trigger rather than remaining at opacity 0)
- `photo-feed`: PhotosList must subscribe to identity-change events and reload the active segment when identity changes
- `wave-hub`: WavesHub must subscribe to identity-change events and reload the waves list when identity changes

## Impact

- New file: `src/events/identityChangeBus.js`
- Modified: `src/screens/Secret/index.js` — fix animation, emit identity-change after submit/reset
- Modified: `src/screens/PhotosList/index.js` — subscribe to identity-change event, trigger reload
- Modified: `src/screens/WavesHub/index.js` — subscribe to identity-change event, trigger reload
- Modified: `src/screens/FriendsList/index.js` — subscribe to identity-change event, trigger reload
