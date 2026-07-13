## Context

`GlobalUploadBanner` (`src/components/GlobalUploadBanner/index.js`) was introduced in the `global-upload-banner` change as a fixed-position overlay at the drawer level. The spec mandates reading `STATE.netAvailable` via `useAtomValue`, but the implementation destructures `netAvailable` from `UploadContext` instead. `UploadContext` never exposes `netAvailable` in its context value, so the variable is always `undefined` (falsy), which traps the status label in its default `"waiting to upload"` branch and disables the icon pulse animation and color gating.

## Goals / Non-Goals

**Goals:**
- Restore three-state upload status labels: "waiting to upload" / "ready to upload" / "uploading"
- Restore icon pulse animation and color gating on network state

**Non-Goals:**
- Modifying `UploadContext.js` — the context contract is correct as designed
- Changing banner layout, positioning, or behavior beyond the status fix

## Decisions

**Read `netAvailable` from Jotai atom directly.** The spec already requires `useAtomValue(STATE.netAvailable)`. The implementation simply missed this during the global banner creation. No architectural change needed — just aligning code with spec.

## Risks / Trade-offs

Minimal risk — this is a one-line fix that aligns the implementation with the existing spec. The `netAvailable` atom is already subscribed to in `UploadProvider` via `useNetInfoSubscription()`, so no new subscriptions are needed.
