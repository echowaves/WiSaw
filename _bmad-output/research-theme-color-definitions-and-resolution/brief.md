# Brief — codebase research

Repository: /Users/dmitry/hacks/wisaw/WiSaw
Commit (full): 044c479ba4f8f9b8078af46f8d798cf89bd457f1
Commit (short): 044c479b
Branch: main

Read code through git at the commit only (`git grep -n <pattern> 044c479b -- <paths>`, `git show 044c479b:<path> | cat -n`). Leave out of every search: `_bmad-output/`, `_bmad/`, `docs/specs/`.

Budgets: 15 files per analyzer; 10 commits for the historian. Validation level: normal.

## Questions

1. **Where do colour values and theme definitions live, and which modules export them?** — shape: `where does X live`
2. **How does a light/dark choice made at runtime reach component styles?** — shape: `how does X work`
3. **What sets text colours, background colours or opacities outside the shared theme tokens?** — shape: `what touches X`
4. **How do the `SHARED_*` preset style objects compose with per-screen and per-component styles, and where are they overridden?** — shape: `how does X work`
5. **Why do both `getTheme(isDark)` and a fixed `THEME = LIGHT_THEME` export exist?** — shape: `why is X this way`

## Areas (from the repository layout)

- `app/` — file-based routes and navigators
- `src/theme/`, `src/consts.js`, `src/utils/`, `src/atoms/`, `src/hooks/`, `src/events/`, `src/types/`, repo root config files
- `src/components/`, `src/contexts/`
- `src/screens/`
- `src/state/` (atom definitions)
