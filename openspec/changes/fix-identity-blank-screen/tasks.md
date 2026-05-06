## 1. Remove animation from identity screen

- [x] 1.1 Remove `Animated` from the `react-native` import in `src/screens/Secret/index.js`
- [x] 1.2 Remove `fadeAnim` and `scaleAnim` refs and the animation `useEffect`
- [x] 1.3 Replace `Animated.View` with plain `View` in the active identity render branch
- [x] 1.4 Replace `Animated.View` with plain `View` in the creation flow render branch
- [x] 1.5 Verify the screen renders correctly in simulator (both identity-exists and no-identity states)
