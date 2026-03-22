## 1. Simplify SecureStore key usage

- [x] 1.1 In `src/components/ui/InteractionHintBanner.js` — remove the `HINT_KEYS` array, replace the `Promise.all` multi-key check in `useEffect` with a single `SecureStore.getItemAsync('interactionHintShown')` call, keep the dismiss handler writing `interactionHintShown` as-is.
