# Agent Instructions

@AGENTS.md

Full instructions live in [AGENTS.md](./AGENTS.md) — read it first. Hard rules if you cannot:

- **Workflow**: BMad Method only. Changes go through `bmad-build` (plan in `_bmad-output/plan-<slug>.md`, then implement, then review). OpenSpec and the `/opsx:*` commands are removed; `docs/specs/` is reference documentation, not a gate.
- **Never commit `.env` or hardcode secrets.** Exact dependency versions only.
- **Complexity limit**: max cyclomatic complexity 8 — extract helpers, early returns.
- **Never edit** `/Users/dmitry/hacks/wisaw/Wisaw.cdk` (backend); emit a prompt for that workspace instead.

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