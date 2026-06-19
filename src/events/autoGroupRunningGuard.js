/**
 * Shared guard to prevent concurrent auto-group execution across all entry points.
 * Used by both WavesHub and photoUploadService.
 */

export const autoGroupRunningRef = { current: false }

export const isAutoGroupRunning = () => autoGroupRunningRef.current

export const setAutoGroupRunning = (value) => {
  autoGroupRunningRef.current = value
}
