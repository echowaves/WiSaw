## 1. Privacy Explainer Component

- [x] 1.1 Create `src/screens/Secret/components/PrivacyExplainerView.js` with three info cards (Zero Personal Data, Your Secret = Your Key, No Recovery Possible) and an "I Understand" button, using themed card tokens (`CARD_BACKGROUND`, `CARD_SHADOW`, `BORDER_LIGHT`, `borderRadius: 16`)
- [x] 1.2 Add styles for the privacy explainer view to `src/screens/Secret/styles.js` (card layout, spacing, button styling)

## 2. SecureStore Gate in SecretScreen

- [x] 2.1 Add `useState` + `useEffect` to `src/screens/Secret/index.js` to check `SecureStore.getItemAsync('identityPrivacyExplainerSeen')` on mount and track `hasSeenExplainer` state
- [x] 2.2 Add conditional render in `SecretScreen`: when `!nickNameEntered && !hasSeenExplainer`, render `PrivacyExplainerView` instead of the creation form
- [x] 2.3 Wire the "I Understand" button to set `SecureStore.setItemAsync('identityPrivacyExplainerSeen', 'true')` and update local state to reveal the creation form

## 3. Copy Updates

- [x] 3.1 Update the creation flow subtitle in `src/screens/Secret/index.js` to: "We never store any personal information on our servers. Your secret is the only way to access your identity — write it down and keep it safe."
- [x] 3.2 Update `PrivacyNoticeCard` copy to explicitly state that no personal information is stored on the servers and frame unrecoverability as a consequence of the zero-PII architecture
- [x] 3.3 Update the Reset Identity confirmation `Alert.alert` message to explain that recovery is impossible because no personal information is stored
