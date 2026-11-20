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

describe('card and disabled surfaces are opaque', () => {
  it('light CARD_BACKGROUND is fully opaque', () => {
    expect(parseColor(light.CARD_BACKGROUND).a).toBe(1)
  })

  it('dark disabledBackground is fully opaque', () => {
    expect(parseColor(dark.disabledBackground).a).toBe(1)
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
  // [file, style key] — the block is read by brace matching so commented-out
  // styles elsewhere in the file cannot satisfy or break the assertion.
  // [file, style key, fill that must survive] — the block is read by brace
  // matching so commented-out styles elsewhere cannot satisfy or break it.
  const scrimStyles = [
    ['src/components/ui/CloseButton.js', 'button', 'rgba(0, 0, 0, 0.6)'],
    ['src/components/Photo/PinchableView.js', 'headerButton', 'rgba(0, 0, 0, 0.6)'],
    ['src/components/ModernHeaderButton/index.js', 'button', 'rgba(255, 255, 255, 0.9)']
  ]

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

  it.each(scrimStyles)('%s › %s keeps its fill and drops the shadow', (rel, key, fill) => {
    const block = styleBlock(rel, key)
    expect(block).toContain(fill)
    expect(block).not.toMatch(/\bshadow(Color|Opacity|Radius)\s*:/)
  })

  it('a framed photo gets an opaque fill behind its shadow', () => {
    const src = readSrc('src/screens/ModalInputText/index.js')
    const block = src.slice(src.indexOf('photoContainer: {'), src.indexOf('photoContainer: {') + 300)
    expect(block).toMatch(/backgroundColor:\s*currentTheme\.CARD_BACKGROUND/)
  })
})
