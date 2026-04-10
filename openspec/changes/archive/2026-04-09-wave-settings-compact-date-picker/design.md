## Context

WaveSettings uses `@react-native-community/datetimepicker` for splash and freeze date fields. Each date field currently has two UI elements: a styled `TouchableOpacity` button showing the formatted date, and a `DateTimePicker` that conditionally renders when the button is tapped. On iOS, the picker stays visible after tapping (inline spinner/calendar), creating a confusing layout with redundant date displays.

The `DateTimePicker` component supports a `display` prop with platform-specific options. On iOS 14+, `display='compact'` renders as a small tappable date label that opens a native calendar popover — combining display and editing into a single element.

## Goals / Non-Goals

**Goals:**
- Combine date display and date picker into a single UI element per date field
- Eliminate picker visibility toggle state (`showSplashPicker`, `showFreezePicker`)
- Maintain the "Set Date" / "Clear" workflow for nullable dates

**Non-Goals:**
- Changing save behavior (still saves immediately on date selection)
- Changing the frozen/unfrozen state logic
- Redesigning the overall WaveSettings layout beyond date fields

## Decisions

### Decision 1: Use `display='compact'` on iOS, `display='default'` on Android

**Choice:** Platform-conditional `display` prop on `DateTimePicker`.

**Rationale:** `compact` on iOS renders as a native date label that opens a popover calendar — exactly the "one element" UX we want. Android's `default` is already a tap-to-open modal dialog and auto-dismisses, which is already a combined element. No `display='compact'` equivalent exists on Android.

**Alternatives considered:**
- `display='inline'` — embeds a full calendar inline, takes too much vertical space for a settings screen
- `display='spinner'` — less intuitive than calendar, still requires separate label

### Decision 2: Conditional rendering for unset dates

**Choice:** When no date is set, show a "Set Date" button. When a date is set, show the `DateTimePicker` (compact) plus a clear button. The `DateTimePicker` requires a valid `Date` value, so it cannot represent "not set."

**Rationale:** `DateTimePicker` has no null/empty state — it always displays a date. Showing a picker initialized to "today" when the user hasn't set a date would be misleading. A "Set Date" button clearly communicates the unset state and initializes the date on first tap.

### Decision 3: Remove picker visibility state

**Choice:** Remove `showSplashPicker` and `showFreezePicker` state variables entirely.

**Rationale:** With `compact` display, the picker is always rendered (when a date is set). There's no show/hide toggle needed — the native compact element handles its own popover state internally. For the "not set" → "set" transition, tapping "Set Date" sets the date to today and the compact picker immediately appears.

## Risks / Trade-offs

- [Risk] `display='compact'` behavior may vary across iOS versions → Mitigation: requires iOS 14+ which is well past minimum support
- [Trade-off] The "Set Date" button flow means the first date selection defaults to today, which the user then adjusts → Acceptable since the compact picker makes adjustment immediate
