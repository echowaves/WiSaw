/**
 * Guards the fills behind iOS shadow rendering: Fabric can only build an
 * efficient shadowPath when a shadowed view's own background is opaque, so the
 * theme surfaces that carry shadows must stay alpha-1 — and swapping them from
 * translucent to opaque must not move a single pixel.
 */
/* eslint-env jest */
const fs = require('fs')
const path = require('path')
const {
  parseColor,
  composite,
  contrast,
  loadThemeTokens
} = require('../../../scripts/theme-contrast-audit.js')

const root = path.join(__dirname, '..', '..', '..')
const readSrc = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')

const { light, dark } = loadThemeTokens()
const toHex = (c) =>
  '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

// Reads one style block out of a source file by brace matching, so commented-out
// styles elsewhere in the file can neither satisfy nor break an assertion.
const styleBlock = (rel, key) => {
  const src = readSrc(rel)
  const start = src.indexOf(`${key}: {`)
  if (start < 0) throw new Error(`${key} not found in ${rel}`)
  let depth = 0
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++
    if (src[i] === '}') depth--
    if (depth === 0) return src.slice(start, i + 1)
  }
  throw new Error(`unbalanced braces in ${key} of ${rel}`)
}

// Same brace matching for an inline style object, found by a needle inside it.
const blockAround = (rel, needle) => {
  const src = readSrc(rel)
  const at = src.indexOf(needle)
  if (at < 0) throw new Error(`${needle} not found in ${rel}`)
  let depth = 0
  let start = -1
  for (let i = at; i >= 0; i--) {
    if (src[i] === '}') depth++
    if (src[i] === '{' && depth === 0) { start = i; break }
    if (src[i] === '{') depth--
  }
  if (start < 0) throw new Error(`no opening brace before ${needle} in ${rel}`)
  depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1)
  }
  throw new Error(`unbalanced braces in ${rel}`)
}

// Resolves a style block's own backgroundColor expression to a colour, so its
// alpha can be checked. Supports `theme.TOKEN` (also named `currentTheme`),
// string literals and the `${theme.TOKEN}<aa>` tint form; anything else
// resolves to null, which callers treat as a failure.
const THEME_REF = String.raw`(?:theme|currentTheme)\.([A-Za-z0-9_]+)`
const declaredFill = (block, theme) => {
  const m = /backgroundColor:\s*([^,\n]+)/.exec(block)
  if (!m) return null
  const expr = m[1].trim()
  const token = new RegExp(`^${THEME_REF}$`).exec(expr)
  if (token) return parseColor(theme[token[1]])
  const literal = /^['"]([^'"]+)['"]$/.exec(expr)
  if (literal) return parseColor(literal[1])
  const tint = new RegExp(`^\`\\$\\{${THEME_REF}\\}([0-9A-Fa-f]{2})\`$`).exec(expr)
  if (tint) return parseColor(`${theme[tint[1]]}${tint[2]}`)
  return null
}

describe('card and disabled surfaces are opaque', () => {
  it('light CARD_BACKGROUND is fully opaque', () => {
    expect(parseColor(light.CARD_BACKGROUND).a).toBe(1)
  })

  it('dark disabledBackground is fully opaque', () => {
    expect(parseColor(dark.disabledBackground).a).toBe(1)
  })

  // The photo action card fills with SURFACE and inherits the card preset's
  // shadow, so this surface needs the same alpha-1 treatment as the cards.
  it('SURFACE is fully opaque in both themes', () => {
    expect(parseColor(light.SURFACE).a).toBe(1)
    expect(parseColor(dark.SURFACE).a).toBe(1)
  })

  // actionButton renders on CARD_BACKGROUND (expanded card) and SURFACE (action
  // card). Equal in light mode means one chip fill is exact on both hosts there.
  it('light SURFACE equals CARD_BACKGROUND so the shared chip stays exact', () => {
    expect(toHex(parseColor(light.SURFACE))).toBe(toHex(parseColor(light.CARD_BACKGROUND)))
  })
})

describe('opaque swaps preserve the painted colour', () => {
  it('light card paints what rgba(255,255,255,0.95) over the page used to', () => {
    const before = composite(parseColor('rgba(255, 255, 255, 0.95)'), parseColor(light.BACKGROUND))
    expect(toHex(before)).toBe(toHex(parseColor(light.CARD_BACKGROUND)))
  })

  it('dark disabled surface paints what rgba(255,255,255,0.1) over the page used to', () => {
    const before = composite(parseColor('rgba(255, 255, 255, 0.1)'), parseColor(dark.BACKGROUND))
    expect(toHex(before)).toBe(toHex(parseColor(dark.disabledBackground)))
  })

  it('dark disabled label keeps its contrast ratio', () => {
    const before = composite(parseColor('rgba(255, 255, 255, 0.1)'), parseColor(dark.BACKGROUND))
    expect(contrast(parseColor(dark.TEXT_DISABLED), before)).toBeCloseTo(
      contrast(parseColor(dark.TEXT_DISABLED), parseColor(dark.disabledBackground)),
      4
    )
  })
})

describe('shadows are gone from surfaces that stay translucent by design', () => {
  // [file, style key, fill that must survive] — blocks are read by brace
  // matching (see styleBlock), so commented-out styles elsewhere in the file
  // can neither satisfy nor break the assertion.
  const scrimStyles = [
    ['src/components/ui/CloseButton.js', 'button', 'rgba(0, 0, 0, 0.6)'],
    ['src/components/Photo/PinchableView.js', 'headerButton', 'rgba(0, 0, 0, 0.6)'],
    ['src/components/ModernHeaderButton/index.js', 'button', 'rgba(255, 255, 255, 0.9)']
  ]

  it.each(scrimStyles)('%s › %s keeps its fill and drops the shadow', (rel, key, fill) => {
    const block = styleBlock(rel, key)
    expect(block).toContain(fill)
    expect(block).not.toMatch(/\bshadow(Color|Opacity|Radius)\s*:/)
  })

  it('a framed photo gets an opaque fill behind its shadow', () => {
    const block = styleBlock('src/screens/ModalInputText/index.js', 'photoContainer')
    expect(block).toMatch(/\bshadowOpacity\s*:/)
    // BACKGROUND, not CARD_BACKGROUND: the box renders bare while the thumb is
    // missing or loading, over a container already painted with BACKGROUND.
    expect(block).toMatch(/backgroundColor:\s*currentTheme\.BACKGROUND\b/)
    expect(declaredFill(block, dark)).not.toBeNull()
    expect(declaredFill(block, dark).a).toBe(1)
  })
})

describe('the four shadowed photo chips keep their glow on an opaque fill', () => {
  // [file, style key, chip token, tint token] — parents are CARD_BACKGROUND.
  const chipStyles = [
    ['src/components/PhotoActionButtons/index.js', 'actionButton', 'CHIP_SUCCESS_FILL', 'STATUS_SUCCESS'],
    ['src/components/Photo/index.js', 'addCommentButton', 'CHIP_SUCCESS_FILL', 'STATUS_SUCCESS'],
    ['src/components/Photo/index.js', 'aiTag', 'CHIP_SUCCESS_FILL', 'STATUS_SUCCESS'],
    ['src/components/Photo/index.js', 'aiModerationTag', 'CHIP_ERROR_FILL', 'STATUS_ERROR']
  ]

  it.each(['CHIP_SUCCESS_FILL', 'CHIP_ERROR_FILL'])('%s is opaque in both themes', (name) => {
    expect(parseColor(light[name]).a).toBe(1)
    expect(parseColor(dark[name]).a).toBe(1)
  })

  // Recomputed from live tokens, so a future STATUS_* or CARD_BACKGROUND edit
  // that drifts away from the painted colour fails here rather than shipping.
  it.each(chipStyles)('%s › %s fills with the exact composite of its old tint', (rel, key, chip, tint) => {
    for (const theme of [light, dark]) {
      const before = composite(parseColor(`${theme[tint]}15`), parseColor(theme.CARD_BACKGROUND))
      expect(toHex(parseColor(theme[chip]))).toBe(toHex(before))
    }
  })

  // Fabric only builds a shadowPath when the shadowed view's own fill is alpha-1.
  it.each(chipStyles)('%s › %s pairs its shadow with an opaque fill', (rel, key, chip) => {
    for (const theme of [light, dark]) {
      const block = styleBlock(rel, key)
      expect(block).toMatch(/\bshadowColor\s*:/)
      expect(block).toContain(`backgroundColor: theme.${chip}`)
      const fill = declaredFill(block, theme)
      expect(fill).not.toBeNull()
      expect(fill.a).toBe(1)
    }
  })
})

describe('a card painted over an image keeps its shadow on an opaque fill', () => {
  // The animated masonry thumb styles inline; the expanded card styles by key.
  const cardsOverImage = [
    ['src/components/ExpandableThumb/index.js', "shadowColor: '#000'"],
    ['src/components/Photo/index.js', 'expandedCardContainer']
  ]

  it.each(cardsOverImage)('%s › %s pairs its shadow with an opaque fill', (rel, anchor) => {
    const block = anchor.includes('shadowColor') ? blockAround(rel, anchor) : styleBlock(rel, anchor)
    expect(block).toMatch(/\bshadow(Color|Opacity)\s*:/)
    for (const theme of [light, dark]) {
      const fill = declaredFill(block, theme)
      expect(fill).not.toBeNull()
      expect(fill.a).toBe(1)
    }
  })
})
