# BMad Workflow

This project uses the [BMad Method](https://bmadcode.com) for all structured development work. Features, fixes, and meaningful changes flow through BMad skills. OpenSpec was removed on 2026-10-27; do not look for `openspec/` or `/opsx:*` commands — the behaviour specs it held now live in [docs/specs/](./docs/specs) as ordinary reference documentation, not as a workflow gate.

## How work flows

| Stage | Skill | Output |
|---|---|---|
| Research a decision, or how this repo works | `bmad-deep-recon` | `_bmad-output/research-<topic>/` |
| Requirements / scope | `bmad-prd`, `bmad-product-brief`, `bmad-prfaq` | `_bmad-output/prd-*/`, `brief-*/` |
| Technical design | `bmad-architecture` | `_bmad-output/architecture-*/` |
| UX | `bmad-ux` | `_bmad-output/ux-*/` (`DESIGN.md`, `EXPERIENCE.md`) |
| Tickets, epics, stories | `bmad-agent-po` (Sofia) | `_bmad-output/tickets/` |
| Implement a change | `bmad-build` | plan in `_bmad-output/plan-<slug>.md`, then code |
| Validate | `bmad-code-review`, `bmad-walkthrough`, `bmad-qa-generate-e2e-tests` | findings in chat, tests in the repo |

Rules that matter:

- **One goal per plan.** `bmad-build` plans a single user-facing change; split genuinely independent deliverables into separate plans.
- **The plan is the spec.** Write it to `_bmad-output/plan-<slug>.md`, implement against it, and record deviations in its Plan Change Log instead of silently diverging.
- **Small changes still get reviewed.** `bmad-build` with route `oneshot` covers ordinary changes; use `full` for anything risky or wide-reaching. Trivial maintenance (typos, formatting, ignore-file hygiene) needs no plan.
- **Initiatives are optional.** With none active, artifacts land loose in `_bmad-output/`; ask before creating one.

## Tooling notes

- BMad skills run Python scripts through `uv` (`uv run <script>`). `_bmad/` holds the installed config and scripts; `_bmad/render/` is regenerated per run and is git-ignored.

<!-- bmad:context -->
<!-- Verified 2026-11-18 against e1da5cbc. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## WiSaw

Photo-and-wave social app in React Native — Expo SDK 58, React Native 0.88, Expo Router, Jotai for state, Apollo Client over GraphQL. Mostly plain JavaScript; TypeScript only in route files. Structured work follows the BMad Method below; behaviour reference lives in `docs/specs/`.

## Policy

- Never run `eas build`, `eas update`, `npm run publish:prod`, or any deploy — builds and releases are done by hand.
- Never edit `../WiSaw.cdk` (the backend, checked out beside this repo). When a change needs backend work, emit a copy-paste-ready prompt for that workspace instead.
- Never commit `.env`; never hardcode a secret. `.env.sample` is the key list and `app.config.js`'s `extra` block is the only route into the app.
- Maximum cyclomatic complexity of 8 — extract helpers, return early, split conditionals. Nothing enforces this: there is no CI.
- Never hand-edit `ios/` or `android/` — both are git-ignored `expo prebuild` output. Change `app.config.js` and the `assets/brand/` generator instead.
- Do not modify vendored `src/zxcvbn.js`.

## Where things are

- Screens live in `src/screens/<Name>/index.js`; a file under `app/` is a thin wrapper that mounts one, so put logic in the screen, not the route.
- GraphQL queries are inline `gql` literals in `src/screens/*/reducer.js`. Despite the name these are plain async service functions imported as `import * as reducer from './reducer'` — this repo has no `useReducer`, and no Redux.
- Theme tokens: `LIGHT_THEME` and `DARK_THEME` in `src/theme/sharedStyles.js`.
- GraphQL schema: `../WiSaw.cdk/graphql/schema.graphql`.
- Specs: `docs/specs/<feature>/spec.md` is current EARS-style, but some name deleted files — trust the source over a spec. Top-level `docs/*.md` are dated fix summaries, not guidance.

## Running and verifying

- There is no `test` script and no jest config: run `npx jest --watchman=false`.
- `npm run lint` exits 1 at baseline with ~570 pre-existing findings, and crashes in a sandboxed shell because eslint's cache lands outside the repo. Lint only your changed files with `HOME="$TMPDIR" npx ts-standard <files>` and compare against that baseline instead of expecting clean.
- Run `npm run audit:theme` after any theme-token or text-colour change — it gates on invisible contrast and on a token present in only one theme table. Nothing runs it for you; there is no CI.
- Load the environment before running the app: `source .env && npx expo start`. `app.config.js` reads `API_URI`, `API_KEY` and `PRIVATE_IMG_HOST` from `process.env`, so an unsourced start gets `undefined`.

## Conventions that differ from defaults

- Pin non-Expo packages exactly; `~` is correct for Expo-SDK-managed modules (expo, expo-router, the `expo-*` set, gesture-handler, screens, web) because Expo's own tooling writes it.
- Identity and device secrets go to `expo-secure-store`, not `expo-storage`; grouping state uses AsyncStorage in `src/utils/groupingStorage.js`.
- Images use `expo-cached-image`, except bundled assets and `file://` paths, which `CachedImage` rejects.
- Namespace imports are the idiom — `import * as CONST from '../../src/consts'`, `* as STATE from '../state'` — and imports are relative: no path aliases are configured.

## Known pitfalls

- A token added to only one theme table renders `undefined` colours in the other mode; add to both and let `npm run audit:theme` prove it.
- `docs/DARK_MODE_IMPLEMENTATION.md` is half-stale (SecureStore, a deleted Chat screen, two modes instead of the current `light|dark|system`); only its contrast-gate section is current.
- BMad's `uv run` needs `UV_PYTHON_INSTALL_DIR="$TMPDIR/uv-python"` in a sandboxed shell.

<!-- /bmad:context -->
