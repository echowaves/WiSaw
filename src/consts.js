import * as FileSystem from 'expo-file-system'

export const HOST = "https://api.wisaw.com"
// export const HOST = "https://testapi.wisaw.com"

export const MAIN_COLOR = "#EA5E3D"
export const SECONDARY_COLOR = "#C0C0C0"
export const TEXT_COLOR = "#555f61"
export const PLACEHOLDER_TEXT_COLOR = "#ececec"
export const UNFILLED_COLOR = 'rgba(200, 200, 200, 0.2)'
export const TRANSPARENT_BUTTON_COLOR = 'rgba(10,10,10,.5)'

export const PENDING_UPLOADS_FOLDER = `${FileSystem.cacheDirectory}pendingUploads/`
export const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}images/`
