## Context

The current `UngroupedPhotosCard` already separates manual grouping controls from the bottom auto-group row and tracks selected photo IDs locally. Its bulk action currently checks only the auto-group loading state, while the manual actions check whether the selection is non-empty. See the proposal for the motivation and the modified capability spec for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Make the three grouping actions mutually exclusive according to selection state.
- Keep the existing whole-pool server operation, confirmation dialog, loading indicator, and completion refresh unchanged.
- Ensure selection cancellation and successful manual grouping restore the no-selection action state.

**Non-Goals:**

- No GraphQL, backend, reducer, dependency, navigation, or persistence changes.
- No change to how selected photos are added to a newly created or existing wave.
- No change to the existing bottom-row layout or explanatory copy.

## Decisions

1. **Derive bulk-action availability from the existing selection state.** Use the same selected-ID set that gates the manual actions. The auto-group button is interactive only when the set is empty and `autoGrouping` is false; this avoids introducing another source of truth.

2. **Keep the mutation whole-pool scoped.** The reducer call remains unchanged and receives the configured grouping level. Disabling the button during selection prevents an ambiguous action, while the mutation itself continues to group the complete ungrouped pool when invoked with no selection.

3. **Keep the bulk button visible at all times.** The orange fill stays constant; when photos are selected the button is dimmed with opacity (0.5) instead of swapping to the near-transparent disabled background, so it never disappears from the layout. Keep the ActivityIndicator behavior and loading disabled state intact.

4. **Give both children of the bottom row a definite flex weight.** A `flex: 1` button next to a plain (auto-basis) `Text` collapses to zero width: Yoga measures the text at the full available row width, so the text fills the row and the basis-0 button is left with no space to grow into. The explanation text therefore also uses `flex: 1`, producing a stable 50/50 split that keeps the button's width constant across label and loading-spinner states.

4. **Validate the state matrix at the component boundary.** Add focused coverage or manual verification for zero selection, one-or-more selection, cancellation, and loading. The reducer tests remain sufficient for mutation arguments and batching because the reducer contract is unchanged.

## Risks / Trade-offs

- [A selected photo can be removed asynchronously after selection] -> The existing selection set is cleared by the current completion and cancel paths; keep the action gate derived from the current set so it cannot become enabled due to a stale independent flag.
- [The card can disappear after grouping completes] -> Preserve the existing completion callback so the Waves Hub refreshes the count and removes the card when the pool reaches zero.

## Migration Plan

Update the card’s derived disabled state and its focused UI validation. No data migration, backend deployment, or dependency update is required. Rollback is limited to reverting the card behavior and its test/spec updates.