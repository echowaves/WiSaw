## Context

`expo-cached-image@55.0.0` switched from the legacy `FileSystem.downloadAsync` to the new `File.downloadFileAsync` API from `expo-file-system`. On Android, the native implementation strictly validates that the download URI is absolute (has a scheme like `https://`). When `photo.imgUrl` or `photo.thumbUrl` is `undefined` or `null`, JavaScript template literals (`` `${photo.imgUrl}` ``) coerce them to the string `"undefined"` or `"null"`, which fails the absolute URI check and throws `java.lang.IllegalArgumentException: URI is not absolute`.

Five components pass URIs to `CachedImage` without validation: `ImageView`, `PinchableView`, `ExpandableThumb`, `ChatPhoto`, and `ModalInputText`.

## Goals / Non-Goals

**Goals:**
- Prevent Android crash from non-absolute URIs reaching `File.downloadFileAsync`
- Handle edge cases where `imgUrl`/`thumbUrl` are `undefined`, `null`, or empty
- Show placeholder content instead of crashing when URIs are invalid

**Non-Goals:**
- Fixing backend data to always return valid URLs (separate concern)
- Modifying `expo-cached-image` library internals

## Decisions

### 1. Inline URI guard vs. utility function
**Decision:** Create a simple `isValidImageUri` utility function in `src/utils/`.
**Rationale:** Five components need the same check. A shared function avoids duplication and ensures consistent validation. The function checks that the value is a non-empty string starting with `http://` or `https://`.
**Alternative considered:** Inline checks in each component — rejected due to repetition.

### 2. Guard placement: before CachedImage vs. wrapper component
**Decision:** Guard at each call site with a conditional render.
**Rationale:** Each component already has its own layout/placeholder logic. A wrapper would add unnecessary abstraction. Simple `{isValidImageUri(uri) && <CachedImage ... />}` is clear and minimal.
**Alternative considered:** A `SafeCachedImage` wrapper component — rejected as over-engineering for a null-check.

## Risks / Trade-offs

- [Risk] Photos with truly invalid URIs silently show placeholder instead of crashing → **Acceptable** — placeholder is better than a crash, and the underlying data issue should be addressed server-side separately.
- [Risk] `isValidImageUri` only checks `http(s)://` prefix, not full URL validity → **Acceptable** — this matches the native validator's requirement (absolute URI with scheme).
