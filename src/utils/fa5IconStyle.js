// FontAwesome5 icon-style resolver for the v13 scoped package.
//
// The legacy @expo/vector-icons FontAwesome5 set was multi-style with
// `defaultStyle: 'regular'` and a per-glyph fallback, so every glyph rendered
// with the *regular* face when it existed there and the *solid* face otherwise.
// The v13 `@react-native-vector-icons/fontawesome5` package splits FA5 into
// separate solid/regular/brand fonts and REQUIRES an explicit `iconStyle` prop;
// omitting it renders the regular face, which is blank for solid-only glyphs.
//
// This helper reproduces the legacy per-glyph resolution so the migration is
// behavior-preserving. Only the FA5 names actually used in WiSaw are listed.
// Regular-priority: a name in FA5_REGULAR_NAMES renders regular; every other
// FA5 name renders solid.
const FA5_REGULAR_NAMES = new Set([
  'check-circle',
  'clock',
  'comments',
  'edit',
  'eye',
  'eye-slash',
  'hourglass',
  'images',
  'moon',
  'paper-plane',
  'sun',
  'user',
  'user-circle'
])

export function fa5IconStyle (name) {
  return FA5_REGULAR_NAMES.has(name) ? 'regular' : 'solid'
}
