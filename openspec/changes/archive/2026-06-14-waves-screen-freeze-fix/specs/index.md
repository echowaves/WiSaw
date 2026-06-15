# Specs: Fix Waves Screen Freeze

This change fixes the Waves screen freeze issue by:

1. Making `handleRefresh` async and awaiting operations
2. Adding a guard to prevent concurrent refresh calls
3. Removing the double refresh after auto-group completes

## Specs

- [handle-refresh-async](./handle-refresh-async/spec.md) - Make handleRefresh async
- [refresh-guard](./refresh-guard/spec.md) - Add guard to prevent concurrent calls
- [remove-double-refresh](./remove-double-refresh/spec.md) - Remove double refresh

## Overview

See [proposal.md](../proposal.md) for the problem description and [design.md](../design.md) for implementation details.
