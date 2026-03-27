## Context

The app uses Expo Router's file-based routing with a nested navigator hierarchy: Root Stack → Drawer → multiple child Stacks (`(tabs)` and `waves`). The comment input screen (`modal-input.tsx`) currently lives inside `(tabs)`, which means navigating to it from the `waves` stack crosses navigator boundaries. After `router.back()`, the user lands on `(tabs)/index` (PhotosList) instead of returning to the originating wave detail screen.

There is existing precedent for root-level routes: `tandc-modal.tsx` already sits at `app/` alongside the `(drawer)` group.

## Goals / Non-Goals

**Goals:**
- `router.back()` after comment submission returns to the screen the user came from, regardless of which navigator stack it belongs to
- Preserve all existing modal-input functionality (custom AppHeader, submit handler, keyboard behavior)

**Non-Goals:**
- Changing the comment submission logic or Photo component's `router.push` call
- Migrating other `(tabs)` screens to root level
- Changing the visual presentation of the modal input beyond what `presentation: 'modal'` provides natively

## Decisions

### 1. Root-level route with `presentation: 'modal'` vs duplicating into waves stack

**Choice:** Move `modal-input.tsx` to `app/` and register with `presentation: 'modal'` in the root Stack.

**Rationale:** A root-level modal is navigator-agnostic — it overlays whatever is currently on screen, and `router.back()` always pops back to the originator. Duplicating the screen into `waves/` would fix the immediate bug but creates maintenance burden (two copies of the same screen) and wouldn't cover future stacks.

**Alternatives considered:**
- Duplicate `modal-input.tsx` into `app/(drawer)/waves/` — fixes the bug but violates DRY
- Inline comment input in the Photo component — significant refactor, changes UX, out of scope

### 2. File move (not copy) from `(tabs)` to root

**Choice:** Move the file and remove the old `<Stack.Screen name='modal-input' />` from the `(tabs)` layout.

**Rationale:** Leaving the old route in place would create route ambiguity in Expo Router's file-based resolution. The old location must be cleaned up.

### 3. No changes to `router.push` call in Photo component

**Choice:** Keep the existing `router.push({ pathname: '/modal-input', params: { ... } })` unchanged.

**Rationale:** Expo Router resolves `/modal-input` to whatever route matches that path. Moving the file from `app/(drawer)/(tabs)/modal-input.tsx` to `app/modal-input.tsx` doesn't change the resolved pathname — it's still `/modal-input`. The push call works as-is.

## Risks / Trade-offs

- **[Modal presentation style difference]** `presentation: 'modal'` may render differently than a standard stack push (e.g., iOS card-style slide vs modal sheet). → Mitigation: The screen already uses a custom `AppHeader` with back button, so the visual change is minimal. Test on both platforms.
- **[Route resolution order]** If both the old and new files exist simultaneously during development, Expo Router might resolve to the wrong one. → Mitigation: Delete the old file before creating the new one (single move operation).
