## ADDED Requirements

### Requirement: ROLE_CONFIG SHALL be consolidated in src/consts.js

The system SHALL add `WAVE_ROLES` to `src/consts.js` with the shared role definitions:
```js
export const WAVE_ROLES = {
  owner: { label: 'Owner', color: MAIN_COLOR },
  facilitator: { label: 'Facilitator', color: '#8B5CF6' },
  contributor: { label: 'Contributor', color: '#6B7280' }
}
```

#### Scenario: WaveDetail uses WAVE_ROLES
- **WHEN** WaveDetail needs role config
- **THEN** it imports `WAVE_ROLES` from `src/consts.js`

#### Scenario: WaveMembers uses WAVE_ROLES with icons
- **WHEN** WaveMembers needs role config with icons
- **THEN** it spreads `WAVE_ROLES` and adds icon properties: `{ ...WAVE_ROLES, owner: { ...WAVE_ROLES.owner, icon: 'crown' }, ... }`

#### Scenario: WaveCard uses WAVE_ROLES
- **WHEN** WaveCard needs role config
- **THEN** it imports `WAVE_ROLES` from `src/consts.js`

### Requirement: segmentConfig constants SHALL be added to src/consts.js

The system SHALL add layout config constants to `src/consts.js`:
```js
export const BOOKMARK_LAYOUT_CONFIG = { spacing: 8, baseHeight: 200, aspectRatioFallbacks: [1.0] }
export const GEO_FEED_LAYOUT_CONFIG = { spacing: 5, baseHeight: 100, aspectRatioFallbacks: [0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78] }
```

#### Scenario: WaveDetail uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** WaveDetail configures segment settings
- **THEN** it passes `BOOKMARK_LAYOUT_CONFIG`

#### Scenario: FriendDetail uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** FriendDetail configures segment settings
- **THEN** it passes `BOOKMARK_LAYOUT_CONFIG`

#### Scenario: BookmarksList uses BOOKMARK_LAYOUT_CONFIG
- **WHEN** BookmarksList configures segment settings
- **THEN** it passes `BOOKMARK_LAYOUT_CONFIG`

#### Scenario: PhotosList uses GEO_FEED_LAYOUT_CONFIG
- **WHEN** PhotosList configures segment settings
- **THEN** it passes `GEO_FEED_LAYOUT_CONFIG`
