# Design

## Context

See proposal.md for the failure scenario and scope. The existing queue stores a stable original video path and a deterministic staged filename derived from the queued item's local filename. Video processing currently moves the source before the queue entry has durable staged-video and thumbnail paths. Queue recovery checks the original path before entering the upload service, so a moved file can be mistaken for a missing file.

## Goals / Non-Goals

**Goals:**

- Make staging state durable before backend photo creation can be attempted.
- Recover videos when the process stops in the interval between moving the file and persisting the staging state.
- Rebuild a missing thumbnail from a recoverable staged video and resume the existing upload flow.
- Keep missing-media classification tied to actual local-file existence.

**Non-Goals:**

- Change the GraphQL API, backend photo lifecycle, or object-storage naming.
- Automatically delete or replace the user's queued video.
- Change image upload recovery behavior.

## Decisions

### Keep staging path derivable and persist it before remote work

Use the existing deterministic pending-upload destination derived from the queue item, and store the staged video path on the queue entry as soon as staging completes. Persisting the path before thumbnail generation and before `createPhoto` ensures retries can resume without relying on an in-memory result.

Alternatives considered:

- Copy rather than move the video and retain the original indefinitely. This adds duplicate local storage and still requires cleanup and queue lifecycle changes.
- Persist only after the photo record is created. This preserves the current crash window and does not solve the reported failure.

### Probe the deterministic staged path during recovery

When a video item's original path is absent but its persisted staged path is missing or not yet recorded, recovery SHALL check the deterministic staged destination before marking the item unrecoverable. If present, it SHALL restore the staged path in the queue and continue processing. This closes the unavoidable interruption window between file move and queue persistence.

If the video is present but the thumbnail is absent, regenerate the thumbnail from the staged video and persist the resulting paths before making remote requests. If neither the original nor staged video exists, preserve the existing unrecoverable behavior.

### Fail closed when durable queue updates fail

The upload flow SHALL NOT continue to backend photo creation until it has successfully persisted the staged path. A persistence failure must leave the item queued and report the failure through existing logging/error handling; it must not be represented as a successful queue update.

## Risks / Trade-offs

- [A legacy item may have a staged file whose deterministic path differs from the current naming convention] -> Confirm the destination against current `localImageName` behavior and add a regression test using legacy queue-entry shapes before relying on the derived path.
- [Persisting staging state adds a queue write during video processing] -> Reuse the serialized queue write lock so concurrent queue updates remain ordered.
- [A crash can still occur at any boundary] -> Recovery must inspect actual original and staged files on every pass and be idempotent.

## Migration Plan

No backend or storage migration is required. Existing queue items retain their current fields; recovery derives the staged destination for legacy entries and persists the restored path when it finds the file. Rollback can revert the client behavior without modifying server data; entries already carrying the added staging field remain readable by older code because it ignores unknown queue fields.
