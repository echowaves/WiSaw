## Context

`src/screens/PhotosList/index.js` is a 1802-line React component that serves as the main photo feed screen. Some extraction has already happened — rendering components (`PhotosListMasonry`, `PhotosListFooter`, `PhotosListSearchBar`, `PendingPhotosBanner`, `PhotosListEmptyState`) and the upload hook (`usePhotoUploader`) live in separate files. What remains in `index.js` is the orchestration layer: 30+ `useState` calls, 15+ `useEffect` hooks, and ~350 lines of handler functions spanning 7 distinct concerns.

Existing structure:
```
src/screens/PhotosList/
├── index.js              (1802 lines — the target)
├── reducer.js            (data fetching)
├── components/           (5 extracted UI components)
└── upload/               (usePhotoUploader hook + service)
```

## Goals / Non-Goals

**Goals:**
- Reduce `index.js` NLOC from ~1393 to ~500-550 (below Lizard threshold)
- Extract 6 custom hooks and 1 component with clean, documented interfaces
- Preserve all existing behavior — zero functional changes
- Make each extracted concern independently testable

**Non-Goals:**
- Changing state management (e.g. adding React Context or Redux) — keep Jotai atoms in the orchestrator
- Extracting `load()`/`reload()`/`updateIndex()` — these are the orchestration core and too tightly coupled to extract cleanly
- Extracting search logic — depends on too many callbacks (`reload`, `setPhotosList`, `setActiveSegment`, etc.) making extraction a net negative for readability
- Adding TypeScript to extracted files — follow the existing JS convention
- Changing the component tree or prop interfaces of already-extracted components

## Decisions

### 1. Hook files go in `src/screens/PhotosList/hooks/`

**Rationale**: Keeps hooks co-located with the screen they serve, mirroring the existing `components/` and `upload/` directories. Avoids polluting a global hooks directory with screen-specific logic.

**Alternative considered**: Global `src/hooks/` directory — rejected because these hooks are tightly coupled to PhotosList concerns (expansion IDs, masonry refs) and not reusable elsewhere.

### 2. Each hook receives dependencies via a params object

**Rationale**: Every hook takes a single `{ ... }` params object rather than positional arguments. This makes call sites self-documenting and allows adding/removing dependencies without breaking the signature.

```javascript
const { location, initLocation } = useLocationInit({ toastTopOffset })
```

### 3. Hooks return a flat object of values and callbacks

**Rationale**: Consistent return shape across all hooks. Callers destructure what they need. No nested objects or arrays.

```javascript
const { expandedPhotoIds, handlePhotoToggle, isPhotoExpanded, ... } = usePhotoExpansion({ ... })
```

### 4. `renderCustomHeader` becomes `<PhotosListHeader />` component

**Rationale**: It's a 150-line render function with clear inputs (activeSegment, updateIndex, loading, theme, segmentWidth, styles) and no side effects. It's already a component in disguise.

**Alternative considered**: Keep as render function — rejected because extracting it gives the biggest single-file line-count reduction with the lowest coupling risk.

### 5. StyleSheet stays in `index.js`

**Rationale**: The `styles` object is created inside the component using the dynamic `theme`. Most styles are consumed by the render JSX in `index.js` and by `PhotosListHeader`. Extracting styles to a separate file would require passing the theme to a factory function — added complexity for no real benefit.

### 6. Module-level code stays in `index.js`

**Rationale**: `TaskManager.defineTask()`, `registerBackgroundFetchAsync()`, `BACKGROUND_TASK_NAME`, `FOOTER_HEIGHT`, `currentBatch`, and `QuickActionsModalWrapper` remain in `index.js`. They are module-level setup or tightly coupled to the orchestration flow.

## Risks / Trade-offs

**[Stale closure risk in extracted hooks]** → Hooks that use refs (e.g. `usePhotoExpansion` with `lastExpandedIdRef`, `scrollingInProgressRef`) must be careful about closure captures. Mitigation: keep refs as local to the hook, pass stable callbacks rather than state values.

**[Increased import boilerplate]** → `index.js` will import 6 hooks + 1 component. Mitigation: acceptable trade-off for clarity; each import is a named, documented concern.

**[Coordinated state between hooks]** → `usePhotoExpansion` needs `segmentConfig` which depends on `activeSegment` from the orchestrator, and `photosList` from Jotai. Mitigation: pass these as params; the orchestrator remains the single source of truth for shared state.

**[Testing gap]** → Currently no unit tests for the logic being extracted. Mitigation: extraction enables testing but doesn't require tests in this change. Tests can be added incrementally.
