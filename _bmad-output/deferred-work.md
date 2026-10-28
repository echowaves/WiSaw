# Deferred Work

Items noticed while working that are deliberately out of scope for the current change. Pick one up before starting a new change in the area it touches.

## `MAIN_COLOR` is orange but the brand mark is cyan

- **Raised:** 2026-10-27, during `plan-new-wisaw-logo-branding`.
- **What:** `src/consts.js:36` sets `MAIN_COLOR = '#EA5E3D'`, the app's primary interactive colour, and it is used for buttons, links and highlights throughout. The new WiSaw logo carries no orange at all — its accent is cyan `#26D1D3` on navy `#01122D`. Branding (icon, splash, adaptive icon, drawer mark, Terms hero) now reads cyan/navy while the UI chrome stays orange.
- **Why deferred:** re-tinting the app is a design decision with a theme-wide blast radius (theme tokens in `src/theme/`, contrast ratios for text and pressed states, possibly dark/light variants). The human on this change chose to keep orange and settle the palette separately.
- **Suggested first step:** get the brand palette confirmed, then change the theme token(s) rather than individual usages, and re-check contrast for `INTERACTIVE_PRIMARY` text-on-field pairs in both themes.

## Adaptive icon does not use Android's 66% safe zone

- **Raised:** 2026-10-27, during `plan-new-wisaw-logo-branding`.
- **What:** `assets/adaptive-icon.png` is the artwork full-bleed (identical to `assets/icon.png`), so the outermost bright pixel of the mark sits at r = 0.39 of the canvas — inside every standard launcher mask, but outside Google's conservative 66dp-of-108dp safe zone. Padding it instead produces a visible rounded-square seam because the artwork ships its own dark tile and corner vignette.
- **Why deferred:** the clean fix is a designer-supplied adaptive foreground (mark on a flat field with no baked-in tile). Doing it mechanically in ImageMagick looked worse than full-bleed.
- **Suggested first step:** ask for an "adaptive" export from whoever produced `wisaw_logo.png`; if one arrives, drop it in as `assets/adaptive-icon.png` and keep `BRAND_FIELD` as `backgroundColor`.
