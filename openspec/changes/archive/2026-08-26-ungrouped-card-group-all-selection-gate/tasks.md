## 1. Bulk Action State

- [x] 1.1 Derive the auto-group button’s enabled state from an empty selected-photo set and the existing `autoGrouping` loading state in `src/components/UngroupedPhotosCard/index.js`.
- [x] 1.2 Keep the auto-group button always visible with a dimmed (opacity) disabled appearance when photos are selected, while preserving its bottom-row layout, confirmation dialog, and loading indicator.
- [x] 1.3 Fix the zero-width auto-group button in the bottom row (Yoga measured the auto-basis explanation Text at the full row width, collapsing the flex:1 button): give the explanation text `flex: 1` for a 50/50 row split.

## 2. Selection and Regression Validation

- [x] 2.1 Verify that with zero selected photos, auto-grouping is enabled and the manual wave actions are disabled.
- [x] 2.2 Verify that with one or more selected photos, auto-grouping is disabled and only create/add-to-wave actions are enabled; confirm pressing the disabled bulk action does not invoke the mutation.
- [x] 2.3 Verify that cancelling selection or completing manual grouping clears selection and restores auto-group availability.
- [x] 2.4 Run the focused existing auto-group reducer tests and project lint; manually verify the card remains at the bottom of the ungrouped photos section and hides after the ungrouped count reaches zero.