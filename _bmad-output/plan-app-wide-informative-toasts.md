---
title: 'Informative failure toasts with long-press detail'
type: 'bugfix'
ticket: ''
created: '2026-11-19'
status: 'draft'
baseline_revision: 'e8c89552db34d611551a116742c775b10efbaa52'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Deleting a photo (and bookmarking, commenting, sharing, waving) can fail with a toast that carries no information at all. Failure toasts across the app are inconsistent: some discard the caught error and say "Please try again", and the only "see more" path is a tap wired through module-level globals that leaks stale callbacks onto unrelated toasts.

**Approach:** Make one toast façade own every failure message: it always derives a human reason from whatever was caught, and carries structured detail (reason + stack when available) on the toast itself so long press opens the existing error bottom sheet. Existing screens keep their wording; only the plumbing changes.

## Boundaries & Constraints

**Always:**
- Every error toast shows a non-empty reason; an empty/blank toast is a defect.
- Detail payload travels with the individual toast, never in module-level mutable state.
- Reuse `ErrorDetailModal` and `errorContextAtom` as they are — they already render title, message and a collapsible stack trace.
- Keep the exported names `showToast` (default), `showSuccessToast`, `showInfoToast`, `showErrorToast` — tests mock them by name.

**Never:**
- Do not fork, patch, or upgrade `react-native-toast-message`; work through its public options.
- Do not redesign toast styling, positions, or animation.
- Do not touch `../WiSaw.cdk`, `ios/`, `android/`, or `src/zxcvbn.js`.
- No new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Delete fails (GraphQL) | `catch (err)` Apollo error, no text given | Toast: title + `err` reason (not blank); long press opens sheet with full message + stack | Reason extracted from `graphQLErrors`/`networkError`/`message` in that order |
| Unknown throw | `throw 'boom'` / `{}` / `null` | Toast still shows a concrete line (`String(err)` or `Unknown error`) and never `'Notification'` | Never throws from inside the toast helper |
| Non-Error text2 | Caller passes an Error object as `text2` | Rendered as its message string, not dropped by BaseToast's `text2.length` guard | Coerced to string in the helper |
| Success/info toast | `showSuccessToast('Saved')` | Unchanged rendering; no long-press affordance unless it carries detail | n/a |
| Two errors in flight | Second error toast shows before first hides | Each toast opens its own detail, not the other's | Detail is per-toast payload |

## Decisions (settled at checkpoint)

1. **Long-press coverage:** every error toast gets the long-press reveal; the sheet shows the stack section only when a stack exists. Uniform affordance — no dead gesture.
2. **Tap and long press both open detail**, so existing muscle memory on tap is preserved.
3. **Consolidation:** `src/utils/showErrorToast.js` stays as a thin wrapper over the façade's error path; the 15 existing imports keep working unchanged.
4. **Stack visibility:** the detail sheet always shows the stack when one was captured, in release builds too — field troubleshooting is the point of this change.

</frozen-after-approval>

## Code Map

- `src/utils/showToast.js` -- the façade: defaults `top/topOffset 60/2000ms` (error 3000ms) + `show{Success,Error,Info}Toast`. **Bug:** object branch falls back to `text1: 'Notification'`, which is what renders as the blank delete-failure toast.
- `src/utils/showErrorToast.js` -- rival rich helper `{title,message,stack,topOffset=100,visibilityTime=8000}`; truncates at 80 chars; stashes an open-detail closure in module global `currentOnPress`; calls `Toast.show` directly, bypassing the façade.
- `app/_layout.tsx:36-45,269` -- `ErrorToastWithTap` is the custom `error` toast config (`BaseToast` + `onPress` → `getCurrentOnPress()`). It overrides any caller-supplied `onPress`, so `photoUploadService.js:849,904`'s `alert()` handlers are dead, and a stale closure can open the wrong detail. `:57-59` injects the atom setter; `:270` mounts `ErrorDetailModal`.
- `src/atoms/errorAtom.js` -- `errorContextAtom {visible,title,message,stack}` + `hideErrorAtom`. Reuse unchanged.
- `src/components/ErrorDetailModal/index.js` -- bottom sheet already renders title/message/collapsible stack and swipe-to-dismiss. **Reuse as-is; do not rewrite.**
- `node_modules/react-native-toast-message@2.5.2/lib/src/ToastUI.js:13,20-36` -- forwards ONLY `position,type,isVisible,visibilityTime,text1,text2,text1Style,text2Style,show,hide,onPress,props` to a config component → carry detail via `Toast.show({ props: {...} })`.
- `node_modules/.../components/BaseToast.js:6` -- root is a `TouchableOpacity` with `{...touchableContainerProps}` spread last → inject `{ onLongPress, delayLongPress }` there; the lib has no long-press support otherwise.
- **Broken signature (root cause):** `src/components/Photo/reducer.js:1` and `src/hooks/usePhotoActions.js:2` import `showErrorToast` from `utils/showToast` (string API) but call it as `{title,message,topOffset}` — 15 sites, incl. `deletePhoto` at `Photo/reducer.js:129`. All render `'Notification'` with no detail.
- **Reason discarded:** `src/utils/themeStorage.js:12,22,32,42,68`; `src/screens/FriendsList/index.js:144,162,165,217`; `src/screens/Secret/reducer.js:152,165,189`; `src/screens/PhotosList/upload/usePhotoUploader.js:304`; `app/tandc-modal.tsx:34`.
- `src/hooks/useToastTopOffset.js` -- canonical offset; many sites hardcode `topOffset: 60`. Leave call-site values alone unless already editing that line.
- Tests: jest 30, no config file, no `@testing-library` — plain `react-test-renderer` + manual RN mocks; run `npx jest --watchman=false`. Follow `src/screens/PhotosList/upload/__tests__/photoUploadService.test.js:42` (mocks `{ showInfoToast, showErrorToast }`).

## Tasks & Acceptance

**Execution:**
- [ ] `src/utils/showToast.js` -- single façade for errors: add reason extraction (`graphQLErrors[0].message` → `networkError.message` → `err.message` → `String(err)` → `'Unknown error'`), coerce Error-valued `text2`/`message` to string, drop the `'Notification'` fallback in favour of a real line, and attach `props: { detail }` (`{title, message, stack}`) on every error toast.
- [ ] `src/utils/showErrorToast.js` -- reduce to a thin wrapper over the façade's error path so both import styles reach one implementation; remove `currentOnPress`/`setAtomSetter`.
- [ ] `app/_layout.tsx` -- replace `ErrorToastWithTap` with a component that wires tap **and** long press (`delayLongPress` via `touchableContainerProps`) from the toast's own `props.detail`; delete the atom-setter injection.
- [ ] `src/components/Photo/reducer.js`, `src/hooks/usePhotoActions.js` -- normalize all 15 mismatched calls to the unified API so the reason renders (this is the reported delete failure).
- [ ] Reason-restoring call sites: `themeStorage.js`, `FriendsList/index.js`, `Secret/reducer.js`, `usePhotoUploader.js`, `tandc-modal.tsx` -- pass the caught error through instead of a static string.
- [ ] `src/screens/PhotosList/upload/photoUploadService.js:849,904` -- delete the dead `onPress: () => alert(...)` handlers.
- [ ] `src/utils/__tests__/showToast.test.js` (new) -- unit-test the matrix rows above by mocking `react-native-toast-message`.

**Acceptance Criteria:**
- Given a photo whose `deletePhoto` mutation rejects, when the user confirms deletion, then the toast names the failure reason and long press reveals the full message plus stack in `ErrorDetailModal`.
- Given a thrown value that is not an `Error`, when any error toast shows, then it still displays a concrete reason and never `Notification` or blank.
- Given two error toasts shown back to back, when either is long pressed, then the detail shown belongs to that toast.
- Given any success/info toast, when it renders, then its appearance and timing are unchanged from baseline.
- Given the app-wide audit, when grepping for `showErrorToast(` with a `title:`/`message:` object against the `utils/showToast` import, then zero matches remain.

## Implementation Notes

_Risk rationale:_ medium — the helpers are imported by ~29 files / 168 call sites, so a regression hides error feedback app-wide; but nothing here mutates data or the backend, and it is JS-only and reversible.

## Verification

**Commands:**
- `npx jest --watchman=false` -- expected: all suites pass, including the new toast test and the 3 upload suites that mock the helpers.
- `HOME="$TMPDIR" npx ts-standard src/utils/showToast.js src/utils/showErrorToast.js app/_layout.tsx src/components/Photo/reducer.js src/hooks/usePhotoActions.js` -- expected: no new findings versus baseline noise.
- `grep -rn "showErrorToast({" src app | grep -v __tests__` then check each hit imports from `utils/showErrorToast` -- expected: no object-form calls against the string API.

**Manual checks:**
- Trigger a failed delete on a bookmarked photo and on an offline device; confirm both toasts state why, and long press opens the sheet with a stack where one exists.

## Open Questions

1. **Long-press coverage** — "if possible" is unresolved. (a) Long press on every error toast, showing stack only when one exists [recommended: uniform affordance, no dead gesture]; (b) only when a stack/detail exists; (c) also on success/info toasts that carry `text2`.
2. **Tap vs long press** — keep tap opening detail as well as long press [safer, preserves today's muscle memory], or make long press the only reveal so accidental taps never open a sheet?
3. **Module consolidation** — collapse to one helper module and repoint the 15 `utils/showErrorToast` imports [cleaner end state, bigger diff], or keep `showErrorToast.js` as a compatibility wrapper [smaller diff, two entry points remain]?
4. **Stack in release builds** — always show the stack in the detail sheet [best for field troubleshooting, exposes internals], dev-only, or dev plus an in-app debug flag?
