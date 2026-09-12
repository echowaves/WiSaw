## Purpose
Ensures the WiSaw repository contains no unreachable entry points, unreferenced utility modules, or developer scratch files, and that dead code is removed as part of the changes that make it dead.

## ADDED Requirements

### Requirement: No unreachable entry points in the repository
The repository root SHALL NOT contain entry-point files that are not actually used by the build. The application entry SHALL be the one declared in `package.json` (`main`) backed by the Expo Router entry, and any root-level file that imports a non-existent module or is otherwise unreachable SHALL be removed.

#### Scenario: Root scratch or stale entry files removed
- **WHEN** the repository root is inspected for entry-point files
- **THEN** no file SHALL import a non-existent module (e.g., a removed `./App`)
- **THEN** no developer scratch files (e.g., `test-import.js`) or configuration for removed third-party services (e.g., Branch's `branch.json`) SHALL remain

#### Scenario: Application entry is unambiguous
- **WHEN** the app is built or started
- **THEN** the entry used SHALL be exactly the one declared in `package.json`
- **THEN** no competing root-level entry file SHALL shadow or confuse it

### Requirement: Unreferenced utility modules are removed
Utility modules under `src/utils/` SHALL be reachable from at least one call site. A module whose exported functions have zero references anywhere in the codebase SHALL be deleted.

#### Scenario: Dead utility module removed
- **WHEN** a utility module's exported functions have no references in the codebase
- **THEN** the module SHALL be deleted
- **THEN** no import of the deleted module SHALL remain

#### Scenario: Dead functions in live reducers are removed
- **WHEN** a function in a live reducer or service has zero call sites
- **THEN** the function SHALL be deleted
- **THEN** the containing module SHALL remain free of unreachable code
