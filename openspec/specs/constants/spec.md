# constants Specification

## Purpose
Consolidate shared constants (`WAVE_ROLES`, `ROLE_CONFIG`, `BOOKMARK_LAYOUT_CONFIG`, `GEO_FEED_LAYOUT_CONFIG`) into `src/consts.js` for code reuse and single source of truth.

## Requirements
### Requirement: ROLE_CONFIG SHALL be consolidated in src/consts.js

The system SHALL add `WAVE_ROLES` to `src/consts.js` with the shared role definitions:
```js
export const WAVE_ROLES = {
  owner: { label: 'Owner', color: MAIN_COLOR },
  facilitator: { label: 'Facilitator', color: '#8B5CF6' },
  contributor: { label: 'Contributor', color: '#6B7280' }
}
```

The system SHALL also add `ROLE_CONFIG` to `src/consts.js` with the extended role definitions including icons:
```js
export const ROLE_CONFIG = {
  owner: { ...WAVE_ROLES.owner, icon: 'crown' },
  facilitator: { ...WAVE_ROLES.facilitator, icon: 'shield-account' },
  contributor: { ...WAVE_ROLES.contributor, icon: 'account' }
}
```

#### Scenario: WaveDetail uses ROLE_CONFIG
- **WHEN** WaveDetail needs role config with icons
- **THEN** it imports `ROLE_CONFIG` from `src/consts.js`

#### Scenario: WaveMembers uses ROLE_CONFIG
- **WHEN** WaveMembers needs role config with icons
- **THEN** it imports `ROLE_CONFIG` from `src/consts.js`

#### Scenario: WaveCard uses WAVE_ROLES
- **WHEN** WaveCard needs role config without icons (only label and color)
- **THEN** it imports `WAVE_ROLES` from `src/consts.js` and accesses properties directly

### Requirement: Layout config constants SHALL be added to src/consts.js

The system SHALL add layout config constants to `src/consts.js`:
```js
export const BOOKMARK_LAYOUT_CONFIG = {
  spacing: 8,
  baseHeight: 200,
  aspectRatioFallbacks: [1.0]
}

export const GEO_FEED_LAYOUT_CONFIG = {
  spacing: 5,
  baseHeight: 100,
  aspectRatioFallbacks: [0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]
}
```

#### Scenario: WaveDetail uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** WaveDetail configures segment settings
- **THEN** it imports and uses `BOOKMARK_LAYOUT_CONFIG` from `src/consts.js`

#### Scenario: FriendDetail uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** FriendDetail configures segment settings
- **THEN** it imports and uses `BOOKMARK_LAYOUT_CONFIG` from `src/consts.js`

#### Scenario: PhotosList uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** PhotosList configures segment settings
- **THEN** it imports and uses `BOOKMARK_LAYOUT_CONFIG` from `src/consts.js`

## Implementation Notes

### Bug Fix (2026-06-18)
The original implementation was missing `ROLE_CONFIG` export from `src/consts.js`, causing a runtime error:
```
TypeError: Cannot convert undefined value to object
at WaveDetail index.js:77
  const roleConfig = ROLE_CONFIG[myRole] || null
```

**Fix:** Added `ROLE_CONFIG` export with full role definitions including icons, and updated WaveMembers to import `ROLE_CONFIG` from `src/consts.js` instead of defining it locally.

**Files affected:**
- `src/consts.js` - Added `ROLE_CONFIG` export
- `src/screens/WaveMembers/index.js` - Updated import to use `ROLE_CONFIG` from consts

