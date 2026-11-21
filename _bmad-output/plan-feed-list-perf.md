---
title: 'Photo feed list: stop redundant relayout and cell re-renders'
type: 'bugfix'
ticket: ''
created: '2026-11-21'
status: 'built'
baseline_revision: 'f1cba30a48be9a1c9f65cdcab4d47901c48c9214'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The photo feed mounts every band at once (`windowSize={99}` on a ~45,000 px list), the masonry layout is recomputed on *every* screen render because `expandedItemIds` is a brand-new array each time, and every mounted thumb re-renders with its parent — so typing in search, toggling the scroll fob, or a keyboard-height change all cost a full O(n) relayout plus hundreds of cell renders. The RN dev log line that prompted this (`VirtualizedList: You have a large list that is slow to update`) is only a scroll-event-gap heuristic and is a false positive here, but the waste it pointed at is real.

**Approach:** Restore virtualization, give the library's layout memo stable inputs, and stop needless cell re-renders. All of it is app code; `expo-masonry-layout` gets no change.

</frozen-after-approval>

## Implementation Notes

Why each decision, so implementation doesn't re-litigate it:

- **`windowSize={99}` → `{15}`** in [PhotosListMasonry](../src/components/PhotosListMasonry/index.js). RN's render window is `windowSize` viewport-lengths total; the feed measured 45,761 px ≈ 54 viewports, so 99 mounted all ~152 bands forever and virtualization did nothing. The library slices bands at 300 px (`DEFAULT_BAND_HEIGHT`), so 15 viewports ≈ 12,750 px ≈ 42 bands — about a screen's worth of buffer ahead and behind on top of `maxToRenderPerBatch={30}` (9,000 px/batch), which keeps fast flings filled. [PhotoSelectionMode already uses `windowSize={9}`](../src/screens/PhotoSelectionMode/index.js) against the same library, so virtualized masonry is proven here. Leave `initialNumToRender={30}`, `maxToRenderPerBatch={30}`, `updateCellsBatchingPeriod={16}` and especially `removeClippedSubviews={false}` alone — items are absolutely positioned inside bands, and clipping them is a known RN failure mode.
- **Stabilise `expandedItemIds`** in [usePhotoExpansion](../src/hooks/usePhotoExpansion.js). It feeds the library's `columnLayoutData` useMemo deps, so a new array identity per render re-runs `calculateColumnMasonryLayout` + `sliceIntoBands` over the whole feed on every parent render. Use `useMemo` over `expandedPhotoId` with a module-level frozen empty-array constant for the collapsed case.
- **`React.memo(ExpandableThumb)`** plus a stable press handler in [PhotosListMasonry](../src/components/PhotosListMasonry/index.js): memo is worthless while `onPress={() => toggleExpand(item.id)}` allocates per item. `ExpandableThumb` already calls `onPress(item)`, so pass one `useCallback` that takes the photo and expands `photo.id`. Keep `displayName` on the memo wrapper; the Jotai `isDarkMode` subscription still re-renders thumbs on theme change, which is correct.
- **Drop the duplicated `columns={{ 402: 2, ... }}` literals** at the three call sites ([PhotosList](../src/screens/PhotosList/index.js), [WaveDetail](../src/screens/WaveDetail/index.js), [FriendDetail](../src/screens/FriendDetail/index.js)). All three are byte-identical to the component's `FEED_COLUMNS` default, so deleting the prop removes a per-render object allocation with no behaviour change.
- **One focused test** for the identity guarantee — that is the only new behaviour worth pinning. No test for `windowSize` (a tuning constant) and none restating `React.memo`.

Known limits accepted: the library rebuilds its `contentContainerStyle`/`style` objects each render, so the list itself still re-renders; and pagination recreates layout item objects, so memo legitimately misses when a new page lands. Neither is app-fixable or worth working around.

Implementation record (all six planned files changed, plus one new test):

- `ExpandableThumb` became `memo(function ExpandableThumb ({...}) { ... })` rather than wrapping an arrow, so the existing trailing `.propTypes` / `.displayName` assignments land on the memo object; `displayName` still resolves there (React's `getComponentNameFromType` handles `REACT_MEMO_TYPE`), though React 19.3 does no dev-time `propTypes` validation at all, so that assignment is decorative in this version either way. Converting the arrow cost one extra edit (`}) => {` → `}) {`) and initially produced a parse error; caught by lint, fixed.
- The new test needed `global.IS_REACT_ACT_ENVIRONMENT = true` (React 19 + `react-test-renderer` warns otherwise); no `react-native` mock is required because `photoListHelpers` imports nothing.
- Proved the test bites: reverting the hook's `useMemo` to a plain array fails `expect(...).toBe(ids)` at the "same photo stays expanded" case. The collapsed case alone would not prove it, because the frozen empty-array constant is stable by itself — that's why both cases exist.
- Pre-existing failure in the suite, untouched by this change: `src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js` fails identically when run alone, and nothing in `src/screens/PhotosList/upload/` imports any file this plan touched.

## Plan Change Log

## Review Triage Log

Pass 1 (lens `quick`): high 0, medium 0, low 1, false 1, maybe-false 0. No loopback needed — the only real finding was plan prose.

- `low` → **patched** — Implementation record claimed the memo-wrapper `.propTypes` assignment matters to "React's dev propTypes check". Evidence: `node_modules/react/cjs/react.development.js` (react 19.3.0) has zero matches for `checkPropTypes` / `Missing required prop`, so React 19 performs no dev-time propTypes validation; `displayName` does resolve on a memo object (`REACT_MEMO_TYPE` handled in `getComponentNameFromType`). Amended the note to say the assignment is decorative in this version. KEEP: everything else in the record and the six code changes as reviewed.
- `false` → **rejected** — "`toggleExpand(photo?.id ?? photo)` could expand a non-id value" at `src/components/PhotosListMasonry/index.js`. Unreachable: `ExpandableThumb` only ever calls `onPress(item)`, and that `item` is `photosById.get(item.id) || item`, i.e. keyed by a present `id` (`renderMasonryItem` looks it up by `item.id`). No guard added for an unreachable state.

## Verification

**Commands:**
- `npx jest --watchman=false src/hooks/__tests__/usePhotoExpansion.test.js` -- expected: passes; and it must fail if the `useMemo` is reverted (verify once by inspection of what it asserts).
- `npx jest --watchman=false` -- expected: no new failures against the pre-existing suite.
- `HOME="$TMPDIR" npx ts-standard src/hooks/usePhotoExpansion.js src/components/PhotosListMasonry/index.js src/components/ExpandableThumb/index.js src/screens/PhotosList/index.js src/screens/WaveDetail/index.js src/screens/FriendDetail/index.js` -- expected: no findings beyond the baseline this repo carries (repo-wide lint is not clean; compare, don't expect zero).

**Manual checks (device/simulator, `source .env && npx expo start`):**
- Feed scrolls to the end with no blank bands during a hard fling, and scrolling back up re-shows images without a long blank.
- Type in the feed search and toggle the scroll-to-top fob: no full-grid flash/relayout (previously every keystroke rebuilt the grid).
- Expand a photo, scroll ~20 screens away, return: the expanded card keeps its measured height and stays expanded/collapsible.
