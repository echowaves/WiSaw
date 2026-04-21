## Why

Apple rejected WiSaw v7.5.3 citing Guideline 5.1.1(iv) (Privacy — pushy permission messaging) and Guideline 1.2 (Safety — UGC). The permission alerts use pressuring language ("Why don't you enable…?") and the Terms of Use / moderation messaging doesn't clearly communicate to users that content is actively moderated and what the consequences of abuse reports are. These must be fixed before resubmission.

## What Changes

- Replace pushy permission alert messages across all camera, media library, and location permission prompts with neutral, informative explanations of why each permission is needed. Keep "Open Settings" buttons as a convenience feature.
- Rename "Community Guidelines" to "Terms of Use" throughout the T&C modal to satisfy Apple's EULA/Terms requirement for UGC apps.
- Update T&C points to explicitly communicate that content is moderated by AI, community reports, and human moderators — not just "the community."
- Make report consequences explicit: clarify that users reported 3 times are blocked from posting, so reporters and potential offenders understand the system.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-services`: Permission-denied Alert message text changes from pressuring to informative language, keeping the "Open Settings" convenience button.
- `ai-content-recognition`: No spec-level behavior change — only T&C messaging references AI moderation more explicitly. _(no delta spec needed)_

## Impact

- `src/screens/PhotosList/hooks/useCameraCapture.js` — camera and media library permission alert text
- `src/screens/WaveDetail/index.js` — camera and media library permission alert text
- `src/hooks/useLocationProvider.js` — location permission denied alert text
- `src/screens/PhotosList/index.js` — location denied banner and EmptyStateCard text
- `src/screens/TandC/index.tsx` — title, description, points, and agreement text
- `src/hooks/usePhotoActions.js` — report confirmation alert text (both wave and regular photo paths)
