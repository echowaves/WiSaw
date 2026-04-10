## Context

The backend (`wave-invite` branch on WiSaw.cdk) has been deployed to production with renamed wave scheduling fields and changed semantics. The deployed Lambda's `index.ts` maps GraphQL arguments using new names (`splashDate`, `freezeDate`) while the client app still sends old names (`startDate`, `endDate`, `frozen`). This causes production errors: NOT NULL constraint violations when updating waves, and erroneous "wave is frozen" errors on auto-grouped waves.

The client currently has screens (WaveSettings, WaveMembers, WaveModeration, WaveShareModal) and GraphQL operations that reference the old field names. The Wave type response from the backend no longer returns `isActive` or `frozen` as writable fields — `isFrozen` is the sole computed boolean indicating freeze state.

## Goals / Non-Goals

**Goals:**
- Align all client GraphQL operations with the deployed backend field names
- Update WaveSettings UI to reflect the new freezing model (date-driven, no toggle)
- Replace `isActive` display logic with `isFrozen` and `splashDate`-based pending detection
- Ensure all wave mutations succeed against the deployed backend

**Non-Goals:**
- Backend changes (already deployed and correct)
- New wave features (invites, roles, moderation — already functional)
- Changing wave creation flow (doesn't use these fields)

## Decisions

### 1. Field name mapping follows backend `index.ts`

The deployed `index.ts` reads `args.splashDate` and `args.freezeDate`. The GraphQL schema on GitHub may still show old names, but the deployed AppSync schema uses the new names. The client will send `splashDate`/`freezeDate` to match.

### 2. "Pending" state derived client-side from `splashDate`

With `isActive` removed from the backend response, the client derives the pending state: a wave is "pending" when `splashDate` exists and is in the future. This is a display-only concern — the backend enforces the actual constraint via `_isWaveActive()`.

### 3. Remove explicit freeze toggle

Freezing is now controlled by `freezeDate`. To freeze a wave, set `freezeDate` to a past or current date. To unfreeze, set `freezeDate` to a future date or clear it. The WaveSettings UI removes the freeze switch and keeps only the date picker for `freezeDate`.

### 4. `freezeDate` picker remains editable when frozen

When `isFrozen === true`, all settings except `freezeDate` are disabled. The `freezeDate` picker must remain active so the owner can set a future date to unfreeze the wave. This is the only path to unfreeze.

## Risks / Trade-offs

- **Stale clients**: Users on older app versions will still send `startDate`/`endDate`/`frozen`. The backend `index.ts` maps by argument name, so old field names will be silently ignored (positional args won't match). Those users will see failed mutations until they update. → No mitigation needed beyond app store update.
- **Pending badge accuracy**: Client-side date comparison depends on device clock. A device with a significantly wrong clock could show incorrect pending state. → Acceptable risk; consistent with how other date-based UI works.
