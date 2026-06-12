## Context

The `PendingPhotosBanner` component at `src/screens/PhotosList/components/PendingPhotosBanner.js` is a reusable animated card showing upload progress with:
- Cloud-upload icon with pulse animation when uploading
- Count text ("3 photos uploading")
- Status label (uploading/ready to upload/waiting)
- `LinearProgress` bar at the bottom
- Long-press action to clear the upload queue
- Spring entrance/scale animations via `usePendingAnimation` hook

**Current state across screens:**

| Screen | Banner | Animation Hook | UploadContext |
|--------|--------|---------------|---------------|
| PhotosList (5 render paths) | ✅ | ✅ `usePendingAnimation` | ✅ |
| WaveDetail | ✅ | ❌ inline `useRef` | ✅ |
| WavesHub | ❌ | ❌ | ❌ |

WavesHub subscribes to `uploadBus` for badge count updates but has zero upload progress UI. Users taking photos from the waves list get no visual feedback.

## Goals / Non-Goals

**Goals:**
- Reuse exact `PendingPhotosBanner` component in WavesHub
- Add `UploadContext` consumption and `usePendingAnimation` hook to WavesHub
- Standardize WaveDetail to use `usePendingAnimation` hook instead of inline refs
- Provide consistent upload progress experience across all screens

**Non-Goals:**
- Modify `PendingPhotosBanner` component itself (reused as-is)
- Modify `usePendingAnimation` hook (reused as-is)
- Add new upload-related capabilities or APIs
- Change upload queue behavior or bus protocol

## Decisions

### Decision 1: Reuse PendingPhotosBanner exactly as-is in WavesHub

**Choice:** Import and render the existing `PendingPhotosBanner` in WavesHub with the same props as PhotosList.

```js
// WavesHub/index.js
const { pendingPhotos, isUploading, clearPendingQueue } = useContext(UploadContext)
const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({
  pendingPhotosCount: pendingPhotos.length,
  netAvailable
})

// In JSX, between header and main content:
<PendingPhotosBanner
  theme={theme}
  pendingPhotos={pendingPhotos}
  netAvailable={netAvailable}
  isUploading={isUploading}
  clearPendingQueue={clearPendingQueue}
  toastTopOffset={toastTopOffset}
  pendingPhotosAnimation={pendingPhotosAnimation}
  uploadIconAnimation={uploadIconAnimation}
/>
```

**Rationale:** The component already handles all the right cases (netAvailable=false, pendingPhotos.length=0, long-press clear). No need to reinvent. WavesHub already has `UploadProvider` wrapping it at the Drawer layout level.

**Alternatives considered:**
- Custom lightweight progress indicator for WavesHub → Rejected, violates DRY, inconsistent UX
- New `UploadProgressIndicator` component → Rejected, unnecessary duplication

### Decision 2: Standardize WaveDetail to use usePendingAnimation hook

**Choice:** Replace WaveDetail's inline animation refs:
```js
// Current (inconsistent):
const pendingPhotosAnimation = useRef(new Animated.Value(0)).current
const uploadIconAnimation = useRef(new Animated.Value(1)).current
```

With the hook:
```js
const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({
  pendingPhotosCount: pendingPhotos.length,
  netAvailable
})
```

**Rationale:** WaveDetail currently has its own inline animation refs but passes them to the same `PendingPhotosBanner` component. This is inconsistent with PhotosList which uses the hook. Using the hook everywhere eliminates drift and makes animation behavior a single source of truth.

**Alternatives considered:**
- Leave WaveDetail as-is → Rejected, inconsistent patterns make future animation changes harder

### Decision 3: Banner placement in WavesHub

**Choice:** Render `PendingPhotosBanner` between `AppHeader` and `InteractionHintBanner`, same position as in PhotosList and WaveDetail.

```
┌──────────────────────────────┐
│  AppHeader                   │
├──────────────────────────────┤
│  PendingPhotosBanner         │ ← NEW
├──────────────────────────────┤
│  InteractionHintBanner       │
├──────────────────────────────┤
│  UngroupedPhotosCard (if >0) │
├──────────────────────────────┤
│  FlatList (waves)            │
└──────────────────────────────┘
```

**Rationale:** This matches the existing pattern. The banner appears at the top when there are pending uploads and hides itself when `pendingPhotos.length === 0`.

## Risks / Trade-offs

### [Risk] Banner adds vertical space in WavesHub
The banner card takes ~64px vertical space. On the waves list this may push content down during active uploads.
→ **Mitigation:** This is expected behavior. PhotosList has the same tradeoff and it works fine. The banner is dismissible via long-press.

### [Risk] WaveDetail hook migration could affect animations
Replacing inline refs with the hook changes the animation lifecycle (the hook uses `previousPendingCount` state for enter/exit logic).
→ **Mitigation:** The hook's behavior should be identical to the current inline refs since both animate based on `pendingPhotosCount` transitions. Test with various scenarios (upload start, upload finish, queue clear).
