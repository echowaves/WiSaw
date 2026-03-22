## Context

Three screens currently support long-press context menus for list items: PhotosList (photos), WavesHub (waves), and WaveDetail (photos). Each has evolved its own hint banner independently:

- **PhotosList**: Dark semi-transparent banner with bulb icon, "Long-press any photo for quick actions" text, ✕ close button. Uses SecureStore key `photoActionsHintShown`.
- **WavesHub**: Theme-colored tooltip with "Hold or tap ⋮ for options" text, dismisses on tap. Uses SecureStore key `waveContextMenuTooltipShown`.
- **WaveDetail**: No hint banner at all, despite having long-press photo interactions.

The three implementations differ in text, visual design, persistence keys, and dismiss behavior. This creates inconsistent UX and duplicated code.

## Goals / Non-Goals

**Goals:**
- Single shared `InteractionHintBanner` component that encapsulates all hint logic (visibility state, SecureStore persistence, dismiss behavior, styling)
- Consistent visual design and text across all screens
- Component is self-contained — screens render it without managing hint state
- Backward compatibility with legacy SecureStore keys so existing users who dismissed the hint don't see it again
- Add hint to WaveDetail which currently lacks one

**Non-Goals:**
- Changing the ⋮ pill/icon affordances on thumbnails or wave cards (those stay as-is)
- Adding hints to screens that don't have long-press menus
- Animating the banner appearance or dismissal

## Decisions

### 1. Self-contained component vs. shared hook
**Decision**: Self-contained component (`InteractionHintBanner`) that manages its own state internally.

**Rationale**: The hint banner is a pure UI concern with simple persistence logic. A component keeps everything co-located (state, effect, handler, JSX, styles) and makes the consumer API trivial — just `<InteractionHintBanner />`. A hook would still require each screen to manage JSX and styles separately, defeating the purpose.

**Alternative considered**: Custom hook `useInteractionHint()` returning `{ visible, dismiss }` — rejected because screens would still duplicate JSX/styles.

### 2. Single unified SecureStore key with backward compatibility
**Decision**: Write to `interactionHintShown`. On read, check all three keys (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`) — if ANY is set, consider hint shown.

**Rationale**: Existing users who dismissed either the PhotosList or WavesHub hint shouldn't see it again. Using Promise.all to check all three keys on mount handles all migration cases without a separate migration step.

### 3. Component placement
**Decision**: Each screen renders `<InteractionHintBanner />` inline, with a `hasContent` boolean prop to prevent showing the banner on empty lists.

**Rationale**: The banner needs to know if there's content to show it against. Rather than adding list-awareness to the component, a simple boolean prop lets the screen control this. The component handles everything else.

### 4. File location
**Decision**: `src/components/ui/InteractionHintBanner.js`

**Rationale**: Follows existing pattern — `src/components/ui/` already exists for small shared UI components. JavaScript (not TypeScript) matches the project convention for component files.

## Risks / Trade-offs

- [Three SecureStore reads on mount] → Minimal perf impact; reads are fast and run once via Promise.all. No mitigation needed.
- [Banner text may not perfectly describe all interaction types] → "Tap and hold for options or tap ⋮" is generic enough for photos and waves. Acceptable trade-off for consistency.
