## Q4 digest — how `SHARED_*` presets compose, and where they are overridden @ 044c479b

### 1. The preset layer itself

- Presets are plain frozen objects built **once at module load** from `THEME`, and `THEME = LIGHT_THEME` (`src/theme/sharedStyles.js:138` `THEME`) @ 044c479b. So every colour inside a preset is the *light* value, permanently — `containers.card` bakes `THEME.CARD_BACKGROUND`/`CARD_BORDER`/`CARD_SHADOW` (`sharedStyles.js:157-173`), `text.subheading` bakes `THEME.TEXT_PRIMARY` (`:214-218`), `interactive.headerButton` bakes `INTERACTIVE_BACKGROUND`/`INTERACTIVE_BORDER`/`CARD_SHADOW` (`:392-407`). **[LB]**
- The aggregate is a namespace, not a merge: `containers/text/header/interactive/layout` + a raw token bag `theme: THEME` (`sharedStyles.js:444-451` `SHARED_STYLES`) @ 044c479b. Only the aggregate is ever imported; the five named exports (`SHARED_CONTAINERS`, `SHARED_TEXT`, `SHARED_HEADER`, `SHARED_INTERACTIVE`, `SHARED_LAYOUT`) are referenced nowhere outside their own file (`git grep -n "SHARED_" … -- 'src/*' 'app/*'` returns `sharedStyles.js:141,195,228,325,418,444-449` only). One preset composes another internally: `interactive.secondaryButtonTitle` spreads `SHARED_TEXT.secondary` then overrides size/weight (`sharedStyles.js:369-373`).

### 2. Composition mechanics and precedence **[LB]**

Two mechanics, both "preset first, everything later wins":

1. **Object spread inside a style factory** — `{ ...PRESET, local… }`; JS object semantics ⇒ the *right-most* (local) key wins. All sites put the spread first: `Photo/index.js:209-215`, `WaveSelectorModal/index.js:442-447`, `ModalInputText/index.js:91-95`, `NamePicker/index.js:118-133`.
2. **Style array at render** — `[PRESET, styles.x, {inline}]`; RN flattens left→right assigning each key, so the **last entry containing a key wins**, and non-object entries (`false`, `null` from conditionals) are skipped: `node_modules/react-native/Libraries/StyleSheet/flattenStyle.js:26-45` (skip at `:28`, overwrite at `:43`; RN 0.88.1). Sites: `UploadQueueModal/index.js:238`, `FriendDetail/index.js:165-172`, `WavesHub/index.js:197-206`, `Photo/index.js:1230-1233`.

The idiomatic three-layer order actually in use is **preset → local StyleSheet key → render-time inline object**, and it exists chiefly to repair the light-baked colours of §1. Factories are called from the render body with a mode-resolved theme, so presets are re-expanded per render: `Photo/index.js:585-586` (`theme = getTheme(isDark)`, `styles = createStyles(theme)`), `WaveSelectorModal/index.js:48,199,420`, `ModalInputText/index.js:35,37,101`, `PhotosDetailsShared/index.js:23,34-46`.

### 3. Every module that imports `SHARED_*` (13), each with a representative preset → local → inline site

```
src/theme/sharedStyles.js                                   (definer)
src/components/Photo/index.js:43            :196 card→(no local) ; :209-215 infoCard→local theme.CARD_BACKGROUND/-CARD_BORDER+margin ; :1351-1360 [styles.container,{paddingTop,width,…}]
src/components/NamePicker/index.js:26       :52 header.title (pure alias, no local) ; :118-119 primaryButton→local backgroundColor currentTheme.STATUS_SUCCESS ; :212-215 [preset headerButton,{opacity}]
src/components/WaveSelectorModal/index.js:25 :443 text.subheading → local color theme.TEXT_PRIMARY + fontSize 18/weight '700' (no inline)
src/components/UploadQueueModal/index.js:19 :238 [SHARED_STYLES.text.subheading, styles.headerTitle, {color:theme.TEXT_PRIMARY}] — full 3 layers on one node; local block is static, module-level (:306,:326-329 = fontSize/weight only, no colour)
src/screens/FriendDetail/index.js:18        :165-172 [preset headerButton,{backgroundColor/borderWidth/borderColor from theme}]
src/screens/WaveDetail/index.js:19          :343-350 same array shape as FriendDetail
src/screens/FriendsList/index.js:31         :105-112 same array shape
src/screens/WavesHub/index.js:27            :197-206 and :217-226 — array adds keys absent from preset (flexDirection/alignItems) plus recolours
src/screens/FriendsList/ConfirmFriendship.js:18 :34-37 container = pure spread of containers.main, no theme arg → stays light in dark mode
src/screens/ModalInputText/index.js:20      :91-95 primaryButton→local margin/marginTop ; :96-98 submitButtonTitle = pure alias (no local)
src/screens/PhotosDetailsShared/index.js:20 :34-39 header.title→local textShadow* from theme.CARD_SHADOW
app/(drawer)/(tabs)/_layout.tsx:3           :23-35 hand-written headerStyle reading SHARED_STYLES.theme.HEADER_* (token bag, no preset object)
app/modal-input.tsx:9                       :73-76 [preset headerButton,{opacity}] ; :81-85 icon colour from SHARED_STYLES.theme.TEXT_DISABLED/TEXT_PRIMARY
```

Near-miss: `src/components/WavesExplainerView/index.js:7,24` matches `SHARED_` but is a local `SHARED_CARDS` data array — not this system. `src/utils/navigationStyles.js` never imports the presets.

Two patterns do the same job, unranked: (a) spread/merge of preset objects (above); (b) `src/utils/navigationStyles.js:9-32,39-53,60-72` re-derives the identical header look from `CONST.*` with caller-supplied merges (`...customStyle` last at `:22`, `...customOptions` last at `:52`; `getDefaultScreenOptions` merges `customOptions.headerStyle` into `headerStyle` at `:42` and then re-spreads the whole `customOptions` at `:52`). `app/(drawer)/(tabs)/_layout.tsx:8` calls it with no argument, while `:23-35` duplicates the same base style by hand from `SHARED_STYLES.theme.*`.

### 4. Mode-aware coverage in `getThemedStyles` (`sharedStyles.js:463-527`) **[LB]**

| Sub-object | mode-aware equivalent | missing |
|---|---|---|
| `containers` | main, scrollContainer, contentContainer, card (`:468-497`) | **infoCard** |
| `text` | primary, secondary, heading (`:498-514`) | **subheading**, **caption** |
| `interactive` | button only (`:515-523`) | **buttonText, primaryButton, primaryButtonTitle, secondaryButton, secondaryButtonTitle, buttonContainer, statItem, headerButton, statText** |
| `header` | — none (no key returned) | whole section |
| `layout` | — none (no key returned) | whole section |
| `theme` | `currentTheme` (`:525`) | — |

Consequence visible in code: the two most-used presets, `interactive.headerButton` (7 sites) and `text.subheading` (4), have **no** themed equivalent, which is why §3's screens re-apply `theme.INTERACTIVE_BACKGROUND/-BORDER/TEXT_PRIMARY` inline instead of using a themed preset. `getThemedStyles` has exactly one consumer — `NamePicker/index.js:26,36` — and its fallback at `:115` (`themedStyles.interactive.buttonContainer || SHARED_STYLES.interactive.buttonContainer`) always takes the right-hand branch, since `interactive` there contains only `button`. `NamePicker` mixes both worlds: themed for container/text (`:49,72,78,100`), light-baked preset for `header.title` and all buttons (`:52,118-133`).

Unused presets (no reference outside `sharedStyles.js`, per the `git grep -oE "SHARED_STYLES\.[a-zA-Z]+\.[a-zA-Z]+" | uniq -c` tally): `containers.scrollContainer`, `containers.contentContainer`, `header.container|subtitle|contentContainer|drawerStyle|modalStyle|modalTitleStyle|transparentStyle|transparentTitleStyle|routeStyle`, `header.getDynamicHeight` (a function), `interactive.button`, `interactive.buttonText`, `layout.centered`.

### 5. Looked for and did not find

- `git grep -n "getThemedStyles" … -- 'src/*' 'app/*' @ 044c479b`: only the definition + NamePicker — no shared themed-preset consumer exists.
- `git grep -n "useCurrentTheme" … @ 044c479b`: defined at `sharedStyles.js:455`, zero callers.
- No file imports `SHARED_CONTAINERS`/`SHARED_TEXT`/`SHARED_HEADER`/`SHARED_INTERACTIVE`/`SHARED_LAYOUT` by name; no `StyleSheet.flatten` of presets anywhere in `src/` or `app/`.
- No Chat-screen use of `SHARED_STYLES` (only historical mentions in `docs/CHAT_SCREEN_THEME_UNIFICATION.md:19,65-111`, which describes a past change and was not treated as evidence).
- Not verified: shorthand-vs-longhand precedence (`ModalInputText/index.js:92-94` spreads then sets `margin: 20, marginTop: 10`) — RN's JS `flattenStyle` does no shorthand expansion, so the outcome depends on native processing I did not read.

Budget: cap reached at 15 repo files (sharedStyles.js, navigationStyles.js, NamePicker, Photo, WaveSelectorModal, UploadQueueModal, ModalInputText, ConfirmFriendship, FriendDetail, FriendsList, WavesHub, PhotosDetailsShared, WaveDetail, `app/(drawer)/(tabs)/_layout.tsx`, `app/modal-input.tsx`). Unread and unneeded: `WavesExplainerView` (false positive), plus full bodies of the large screens (`Photo/index.js` 1398 lines, `WavesHub` 837) beyond the cited regions.