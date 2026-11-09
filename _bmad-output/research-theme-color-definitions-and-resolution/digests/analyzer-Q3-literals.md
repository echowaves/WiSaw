## Q3 inventory — what sets colour/background/opacity outside the shared tokens @ 044c479b

**Token baseline (for exclusion):** `LIGHT_THEME` / `DARK_THEME` keys in src/theme/sharedStyles.js:19-132 (`getTheme` at :135) and flat exports in src/consts.js:36-79 (`MAIN_COLOR`, `BG_COLOR`, `TEXT_COLOR`, `HEADER_*`, `SEGMENT_*`, `FOOTER_COLOR`, `PLACEHOLDER_TEXT_COLOR`, `UNFILLED_COLOR`, `TRANSPARENT_BUTTON_COLOR`, `TRANSPARENT_ICONS_COLOR`, `WAVE_ROLES`/`ROLE_CONFIG` colors). Everything below is outside those.

### Load-bearing claims
1. **src/theme/sharedStyles.js:138** `export const THEME = LIGHT_THEME` @ 044c479b — every `SHARED_CONTAINERS/SHARED_TEXT/SHARED_HEADER/SHARED_INTERACTIVE/SHARED_LAYOUT` sheet is built at module load from this frozen light alias (40+ `THEME.*` reads, :144-444), so token-bound shared styles never see `DARK_THEME`.
2. **src/theme/sharedStyles.js:280, :286, :291** @ 044c479b — literals live *inside* the theme file itself (`SHARED_HEADER.modalStyle` `'rgba(0, 0, 0, 0.9)'`, `modalTitleStyle` `color: '#fff'`, `transparentStyle` `'rgba(0, 0, 0, 0.3)'`).
3. **src/utils/navigationStyles.js:62** (`getTransparentHeaderStyle`) @ 044c479b — `'rgba(0, 0, 0, 0.3)'` header background; the same file's other builders do use `CONST.*`.
4. **33 module-load `StyleSheet.create` sheets never receive a theme** (list in §6) — they are the structural reason literals are used.
5. **src/components/Photo/index.js** and **src/screens/Feedback/index.js**: 18 + 14 sites; **WaveShareModal.js:304-472** and **ShareOptionsModal.js:150-292** are two fully off-token stylesheets (`'white'`, `'#333'`, `'#666'`, `'#999'`, `'#f8f9fa'`) with no theme input at all.
6. **src/screens/PhotosDetailsShared/index.js:135, :154** @ 044c479b — `barStyle='dark-content'` fixed while `backgroundColor={theme.HEADER_BACKGROUND}` is mode-driven (dark icons on dark header).

### Counts per area (`git grep -nE "#[0-9A-Fa-f]{3,8}|rgba?\(|'(white|black)'|opacity:" 044c479b -- <area> ':(exclude)**/__tests__/**'`)
| area | lines | hex/rgba | `'white'/'black'` | `opacity:` | files |
|---|---|---|---|---|---|
| src/components | 237 | 181 | 26 | 30 | 41 |
| src/screens | 79 | 66 | 9 | 4 | 19 |
| app/ | 15 | 8 | 4 | 3 | 3 |
| src/theme | 63 (59 are the token defs themselves → **4 off-token**) | 63 | 0 | 0 | 2 |
| src/utils | 1 | 1 | 0 | 0 | 1 |

Total ≈ **336 literal/opacity lines** (2 are commented-out code) **+ 15 alpha-concat sites** that contain no literal → ~349 live sites. Symbol names below come from a brace-walk over `git show` output; `[key]` = the StyleSheet key.

---

### 1. Hardcoded hex/rgba in `StyleSheet.create` blocks and inline style objects

**src/components (non-test)**
- src/components/ActionMenu/index.js:104 (`createStyles [overlay]`) — bg `rgba(0, 0, 0, 0.6)` @ 044c479b
- src/components/EditWaveModal/index.js:111 (`styles [modalOverlay]`) — bg `rgba(0,0,0,0.5)` @ 044c479b
- src/components/EmptyStateCard/index.js:42 (`createStyles [iconContainer]`) — bg `rgba(234, 94, 61, 0.1)` (= `INTERACTIVE_SECONDARY` value, not the token) @ 044c479b
- src/components/ErrorDetailModal/index.js:213 (`createStyles [backdrop]`) `rgba(0, 0, 0, 0.4)`; :229 (`[ios]`) `shadowColor: '#000'` @ 044c479b
- src/components/ExpandableThumb/index.js:104 `#4FC3F7`, :113 `#FFD700` (icon tints, = `STATUS_SUCCESS`/`STATUS_WARNING` values); :163 inline bg `rgba(0,0,0,0.4)`; :204 `shadowColor '#000'`; :222 bg `rgba(0,0,0,0.7)` @ 044c479b (all in `ExpandableThumb`)
- src/components/FeedModeToggleFAB/index.js:78 (`styles [fabButton]`) `shadowColor '#000'` @ 044c479b
- src/components/ForceUpdateModal/index.tsx:97 `[overlay]` `rgba(0, 0, 0, 0.7)`; :109 `[card]` `#000` shadowColor; :139 `[buttonText]` `color '#FFFFFF'` @ 044c479b (`createStyles`)
- src/components/FriendCard/index.js:73 (`styles [card]`) `shadowColor '#000'` @ 044c479b
- src/components/FriendsExplainerView/index.js:41, :52 icon tint `#EA5E3D`; :97 `[iconCircle]` bg `rgba(234, 94, 61, 0.1)`; :145 `[button]` bg `#EA5E3D`; :150 `[button]` `shadowColor #EA5E3D` @ 044c479b
- src/components/IdentityHeaderIcon/index.js:115 (`styles [badge]`) bg `#FF3B30` @ 044c479b
- src/components/MergeWaveModal/index.js:210 (`makeStyles [backdrop]`) bg `rgba(0,0,0,0.5)` — literal inside a theme-aware factory @ 044c479b
- src/components/ModernHeaderButton/index.js:13 (`styles [button]`) bg `rgba(255, 255, 255, 0.9)` @ 044c479b
- src/components/NamePicker/index.js:123 (`[saveButtonTitle]`) `color '#FFFFFF'` @ 044c479b
- src/components/Photo/PinchableView.js:34 `[headerButton]` bg `rgba(0, 0, 0, 0.6)`; :37 border `rgba(255, 255, 255, 0.2)`; :38 `shadowColor '#000'`; :48 `[headerIcon]` `textShadowColor 'rgba(0, 0, 0, 0.8)'`; :53 `[headerTitle]` `color 'rgba(255, 255, 255, 0.95)'`; :56 same textShadow; :86, :98 icon props `rgba(255, 255, 255, 0.95)`; :113 inline bg `rgba(0, 0, 0, 0.5)`; (:139 commented-out `rgba(0, 0, 0, 0.9)`) @ 044c479b (`createStyles` / `PinchableView`)
- src/components/Photo/index.js:127 bg `rgba(0,0,0,0.8)`; :132 bg `rgba(255,255,255,0.1)`; :139 border `rgba(255,255,255,0.3)`; :155 bg `rgba(255,255,255,0.1)`; :160 border `rgba(255,255,255,0.2)`; :170 bg `rgba(255,255,255,0.1)` (all `VideoSection` inline); :511 (`createStyles [expandedCardContainer]`) `shadowColor '#000'`; :760 icon `#4FC3F7`; :769 icon `#FFD700`; :1320 `<LinearProgress color='#4FC3F7'>`; :1328 inline `shadowColor: '#4FC3F7'` @ 044c479b
- src/components/PhotoActionButtons/index.js:155 icon `color={isOwnPhoto ? '#4FC3F7' : theme.TEXT_DISABLED}`; :162 `[actionButtonText]` inline `color: '#4FC3F7'` @ 044c479b
- src/components/PhotosListMasonry/index.js:122 inline bg `rgba(0,0,0,0.5)` @ 044c479b
- src/components/QuickActionsModal/index.js:175 icon `#FFD700`; :226 (`createStyles [overlay]`) bg `rgba(0, 0, 0, 0.6)` @ 044c479b
- src/components/SearchFab/index.js:219 (`styles [fabButton]`) `shadowColor '#000'` @ 044c479b
- src/components/ShareOptionsModal.js — `styles` sheet, no theme: :153 `[overlay]` `rgba(0, 0, 0, 0.7)`; :171 `[header]` borderBottomColor `#f0f0f0`; :176 `[title]` `#333`; :198 `[friendName]` `#333`; :204 `[description]` `#666`; :214 `[sectionTitle]` `#333`; :224 `[qrCodeWrapper]` shadowColor `#000`; :236 `[qrPlaceholder]` bg `#f8f9fa`; :242 `[placeholderText]` `#999`; :247 `[qrDescription]` `#666`; :260 `[optionButton]` bg `#f8f9fa`; :278 `[optionTitle]` `#333`; :283, :292 `#666`. JSX: :73 icon `#666`; :95/:96 QR `bgColor='#ffffff'`/`fgColor='#000000'`; :102, :131 icon `#ccc`; :122 `[optionIcon]` bg `#ff6b35` @ 044c479b
- src/components/SortOrderPicker/index.js — iOS-system palette, token-free: :57, :80 border `'#007AFF'` / `'#3A3A3C'` / `'#D1D1D6'`; :107 icon `#007AFF`/`#8E8E93`; :182-186 (`createStyles`) locals `surface #1C1C1E|#FFFFFF`, `trackBg #2C2C2E|#E5E5EA`, `activeBg #3A3A3C|#FFFFFF`, `textPrimary #FFFFFF|#000000`, `textSecondary #8E8E93`; :191 `[overlay]` `rgba(0,0,0,0.4)`; :219 `[doneText]` `#007AFF`; :267, :295 bg `#2C2C2E|#F2F2F7`; :270, :298 bg `rgba(0,122,255,0.15)|rgba(0,122,255,0.1)` @ 044c479b
- src/components/UngroupedPhotosCard/index.js:166 inline border `#EA5E3D`; :168 icon `#EA5E3D`; :176, :181, :190 text `#007AFF`; :217, :230 text `#007AFF`/`theme.TEXT_SECONDARY`; :244 bg `#EA5E3D`; :249 `ActivityIndicator color='#FFFFFF'`; :250 text `#FFFFFF` @ 044c479b (`UngroupedPhotosCard`)
- src/components/UploadQueueModal/index.js:309 (`styles [backdrop]`) `rgba(0, 0, 0, 0.5)`; :351 (`[thumb]`) bg `#00000022` @ 044c479b
- src/components/WaveCard/index.js:67 icons `#007AFF`; :76 icon `#3B82F6`; :91 `[roleBadge]` inline bg `#FEF3C7`; :92 text `#D97706`; :118 (`styles [card]`) shadowColor `#000`; :169 (`[selectedCard]`) border `#007AFF` @ 044c479b
- src/components/WaveHeaderIcon/index.js:51 (`WaveHeaderIcon`) `iconColor = hasWaves ? '#EA5E3D' : '#8E8E93'` → icon tint @ 044c479b
- src/components/WavePhotoStrip/index.js:127, :132 icons `#FFFFFF`; :197 (`styles [checkBadgeSelected]`) bg `#007AFF`; :200 (`[checkBadgeUnchecked]`) bg `rgba(0,0,0,0.35)`; :202 border `#007AFF` @ 044c479b
- src/components/WaveSelectorModal/index.js:291, :331 icons `#fff`; :424 (`makeStyles [backdrop]`) `rgba(0, 0, 0, 0.5)`; :599 (`[useLocationText]`) color `#fff` @ 044c479b
- src/components/WaveShareModal.js — `styles`, no theme: :307 `[overlay]` `rgba(0,0,0,0.5)`; :325 borderBottomColor `#eee`; :330 `[title]` `#333`; :346 `[waveName]` `#333`; :351 `[description]` `#666`; :360 `[sectionTitle]` `#999`; :367 `[qrContainer]` bg `#f8f8f8`; :375 shadowColor `#000`; :389 `[placeholderText]` `#999`; :394 `[qrDescription]` `#666`; :402 `[optionsPanel]` bg `#f8f8f8`; :416 `[inputLabel]` `#666`; :421 border `#e4e4e4`; :426 `[input]` color `#333`; :427 bg `#fff`; :447 `[optionButton]` bg `#f8f8f8`; :468 `[optionTitle]` `#333`; :472 `[optionDescription]` `#666`. JSX: :183 icon `#666`; :209, :220 `placeholderTextColor='#999'`; :255/:256 QR `bgColor='#ffffff'`/`fgColor='#000000'`; :262, :294 icons `#ccc` @ 044c479b
- src/components/WavesExplainerView/index.js:35, :46 icon `#EA5E3D`; :91 (`getStyles [iconCircle]`) bg `rgba(234, 94, 61, 0.1)`; :139 `[button]` bg `#EA5E3D`; :144 `[button]` shadowColor `#EA5E3D` @ 044c479b
- src/components/ui/Badge.js:9 (`styles [badge]`) bg `#FF3B30`; :14 (`[text]`) color `#FFFFFF` @ 044c479b
- src/components/ui/Button.js:5 `[button]` bg `#2D9CDB`; :28 `[title]` `#FFFFFF`; :38 `[outline]` border `#2D9CDB`; :41 `[outlineTitle]` `#2D9CDB`; :75 inline ternary `'#333' : '#FFFFFF'` @ 044c479b
- src/components/ui/CloseButton.js:14 icon `rgba(255, 255, 255, 0.95)`; :28 `[button]` bg `rgba(0, 0, 0, 0.6)`; :33 border `rgba(255, 255, 255, 0.2)`; :34 shadowColor `#000`; :41 `[icon]` textShadowColor `rgba(0, 0, 0, 0.8)` @ 044c479b
- src/components/ui/Input.js:13 `[inputContainer]` border `rgba(0,0,0,0.1)`; :14 bg `#FFFFFF`; :22 `[input]` color `#1C1C1E`; :39 `[errorText]` `#FF3B6B`→actual `#FF3B30`; :79 `placeholderTextColor='rgba(60,60,67,0.6)'` @ 044c479b
- src/components/ui/InteractionHintBanner.js:31 icon `#FFD700`; :35 icon `rgba(255,255,255,0.8)`; :46 `[banner]` bg `rgba(0,0,0,0.6)`; :60 `[text]` color `rgba(255,255,255,0.9)` @ 044c479b

**src/screens**
- src/screens/Feedback/index.js:142 `'#FF6B6B'`, :143 `'#FFD93D'` (`getCharacterCountColor` → char-counter text colour); :149 `'rgba(255, 255, 255, 0.3)'`, :150 `'rgba(255, 255, 255, 0.1)'` (`getInputBorderColor` → border); :362 (`[helpTitle]`) `color '#4FC3F7'`; :485, :492, :499, :506 inline `<Text style={{ color: '#4FC3F7' }}>` bullet text @ 044c479b
- src/screens/FriendsList/index.js:75 (`[clearButton]`) bg `rgba(128,128,128,0.2)` @ 044c479b
- src/screens/ModalInputText/index.js:165 commented-out `rgba(0, 0, 0, 0.9)` @ 044c479b
- src/screens/PhotoSelectionMode/index.js:263 (`styles [selectedOverlay]`) bg `rgba(43, 130, 201, 0.3)`; :284 border `rgba(255,255,255,0.7)`; :285 bg `rgba(0,0,0,0.2)` (`[unselectedCircle]`); :305 (`[floatingBar]`) shadowColor `#000`; :323 (`[addButtonText]`) color `#FFF`; JSX :179 icon `#FFF`, :248 `ActivityIndicator color='#FFF'` @ 044c479b
- src/screens/Secret/components/ActionRow.js:8 `accentColor = destructive ? '#FF9500' : CONST.MAIN_COLOR` (icon/text); :18 `[row]` border `rgba(255, 149, 0, 0.2)`; :24 `[iconContainer]` bg `rgba(255, 149, 0, 0.1)` / `'rgba(234, 94, 61, 0.1)'`; :33 `[label]` color `#FF9500` @ 044c479b
- src/screens/Secret/components/IdentityProfileCard.js:26 `[iconContainer]` bg `rgba(234, 94, 61, 0.1)`; :41 `[statusBadge]` bg `rgba(80, 227, 194, 0.1)`; :50 `[statusDot]` bg `#50E3C2`; :56 `[statusText]` color `#50E3C2` @ 044c479b
- src/screens/Secret/components/NicknameInputField.js:34 / src/screens/Secret/components/SecretInputField.js:56 — `errorStyle={{ color: '#FF6B6B' }}` text @ 044c479b
- src/screens/Secret/components/PasswordStrengthIndicator.js:50 (`[errorText]`) color `#FF6B6B` @ 044c479b
- src/screens/Secret/components/PrivacyExplainerView.js:36, :47 icon `#EA5E3D`; :92 (`getStyles [iconCircle]`) bg `rgba(234, 94, 61, 0.1)`; :140 `[button]` bg `#EA5E3D`; :145 `[button]` shadowColor `#EA5E3D` @ 044c479b
- src/screens/Secret/components/PrivacyNoticeCard.js:8 `[card]` bg `rgba(80, 227, 194, 0.08)`; :12 border `rgba(80, 227, 194, 0.2)`; :21 `[title]` color `#50E3C2`; :36 icon `#50E3C2` @ 044c479b
- src/screens/Secret/index.js:367 icon `#EA5E3D` @ 044c479b
- src/screens/Secret/styles.js:36 (`getStyles [creationIconContainer]`) bg `rgba(234, 94, 61, 0.1)` @ 044c479b
- src/screens/TandC/index.tsx:209 (`createStyles [primaryButtonTitle]`) color `#FFFFFF` @ 044c479b
- src/screens/WaveDetail/index.js:314, :448 icon `#60A5FA`; :569 (`styles [modalOverlay]`) bg `rgba(0,0,0,0.5)`; :612 (`[frozenBanner]`) bg `rgba(96, 165, 250, 0.15)`; :620 (`[frozenBannerText]`) color `#60A5FA` @ 044c479b
- src/screens/WaveMembers/index.js:190 icon `#EF4444`; :198 bg `#EF444420` (8-digit hex alpha); :199 icon `#EF4444` @ 044c479b
- src/screens/WaveModeration/index.js:163 bg `#EF444420`; :164 icon `#EF4444`; :282 (`styles [identityButtonText]`) color `#FFF` @ 044c479b
- src/screens/WaveSettings/index.js:298 icon `#60A5FA`; :442, :447 icon/text `'#FFFFFF' : CONST.MAIN_COLOR`; :478 icon `#fff`; :532 (`styles [frozenNotice]`) bg `rgba(96, 165, 250, 0.15)`; :540 (`[frozenNoticeText]`) color `#60A5FA`; :628 (`[locationButtonText]`) color `#fff` @ 044c479b
- src/screens/WavesHub/index.js:208 text `#007AFF`; :683 bg `#007AFF`; :688 icon `#FFFFFF`; :757 (`styles [clearButton]`) bg `rgba(128,128,128,0.2)`; :769 (`[modalOverlay]`) bg `rgba(0,0,0,0.5)`; :831 (`[combineButtonText]`) color `#FFFFFF` @ 044c479b

**app/**
- app/(drawer)/_layout.tsx:331 icon `'#FFFFFF' : CONST.MAIN_COLOR`; :342 text `'#FFFFFF'`; :398 (`IdentityDrawerIcon`) inline bg `#FF3B30` badge dot @ 044c479b
- app/(drawer)/waves/join.tsx:234 (`WaveJoinScreen`) inline `[errorCard]` bg `#FFF0F0`, border `#FFCCCC`; :235 icon `#CC0000`; :339 (`styles [errorText]`) color `#CC0000` @ 044c479b

**src/theme / src/utils (off-token)**
- src/theme/sharedStyles.js:280, :286, :291 as above (§load-bearing) @ 044c479b
- src/theme/screenIcons.tsx:79 (`styles [badge]`) bg `#FF3B30` @ 044c479b
- src/utils/navigationStyles.js:62 (`getTransparentHeaderStyle`) bg `rgba(0, 0, 0, 0.3)` @ 044c479b

### 2. Named colour keywords `'white'` / `'black'` — 39 sites (26 components, 9 screens, 4 app)
- Text colour: src/components/EmptyStateCard/index.js:86 `[actionButtonText]`; src/components/FriendsExplainerView/index.js:157 `[buttonTitle]`; src/components/PendingFriendsCard/index.js:116 `[remindText]`; src/components/Photo/index.js:163, :176 inline `<Text style={{ color: 'white' …}}>`; src/components/ShareOptionsModal.js:157 `[modalContainer]` bg `'white'`, :222 `[qrCodeWrapper]` bg `'white'`; src/components/WaveShareModal.js:311 `[modalContainer]` bg `'white'`, :442 `[regenerateButtonLabel]` text; src/components/WavesExplainerView/index.js:151 `[buttonTitle]`; src/screens/Feedback/index.js:347 `[submitButtonText]`; src/screens/Secret/components/PrivacyExplainerView.js:152 `[buttonTitle]`; src/screens/Secret/styles.js:95 `[submitButtonTitle]`; app/(drawer)/_layout.tsx:475 `drawerActiveTintColor: 'white'`; app/(drawer)/waves/join.tsx:354 `[joinButtonText]`
- Icon tints / spinner: src/components/ExpandableThumb/index.js:171, :230; src/components/FeedModeToggleFAB/index.js:58; src/components/FriendsExplainerView/index.js:66; src/components/NamePicker/index.js:282; src/components/PendingFriendsCard/index.js:46; src/components/Photo/index.js:147; src/components/PhotosListFooter/index.js:131, :161; src/components/PhotosListMasonry/index.js:130; src/components/SearchFab/index.js:159; src/components/ShareOptionsModal.js:123; src/components/WaveShareModal.js:231, :284; src/components/WavesExplainerView/index.js:60; src/screens/Feedback/index.js:470, :473; src/screens/ModalInputText/index.js:228; src/screens/Secret/components/PrivacyExplainerView.js:61; src/screens/Secret/index.js:310, :418; app/(drawer)/waves/join.tsx:249 (`ActivityIndicator`), :252 @ 044c479b
- `git grep -nE '"(white|black)"'` → **no hits** (all single-quoted). No CSS named colours either (see "searches that found nothing").

### 3. Alpha-by-string-concat — 15 sites
- app/(drawer)/waves/join.tsx:197 (`WaveJoinScreen`) `` `${CONST.MAIN_COLOR}15` `` → icon-circle bg @ 044c479b
- src/components/PendingFriendsCard/index.js:12 `` `${CONST.MAIN_COLOR}1A` `` → card bg (border uses `CONST.MAIN_COLOR`) @ 044c479b
- src/components/Photo/index.js:317, :353, :438 `` `${theme.STATUS_SUCCESS}15` `` chip bg; :325, :356 `` …}40 `` border; :443 `` …}30 `` border; :459 `` `${theme.STATUS_ERROR}15` `` bg; :464 `` …}30 `` border @ 044c479b (`createStyles`)
- src/components/PhotoActionButtons/index.js:193 `` `${theme.STATUS_SUCCESS}15` `` bg; :201 `` …}40 `` border @ 044c479b
- src/components/WaveCard/index.js:84 `` `${roleConfig.color}15` `` → role-badge bg (token is `ROLE_CONFIG.*.color`) @ 044c479b
- src/components/WaveSelectorModal/index.js:533 `` `${CONST.MAIN_COLOR}15` `` bg @ 044c479b
- src/screens/WaveMembers/index.js:157 `roleInfo.color + '20'` → member-avatar bg (only `+ 'XX'` form in the repo) @ 044c479b

### 4. Token-with-literal-fallback — 11 sites, all hex fallbacks
- src/components/EditWaveModal/index.js:65 `theme.CARD_BACKGROUND || '#FFF'` (modal bg); :66, :88, :97 `theme.TEXT_PRIMARY || '#000'` (title/button text); :68, :75 `…TEXT_PRIMARY || '#000'` + `theme.INTERACTIVE_BORDER || '#CCC'` (input text/border); :70, :77 `theme.TEXT_SECONDARY || '#999'` (`placeholderTextColor`); :85, :91 `theme.INTERACTIVE_BACKGROUND || '#F0F0F0'` (button bg); :96 adjacent `<ActivityIndicator color='#FFF' />` @ 044c479b
- src/components/ScrollToTopFob/index.js:43 `shadowColor: theme.HEADER_SHADOW || '#000'` @ 044c479b
- `grep -nE "(theme|th)\.[A-Za-z_]+ +(\|\||\?\?) +['\"]"` minus hex → **no non-hex fallbacks**; no `??` fallbacks at all.

### 5. Module-level local colour constants / prop defaults — 6 declarations
- src/components/ActionMenu/index.js:17 `const DESTRUCTIVE_COLOR = '#FF3B30'`; used :58 (destructive row text/icon) @ 044c479b
- src/components/UploadQueueModal/index.js:24 `const DESTRUCTIVE_COLOR = '#FF3B30'`; used :278 (delete-count text) @ 044c479b
- src/screens/Secret/components/PasswordStrengthIndicator.js:7 `const strengthColors = ['#FF6B6B', '#FF9500', '#FFD93D', '#4FC3F7', '#50E3C2']`; used :59 (icon tint), :60 (strength text), :70 (bar bg) @ 044c479b
- src/components/ui/LinearProgress.js:11-12 prop defaults `color = '#2D9CDB'`, `trackColor = 'rgba(0,0,0,0.1)'` — inherited by AppHeader:137, GlobalUploadBanner:260, Photo:1319, PhotosListHeader:74 @ 044c479b
- src/components/PhotoActionButtons/index.js:23-27 `bookmarkAccentColor` falls back to literal `'#FFD700'`; used :110 icon tint @ 044c479b
- src/screens/Secret/components/ActionRow.js:8 / src/components/WaveHeaderIcon/index.js:51 — function-local colour selectors (also listed in §1) @ 044c479b

### 6. Stylesheets created at module load that never receive the theme — 33
`styles` unless noted. app/(drawer)/waves/join.tsx:277; src/components/BookmarksHeaderIcon/index.js:34; EditWaveModal/index.js:106; ExpandableThumb/index.js:239 (`commentStyles`); FeedModeToggleFAB/index.js:65; FriendCard/index.js:67; FriendsHeaderIcon/index.js:34; IdentityHeaderIcon/index.js:95; ModernHeaderButton/index.js:5; PendingFriendsCard/index.js:64; ScrollToTopFob/index.js:53; SearchFab/index.js:167; ShareOptionsModal.js:150; UngroupedPhotosCard/index.js:273; UploadQueueModal/index.js:306; WaveCard/index.js:112; WaveHeaderIcon/index.js:68; WavePhotoStrip/index.js:168; WaveShareModal.js:304; ui/Badge.js:3; ui/Button.js:3; ui/CloseButton.js:20; ui/Input.js:4; ui/InteractionHintBanner.js:41; ui/LinearProgress.js:4; src/screens/FriendDetail/index.js:283; PhotoSelectionMode/index.js:257; WaveDetail/index.js:556; WaveMembers/index.js:300; WaveModeration/index.js:208; WaveSettings/index.js:525; WavesHub/index.js:731; src/theme/screenIcons.tsx:61 @ 044c479b.
Related (module load, theme-bound but frozen to light): all `SHARED_*` objects in src/theme/sharedStyles.js (:141, :195, :228, :325, :418, :444) via `THEME = LIGHT_THEME` (:138).
Related (per-render sheets with no theme parameter): src/components/AppHeader/index.tsx:32; PhotosListFooter/index.js:29; src/screens/Feedback/index.js:212; FriendsList/ConfirmFriendship.js:34; PhotosList/index.js:154; Secret/components/{ActionRow.js:10, IdentityProfileCard.js:7, NicknameInputField.js:8, PasswordStrengthIndicator.js:24, PrivacyNoticeCard.js:6, SecretInputField.js:18} @ 044c479b.

### 7. `barStyle` / StatusBar style props fixed regardless of mode — 4
- src/components/Photo/PinchableView.js:152 (`PinchableView`) `<StatusBar barStyle='light-content' backgroundColor='transparent' translucent />` @ 044c479b
- src/screens/ModalInputText/index.js:177 (`ModalInputText`) `barStyle='dark-content'` fixed @ 044c479b
- src/screens/PhotosDetailsShared/index.js:135 and :154 — `barStyle='dark-content'` fixed with mode-driven `backgroundColor={theme.HEADER_BACKGROUND}` @ 044c479b
Mode-aware (not violations): app/_layout.tsx:256 `<StatusBar style={isDarkMode ? 'light' : 'dark'} />`; src/components/NamePicker/index.js:185-186 (`barStyle` ternary + `theme.HEADER_BACKGROUND`).

### 8. Opacity on text or text-holding containers — 37 sites
- Fixed: src/components/ActionMenu/index.js:139 `[rowDisabled]` 0.4 (menu row w/ label); EmptyStateCard/index.js:48 `[icon]` 0.8; NamePicker/index.js:214 save-button text 1/0.6; Photo/index.js:979 send-text 1/0.4, :991 `[addCommentButton]` 0.5 (comments locked), :1053 and :1232 AI-tag chips `opacity: Math.min(confidence/100+0.3, 1)` (text chips); PhotoActionButtons/index.js:220 `[actionButtonDisabled]` 0.5; PhotosListFooter/index.js:125, :154 camera-disabled 0.4/1; ShareOptionsModal → n/a; WaveShareModal.js:453 `[disabledButton]` 0.5; UploadQueueModal/index.js:189 0.55/1 (active row incl. text), :274, :291 1/0.5 (delete labels); UngroupedPhotosCard/index.js:214, :227 1/0.5 (text rows), :245 1/0.5 (Auto-Group button text); ui/Button.js:44 `[disabled]` 0.6, :47 `[pressed]` 0.85; ui/Input.js:35 `[disabled]` 0.6; WaveSelectorModal/index.js:287 create-submit 0.4; src/screens/Feedback/index.js:159 header submit button 0.5/1; src/screens/TandC/index.tsx:204 `[primaryButtonPressed]` 0.85 (button text); WavesHub/index.js:682 merge-button 1/0.4; app/(drawer)/_layout.tsx:461 (`DrawerLayout`) `offlineItemStyle = { opacity: 0.4 }` applied to drawer items (label text); app/(drawer)/waves/join.tsx:359 `[disabledButton]` 0.6; app/modal-input.tsx:75 submit button 0.6/1 @ 044c479b
- Animation-driven on text/containers: src/components/ErrorDetailModal/index.js:93 (`backdropOpacity.value`, backdrop); GlobalUploadBanner/index.js:196 (banner container), :232 (`Animated.Text` label), :257 progress strip `isPaused ? 0.3 : 1`; ScrollToTopFob/index.js:29 (`opacity.value`); SearchFab/index.js:51, :58 (`interpolate`), :64 (`isCommentEditing`), :153 `INTERACTIVE_PRIMARY + 0.4/1`; src/screens/Feedback/index.js:415 (`fadeAnim`) @ 044c479b
- Excluded from this count but adjacent: ~40 `shadowOpacity:` numeric values across 30 files (e.g. GlobalUploadBanner/index.js:193 `0.3`, Feedback/index.js ×5).

### Searches that found nothing
- `git grep -nE '"(white|black)"' 044c479b -- src app` → 0 hits (no double-quoted keywords).
- `git grep -nE "(color|Color): '(red|blue|green|gray|grey|orange|purple|silver|gold|lightgray|darkgray|dimgray|tomato|crimson)'" 044c479b -- src app` → 0 hits (no CSS named colours beyond white/black).
- `git grep -nE "^(export )?const [A-Za-z_$]*([Cc]olor|COLOR)[A-Za-z_$]* *=" 044c479b -- src app` → 0 hits; only the array form `strengthColors` (§5) exists.
- `git grep -nE "(theme|th)\.[A-Za-z_]+ +(\|\||\?\?) +['\"]" … | grep -v "|| '#"` → 0 non-hex / no `??` fallbacks.
- No off-token colour in app/(drawer)/(tabs)/_layout.tsx (uses `SHARED_STYLES.theme.HEADER_SHADOW`) or src/components/AppHeader, PhotosList, FriendsList/ConfirmFriendship sheets (no literals found).

### Budget
Files read in full: 0 consumed beyond range reads — I used `git show <sha>:<path> | sed -n`/`cat -n` slices for src/theme/sharedStyles.js (:1-140, :255-300), src/consts.js (:1-120), src/utils/navigationStyles.js (:1-80), src/theme/screenIcons.tsx (:55-90), app/(drawer)/_layout.tsx (325-345, 390-400, 452-465), GlobalUploadBanner (190-260 slices), Feedback (138-162, 340-365), and 9 short context slices for StatusBar/icon-prop verification. All ~350 sites were enumerated by unlimited line-level `git grep` plus a brace-walk script over `git show` output to resolve enclosing symbol + StyleSheet key; nothing was left uncounted in the five assigned areas. `_bmad-output/`, `_bmad/`, `docs/specs/`, `node_modules/` excluded throughout; `**/__tests__/**` excluded (only hit: src/components/GlobalUploadBanner/__tests__/index.test.js:67-79, a mocked theme fixture).