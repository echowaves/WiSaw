## Context

The pending upload indicator (`PendingPhotosBanner`) is currently rendered inline inside individual screens (PhotosList in 6 places, WaveDetail, WavesHub). Each screen consumes `UploadContext`, runs `usePendingAnimation`, and passes props down. BookmarksList and FriendsList have no upload indicator at all. Every new screen risks forgetting to wire the banner.

## Goals / Non-Goals

**Goals:**
- Single global upload banner visible on all drawer screens automatically
- No screen needs to know about upload indicator rendering
- Dynamic padding so screen content never hides behind the banner
- Clean removal of per-screen banner duplication (8+ render sites)

**Non-Goals:**
- Modals, full-screen overlays, or non-drawer routes don't show the banner
- Upload queue logic, processing, or provider architecture stays unchanged
- Banner visual design stays the same (reuse existing layout logic)

## Decisions

### Banner lives in drawer layout, not root layout

The `UploadProvider` wraps the Drawer in `app/(drawer)/_layout.tsx`. The banner mounts as a sibling to the Drawer inside the provider — not in `_layout.tsx` (root). This keeps the banner scoped to drawer screens only (no modals) and guarantees `UploadContext` is available.

```
UploadProvider
  ├── GlobalUploadBanner (absolute, reads context)
  └── Drawer
        └── all screens
```

### Fixed overlay with atom-driven height coordination

The banner uses `position: 'absolute'` anchored to the safe area top. A new `bannerHeightAtom` (Jotai) publishes the banner's visible height (0 or ~80dp). Screens read this atom for `paddingTop`.

**Why atom over callback?** Screens already use Jotai for state. An atom is declarative, automatic, and avoids prop-drilling or callback registration. It also works across navigation transitions — the banner height is independent of which screen is visible.

**Why not a layout effect?** Absolute positioning means the banner doesn't push screen content. The atom bridges that gap — screens add exactly the padding the banner occupies.

### Self-contained banner reads context directly

`GlobalUploadBanner` consumes `UploadContext` and `STATE.netAvailable` internally. No props from the parent layout. This is the key difference from `PendingPhotosBanner` which required every parent to wire props.

### Toast offset handled internally

The banner computes `safeAreaInsets.top + bannerHeight + 10` for toast calls (clear queue confirmation). No coordination with parent screens needed.

### Replace, don't wrap

`PendingPhotosBanner` becomes dead code and is deleted. `usePendingAnimation` is deleted. No adapter layer — the new component incorporates animation logic internally.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Screens that don't read `bannerHeightAtom` will have content hidden behind banner | Audit all drawer screens; add atom consumption to top-level render in each |
| Banner height miscalculation causes visual gap or overlap | Banner uses `onLayout` to measure actual height rather than hardcoding |
| Animation timing mismatch between banner visibility and padding | Banner sets atom immediately on mount/unmount; animation is visual polish on top |
| Performance: atom update on every layout change | `onLayout` throttles naturally; height changes only on show/hide, not every frame |
