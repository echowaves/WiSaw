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
- In a sandboxed agent shell, `uv run` may fail with `Failed to read directory /Users/<user>/.local/share/uv/python`. Prefix the command with `UV_PYTHON_INSTALL_DIR="$TMPDIR/uv-python"` to work around it.

## Project Context

- **Tech stack**: React Native 0.81.5, Expo 54.0.25, Expo Router 6.0.15, React 19.1.0
- **State management**: Jotai 2.15.0
- **API**: Apollo Client 4.0.2, GraphQL with WebSocket subscriptions
- **Architecture**: File-based routing (Expo Router), modular screens with reducers and custom hooks
- **Package manager**: npm
- **Dependencies**: Always use exact versions (no `^` or `~` prefixes)
- **Backend repo**: `/Users/dmitry/hacks/wisaw/Wisaw.cdk`
- **API schema**: Refer to GraphQL schema at `https://github.com/echowaves/WiSaw.cdk/blob/main/graphql/schema.graphql` using the GitHub MCP server
- **Complexity limit**: Maximum cyclomatic complexity of 8. Refactor by extracting helpers, using early returns, and breaking down conditionals.
- **Image caching**: Always use `expo-cached-image`
- **Key-value storage**: Always use `expo-storage`
- **Security**: `.env` must never be committed. Secrets must never be hardcoded.
- **Backend restriction**: Never modify code in `/Users/dmitry/hacks/wisaw/Wisaw.cdk`. The backend is a separate repo with its own deployment cycle. If a change requires backend modifications, generate a copy-paste-ready prompt for the backend workspace instead of editing files directly.
