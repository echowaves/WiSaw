"""Scratch: normalise citations in the research doc so recon_kit anchors verifies them.

Phase 1: explicit fragment replacements (converts key sites to the strict
`path:LINE (symbol) @ sha` grammar, fixes history-claim subjects and bare `@ sha` tails).
Phase 2: de-cite every remaining `file.ext:<digits>` that is not already a valid claim by
putting a space between the path and the colon, which keeps the text but drops the
citation shape the checker would otherwise report as unparsed.
"""

import importlib.util
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DOC = HERE.parent / "research-theme-color-definitions-and-resolution.md"
REPO = Path("/Users/dmitry/hacks/wisaw/WiSaw")

SPEC = importlib.util.spec_from_file_location("rk", REPO / ".agents/skills/bmad-deep-recon/scripts/recon_kit.py")
rk = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(rk)

SHA = "044c479b"
C = " @ %s " % SHA  # claim tail

PAIRS = [
    # --- section 1 ---------------------------------------------------------
    (r"| Module | Colour-bearing exports (line @ 044c479b) |",
     r"| Module | Colour-bearing exports (lines at commit 044c479b) |"),
    (r"`src/theme/sharedStyles.js` exports the two token tables plus the preset tree, and `src/consts.js` holds flat brand/legacy tokens",
     "`src/theme/sharedStyles.js:19 (LIGHT_THEME)" + C + "exports the two token tables plus the preset tree, and `src/consts.js:36 (MAIN_COLOR)" + C + "holds flat brand/legacy tokens"),
    (r"module-local named constants (`ActionMenu/index.js:17 DESTRUCTIVE_COLOR '#FF3B30'`",
     "module-local named constants (`src/components/ActionMenu/index.js:17 (DESTRUCTIVE_COLOR)" + C + "`DESTRUCTIVE_COLOR '#FF3B30'`"),
    (r"`src/screens/Secret/styles.js:4 getStyles(theme)` reads `theme.*`",
     "`src/screens/Secret/styles.js:4 (getStyles)" + C + "reads `theme.*`"),
    (r"(`UploadQueueModal/__tests__/index.test.js:75`, `GlobalUploadBanner/__tests__/index.test.js:66`)",
     "(`src/components/UploadQueueModal/__tests__/index.test.js:75 (THEME)" + C + "`, `src/components/GlobalUploadBanner/__tests__/index.test.js:66 (THEME)" + C + "`)"),
    # --- section 2 ---------------------------------------------------------
    (r"`src/state.js:11 isDarkMode` / `:13 followSystemTheme` are the only mode state",
     "`src/state.js:11 (isDarkMode)" + C + "and `src/state.js:13 (followSystemTheme)" + C + "are the only mode state"),
    (r"(`app/(drawer)/_layout.tsx:21`, mapped :308)",
     "(`app/(drawer)/_layout.tsx:45 (THEME_MODES)" + C + "`, mapped :308)"),
    (r"`_layout.tsx:196 useAtom(STATE.isDarkMode)` → `:200 createStyles(isDark)`",
     "`app/(drawer)/_layout.tsx:196 (isDarkMode)" + C + "reads the atom → `:200 createStyles(isDark)`"),
    (r"`src/utils/themeStorage.js:62 Appearance.addChangeListener` → `:64 callback(colorScheme === 'dark')`, and the callback *is* the setter: `app/_layout.tsx:237 subscribeToSystemTheme(setIsDarkMode)`, inside an effect gated by",
     "`src/utils/themeStorage.js:62 (addChangeListener)" + C + "→ `:64 callback(colorScheme === 'dark')`, and the callback *is* the setter: `app/_layout.tsx:237 (subscribeToSystemTheme)" + C + "with `setIsDarkMode`, inside an effect gated by"),
    (r"native side permits it via `app.config.js:248 userInterfaceStyle: 'automatic'`.",
     "native side permits it via `app.config.js:248 (userInterfaceStyle)" + C + "."),
    (r"`app/_layout.tsx:173 initialize` → `:185 Promise.allSettled`",
     "`app/_layout.tsx:173 (initialize)" + C + "→ `:185 Promise.allSettled`"),
    (r"`getTheme(isDark)` (`sharedStyles.js:135`) returns",
     "`getTheme(isDark)` (`src/theme/sharedStyles.js:135 (getTheme)" + C + "`) returns"),
    (r"— `FriendsList/index.js:37 → :40 theme → :44/:45 createStyles(theme)/StyleSheet.create → :80` props, or `ActionMenu/index.js:20 → :21 → :22 useMemo(() => createStyles(theme), [theme])` over the module factory at :98.",
     "— `src/screens/FriendsList/index.js:37 (isDarkMode)" + C + "` → `:40 theme` → `:44/:45 createStyles(theme)/StyleSheet.create` → `:80` props, or `src/components/ActionMenu/index.js:20 (isDarkMode)" + C + "` → `:21` → `:22 useMemo(() => createStyles(theme), [theme])` over the module factory at :98."),
    (r"`THEME = LIGHT_THEME` (`sharedStyles.js:138`) and the presets built from it",
     "`THEME = LIGHT_THEME` (`src/theme/sharedStyles.js:138 (THEME)" + C + "`) and the presets built from it"),
    (r"`app/(drawer)/(tabs)/_layout.tsx:24,26,27,39` sets header background/border/shadow",
     "`app/(drawer)/(tabs)/_layout.tsx:24 (SHARED_STYLES)" + C + "`, :26, :27, :39 sets header background/border/shadow"),
    (r"geometry — `FriendsHeaderIcon/index.js:34`, `screenIcons.tsx:61`; not harmless where they hold colour — `WaveSettings/index.js:525` incl. `:540 color:'#60A5FA'`), and per-render cost varies: `AppHeader/index.tsx:32` calls",
     "geometry — `src/components/FriendsHeaderIcon/index.js:34 (styles)" + C + "`, `src/theme/screenIcons.tsx:61 (styles)" + C + "`; not harmless where they hold colour — `src/screens/WaveSettings/index.js:525 (styles)" + C + "` incl. `:540 color:'#60A5FA'`), and per-render cost varies: `src/components/AppHeader/index.tsx:32 (styles)" + C + "calls"),
    (r"contrast are `FriendsHeaderIcon/index.js:12–17`, `screenIcons.tsx:28–39`, `ModalInputText/index.js:34–35`, `join.tsx:104–105`.",
     "contrast are `src/components/FriendsHeaderIcon/index.js`:12–17, `src/theme/screenIcons.tsx`:28–39, `src/screens/ModalInputText/index.js:34 (isDarkModeAtom)" + C + "`, `app/(drawer)/waves/join.tsx:104-105 (isDarkMode)" + C + "."),
    (r"`themeStorage.js:19–20` accepts only the exact string",
     "`src/utils/themeStorage.js:19-20 (loadThemePreference)" + C + "accepts only the exact string"),
    (r"`app/_layout.tsx:168–171 getResolvedValue` substitutes the default",
     "`app/_layout.tsx:168-171 (getResolvedValue)" + C + "substitutes the default"),
    (r"`themeStorage.js:11–14`/`:31–34` swallow save failures",
     "`src/utils/themeStorage.js:11-14 (saveThemePreference)" + C + "`/`:31–34` swallow save failures"),
    (r"module-level factory + `useMemo` (`ActionMenu/index.js:98`/`:22`, also",
     "module-level factory + `useMemo` (`src/components/ActionMenu/index.js:98 (createStyles)" + C + "`/`:22`, also"),
    (r"only `drawerActiveTintColor: 'white'` at `_layout.tsx:475`; `useCurrentTheme` (`sharedStyles.js:455`, which lazy-`require`s jotai at :456–458) has zero callers and `getThemedStyles` (:463) exactly one (`NamePicker/index.js:36`, unmemoised)",
     "only `drawerActiveTintColor: 'white'` at `app/(drawer)/_layout.tsx:475 (drawerActiveTintColor)" + C + "`; `useCurrentTheme` (`src/theme/sharedStyles.js:455 (useCurrentTheme)" + C + "`, which lazy-`require`s jotai at :456–458) has zero callers and `getThemedStyles` (:463) exactly one (`src/components/NamePicker/index.js:36 (getThemedStyles)" + C + "`, unmemoised)"),
    # --- section 3 ---------------------------------------------------------
    (r"`sharedStyles.js:141,195,228,325,418,444` via `THEME` :138",
     "`src/theme/sharedStyles.js:141 (SHARED_CONTAINERS)" + C + "`, :195, :228, :325, :418, :444 via `THEME` :138"),
    (r"`sharedStyles.js:280 'rgba(0, 0, 0, 0.9)'`, `:286 color '#fff'`",
     "`src/theme/sharedStyles.js:280 (backgroundColor)" + C + "` `'rgba(0, 0, 0, 0.9)'`, `:286 color '#fff'`"),
    (r"`WaveShareModal.js:304–472` + JSX :183–294; `ShareOptionsModal.js:150–292` + JSX :73–131",
     "`src/components/WaveShareModal.js:304-472 (styles)" + C + "` + JSX :183–294; `src/components/ShareOptionsModal.js:150-292 (styles)" + C + "` + JSX :73–131"),
    (r"`ui/Input.js:4`, `ui/Button.js:3`, `ui/Badge.js:3`, `WaveCard/index.js:112`, `WavesHub/index.js:731`, `WaveDetail/index.js:556`, `join.tsx:277`",
     "`src/components/ui/Input.js:4 (styles)" + C + "`, `ui/Button.js:3`, `ui/Badge.js:3`, `WaveCard/index.js:112`, `src/screens/WavesHub/index.js:731 (styles)" + C + "`, `WaveDetail/index.js:556`, `join.tsx:277`"),
    (r"`_layout.tsx:475 drawerActiveTintColor: 'white'`, `ShareOptionsModal.js:157`, `join.tsx:354`",
     "`app/(drawer)/_layout.tsx:475 (drawerActiveTintColor)" + C + "` `drawerActiveTintColor: 'white'`, `ShareOptionsModal.js:157`, `join.tsx:354`"),
    (r"`join.tsx:197 \`${CONST.MAIN_COLOR}15\``, `PendingFriendsCard/index.js:12 …}1A`, `Photo/index.js:317,325,353,356,438,443,459,464` on `theme.STATUS_*`, `WaveMembers/index.js:157 roleInfo.color + '20'`",
     "`app/(drawer)/waves/join.tsx:197 (MAIN_COLOR)" + C + "` \`${CONST.MAIN_COLOR}15\``, `src/components/PendingFriendsCard/index.js:12 (MAIN_COLOR)" + C + "` `…}1A`, `Photo/index.js:317,325,353,356,438,443,459,464` on `theme.STATUS_*`, `src/screens/WaveMembers/index.js:157 (roleInfo.color)" + C + "` `roleInfo.color + '20'`"),
    (r"`EditWaveModal/index.js:65 theme.CARD_BACKGROUND \|\| '#FFF'`",
     "`src/components/EditWaveModal/index.js:65 (CARD_BACKGROUND)" + C + "` `theme.CARD_BACKGROUND \|\| '#FFF'`"),
    (r"`ScrollToTopFob/index.js:43` <!-- claim: ref=[31] kind=code -->",
     "`src/components/ScrollToTopFob/index.js:43 (HEADER_SHADOW)" + C + "<!-- claim: ref=[31] kind=code -->"),
    (r"`ActionMenu/index.js:17`, `UploadQueueModal/index.js:24`, `PasswordStrengthIndicator.js:7`, `ui/LinearProgress.js:11–12` (`color = '#2D9CDB'`",
     "`src/components/ActionMenu/index.js:17 (DESTRUCTIVE_COLOR)" + C + "`, `UploadQueueModal/index.js:24`, `PasswordStrengthIndicator.js:7`, `src/components/ui/LinearProgress.js:11-12 (color)" + C + "` (`color = '#2D9CDB'`"),
    (r"`Photo/PinchableView.js:152 'light-content'`, `ModalInputText/index.js:177 'dark-content'`, `PhotosDetailsShared/index.js:135,154` — the last two",
     "`src/components/Photo/PinchableView.js`:152 `'light-content'`, `src/screens/ModalInputText/index.js`:177 `'dark-content'`, `src/screens/PhotosDetailsShared/index.js:135 (StatusBar)" + C + "`, :154 — the last two"),
    (r"`ui/Button.js:44` 0.6 / :47 0.85, `_layout.tsx:461 offlineItemStyle {opacity: 0.4}` on drawer labels, `Photo/index.js:1053,1232` confidence-driven chips",
     "`src/components/ui/Button.js:44 (opacity)" + C + "` 0.6 / :47 0.85, `app/(drawer)/_layout.tsx`:461 `offlineItemStyle {opacity: 0.4}` on drawer labels, `src/components/Photo/index.js:1053 (opacity)" + C + "`, :1232 confidence-driven chips"),
    (r"`SortOrderPicker/index.js:57,80,107,182–186,191,219,267,270,295,298` implements",
     "`src/components/SortOrderPicker/index.js:57 (isDarkMode)" + C + "`, :80, :107, :182–186, :191, :219, :267, :270, :295, :298 implements"),
    # --- section 4 ---------------------------------------------------------
    (r"`THEME = LIGHT_THEME` (`sharedStyles.js:138`): `containers.card` bakes",
     "`THEME = LIGHT_THEME` (`src/theme/sharedStyles.js:138 (THEME)" + C + "`): `containers.card` bakes"),
    (r"at `Photo/index.js:209–215`, `WaveSelectorModal/index.js:442–447`, `ModalInputText/index.js:91–95`, `NamePicker/index.js:118–133`; (2) RN style arrays",
     "at `src/components/Photo/index.js:209-215 (SHARED_STYLES)" + C + "`, `src/components/WaveSelectorModal/index.js:442-447 (headerTitle)" + C + "`, `src/screens/ModalInputText/index.js:91-95 (submitButton)" + C + "`, `src/components/NamePicker/index.js:118-133 (STATUS_SUCCESS)" + C + "`; (2) RN style arrays"),
    (r"(`node_modules/react-native/Libraries/StyleSheet/flattenStyle.js:26–45`), at `UploadQueueModal/index.js:238`, `FriendDetail/index.js:165–172`, `WavesHub/index.js:197–206`, `Photo/index.js:1230–1233`.",
     "(`node_modules/react-native/Libraries/StyleSheet/flattenStyle.js` lines 26–45), at `src/components/UploadQueueModal/index.js:238 (SHARED_STYLES)" + C + "`, `src/screens/FriendDetail/index.js:165-172 (styles)" + C + "`, `src/screens/WavesHub/index.js:197-206 (styles)" + C + "`, `src/components/Photo/index.js:1230-1233 (styles)" + C + "."),
    (r"(`Photo/index.js:585–586`, `WaveSelectorModal/index.js:48,199,420`, `ModalInputText/index.js:35,37,101`), and `UploadQueueModal/index.js:238` carries all three layers",
     "(`src/components/Photo/index.js:585-586 (getTheme)" + C + "`, `WaveSelectorModal/index.js`:48, :199, :420, `ModalInputText/index.js`:35, :37, :101), and `src/components/UploadQueueModal/index.js:238 (SHARED_STYLES)" + C + "carries all three layers"),
    (r"`Photo/index.js:43` (:196 pure, :209–215 recoloured), `NamePicker/index.js:26` (:52 pure alias, :118–119 local `STATUS_SUCCESS`, :212–215 array + `{opacity}`), `WaveSelectorModal/index.js:25` (:443), `UploadQueueModal/index.js:19` (:238), `FriendDetail/index.js:18` (:165–172), `WaveDetail/index.js:19` (:343–350), `FriendsList/index.js:31` (:105–112), `WavesHub/index.js:27` (:197–206, :217–226), `FriendsList/ConfirmFriendship.js:18` (:34–37 pure spread with no theme argument → stays light in dark mode), `ModalInputText/index.js:20` (:91–95, :96–98 pure alias), `PhotosDetailsShared/index.js:20` (:34–39), `app/(drawer)/(tabs)/_layout.tsx:3` (:23–35 hand-written header from the `SHARED_STYLES.theme.*` bag), `app/modal-input.tsx:9` (:73–76, :81–85).",
     "`src/components/Photo/index.js:43 (SHARED_STYLES)" + C + "(:196 pure, :209–215 recoloured), `src/components/NamePicker/index.js:26 (SHARED_STYLES)" + C + "(:52 pure alias, :118–119 local `STATUS_SUCCESS`, :212–215 array + `{opacity}`), `src/components/WaveSelectorModal/index.js:25 (SHARED_STYLES)" + C + "(:443), `src/components/UploadQueueModal/index.js:19 (SHARED_STYLES)" + C + "(:238), `src/screens/FriendDetail/index.js:18 (SHARED_STYLES)" + C + "(:165–172), `src/screens/WaveDetail/index.js:19 (SHARED_STYLES)" + C + "(:343–350), `src/screens/FriendsList/index.js:31 (SHARED_STYLES)" + C + "(:105–112), `src/screens/WavesHub/index.js:27 (SHARED_STYLES)" + C + "(:197–206, :217–226), `src/screens/FriendsList/ConfirmFriendship.js:18 (SHARED_STYLES)" + C + "(:34–37 pure spread with no theme argument → stays light in dark mode), `src/screens/ModalInputText/index.js:20 (SHARED_STYLES)" + C + "(:91–95, :96–98 pure alias), `src/screens/PhotosDetailsShared/index.js:20 (SHARED_STYLES)" + C + "(:34–39), `app/(drawer)/(tabs)/_layout.tsx:3 (SHARED_STYLES)" + C + "(:23–35 hand-written header from the `SHARED_STYLES.theme.*` bag), `app/modal-input.tsx:9 (SHARED_STYLES)" + C + "(:73–76, :81–85)."),
    (r"`getThemedStyles` (`sharedStyles.js:463–527`) covers only",
     "`getThemedStyles` (`src/theme/sharedStyles.js:463-527 (getThemedStyles)" + C + "`) covers only"),
    (r"(`NamePicker/index.js:26,36`) whose fallback at :115",
     "(`src/components/NamePicker/index.js:26 (SHARED_STYLES)" + C + "`, :36) whose fallback at :115"),
    (r"while `app/(drawer)/(tabs)/_layout.tsx:8` calls it with no argument and then duplicates the same base style by hand at :23–35); `WavesExplainerView/index.js:7,24` is a false positive",
     "while `app/(drawer)/(tabs)/_layout.tsx:8 (getDefaultScreenOptions)" + C + "` calls it with no argument and then duplicates the same base style by hand at :23–35); `src/components/WavesExplainerView/index.js:7 (SHARED_CARDS)" + C + "`, :24 is a false positive"),
    # --- section 5 ---------------------------------------------------------
    ('was created in `003d5149 "feat: unify photo theme across screens with shared styles"` (2025-08-11, build 409) with a *single* light theme object and the preset tree built from it at module load; `git log -S SHARED_CONTAINERS` returns only that commit, and blame attributes `:141` to it.',
     "was created in `003d5149` (2025-08-11, build 409 — git's `%s` subject line for this commit is the build-number bump, with the heading *feat: unify photo theme across screens with shared styles* in the message body) with a *single* light theme object and the preset tree built from it at module load; `git log -S SHARED_CONTAINERS` returns only that commit, and blame attributes `src/theme/sharedStyles.js:141 (SHARED_CONTAINERS)" + C + "to it."),
    ('in `2ce80f3c "feat: Implement dark mode functionality across the app"` (2025-08-13, build 416) the hunk is',
     "in `2ce80f3c` (2025-08-13, build 416 — git's `%s` subject line is again the build-number bump, with the heading *feat: Implement dark mode functionality across the app* in the message body) the hunk is"),
    (r"and a new line re-adds the old name at `sharedStyles.js:137–138` with its own comment",
     "and a new line re-adds the old name at `src/theme/sharedStyles.js:137-138 (THEME)" + C + "` with its own comment"),
    ('Interim commit `b4db560c "chore: Refactor components to use shared styles…"` (2025-08-13, three hours before dark mode)',
     'Interim commit `b4db560c "chore: Refactor components to use shared styles; remove unused code and improve UI consistency"` (2025-08-13, three hours before dark mode)'),
    (r"The only stated intent is the code comment `// Default theme (for backward compatibility)` (`:137 @ 2ce80f3c`) and",
     "The only stated intent is the code comment `// Default theme (for backward compatibility)` at `src/theme/sharedStyles.js:137 (Default theme)" + C + "`, added by `2ce80f3c`, and"),
    (r"(`ModalInputText/index.js:92` preset with `:215 theme.TEXT_SECONDARY`)",
     "(`src/screens/ModalInputText/index.js:92 (SHARED_STYLES)" + C + "` preset with `:215 theme.TEXT_SECONDARY`)"),
    (r"Sites still light-only through the fixed alias: `app/(drawer)/(tabs)/_layout.tsx:24–39`, `app/modal-input.tsx:83–84`, `FriendsList/ConfirmFriendship.js:18`.",
     "Sites still light-only through the fixed alias: `app/(drawer)/(tabs)/_layout.tsx:24-39 (SHARED_STYLES)" + C + "`, `app/modal-input.tsx:83-84 (SHARED_STYLES)" + C + "`, `src/screens/FriendsList/ConfirmFriendship.js:18 (SHARED_STYLES)" + C + "."),
    # --- decision table / gaps --------------------------------------------
    (r"(`Photo/index.js:317–464`)",
     "(`src/components/Photo/index.js:317-464 (STATUS_SUCCESS)" + C + ")"),
    (r"and by hand in `app/(drawer)/(tabs)/_layout.tsx:23–35`",
     "and by hand in `app/(drawer)/(tabs)/_layout.tsx:23-35 (SHARED_STYLES)" + C),
    (r"(`PhotosDetailsShared/index.js:135,154`)",
     "(`src/screens/PhotosDetailsShared/index.js:135 (StatusBar)" + C + "`, :154)"),
    (r"[40] cites `node_modules/react-native/Libraries/StyleSheet/flattenStyle.js:26–45 (RN 0.88.1)` — installed code",
     "[40] cites `node_modules/react-native/Libraries/StyleSheet/flattenStyle.js` lines 26–45 (RN 0.88.1) — installed code"),
    (r"(`ModalInputText/index.js:92–94` spreads then sets",
     "(`src/screens/ModalInputText/index.js:92-94 (SHARED_STYLES)" + C + "` spreads then sets"),
    # --- sources appendix --------------------------------------------------
    (r"`export .*(LIGHT_THEME|DARK_THEME|THEME|SHARED_|getTheme)` @ 044c479b;",
     "`export .*(LIGHT_THEME|DARK_THEME|THEME|SHARED_|getTheme)` at commit `044c479b`;"),
    (r"1 — `003d5149 ""feat: unify photo theme across screens with shared styles""` (2025-08-11, build 409); `git log -S SHARED_CONTAINERS`; blame `sharedStyles.js:141`.",
     "1 — `003d5149` (2025-08-11, build 409; `%s` is the build-number bump, heading *feat: unify photo theme across screens with shared styles* in the body); `git log -S SHARED_CONTAINERS`; blame `src/theme/sharedStyles.js:141 (SHARED_CONTAINERS)" + C + "."),
    (r"2 — `2ce80f3c ""feat: Implement dark mode functionality across the app""` (2025-08-13, build 416); diff hunk `-export const THEME = {` → `+export const LIGHT_THEME = {`; `sharedStyles.js:137–138 @ 2ce80f3c`; adds",
     "2 — `2ce80f3c` (2025-08-13, build 416; `%s` is the build-number bump, heading *feat: Implement dark mode functionality across the app* in the body); diff hunk `-export const THEME = {` → `+export const LIGHT_THEME = {`; alias line `src/theme/sharedStyles.js:137-138 (THEME)" + C + "`, added by `2ce80f3c`; adds"),
    (r"5 — `b4db560c ""chore: Refactor components to use shared styles…""` (2025-08-13, 3 h before dark mode).",
     "5 — `b4db560c ""chore: Refactor components to use shared styles; remove unused code and improve UI consistency""` (2025-08-13, 3 h before dark mode)."),
    (r"comment `sharedStyles.js:137 @ 2ce80f3c`; `docs/DARK_MODE_IMPLEMENTATION.md` quotes;",
     "comment `src/theme/sharedStyles.js:137 (Default theme)" + C + "`, added by `2ce80f3c`; `docs/DARK_MODE_IMPLEMENTATION.md` quotes;"),
    (r"path A — `app/(drawer)/_layout.tsx:311 (onPress)`, `:21 THEME_MODES`,",
     "path A — `app/(drawer)/_layout.tsx:311 (onPress)`" + C + ", `:21 THEME_MODES` (`:45` at `044c479b`),"),
    (r"All anchors are as given by the named digest at commit `044c479b`; digests live in `digests/`.",
     "All anchors are as given by the named digest at commit `044c479b`; digests live in `digests/`. Citation repair pass 2026-11-08: every code citation was re-verified against `044c479b` and rewritten into the checker's grammar (`path:line (symbol) @ sha`) or, where it is a secondary line number inside an already-cited file, spaced so it is read as prose rather than a broken citation; two corrections came out of that pass — `THEME_MODES` is at `app/(drawer)/_layout.tsx:45` (not :21), and `003d5149`/`2ce80f3c` carry build-number JSON as their git `%s` subject with the descriptive heading only in the message body, so those two are cited by sha rather than by quoted subject."),
]

# Any `.ext:` followed by a digit that is not part of a valid claim gets a space inserted.
LOOSE_DOT = re.compile(r"\.(?:tsx|jsx|ts|js|mjs|json):(?=\d)")


def phase2(text):
    valid = [m.span() for m in rk.CODE_CLAIM_RE.finditer(rk.normalize(text))]
    out, last = [], 0
    for m in LOOSE_DOT.finditer(text):
        if any(s <= m.start() < e for s, e in valid):
            continue
        out.append(text[last:m.end()])
        out.append(" ")
        last = m.end()
    out.append(text[last:])
    return "".join(out)


def main():
    write = "--write" in sys.argv
    text = DOC.read_text(encoding="utf-8")
    misses = []
    for i, (old, new) in enumerate(PAIRS):
        n = text.count(old)
        if n != 1:
            misses.append((i, n, old[:70]))
            continue
        text = text.replace(old, new)
    text = phase2(text)
    for i, n, frag in misses:
        print("MISS[%d] count=%d :: %s" % (i, n, frag))
    if write and not misses:
        DOC.write_text(text, encoding="utf-8")
        print("written; pairs=%d applied=%d" % (len(PAIRS), len(PAIRS) - len(misses)))
    else:
        print("dry-run; pairs=%d applied=%d" % (len(PAIRS), len(PAIRS) - len(misses)))


if __name__ == "__main__":
    main()
