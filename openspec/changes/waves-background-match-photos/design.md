## Context

The WavesHub screen (`src/screens/WavesHub/index.js`) and PhotosList screen (`src/screens/PhotosList/index.js`) are the two primary content browsing screens. PhotosList uses `theme.INTERACTIVE_BACKGROUND` for its container, providing a subtle warm coral-tinted background that gives better visual contrast with content thumbnails and cards. WavesHub currently uses `theme.BACKGROUND` (plain white/dark), creating a noticeable visual difference when navigating between the two screens.

## Goals / Non-Goals

**Goals:**
- Make the WavesHub container background match the PhotosList container background by using the same `theme.INTERACTIVE_BACKGROUND` token

**Non-Goals:**
- Changing PhotosList background
- Introducing new theme tokens
- Changing any other screen backgrounds

## Decisions

### 1. Use `theme.INTERACTIVE_BACKGROUND` for WavesHub container
**Rationale**: PhotosList deliberately chose `INTERACTIVE_BACKGROUND` with a comment noting "Much darker background for high contrast with ExpandableThumb." The same reasoning applies to WavesHub, which also displays content thumbnails in wave cards. Using the same token ensures both screens share identical backgrounds in both light and dark modes.

## Risks / Trade-offs

- **[Minimal risk]** → Single-token swap in one file. No other code references the WavesHub container background.
