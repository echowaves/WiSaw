#!/usr/bin/env node
/*
 * Theme contrast audit.
 *
 * Finds text that would be invisible (or barely visible) in light or dark mode:
 *  - token pairs inside LIGHT_THEME / DARK_THEME that fail WCAG AA,
 *  - hardcoded colours used for text or backgrounds outside the theme tokens,
 *    measured against every surface they can land on.
 *
 * Usage: node scripts/theme-contrast-audit.js [--json] [--strict]
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const THEME_FILE = 'src/theme/sharedStyles.js'
const CONSTS_FILE = 'src/consts.js'
const SCAN_DIRS = ['app', 'src']
const SKIP_DIR_NAMES = new Set(['node_modules', '__tests__', 'assets', '.expo'])

const AA_TEXT = 4.5
const INVISIBLE = 1.6 // near-identical foreground/background

const NAMED_COLORS = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  transparent: null
}

/* ---------------------------------- colour math --------------------------------- */

function hexToRgba (hex) {
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length === 4) h = h.split('').map((c) => c + c).join('') + 'ff'
  if (h.length === 6) h += 'ff'
  if (h.length !== 8) return null
  const num = parseInt(h.slice(0, 6), 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: parseInt(h.slice(6, 8), 16) / 255 }
}

function parseRgba (v) {
  const m = /^rgba?\(([^)]+)\)$/.exec(v)
  if (!m) return null
  const parts = m[1].split(/[,/\s]+/).filter(Boolean).map(Number)
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 }
}

function parseColor (value) {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (v.startsWith('#')) return hexToRgba(v)
  if (NAMED_COLORS[v] !== undefined) return NAMED_COLORS[v] === null ? null : parseColor(NAMED_COLORS[v])
  return parseRgba(v)
}

// Alpha-composite `fg` over opaque base `bg`.
function composite (fg, bg) {
  if (!fg) return null
  if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 }
  const k = fg.a
  return {
    r: Math.round(k * fg.r + (1 - k) * bg.r),
    g: Math.round(k * fg.g + (1 - k) * bg.g),
    b: Math.round(k * fg.b + (1 - k) * bg.b),
    a: 1
  }
}

function channelLuminance (c8) {
  const c = c8 / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance (color) {
  return 0.2126 * channelLuminance(color.r) + 0.7152 * channelLuminance(color.g) + 0.0722 * channelLuminance(color.b)
}

function contrast (a, b) {
  if (!a || !b) return null
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Contrast of a possibly translucent colour over each candidate base, worst case kept.
/* --------------------------------- token loading -------------------------------- */

function loadConsts () {
  const src = fs.readFileSync(path.join(ROOT, CONSTS_FILE), 'utf8')
  const consts = {}
  const re = /^export const ([A-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]/gm
  let m
  while ((m = re.exec(src)) !== null) consts[m[1]] = m[2]
  return consts
}

function resolveValue (raw, consts) {
  const ref = /^CONST\.([A-Z0-9_]+)$/.exec(raw.trim())
  if (ref) return consts[ref[1]] || null
  const quoted = /^['"]([^'"]+)['"].*$/.exec(raw.trim())
  return quoted ? quoted[1] : null
}

function extractBlock (src, name) {
  const start = src.indexOf(`export const ${name} = {`)
  if (start === -1) throw new Error(`missing export: ${name}`)
  const end = src.indexOf('\n}', start)
  return src.slice(start, end).replace(/\/\/[^\n]*/g, '')
}

function loadThemeTokens () {
  const consts = loadConsts()
  const src = fs.readFileSync(path.join(ROOT, THEME_FILE), 'utf8')
  const read = (blockName) => {
    const block = extractBlock(src, blockName)
    const tokens = {}
    const re = /^ {2}([A-Za-z0-9_]+):\s*(.+?),?\s*$/gm
    let m
    while ((m = re.exec(block)) !== null) {
      const value = resolveValue(m[2], consts)
      if (value !== null) tokens[m[1]] = value
    }
    return tokens
  }
  return { light: read('LIGHT_THEME'), dark: read('DARK_THEME'), consts }
}

const SURFACE_NAMES = ['BACKGROUND', 'CARD_BACKGROUND', 'SURFACE', 'HEADER_BACKGROUND', 'INTERACTIVE_BACKGROUND',
  'STATUS_ERROR_BACKGROUND', 'STATUS_SUCCESS_BACKGROUND', 'STATUS_PENDING_BACKGROUND', 'helpCardBackground',
  'inputFooterBackground', 'disabledBackground', 'interactiveBackground']

// Translucent surfaces are flattened over the mode's own BACKGROUND, which is opaque in both modes.
function surfacesFor (tokens) {
  const base = parseColor(tokens.BACKGROUND) || { r: 255, g: 255, b: 255, a: 1 }
  const surfaces = []
  for (const name of SURFACE_NAMES) {
    const value = tokens[name]
    if (!value) continue
    const color = parseColor(value)
    if (!color) continue
    surfaces.push({ name, color: composite(color, base) || base })
  }
  return surfaces
}

/* --------------------------------- token audit ---------------------------------- */

const TEXT_TOKENS = ['TEXT_PRIMARY', 'TEXT_SECONDARY', 'TEXT_DISABLED', 'TEXT_PLACEHOLDER', 'STATUS_SUCCESS',
  'STATUS_EDIT', 'STATUS_WARNING', 'STATUS_ERROR', 'STATUS_CAUTION', 'STATUS_PENDING_TEXT', 'INTERACTIVE_PRIMARY']

// TEXT_ON_PRIMARY is drawn on a solid brand fill, which the source-pair audit measures.
const SKIPPED_TEXT_TOKENS = new Set(['TEXT_ON_PRIMARY'])

// A status colour never shares a chip with another status's tinted background, so those pairs are not reachable.
const STATUS_TINT_OWNER = {
  STATUS_ERROR: 'STATUS_ERROR_BACKGROUND',
  STATUS_SUCCESS: 'STATUS_SUCCESS_BACKGROUND',
  STATUS_PENDING_TEXT: 'STATUS_PENDING_BACKGROUND'
}

function pairable (fgName, surfaceName) {
  if (!surfaceName.startsWith('STATUS_')) return true
  return STATUS_TINT_OWNER[fgName] === surfaceName
}

// A token is only a real text-contrast problem where the app actually paints it as text.
function tokensUsedAsText () {
  const used = new Set(['TEXT_PRIMARY', 'TEXT_SECONDARY', 'TEXT_DISABLED'])
  const files = SCAN_DIRS.flatMap((d) => walkFiles(path.join(ROOT, d), []))
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8')
    const re = /\b(?:color|placeholderTextColor)\s*:\s*(?:theme|currentTheme|t)\.([A-Z0-9_]+)/g
    let m
    while ((m = re.exec(src)) !== null) used.add(m[1])
  }
  return used
}

/**
 * Light and dark token tables must expose the same keys. A key present in one
 * table only resolves to `undefined` in the other mode, so any text or icon
 * using it silently falls back to a platform default colour — the classic way
 * a fix for one mode creates an invisible-text bug in the other.
 */
/**
 * Every `theme.KEY` read in the app must exist in both token tables. A typo or a
 * token dropped from one table resolves to `undefined`, and React Native then
 * paints that text or icon with its platform default colour — invisible in one
 * mode, and silent at build time.
 */
function isThemeTokenRead (n) {
  if (n.type !== 'MemberExpression' || n.computed) return false
  if (n.object.type !== 'Identifier' || !THEME_OBJECT_NAMES.has(n.object.name)) return false
  return n.property.type === 'Identifier' && /^[A-Z][A-Z0-9_]*$/.test(n.property.name)
}

function tokenRefFinding (n, file, light, dark) {
  if (!isThemeTokenRead(n)) return null
  const key = n.property.name
  const missing = [!(key in light) ? 'LIGHT_THEME' : null, !(key in dark) ? 'DARK_THEME' : null].filter(Boolean)
  if (missing.length === 0) return null
  return {
    file: path.relative(ROOT, file),
    line: n.loc.start.line,
    name: `${n.object.name}.${key}`,
    fg: '(unknown token)',
    fgValue: 'undefined',
    bg: '(fallback)',
    bgValue: 'platform default',
    ratio: null,
    required: null,
    severity: 'invisible',
    detail: `theme.${key} is not defined in ${missing.join(' and ')} — resolves to undefined`
  }
}

function auditTokenRefs ({ light, dark }) {
  const findings = []
  for (const file of SCAN_DIRS.flatMap((d) => walkFiles(path.join(ROOT, d), []))) {
    const src = fs.readFileSync(file, 'utf8')
    if (!/\b(?:theme|currentTheme|themedTheme)\s*\.\s*[A-Z]/.test(src)) continue
    const ast = parseSource(file, src)
    if (!ast) continue
    traverseAst(ast, (p) => {
      const finding = tokenRefFinding(p.node, file, light, dark)
      if (finding) findings.push(finding)
    })
  }
  return findings
}

function auditParity (light, dark) {
  const findings = []
  const modes = [['DARK_THEME', light, dark], ['LIGHT_THEME', dark, light]]
  for (const [missingIn, against, table] of modes) {
    for (const key of Object.keys(against)) {
      if (!(key in table)) {
        findings.push({
          file: 'src/theme/sharedStyles.js',
          line: 0,
          name: `${key} (${missingIn})`,
          fg: '(missing token)',
          fgValue: 'undefined',
          bg: '(fallback)',
          bgValue: 'platform default',
          ratio: null,
          required: null,
          severity: 'invisible',
          detail: `defined in the other table only — resolves to undefined in ${missingIn}`
        })
      }
    }
  }
  return findings
}

function textTokenFindings (mode, tokens, fgName, fgValue, surfaces) {
  const out = []
  for (const surface of surfaces) {
    if (!pairable(fgName, surface.name)) continue
    const finding = tokenPairFinding(mode, tokens, fgName, fgValue, surface)
    if (finding) out.push(finding)
  }
  return out
}

function tokenPairFinding (mode, tokens, fgName, fgValue, surface) {
  const ratio = contrast(composite(parseColor(fgValue), surface.color), surface.color)
  if (ratio === null || ratio >= AA_TEXT) return null
  return {
    kind: 'token',
    mode,
    file: THEME_FILE,
    detail: `${fgName} on ${surface.name}`,
    fg: fgValue,
    bg: tokens[surface.name],
    ratio: Number(ratio.toFixed(2)),
    severity: ratio < INVISIBLE ? 'invisible' : 'low'
  }
}

function auditTokens ({ light, dark }, usedAsText) {
  const findings = []
  for (const [mode, tokens] of [['light', light], ['dark', dark]]) {
    const surfaces = surfacesFor(tokens)
    for (const fgName of TEXT_TOKENS) {
      if (!usedAsText.has(fgName) || SKIPPED_TEXT_TOKENS.has(fgName)) continue
      const fgValue = tokens[fgName]
      if (!fgValue) continue
      findings.push(...textTokenFindings(mode, tokens, fgName, fgValue, surfaces))
    }
  }
  return findings
}

/* --------------------------------- source scan ---------------------------------- */

function walkFiles (dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIR_NAMES.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(full, out)
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

function lineOf (src, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (src[i] === '\n') line++
  return line
}

// Resolve one style-prop value into the colour it paints in each mode.
function literalColorSite (label, value) {
  if (!parseColor(value)) return null
  return { label, light: value, dark: value }
}

function themedColorSite (key, tokens) {
  const light = tokens.light[key]
  const dark = tokens.dark[key]
  if (!light || !dark) return null
  return { label: `theme.${key}`, light, dark }
}

function resolveSite (raw, tokens) {
  const quoted = /^(['"])([^'"]*)\1$/.exec(raw)
  if (quoted) return literalColorSite(quoted[2], quoted[2])
  const constRef = /^CONST\.([A-Z0-9_]+)$/.exec(raw)
  if (constRef) {
    const value = tokens.consts[constRef[1]]
    return value ? literalColorSite(`CONST.${constRef[1]}`, value) : null
  }
  const themeRef = /^(?:theme|currentTheme|themedTheme|t)\.([A-Z0-9_]+)$/i.exec(raw)
  if (themeRef) return themedColorSite(themeRef[1], tokens)
  // `import { MAIN_COLOR } from '../consts'` — a bare name that mirrors a CONST key.
  const bare = /^[A-Z][A-Z0-9_]*$/.exec(raw)
  if (bare && tokens.consts[bare[0]]) {
    const value = tokens.consts[bare[0]]
    return { label: raw, light: value, dark: value }
  }
  return null
}

/* --------------------------- JSX surface resolution ---------------------------- *
 * Lexical proximity cannot tell which View a Text sits on, so the source audit
 * parses each file and resolves every foreground against the background chain of
 * its real JSX ancestors (falling back to the app root surface).
 */

const parser = require('@babel/parser')

/** Babel names object-literal members `ObjectProperty`; ESTree callers say `Property`. */
const isObjectProp = (node) => node?.type === 'ObjectProperty' || node?.type === 'Property'

const FG_ATTRS = new Set(['color', 'tintColor', 'iconColor', 'placeholderTextColor'])
const BG_KEYS = new Set(['backgroundColor', 'background'])
const STYLE_FACTORY = /[Ss]tyles$/

function parseSource (file, src) {
  const plugins = ['jsx']
  if (/\.tsx?$/.test(file)) plugins.push('typescript')
  try {
    return parser.parse(src, { sourceType: 'module', plugins, errorRecovery: true })
  } catch {
    return null
  }
}

/** Source text for the colour a style expression evaluates to, or null if dynamic. */
const EXPR_SOURCES = {
  StringLiteral: (n) => JSON.stringify(n.value),
  TemplateLiteral: (n) => (n.expressions.length === 0 ? JSON.stringify(n.quasis[0].value.cooked) : null),
  Identifier: (n) => n.name,
  MemberExpression: (n) =>
    (!n.computed && n.object.type === 'Identifier' ? `${n.object.name}.${n.property.name ?? n.property.value}` : null),
  LogicalExpression: (n) => exprSource(n.right),
  ConditionalExpression: (n) => exprSource(n.alternate) ?? exprSource(n.consequent)
}

function exprSource (node) {
  if (!node) return null
  const handler = EXPR_SOURCES[node.type]
  return handler ? handler(node) : null
}

/** Foreground/background props written directly in a style object literal. */
function stylePropEntry (p) {
  if (!isObjectProp(p) || p.key.type !== 'Identifier') return null
  if (!BG_KEYS.has(p.key.name) && !FG_ATTRS.has(p.key.name)) return null
  const raw = exprSource(p.value)
  return raw === null ? null : [p.key.name, raw]
}

function literalStyleProps (obj) {
  const props = new Map()
  if (!obj || obj.type !== 'ObjectExpression') return props
  for (const p of obj.properties) {
    const entry = stylePropEntry(p)
    if (entry) props.set(entry[0], entry[1])
  }
  return props
}

function flattenSheet (obj, prefix = '', out = new Map()) {
  for (const p of obj.properties) {
    if (!isObjectProp(p) || p.key.type !== 'Identifier') continue
    const name = prefix ? `${prefix}.${p.key.name}` : p.key.name
    if (p.value.type === 'ObjectExpression') {
      const own = literalStyleProps(p.value)
      if (own.size > 0) out.set(name, own)
      flattenSheet(p.value, name, out)
    }
  }
  return out
}

/** Named style objects: `StyleSheet.create({...})` and `const xStyles = (t) => ({...})`. */
function isStyleSheetCreate (node) {
  return node?.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
    node.callee.object?.name === 'StyleSheet' && node.callee.property?.name === 'create'
}

function collectSheets (path) {
  const node = path.node
  if (node.type !== 'VariableDeclarator' || node.id.type !== 'Identifier') return null
  const init = node.init
  if (!init) return null
  const direct = sheetObjectFrom(init)
  if (direct && isStyleSheetCreate(init)) return [node.id.name, flattenSheet(direct)]
  if (STYLE_FACTORY.test(node.id.name)) {
    const obj = sheetObjectFrom(init)
    if (obj) return [node.id.name, flattenSheet(obj)]
  }
  return null
}

/**
 * `const styles = getStyles(theme)` — a component-local name for a sheet factory.
 * Without this, `styles.title` cannot be looked up and every surface falls back to
 * the app root, which produces false "invisible" reports.
 */
function collectSheetAlias (path, factories) {
  const node = path.node
  if (node.type !== 'VariableDeclarator' || node.id.type !== 'Identifier') return null
  if (node.init?.type !== 'CallExpression' || node.init.callee?.type !== 'Identifier') return null
  if (!factories.has(node.init.callee.name)) return null
  return [node.id.name, node.init.callee.name]
}

function fnBodyExpr (node) {
  if (node.body.type !== 'BlockStatement') return node.body
  return node.body.body.find((st) => st.type === 'ReturnStatement')?.argument
}

/** The object argument of a `StyleSheet.create(...)` or `useMemo(...)` call, else null. */
function callSheetArg (node) {
  if (isStyleSheetCreate(node)) return node.arguments[0]
  return node.callee.name === 'useMemo' ? node.arguments[0] : null
}

/** Unwraps `() => StyleSheet.create({...})`, `(t) => ({...})` and `useMemo(() => ({...}))`. */
function sheetObjectFrom (node, depth = 0) {
  if (!node || depth > 4) return null
  if (node.type === 'ObjectExpression') return node
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    return sheetObjectFrom(fnBodyExpr(node), depth + 1)
  }
  if (node.type === 'CallExpression') {
    const arg = callSheetArg(node)
    if (arg) return sheetObjectFrom(arg, depth + 1)
  }
  return null
}

/** Props a `style=` value yields; array entries later win, named sheets are looked up. */
function mergeProps (target, source) {
  for (const [k, v] of source) target.set(k, v)
  return target
}

// `styles.foo` / `themedStyles.bar.baz` — a lookup into a registered sheet.
function sheetRefProps (node, sheets) {
  const props = new Map()
  const ref = exprSource(node)
  if (!ref || !ref.includes('.')) return props
  const entry = sheets.get(ref.split('.')[0])?.get(ref.slice(ref.indexOf('.') + 1))
  return entry ? mergeProps(props, entry) : props
}

// `a ? styles.on : styles.off` and `a || styles.b` — either branch can paint.
function branchStyleProps (node, sheets, depth) {
  const props = new Map()
  for (const part of [node.consequent ?? node.left, node.alternate ?? node.right]) {
    mergeProps(props, styleProps(part, sheets, depth + 1))
  }
  return props
}

/** Props a `style=` value yields; array entries later win, named sheets are looked up. */
function styleProps (node, sheets, depth = 0) {
  const props = new Map()
  if (!node || depth > 5) return props
  if (node.type === 'ArrayExpression') {
    for (const el of node.elements) mergeProps(props, styleProps(el, sheets, depth + 1))
    return props
  }
  if (node.type === 'ObjectExpression') return literalStyleProps(node)
  if (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression') {
    return branchStyleProps(node, sheets, depth)
  }
  return sheetRefProps(node, sheets)
}

function attrValue (attrs, name) {
  for (const a of attrs) {
    if (a.type !== 'JSXAttribute' || a.name?.name !== name) continue
    if (a.value?.type === 'StringLiteral') return JSON.stringify(a.value.value)
    return exprSource(a.value?.expression)
  }
  return null
}

function styleExpr (attrs) {
  for (const a of attrs) {
    if (a.type === 'JSXAttribute' && a.name?.name === 'style') {
      return a.value?.type === 'JSXExpressionContainer' ? a.value.expression : null
    }
  }
  return null
}

/**
 * Nearest-first background chain above this element.
 * Returns null when the chain passes through a component prop (e.g. `icon={<Icon />}`
 * handed to a custom `<Button>`): the host picks the surface, which this file
 * cannot see, so the site is not ours to judge.
 */
function ancestorBackgrounds (jsxPath, sheets) {
  const chain = []
  let p = jsxPath.parentPath
  while (p) {
    if (p.node.type === 'JSXAttribute' && isCustomElement(ownerElement(p))) return null
    if (p.node.type === 'JSXElement') {
      const attrs = p.node.openingElement.attributes
      for (const [key, raw] of styleProps(styleExpr(attrs), sheets).entries()) {
        if (BG_KEYS.has(key) && raw !== "'transparent'") chain.push(raw)
      }
    }
    p = p.parentPath
  }
  return chain
}

/** The `<Foo>` an attribute belongs to; attributes hang off the opening element. */
function ownerElement (attrPath) {
  let p = attrPath
  while (p && p.node.type !== 'JSXElement') p = p.parentPath
  return p?.node
}

/** Built-in host elements are lowercase (`View`, `Text`); anything else is app code. */
function isCustomElement (jsxElementNode) {
  const name = jsxElementNode?.openingElement?.name
  if (!name) return false
  if (name.type === 'JSXIdentifier') return !/^[a-z]/.test(name.name)
  return true
}

/** Layers from nearest to farthest, stopping at the first opaque one. */
function resolvedLayers (chain, tokens) {
  const layers = []
  for (const raw of chain) {
    const layer = resolveSite(raw, tokens)
    if (!layer) continue // dynamic value: cannot reason about what it paints
    layers.push(layer)
    const color = parseColor(layer.light)
    if (color !== null && color.a >= 0.999) break
  }
  return layers
}

function compositeLayers (layers, mode, base) {
  let color = base
  for (const layer of [...layers].reverse()) {
    const parsed = parseColor(layer[mode])
    if (!parsed) return null
    color = composite(parsed, color)
  }
  return color
}

function layerLabel (layers, mode) {
  return layers.length > 0 ? layers.map((l) => l.label).join(' + ') : `${mode}.BACKGROUND`
}

/** Foregrounds an element paints itself: `style.color` plus colour-ish attributes. */
function foregroundsOf (attrs, sheets) {
  const found = []
  const props = styleProps(styleExpr(attrs), sheets)
  for (const key of ['color', 'placeholderTextColor']) {
    const raw = props.get(key)
    if (raw !== undefined) found.push({ prop: key, raw })
  }
  for (const attr of attrs) {
    if (attr.type !== 'JSXAttribute' || !FG_ATTRS.has(attr.name?.name)) continue
    const raw = attrValue(attrs, attr.name.name)
    if (raw !== null && raw !== props.get(attr.name.name)) found.push({ prop: attr.name.name, raw })
  }
  return found
}

/** The app root surface per mode: what text sees when no ancestor paints a background. */
function rootSurfaces (tokens) {
  const pick = (mode) => surfacesFor(tokens[mode]).find((s) => s.name === 'BACKGROUND')?.color
  return [
    { mode: 'light', base: pick('light') },
    { mode: 'dark', base: pick('dark') }
  ]
}

function jsxName (jsxPath) {
  const name = jsxPath.node.openingElement.name
  if (name.type === 'JSXIdentifier') return name.name
  if (name.type === 'JSXMemberExpression') return `${name.object.name}.${name.property.name}`
  return 'Element'
}

/** Worst ratio across the two modes for one foreground on one resolved stack. */
function measure (fg, layers, roots) {
  let worst = null
  for (const root of roots) {
    const fgColor = parseColor(fg[root.mode])
    const bg = compositeLayers(layers, root.mode, root.base)
    if (!fgColor || !bg) continue
    const ratio = contrast(composite(fgColor, root.base), bg)
    if (ratio === null) continue
    if (worst === null || ratio < worst.ratio) {
      worst = { ratio: Number(ratio.toFixed(2)), mode: root.mode, label: layerLabel(layers, root.mode) }
    }
  }
  return worst
}

function surfaceFindings (jsxPath, sheets, tokens, rel, roots) {
  const attrs = jsxPath.node.openingElement.attributes
  const name = jsxName(jsxPath)
  const chain = ancestorBackgrounds(jsxPath, sheets)
  if (chain === null) return [] // the host component paints this surface, not us
  const layers = resolvedLayers(chain, tokens)
  const findings = []
  for (const fg of foregroundsOf(attrs, sheets)) {
    const resolved = resolveSite(fg.raw, tokens)
    if (!resolved) continue
    const worst = measure(resolved, layers, roots)
    if (worst === null || worst.ratio >= AA_TEXT) continue
    findings.push({
      class: 'surface',
      file: rel,
      line: jsxPath.node.loc?.start.line ?? 0,
      mode: worst.mode,
      detail: `${name}.${fg.prop} ${resolved.label} on ${worst.label} (${worst.mode})`,
      fg: resolved[worst.mode],
      bg: worst.label,
      ratio: worst.ratio,
      severity: worst.ratio < INVISIBLE ? 'invisible' : 'low'
    })
  }
  return findings
}

/** `--explain src/foo.js:41` prints how the resolver sees one element. */
function explain (spec, tokens) {
  const [rel, lineStr] = spec.split(':')
  const wantLine = Number(lineStr)
  const file = path.join(ROOT, rel)
  if (!fs.existsSync(file)) return console.log('no such file', rel)
  const src = fs.readFileSync(file, 'utf8')
  const scope = collectFileScope(rel, src)
  if (!scope) return console.log('parse failed')
  const { sheets, jsxPaths } = scope
  const styleCount = sheets.get('styles') ? [...sheets.get('styles').keys()].length : 'n/a'
  console.log('sheets:', [...sheets.keys()], '| entries styles:', styleCount)
  const containing = jsxPaths.filter((p) => wantLine >= (p.node.loc?.start.line ?? 0) && wantLine <= (p.node.loc?.end.line ?? 0))
  const hit = containing[containing.length - 1] // innermost element holding that line
  if (!hit) return console.log('no JSX element at line', wantLine, '| lines near:', jsxPaths.filter((p) => Math.abs((p.node.loc?.start.line ?? 0) - wantLine) < 3).map((p) => p.node.loc.start.line))
  const chain = ancestorBackgrounds(hit, sheets)
  console.log('element:', jsxName(hit), '| chain:', JSON.stringify(chain))
  console.log('layers:', resolvedLayers(chain ?? [], tokens).map((l) => `${l.label}=${l.light}`).join(' -> '))
  const own = foregroundsOf(hit.node.openingElement.attributes, sheets)
  console.log('foregrounds:', JSON.stringify(own))
  for (const fg of own) console.log('  ', explainForeground(fg, tokens, chain))
}

function explainForeground (fg, tokens, chain) {
  const r = resolveSite(fg.raw, tokens)
  if (!r) return `${fg.prop} ${fg.raw} -> UNRESOLVED`
  const worst = measure(r, resolvedLayers(chain ?? [], tokens), rootSurfaces(tokens))
  return `${fg.prop} ${fg.raw} -> ${r.label} ${r.light}/${r.dark} ratio=${JSON.stringify(worst)}`
}

/** Registered style sheets and JSX elements of one file, with local aliases resolved. */
function collectFileScope (rel, src) {
  const ast = parseSource(rel, src)
  if (!ast) return null
  const sheets = new Map()
  const factories = new Set()
  const aliases = []
  const jsxPaths = []
  traverseAst(ast, (p) => {
    if (p.node.type === 'VariableDeclarator') {
      const sheet = collectSheets(p)
      if (sheet) {
        sheets.set(sheet[0], sheet[1])
        factories.add(sheet[0])
      } else {
        const alias = collectSheetAlias(p, factories)
        if (alias) aliases.push(alias)
      }
    }
    if (p.node.type === 'JSXElement') jsxPaths.push(p)
  })
  for (const [local, factory] of aliases) if (sheets.has(factory)) sheets.set(local, sheets.get(factory))
  return { sheets, jsxPaths }
}

function auditSurfaces (tokens) {
  const findings = []
  const roots = rootSurfaces(tokens)
  for (const file of SCAN_DIRS.flatMap((d) => walkFiles(path.join(ROOT, d), []))) {
    const rel = path.relative(ROOT, file)
    if (MEDIA_OVERLAY_FILES.has(rel)) continue // drawn on user imagery, not on theme surfaces
    const src = fs.readFileSync(file, 'utf8')
    if (!/\b(?:color|tintColor|iconColor|placeholderTextColor)\b/.test(src)) continue
    const scope = collectFileScope(rel, src)
    if (!scope) continue
    const { sheets, jsxPaths } = scope
    for (const jsxPath of jsxPaths) {
      findings.push(...surfaceFindings(jsxPath, sheets, tokens, rel, roots))
    }
  }
  return dedupe(findings)
}

/** One finding per painted site: the worst mode wins. */
function dedupe (findings) {
  const best = new Map()
  for (const f of findings) {
    const key = `${f.file}:${f.line}:${f.detail.replace(/ \((light|dark)\)$/, '')}`
    const prev = best.get(key)
    if (!prev || f.ratio < prev.ratio) best.set(key, f)
  }
  return [...best.values()]
}

/** Minimal recursive walker so the audit does not depend on @babel/traverse interop. */
function traverseAst (ast, visit) {
  const stack = [{ node: ast, parentPath: null }]
  while (stack.length > 0) {
    const entry = stack.pop()
    const path = makePath(entry)
    visit(path)
    for (const key of Object.keys(entry.node)) {
      if (key === 'loc' || key === 'leadingComments') continue
      const child = entry.node[key]
      pushChildren(stack, child, path)
    }
  }
}

function pushChildren (stack, value, parentPath) {
  if (Array.isArray(value)) {
    for (const item of value) pushChildren(stack, item, parentPath)
    return
  }
  if (value && typeof value === 'object' && typeof value.type === 'string') {
    stack.push({ node: value, parentPath })
  }
}

function makePath (entry) {
  const is = (kind) => () => entry.node.type === kind
  return {
    node: entry.node,
    parentPath: entry.parentPath,
    isVariableDeclarator: is('VariableDeclarator'),
    isJSXElement: is('JSXElement')
  }
}

/* --------------------------- hardcoded text colour gate --------------------------- */

// Text colours must come from the theme, or they cannot follow a mode switch.
const HARDCODED_TEXT = /\b(?:color|placeholderTextColor)\s*[:=]\s*(['"](?:#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|white|black)['"])/g

/**
 * Overlays drawn on top of user media have no theme surface behind them: their
 * background is the photo, so they keep fixed light-on-dark colours in both modes.
 */
const MEDIA_OVERLAY_FILES = new Set([
  'src/components/Photo/index.js',
  'src/components/Photo/PinchableView.js',
  'src/components/Photo/ImageView.js',
  'src/components/ui/CloseButton.js',
  'src/components/ui/InteractionHintBanner.js',
  'src/components/ExpandableThumb/index.js',
  'src/components/SearchFab/index.js'
])

/** Where a colour literal belongs: the token tables themselves. */
const DEFINITION_FILES = new Set(['src/consts.js', 'src/theme/sharedStyles.js'])

/** A file that reads theme tokens anywhere paints theme-following surfaces. */
const THEME_REF = /\b(?:currentTheme|themedTheme|theme)\s*\.\s*[A-Z_]+|\bgetTheme\s*\(|\buseCurrentTheme\s*\(|\buseThemedStyles\s*\(/

/**
 * Hardcoded foreground colours.
 *
 * Two classes, and only the first can be invisible:
 *   `mixed`  — the file also uses theme tokens, so its backgrounds change with
 *              the mode while the hardcoded colour cannot. This is the defect.
 *   `island` — no theme usage in the file at all: a fully static surface that
 *              ignores dark mode wholesale. Reported as advisory (dark-mode
 *              coverage), not as an invisible-text failure.
 */
function auditHardcodedText () {
  const violations = []
  for (const file of SCAN_DIRS.flatMap((d) => walkFiles(path.join(ROOT, d), []))) {
    const rel = path.relative(ROOT, file)
    if (MEDIA_OVERLAY_FILES.has(rel) || DEFINITION_FILES.has(rel)) continue
    const src = fs.readFileSync(file, 'utf8')
    const mixed = THEME_REF.test(src)
    HARDCODED_TEXT.lastIndex = 0
    let m
    while ((m = HARDCODED_TEXT.exec(src)) !== null) {
      violations.push({
        class: 'hardcoded-text',
        file: rel,
        line: lineOf(src, m.index),
        value: m[1].slice(1, -1),
        severity: mixed ? 'hardcoded' : 'island',
        detail: `hardcoded text colour ${m[1].slice(1, -1)}`
      })
    }
  }
  return violations
}

/* ------------------------------------ main -------------------------------------- */

const THEME_OBJECT_NAMES = new Set(['theme', 'currentTheme', 'themedTheme'])

const SEVERITY_LABEL = { invisible: 'INVISIBLE', low: 'low      ', island: 'island   ', hardcoded: 'hardcoded' }

function printFindings (findings) {
  for (const f of findings.sort((a, b) => a.ratio - b.ratio)) {
    const where = f.line ? `${f.file}:${f.line}` : f.file
    const label = SEVERITY_LABEL[f.severity] ?? f.severity
    console.log(`${label} ${f.ratio == null ? '   -  ' : String(f.ratio).padStart(5)}  ${where}  ${f.detail}`)
  }
}

function countBy (findings, key) {
  return findings.reduce((acc, f) => {
    acc[f[key]] = (acc[f[key]] ?? 0) + 1
    return acc
  }, {})
}

function collectFindings (argv, tokens) {
  const gate = argv.includes('--gate')
  const hardcodedOnly = argv.includes('--check-hardcoded')
  let findings = [
    ...auditTokens(tokens, tokensUsedAsText()),
    ...auditParity(tokens.light, tokens.dark),
    ...auditTokenRefs(tokens)
  ]
  if (!hardcodedOnly) findings = [...findings, ...auditSurfaces(tokens)]
  if (gate || hardcodedOnly) findings = [...findings, ...auditHardcodedText()]
  return findings
}

function main () {
  const argv = process.argv.slice(2)
  const gate = argv.includes('--gate')
  const tokens = loadThemeTokens()
  const explainIdx = argv.indexOf('--explain')
  if (explainIdx !== -1) return explain(argv[explainIdx + 1], tokens)

  const findings = collectFindings(argv, tokens)
  const counts = countBy(findings, 'severity')
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ counts, findings }, null, 2))
  } else {
    printFindings(gate ? findings.filter((f) => f.severity === 'invisible') : findings)
    console.log(`\n${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}`)
  }

  const fails = gate ? findings.filter((f) => f.severity === 'invisible').length : findings.length
  if ((gate || argv.includes('--strict')) && fails > 0) process.exitCode = 1
}

module.exports = {
  parseColor,
  composite,
  contrast,
  loadThemeTokens,
  surfacesFor,
  loadConsts,
  resolveSite,
  auditSurfaces,
  auditParity,
  auditTokenRefs,
  tokenPairFinding,
  rootSurfaces
}

if (require.main === module) main()
