import { AsyncStorage, } from "react-native"

import RNFetchBlob from 'rn-fetch-blob'

import * as CONST from '../../consts'

export const SET_PREVIEW_URI = 'wisaw/camera/SET_PREVIEW_URI'
export const START_PHOTO_UPLOADING = 'wisaw/camera/START_PHOTO_UPLOADING'
export const FINISH_PHOTO_UPLOADING = 'wisaw/camera/FINISH_PHOTO_UPLOADING'
export const UPDATE_PHOTOS_PENDING_UPLOAD = 'wisaw/camera/UPDATE_PHOTOS_PENDING_UPLOAD'

export const initialState = {
	previewUri: null,
	uploadingPhoto: false,
	pendingUploads: 0,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_PREVIEW_URI:
			return {
				...state,
				previewUri: action.previewUri,
			}
		case START_PHOTO_UPLOADING:
			return {
				...state,
				uploadingPhoto: true,
			}
		case FINISH_PHOTO_UPLOADING:
			return {
				...state,
				uploadingPhoto: false,
				pendingUploads: 0,
			}
		case UPDATE_PHOTOS_PENDING_UPLOAD:
			return {
				...state,
				pendingUploads: action.pendingUploads,
			}
		default:
			return state
	}
}

export function setPreviewUri(previewUri) {
	return {
		type: SET_PREVIEW_URI,
		previewUri,
	}
}

async function getMyKeys() {
	const keys = await AsyncStorage.getAllKeys()
	const myKeys = keys.filter(key => key.startsWith("wisaw-pending-"))
	return myKeys
}

export function uploadPendingPhotos() {
	return async (dispatch, getState) => {
		const keys = await getMyKeys()
		dispatch({
			type: UPDATE_PHOTOS_PENDING_UPLOAD,
			pendingUploads: keys.length,
		})

		if (getState().camera.uploadingPhoto) {
			// already uploading photos, just exit here
			return Promise.resolve()
		}

		try {
			dispatch({
				type: START_PHOTO_UPLOADING,
			})

			let i = 0
			// here let's iterate over the items to upload and upload one file at a time
			for (; i < keys.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
				const fileJson = JSON.parse(await AsyncStorage.getItem(keys[i]))
				// eslint-disable-next-line no-await-in-loop
				const responseData = await uploadFile(fileJson)
				if (responseData.respInfo.status === 200) {
					// eslint-disable-next-line no-await-in-loop
					await AsyncStorage.removeItem(keys[i])
					// eslint-disable-next-line no-await-in-loop
					const pendingUploads = await getMyKeys().length
					dispatch({
						type: UPDATE_PHOTOS_PENDING_UPLOAD,
						// eslint-disable-next-line no-await-in-loop
						pendingUploads: pendingUploads || 0,
					})
				} else {
					alert("Error uploading file, try again.")
				}
			}
		} catch (error) {
			dispatch({
				type: FINISH_PHOTO_UPLOADING,
			})
			uploadPendingPhotos()
		}

		dispatch({
			type: FINISH_PHOTO_UPLOADING,
		})
		return Promise.resolve()
	}
}


async function uploadFile(fileJson) {
	const { uuid, location, uri, } = fileJson
	const response = await fetch(`${CONST.HOST}/photos`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid,
			location,
		}),
	})
	const responseJson = await response.json()

	if (response.status === 401) {
		alert("Sorry, looks like you are banned from WiSaw.")
		return
	}
	if (response.status === 201) {
		const { uploadURL, } = responseJson

		const responseData = await RNFetchBlob.fetch('PUT', uploadURL, {
			"Content-Type": "image/jpeg",
		}, await RNFetchBlob.wrap(uri))
		return responseData
	}
}
