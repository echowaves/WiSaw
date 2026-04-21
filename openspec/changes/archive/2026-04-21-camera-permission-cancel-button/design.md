## Context

Apple rejected WiSaw v7.5.4 under Guideline 5.1.1(iv) because camera and photo library permission denial alerts present only an "Open Settings" button. Without a dismiss option, the user has no way to close the alert without being directed to Settings, which Apple considers pressuring users to reconsider their decision.

There are two locations where these alerts appear:
- `src/screens/PhotosList/hooks/useCameraCapture.js` — generic `checkPermission()` function used for both camera and media library permissions
- `src/screens/WaveDetail/index.js` — inline permission checks for camera and media library

Both locations use `Alert.alert()` with a single "Open Settings" button.

## Goals / Non-Goals

**Goals:**
- Add a "Cancel" button to all camera and photo library permission denial alerts so users can dismiss without any action
- Satisfy Apple Guideline 5.1.1(iv) by providing users a clear alternative to "Open Settings"

**Non-Goals:**
- Changing location permission handling (not cited in this rejection)
- Changing alert text or messaging
- Changing permission request timing or flow architecture

## Decisions

**Decision: Add "Cancel" button with `style: 'cancel'` before "Open Settings"**

On iOS, `style: 'cancel'` renders the button with standard dismiss styling and maps it to the hardware back gesture. Placing "Cancel" first (left position) and "Open Settings" second (right position) follows iOS HIG conventions where the destructive/action button is on the right.

Alternative considered: Remove the "Open Settings" alert entirely and silently return. Rejected because Apple explicitly says _"you may include a notification to inform the user and provide a link to the Settings app"_ — the alert itself is allowed, it just needs a dismiss option.

## Risks / Trade-offs

- [Low risk] Users may more frequently dismiss the alert without enabling camera → acceptable, this is the user's choice and Apple requires it
