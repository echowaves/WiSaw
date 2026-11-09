## History claims — Q5 why both getTheme(isDark) and a fixed THEME = LIGHT_THEME exist

**Order of arrival — prior finding confirmed, both patterns land 2 days apart.**

1. **Baked presets first.** `src/theme/sharedStyles.js` was created in `003d5149 "feat: unify photo theme across screens with shared styles"` (2025-08-11, build 409) with a *single* light theme object and the preset tree built from it at module load. `git log -S SHARED_CONTAINERS` on the file returns only `003d5149`; blame attributes `src/theme/sharedStyles.js:141 (SHARED_CONTAINERS)` to it. **Load-bearing.**
2. **The dark-mode commit renamed, not replaced.** In `2ce80f3c "feat: Implement dark mode functionality across the app"` (2025-08-13, build 416) the diff hunk is `-export const THEME = {` -> `+export const LIGHT_THEME = {`, and a *new* line re-adds the old name: `src/theme/sharedStyles.js:137-138 (THEME) @ 2ce80f3c` with its own comment. Same commit adds `DARK_THEME` (:77), `getTheme` (:135), `useCurrentTheme` (:455), `getThemedStyles` (:463). Pickaxe for `getTheme` and `export const THEME = LIGHT_THEME` -> only `2ce80f3c`. **Load-bearing.**
3. So `THEME` exists to keep the ~300 lines of module-load presets below it (and `SHARED_STYLES.theme`, an unchanged context line in that commit's last hunk) compiling with their existing light values, while dark mode was bolted on alongside rather than through them. **Load-bearing.**
4. **"Backward compatibility" meant the presets, not external imports.** At `2ce80f3c^` exactly one file in `src/`+`app/` referenced the identifier `THEME` — `sharedStyles.js` itself. The compat surface was the derived exports: 16 files import `SHARED_*` at `044c479b`. **Load-bearing.**
5. Interim commit `b4db560c "chore: Refactor components to use shared styles; remove unused code and improve UI consistency"` (2025-08-13, 3 h before dark mode) widened `SHARED_*` adoption — the pressure the alias absorbed.

**Rationale found / not found.**
- No commit message or PR body explains the alias. Both commits reached main via `ca4e94ba "Merge pull request #55 from echowaves/waves-redesign"`; PR **#55** body is literally `ready to merge` (merged 2026-03-19) — no rationale.
- `2ce80f3c`'s message only claims "Extended theme system with light and dark variants in `sharedStyles.js`".
- Only stated intent, quoted: code comment `// Default theme (for backward compatibility)` (`src/theme/sharedStyles.js:137 @ 2ce80f3c`) and `docs/DARK_MODE_IMPLEMENTATION.md` "**Light Theme**: Existing light theme preserved as `LIGHT_THEME`", added in the same commit — it documents preservation but never mentions `THEME`. Same doc prescribes `const theme = getTheme(isDarkMode)` and accepts "Dynamic styles created per component render (negligible performance impact)".
- Searches that found nothing: `git log --grep backward` -> no theme commit; repo grep for `backward.compat` -> `sharedStyles.js` only, no theme doc; no PR/issue refs in any of the five named commit bodies.

**Migration status — asymmetric.**
- `getTheme` won as accessor (~30 importers at `044c479b`). Usual shape is hybrid: light-baked structure + per-render color override (`src/screens/ModalInputText/index.js:92 (SHARED_STYLES.interactive.primaryButton)` with `:215 (theme.TEXT_SECONDARY)`).
- Never adopted: `getThemedStyles` has one consumer, `src/components/NamePicker/index.js:26 @ 044c479b`; `useCurrentTheme` has zero outside the module. No commit other than `2ce80f3c` ever touched either. **Load-bearing.**
- Still light-only, and reading colors through the fixed alias: `app/(drawer)/(tabs)/_layout.tsx:24-39 (SHARED_STYLES.theme.*)`, `app/modal-input.tsx:83-84`, plus `src/screens/FriendsList/ConfirmFriendship.js:18` — these stay light under dark mode.
- Baked path kept growing after dark mode: `e9b448fc "feat: increment build number to 445 … add STATUS_EDIT color to shared styles"` (2025-09-17), `9675df31 "feat: Update shared styles and theme configurations for consistency"` (2025-10-04).
- Nav chrome is a separate, older light-only track: `src/utils/navigationStyles.js` created in `67f81219 "feat: implement centralized status bar handling and refactor navigation styles"` (2025-06-26), colors from `CONST.*` (`:11-14`, `:46 (CONST.TEXT_COLOR)`, `:49 (CONST.MAIN_COLOR)`); it never imports sharedStyles, so `2ce80f3c` left it untouched; only `9675df31` later touched `:47`.

## Two patterns dated
- **Module-load-baked presets** (`SHARED_*`, `THEME`): introduced `003d5149` 2025-08-11; last touched `9675df31` 2025-10-04. Not migrated.
- **Per-render `getTheme` factories** (`getTheme`/`useCurrentTheme`/`getThemedStyles`): introduced `2ce80f3c` 2025-08-13; accessors unchanged since, block last touched `9675df31` 2025-10-04. Migrated in preference, incompletely — the accessor spread, the factory helpers did not.
- `10772010 "feat: update DARK_THEME.INTERACTIVE_BACKGROUND color…"` (2026-03-15) is the last commit to touch the file at all; it changes a value, neither pattern.

## Budget
8 commits inspected in detail (`003d5149`, `2ce80f3c`, `b4db560c`, `9675df31`, `10772010`, `67f81219` blame-only, `ca4e94ba` + PR #55) plus code-state checks at `044c479b`. Not opened: `7e1e49c8` (build 413), `14efea33` (shadow styles).
