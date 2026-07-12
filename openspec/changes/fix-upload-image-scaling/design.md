## Context

`ensurePhotoDimensions()` in `photoUploadService.js` attempts to fill in `width`/`height` on a photo object after upload. It iterates over candidate URIs in order: `[localImgUrl, localThumbUrl, originalCameraUrl]` and returns the first one with valid dimensions. The problem is that `localImgUrl` is a compressed image (resized to height 3000 by `ImageManipulator`), so its dimensions differ slightly from the original camera file due to rounding during resize.

## Goals / Non-Goals

**Goals:**
- Ensure optimistic feed insertion uses original camera image dimensions, matching what the backend returns after processing

**Non-Goals:**
- Adding `width`/`height` to `createPhoto` mutation response (backend change, separate effort)
- Fixing the "already active" photo path that skips `ensurePhotoDimensions` (separate issue)

## Decisions

### Decision 1: Reorder candidateUris to prefer originalCameraUrl first

**Choice:** Change `[localImgUrl, localThumbUrl, originalCameraUrl]` to `[originalCameraUrl, localImgUrl, localThumbUrl]`.

**Rationale:** The original camera file always has the true pixel dimensions. The compressed file is a derivative that may have slightly different dimensions due to resize rounding.

**Alternatives considered:**
- Skip compressed files entirely: Would break the fallback if original camera URL is no longer available (cleaned up, moved, etc.)
- Use the backend dimensions: Requires a backend change and doesn't help the optimistic path until the backend processes the image.

## Risks / Trade-offs

- If `originalCameraUrl` has been deleted or is inaccessible, `getImageDimensionsAsync` will fail and fall through to the next candidate. No regression.
