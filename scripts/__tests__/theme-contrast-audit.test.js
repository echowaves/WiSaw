/**
 * Guards the audit tool itself — `npm run audit:theme` is only worth having if the
 * colour math and the token-parity rule underneath it keep working.
 */
/* eslint-env jest */
const {
  parseColor,
  composite,
  contrast,
  loadThemeTokens,
  resolveSite,
  auditParity,
  auditTokenRefs,
  tokenPairFinding,
  surfacesFor
} = require('../theme-contrast-audit.js')

describe('parseColor', () => {
  it('reads hex, rgba and named colours', () => {
    expect(parseColor('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })

  it('rejects values that are not colours', () => {
    expect(parseColor('theme.TEXT_PRIMARY')).toBeNull()
    expect(parseColor(undefined)).toBeNull()
    expect(parseColor('rgba(a, b, c)')).toBeNull()
  })
})

describe('contrast and composite', () => {
  it('matches WCAG at the extremes', () => {
    expect(contrast(parseColor('#000000'), parseColor('#FFFFFF'))).toBeCloseTo(21, 1)
    expect(contrast(parseColor('#FFFFFF'), parseColor('#FFFFFF'))).toBeCloseTo(1, 5)
  })

  it('alpha-composites a translucent colour over its base', () => {
    const half = composite(parseColor('rgba(0, 0, 0, 0.5)'), parseColor('#FFFFFF'))
    expect(half.r).toBe(128) // Math.round(127.5)
    expect(half.a).toBe(1)
  })

  it('scores a translucent white on white as unreadable', () => {
    const bg = parseColor('#FFFFFF')
    const fg = composite(parseColor('rgba(255, 255, 255, 0.4)'), bg)
    expect(contrast(fg, bg)).toBeLessThan(1.6)
  })
})

describe('resolveSite', () => {
  const tokens = loadThemeTokens()

  it('resolves literals, CONST and theme references', () => {
    // style values arrive as source text, so a literal still carries its quotes
    expect(resolveSite('"#FFFFFF"', tokens).light).toBe('#FFFFFF')
    expect(resolveSite('CONST.TEXT_COLOR', tokens).light).toBe(tokens.consts.TEXT_COLOR)
    const themed = resolveSite('theme.TEXT_PRIMARY', tokens)
    expect(themed.light).toBe(tokens.light.TEXT_PRIMARY)
    expect(themed.dark).toBe(tokens.dark.TEXT_PRIMARY)
  })

  it('returns null for dynamic or unknown expressions', () => {
    expect(resolveSite('styles.foo', tokens)).toBeNull()
    expect(resolveSite('theme.NOT_A_TOKEN', tokens)).toBeNull()
  })
})

describe('auditParity', () => {
  const tokens = loadThemeTokens()

  it('reports nothing while both tables expose the same keys', () => {
    expect(auditParity(tokens.light, tokens.dark)).toHaveLength(0)
  })

  it('flags a token defined in only one table as invisible', () => {
    const findings = auditParity({ TEXT_LINK: '#0B6FE0' }, {})
    expect(findings).toHaveLength(1)
    expect(findings[0].severity).toBe('invisible')
    expect(findings[0].name).toContain('TEXT_LINK')
  })
})

describe('auditTokenRefs', () => {
  const tokens = loadThemeTokens()

  // the gate's second blocking class: every theme.X read must exist in both tables
  it('finds no dangling theme reads anywhere in the app', () => {
    expect(auditTokenRefs(tokens)).toHaveLength(0)
  })
})

describe('tokenPairFinding', () => {
  const tokens = loadThemeTokens()
  const surface = surfacesFor(tokens.light).find((s) => s.name === 'BACKGROUND')

  it('is null while a token clears AA on its surface', () => {
    expect(tokenPairFinding('light', tokens.light, 'TEXT_PRIMARY', tokens.light.TEXT_PRIMARY, surface)).toBeNull()
  })

  it('calls an unreadable token invisible and a merely-weak one low', () => {
    const invisible = tokenPairFinding('light', tokens.light, 'FAKE', 'rgba(255, 255, 255, 0.3)', surface)
    expect(invisible.severity).toBe('invisible')
    expect(tokenPairFinding('light', tokens.light, 'FAKE', '#E8A0A0', surface).severity).toBe('low')
  })
})
