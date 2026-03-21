## Context

The project uses Expo SDK 55 with 21 Expo packages at slightly older patch versions. Expo's compatibility checker flags these as needing updates. All are minor/patch bumps within the same SDK major version (55.x).

## Goals / Non-Goals

**Goals:**
- Bring all 21 Expo packages to their SDK 55-recommended versions
- Use exact versions (no `^` or `~`) per project conventions
- Verify no security vulnerabilities are introduced

**Non-Goals:**
- Upgrading to a new Expo SDK major version
- Updating non-Expo dependencies
- Changing any application code

## Decisions

**1. Update all 21 packages in a single `npm install` command**
These are all patch/minor bumps within SDK 55. Updating together ensures internal consistency since Expo packages have peer dependencies on each other. Alternative: update one-by-one — rejected because it's slower and risks intermediate inconsistent states.

**2. Use exact versions from Expo's compatibility report**
The target versions come directly from the `expo doctor` / compatibility output. No need to independently research each version.

**3. Run trivy security scan after install**
Per project rules, any dependency change must be followed by a Codacy/trivy scan to catch newly introduced vulnerabilities.

## Risks / Trade-offs

- [Breaking change in patch update] Unlikely at patch level, but possible → Mitigation: test app startup and key flows after update
- [Lock file conflicts] Regenerating package-lock.json may conflict with other branches → Mitigation: merge/rebase before committing
