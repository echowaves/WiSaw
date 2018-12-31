import { AsyncStorage, } from "react-native"

import RNFetchBlob from 'rn-fetch-blob'

import * as CONST from '../../consts'
import { store, } from '../../../App'

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


export function uploadPendingPhotos() {
	return async (dispatch, getState) => {
		const keys = await AsyncStorage.getAllKeys()
		dispatch({
			type: UPDATE_PHOTOS_PENDING_UPLOAD,
			pendingUploads: keys.length,
		})

		if (getState().camera.uploadingPhoto) {
			// already uploading photos, just exit here
			return Promise.resolve()
		}

		dispatch({
			type: START_PHOTO_UPLOADING,
		})

		// here let's iterate over the items to upload and upload one file at a time

		dispatch({
			type: FINISH_PHOTO_UPLOADING,
		})
		return Promise.resolve()
	}
}


async function uploadFile(uri) {
	const { uuid, location, } = store.getState().photosList
	const response = await fetch(`${CONST.HOST}/photos`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid,
			location: {
				type: 'Point',
				coordinates: [
					location.coords.latitude,
					location.coords.longitude,
				],
			},
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

		// alert(JSON.stringify(responseData))
	}
}
