## Why

`flushUngroupedPhotos` checks the local upload queue for ungrouped items before calling `autoGroupPhotos` on the server. After the timing fix (move flush to post-drain), the local queue is always empty when flush runs because `removeFromQueue` has already cleared every item. The function returns `false` without ever calling the server, so auto-grouping never fires after uploads.

## What Changes

- Remove the local queue check (`readQueue` / `hasUngrouped` guard) from `flushUngroupedPhotos` — the server knows which photos are ungrouped; the local queue state is irrelevant for auto-grouping

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `upload-wave-assignment`: The "Flush ungrouped photos after upload queue drains" requirement removes the local queue check precondition — flush should always call the server when grouping is enabled

## Impact

- **File modified**: `src/screens/PhotosList/upload/photoUploadService.js`
- **Behavior change**: `flushUngroupedPhotos` now calls `autoGroupPhotos` on the server whenever grouping is enabled, instead of short-circuiting when the local queue is empty
