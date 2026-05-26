## Context
- File: src/screens/WavesHub/index.js contains a useEffect hook (lines 472-478) that triggers auto-grouping when location drift exceeds threshold
- This trigger fires automatically without user confirmation when the app is in foreground and location drift is detected
- Users want auto-grouping to only occur after upload completes or when manually triggered
- The upload-complete trigger exists in src/screens/PhotosList/upload/usePhotoUploader.js (lines 130-136) with a 5-second delay
- Manual triggers exist in UngroupedPhotosCard component and various UI buttons

## Goals / Non-Goals
**Goals:**
- Remove automatic auto-grouping triggered by location drift
- Preserve auto-grouping triggered after upload queue completes (5-second delay)
- Preserve all manual auto-grouping triggers (from UngroupedPhotosCard and UI buttons)
- Maintain all other functionality in WavesHub/index.js unchanged

**Non-Goals:**
- Modify the upload-complete auto-trigger timing or logic
- Change manual trigger behavior or UI
- Alter groupingAtom or other global state management
- Affect the flushUngroupedPhotos function itself

## Decisions
### 1. Location Drift Trigger Removal
**Decision:** Comment out the entire useEffect block responsible for location drift auto-trigger in WavesHub/index.js (lines 472-478)
**Rationale:** 
- This is the simplest and safest way to disable the trigger without removing code that might be needed for reference
- Preserves the code for potential future re-enablement or debugging
- Clearly indicates intentional removal via commenting
- No risk of breaking other functionality since the useEffect is self-contained

### 2. Preserve Existing Triggers
**Decision:** Make no changes to upload-complete trigger (usePhotoUploader.js) or manual triggers
**Rationale:** 
- These are explicitly requested to remain by the user
- No modification needed as they already work correctly
- Minimizes risk of introducing bugs

## Risks / Trade-offs
- [Risk] Users who relied on location drift auto-trigger will need to use manual triggers instead
  - **Mitigation:** Manual triggers are readily available via UngroupedPhotosCard and UI buttons
  - **Acceptable:** This matches the user's explicit request to remove automatic triggers
- [Risk] Commenting out code might confuse future developers
  - **Mitigation:** The proposal and design documents explain why this was removed
  - **Acceptable:** Proper documentation via OpenSpec artifacts addresses this concern