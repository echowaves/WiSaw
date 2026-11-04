#!/bin/bash
# Regenerate every derived brand asset from the master logo.
#
#   wisaw-logo.png    master artwork (never referenced by app code)
#   icon.png          iOS / general app icon, full-bleed artwork, opaque
#   adaptive-icon.png Android adaptive foreground, same artwork
#   splash.png        splash emblem centred on transparent canvas
#   favicon.png       web favicon
#   wisaw-mark.png    soft-edged tile badge used by in-app <Image> branding
#
# Requires ImageMagick 7. Run from the repo root:
#   bash assets/brand/build-brand-assets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
M="$ROOT/assets/brand/wisaw-logo.png"
A="$ROOT/assets"
B="$ROOT/assets/brand"
WORK="$(mktemp -d -t wisaw-brand)"
trap 'rm -rf "$WORK"' EXIT
MASK="$WORK/mask.png"
EMBLEM="$WORK/emblem.png"

# Soft-edged badge: the whole tile, its alpha feathered to nothing just inside
# the artwork's own rounded corners so small-size uses (splash emblem, favicon,
# in-app mark) blend into any background instead of showing a hard box seam.
# The feather mask must be written out as a matte-free grayscale file first --
# an inline gradient carries an opaque matte, which CopyOpacity then copies as
# "fully opaque" and ImageMagick discards the alpha channel entirely.
magick -size 1254x1254 xc:black \
  -fill white -draw "roundrectangle 36,36 1217,1217 190,190" \
  -alpha off -blur 0x38 "$MASK"
magick "$M" "$MASK" -compose CopyOpacity -composite -depth 8 "$EMBLEM"

# App icon and Android adaptive foreground: artwork full-bleed, opaque.
magick "$M" -resize 1024x1024 -background black -flatten -alpha off -depth 8 "$A/icon.png"
cp "$A/icon.png" "$A/adaptive-icon.png"

# Web favicon, and the in-app mark at 4x the largest rendered size (72pt).
magick "$EMBLEM" -resize 48x48 -depth 8 "$A/favicon.png"
magick "$EMBLEM" -resize 256x256 -depth 8 "$B/wisaw-mark.png"

# Splash: emblem centred on transparent; the navy field comes from
# splash.backgroundColor in app.config.js.
magick -size 1242x2436 xc:none \
  \( "$EMBLEM" -resize 620x620 \) -gravity center -composite -depth 8 "$A/splash.png"
