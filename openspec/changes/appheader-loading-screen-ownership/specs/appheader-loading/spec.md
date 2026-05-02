## ADDED Requirements

### Requirement: AppHeader loading progress bar
The AppHeader component SHALL accept an optional `loading` boolean prop. When `loading` is `true`, AppHeader SHALL render an indeterminate LinearProgress bar at the bottom of the header, below the content area and above the bottom border.

#### Scenario: Loading active
- **WHEN** `loading` prop is `true`
- **THEN** AppHeader SHALL display a 3px-tall indeterminate LinearProgress bar in `CONST.MAIN_COLOR` at the bottom of the header
- **THEN** the progress bar container SHALL have `theme.HEADER_BACKGROUND` as its background color

#### Scenario: Loading inactive
- **WHEN** `loading` prop is `false` or not provided
- **THEN** AppHeader SHALL NOT render the progress bar
- **THEN** the header layout SHALL be identical to the current behavior (no extra spacing)

#### Scenario: Default behavior preserved
- **WHEN** `loading` prop is omitted
- **THEN** AppHeader SHALL behave identically to its current implementation with no visual or layout changes

### Requirement: BookmarksList shows loading progress
The BookmarksList screen SHALL pass its `loading` state to AppHeader so that users see a progress bar during data fetching.

#### Scenario: Initial bookmarks load
- **WHEN** the BookmarksList screen mounts and begins fetching watched photos
- **THEN** a LinearProgress bar SHALL appear in the AppHeader

#### Scenario: Bookmarks load complete
- **WHEN** the bookmarks data fetch completes
- **THEN** the LinearProgress bar SHALL disappear from the AppHeader

### Requirement: FriendDetail renders AppHeader with loading
The FriendDetail screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header) and SHALL pass its `loading` state to AppHeader.

#### Scenario: Friend photos loading
- **WHEN** FriendDetail is loading friend photos
- **THEN** a LinearProgress bar SHALL appear in the AppHeader
- **THEN** the standalone LinearProgress bar previously rendered in the screen body SHALL NOT be present

#### Scenario: Header content preserved
- **WHEN** FriendDetail renders AppHeader
- **THEN** the header SHALL display the friend name as title, a back button, and the menu button in the right slot — identical to current behavior

### Requirement: WaveDetail renders AppHeader with loading
The WaveDetail screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header) and SHALL pass its `loading` state to AppHeader.

#### Scenario: Wave photos loading
- **WHEN** WaveDetail is loading wave photos
- **THEN** a LinearProgress bar SHALL appear in the AppHeader
- **THEN** the standalone LinearProgress bar previously rendered in the screen body SHALL NOT be present

#### Scenario: Header content preserved with role and frozen state
- **WHEN** WaveDetail renders AppHeader
- **THEN** the header SHALL display the wave name with frozen indicator (snowflake icon when frozen) and role badge — identical to current behavior
- **THEN** the menu button SHALL appear in the right slot

### Requirement: Route files delegate header to screen
The route files for FriendDetail and WaveDetail SHALL set `headerShown: false` and SHALL NOT render AppHeader or manage header-related state.

#### Scenario: FriendDetail route file
- **WHEN** `app/friendships/[friendUuid].tsx` renders
- **THEN** it SHALL set `Stack.Screen` option `headerShown: false`
- **THEN** it SHALL NOT import or render AppHeader

#### Scenario: WaveDetail route file
- **WHEN** `app/(drawer)/waves/[waveUuid].tsx` renders
- **THEN** it SHALL set `Stack.Screen` option `headerShown: false`
- **THEN** it SHALL NOT import or render AppHeader
- **THEN** it SHALL NOT fetch wave data or manage frozen/role state
