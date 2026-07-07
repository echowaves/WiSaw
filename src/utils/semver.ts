/**
 * Compare two semver strings (MAJOR.MINOR.PATCH).
 * @returns negative if a < b, 0 if equal, positive if a > b
 * Missing parts are treated as 0 (e.g. "7.5" == "7.5.0").
 */
export function compareSemver(a: string, b: string): number {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  const maxLen = Math.max(partsA.length, partsB.length)

  for (let i = 0; i < maxLen; i++) {
    const pa = partsA[i] ?? 0
    const pb = partsB[i] ?? 0
    if (pa !== pb) return pa - pb
  }

  return 0
}
