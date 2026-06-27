## REMOVED Requirements

### Requirement: Client-side ungrouped photo tracking
**Reason**: Auto-grouping is now server-side only; the client no longer tracks or displays ungrouped photos.
**Migration**: The `ungroupedPhotosCount` Jotai atom and `getUngroupedPhotosCount` API are no longer called by the client. The concept of "ungrouped photos" is now entirely handled by the server.

### Requirement: UngroupedPhotosCard component usage
**Reason**: Users no longer need visibility into ungrouped photos since grouping happens automatically server-side.
**Migration**: The `UngroupedPhotosCard` component is no longer rendered in `WavesHub ListHeaderComponent`. The component file remains but is unused.