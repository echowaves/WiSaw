## 1. Fix Permission Alert Messages

- [x] 1.1 Update `useCameraCapture.js` — replace camera permission alert body from `"Why don't you enable photo permission?"` to a neutral explanation that WiSaw needs camera access to capture and share photos
- [x] 1.2 Update `useCameraCapture.js` — replace media library permission alert body from `"Why don't you enable the permission?"` to a neutral explanation that WiSaw needs photo library access to save captured photos
- [x] 1.3 Update `WaveDetail/index.js` — replace camera permission alert body `"Camera access is needed to take photos."` to a neutral explanation that WiSaw needs camera access to capture photos for this wave
- [x] 1.4 Update `WaveDetail/index.js` — replace media library permission alert body `"Media library access is needed to save photos."` to a neutral explanation that WiSaw needs photo library access to save captured photos
- [x] 1.5 Update `useLocationProvider.js` — replace location denied alert body with a neutral explanation that WiSaw uses location to show photos from nearby, keeping both "Open Settings" and "OK" buttons
- [x] 1.6 Update `PhotosList/index.js` — update location denied banner text and EmptyStateCard subtitle to use neutral, informative language

## 2. Rename Community Guidelines to Terms of Use

- [x] 2.1 Update `TandC/index.tsx` — change title from `"WiSaw Community Guidelines"` to `"WiSaw Terms of Use"`
- [x] 2.2 Update `TandC/index.tsx` — change `FOOTER_NOTE` from `"You can revisit these guidelines anytime from Settings."` to `"You can revisit these terms anytime from Settings."`

## 3. Update T&C Moderation Messaging

- [x] 3.1 Update `TANDC_POINTS` — revise moderation points to explicitly mention AI-powered content review, community reporting, and human moderators
- [x] 3.2 Update `TANDC_POINTS` — add explicit consequence: users reported 3 times are blocked from posting

## 4. Update Report Dialog Messaging

- [x] 4.1 Update `usePhotoActions.js` — revise wave photo report dialog to explain that moderators and automated systems will review the content and may remove it
- [x] 4.2 Update `usePhotoActions.js` — revise regular photo report dialog to explicitly state that users reported 3 times will be blocked from posting new content
