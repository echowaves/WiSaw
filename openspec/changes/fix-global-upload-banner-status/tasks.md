## 1. Fix GlobalUploadBanner netAvailable source

- [x] 1.1 Import `useAtomValue` from `jotai` in `src/components/GlobalUploadBanner/index.js`
- [x] 1.2 Add `const netAvailable = useAtomValue(STATE.netAvailable)` inside `GlobalUploadBanner` component
- [x] 1.3 Remove `netAvailable` from the `useContext(UploadContext)` destructuring on line 22
