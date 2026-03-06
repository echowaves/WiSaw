import * as FileSystem from 'expo-file-system'

const CACHE_DIR = `${FileSystem.cacheDirectory}cached-images/`

async function ensureCacheDir () {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  }
}

function getCachePath (key) {
  return `${CACHE_DIR}${key}`
}

// Compatibility wrapper matching the expo-cached-image CacheManager API
export const CacheManager = {
  async addToCache ({ file, key }) {
    await ensureCacheDir()
    const dest = getCachePath(key)
    const destInfo = await FileSystem.getInfoAsync(dest)
    if (destInfo.exists) {
      return
    }
    await FileSystem.copyAsync({ from: file, to: dest })
  },

  async getCachedImageURI (key) {
    const path = getCachePath(key)
    const info = await FileSystem.getInfoAsync(path)
    return info.exists ? path : null
  }
}
