## Context

The app version and build number are stored in three fields in `package.json`: `version`, `buildNumber`, and `versionCode`. The `app.config.js` reads these values directly via `require('./package.json')`, so no other files need updating.

## Goals / Non-Goals

**Goals:**
- Set version to 7.5.0, build number to 540

**Non-Goals:**
- Changing any app behavior or features
- Updating changelog or release notes

## Decisions

**1. Single source of truth in package.json**
`app.config.js` already destructures `{ version, buildNumber, versionCode }` from `package.json`. Only `package.json` needs editing.

## Risks / Trade-offs

(none — trivial metadata change)
