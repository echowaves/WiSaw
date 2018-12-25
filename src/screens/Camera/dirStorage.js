import { Platform, } from 'react-native'

const RNFS = require('react-native-fs')

export const dirHome = Platform.select({
	ios: `${RNFS.DocumentDirectoryPath}/myAppName`,
	android: `${RNFS.ExternalStorageDirectoryPath}/myAppName`,
})

export const dirPicutures = `${dirHome}/Pictures`
export const dirAudio = `${dirHome}/Audio`
