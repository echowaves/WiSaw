## Context

Apple rejected WiSaw v7.5.3 on two guidelines. The app currently has four locations with permission alerts that use pressuring language and redirect to Settings, a T&C modal titled "Community Guidelines" rather than "Terms of Use," vague moderation messaging, and report dialogs that don't explain consequences. All changes are UI text / copy only — no architectural, API, or logic changes are needed.

Current permission alert locations:
- `useCameraCapture.js`: generic `checkPermission()` helper with "Why don't you enable…?" phrasing
- `WaveDetail/index.js`: inline alerts with "Camera access is needed…" / "Media library access is needed…"
- `useLocationProvider.js`: location denied alert with "Location Access Needed"
- `PhotosList/index.js`: location denied banner and EmptyStateCard with "Enable Location" action

Current reporting flow in `usePhotoActions.js`:
- Wave photos: "This photo will be sent to wave moderators for review"
- Regular photos: "The user who posted this photo will be banned"
- Backend already blocks users after 3 reports — but the UI doesn't communicate this

Current T&C (`TandC/index.tsx`):
- Title: "WiSaw Community Guidelines"
- Points reference "the community" removing offenders but don't mention AI or human moderation

## Goals / Non-Goals

**Goals:**
- Replace all pushy/pressuring permission alert text with neutral, informative explanations of why the permission is needed
- Keep "Open Settings" buttons as a convenience feature (not pressuring — user can dismiss)
- Rename "Community Guidelines" → "Terms of Use" in T&C title and footer
- Update T&C points to explicitly mention AI moderation, community reporting, and human moderators
- Update report dialogs to explain the 3-report threshold and posting block consequence
- Satisfy Apple Guidelines 5.1.1(iv) and 1.2 for resubmission

**Non-Goals:**
- Adding a block-user feature (separate change if needed)
- Adding pre-upload content filtering (server-side AI moderation already exists)
- Changing any permission request logic or flow
- Changing any reporting backend logic
- Modifying the T&C layout or styling

## Decisions

### 1. Permission alerts: informative tone, keep "Open Settings"

**Decision**: Replace alert body text with a neutral explanation of what feature requires the permission. Keep the "Open Settings" button as a second button alongside "OK"/"Cancel" so users can easily grant permission if they choose, without feeling pressured.

**Rationale**: Apple's objection is to *pressuring* users, not to providing a convenient path to Settings. The "Open Settings" button is a standard iOS pattern (many approved apps use it). The key is that the messaging must explain *why* the permission matters rather than guilt-tripping ("Why don't you…?").

**Example before**: `"Why don't you enable photo permission?"`
**Example after**: `"WiSaw needs camera access to capture and share photos. You can enable it in Settings."`

### 2. T&C rename: "Community Guidelines" → "Terms of Use"

**Decision**: Change only the title text and footer reference. Keep the shield-checkmark icon and all styling unchanged.

**Rationale**: Apple requires UGC apps to have a "Terms of Use" or EULA that users agree to. The current modal already functions as this — the content just needs the correct framing. The `TANDC_AGREEMENT` constant already says "Terms & Conditions" so it's partially there.

### 3. T&C moderation points: explicit AI + human + community

**Decision**: Update `TANDC_POINTS` to explicitly state that content is reviewed by automated AI systems, community reports, and human moderators. Mention the 3-report blocking consequence.

**Rationale**: Apple wants users to understand that moderation is active and effective. The current vague "community" language doesn't convey the full moderation stack that already exists on the backend.

### 4. Report dialogs: state consequences clearly

**Decision**: Update both report paths in `usePhotoActions.js`:
- Wave photos: mention that moderators will review and may remove the content
- Regular photos: explicitly state that after 3 reports the poster is blocked from uploading

**Rationale**: Users should understand what happens when they report (it's not just a void). This also deters false reports by making the consequence explicit.

**Alternative considered**: Adding a separate "consequences" info screen — rejected as over-engineering for what is a text change.

## Risks / Trade-offs

- [Longer alert text] → Users may not read it. Keeping messages to 1-2 sentences mitigates this.
- [Revealing 3-report threshold] → Potential for coordinated abuse (3 friends targeting someone). Acceptable because: (a) the threshold is already observable behavior, (b) human moderators can review appeals, (c) the anonymous UUID system limits coordinated targeting.
- [T&C rename without legal review] → The content is guidelines, not a binding legal contract. Acceptable for an anonymous photo-sharing app; legal review can come later if needed.
