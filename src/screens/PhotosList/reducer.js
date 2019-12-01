import Geolocation from '@react-native-community/geolocation'

import v4 from 'uuid/v4'
import RNSecureKeyStore, { ACCESSIBLE, } from 'react-native-secure-key-store'
import {
	Toast,
} from 'native-base'

import * as CONST from '../../consts.js'

export const GET_PHOTOS_STARTED = 'wisaw/photosList/GET_PHOTOS'
export const GET_PHOTOS_SUCCESS = 'wisaw/photosList/GET_PHOTOS_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photosList/GET_PHOTOS_FAIL'
export const GET_PHOTOS_FINISHED = 'wisaw/photosList/GET_PHOTOS_FINISHED'
export const RESET_STATE = 'wisaw/photosList/RESET_STATE'
export const SET_IS_TANDC_ACCEPTED = 'wisaw/photosList/SET_IS_TANDC_ACCEPTED'
export const SET_UUID = 'wisaw/photosList/SET_UUID'
export const SET_LOCATION = 'wisaw/photosList/SET_LOCATION'
export const SET_LOCATION_PERMISSION = 'wisaw/photosList/SET_LOCATION_PERMISSION'
export const SET_ERROR = 'wisaw/photosList/SET_ERROR'
export const SET_ORIENTATION = 'wisaw/photosList/SET_ORIENTATION'
export const PHOTO_LIKED = 'wisaw/photosList/PHOTO_LIKED'
export const PHOTO_BANNED = 'wisaw/photosList/PHOTO_BANNED'
export const PHOTO_DELETED = 'wisaw/photosList/PHOTO_DELETED'
export const PHOTO_COMMENTS_LOADED = 'wisaw/photosList/PHOTO_COMMENTS_LOADED'
export const PHOTO_RECOGNITIONS_LOADED = 'wisaw/photosList/PHOTO_RECOGNITIONS_LOADED'
export const COMMENT_POSTED = 'wisaw/photosList/COMMENT_POSTED'
export const TOGGLE_COMMENT_BUTTONS = 'wisaw/photosList/TOGGLE_COMMENT_BUTTONS'
export const COMMENT_DELETED = 'wisaw/photosList/COMMENT_DELETED'

export const PHOTO_UPLOADED_PREPEND = 'wisaw/photosList/PHOTO_UPLOADED_PREPEND'

export const SET_ACTIVE_SEGMENT = 'wisaw/photosList/SET_ACTIVE_SEGMENT'
export const SET_SEARCH_TERM = 'wisaw/photosList/SET_SEARCH_TERM'

const UUID_KEY = 'wisaw_device_uuid'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
	isTandcAccepted: false,
	uuid: null,
	location: null,
	photos: [],
	loading: false,
	errorMessage: '',
	pageNumber: 0,
	locationPermission: null,
	orientation: 'portrait-primary',
	activeSegment: 0,
	searchTerm: null,
	batch: 0,
	isLastPage: false,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case GET_PHOTOS_STARTED:
			return {
				...state,
				loading: true,
				errorMessage: '',
			}
		case GET_PHOTOS_SUCCESS:
			return {
				...state,
				photos:
				state.photos.concat(action.photos),
				// this really stinks, need to figure out why there are duplicates in the first place
				// .filter((obj, pos, arr) => arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos), // fancy way to remove duplicate photos
				// .sort((a, b) => b.id - a.id), // the sort should always happen on the server
				pageNumber: state.pageNumber + 1,
				errorMessage: '',
			}
		case GET_PHOTOS_FAIL:
			return {
				...state,
				pageNumber: state.pageNumber + 1,
				errorMessage: action.errorMessage,
			}
		case GET_PHOTOS_FINISHED:
			return {
				...state,
				loading: false,
				isLastPage:
				(state.searchTerm && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
				|| (state.activeSegment === 0 && state.pageNumber > 1095) // 1095 days === 3 years
				|| (state.activeSegment === 1 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
				,
			}
		case RESET_STATE:
			return {
				...state,
				location: null,
				photos: [],
				loading: false,
				errorMessage: '',
				pageNumber: 0,
				isLastPage: false,
				batch: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
			}
		case SET_IS_TANDC_ACCEPTED:
			return {
				...state,
				isTandcAccepted: action.isTandcAccepted,
			}
		case SET_UUID:
			return {
				...state,
				uuid: action.uuid,
			}
		case SET_LOCATION:
			return {
				...state,
				location: action.location,
			}
		case SET_LOCATION_PERMISSION:
			return {
				...state,
				locationPermission: action.locationPermission,
			}
		case SET_ERROR:
			return {
				...state,
				error: action.error,
			}
		case SET_ORIENTATION:
			return {
				...state,
				orientation: action.orientation,
			}
		case PHOTO_LIKED:
			return {
				...state,
				photos: state.photos.map(item => ((item.id === action.photoId) ? { ...item, likes: item.likes + 1, } : item)),
			}
		case PHOTO_BANNED:
			return {
				...state,
				// photos: state.photos.filter(item => (item.id !== action.photoId)),
			}
		case PHOTO_DELETED:
			return {
				...state,
				photos: state.photos.filter(item => (item.id !== action.photoId)),
			}
		case PHOTO_COMMENTS_LOADED:
			return {
				...state,
				photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, comments: action.comments, } : item)),
			}

		case PHOTO_RECOGNITIONS_LOADED:
			return {
				...state,
				photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, recognitions: action.recognitions, } : item)),
			}

		case PHOTO_UPLOADED_PREPEND:
			return {
				...state,
				photos:
				[action.photo,
					...state.photos,
				],
			}
		case COMMENT_POSTED:
			return {
				...state,
				photos: state.photos.map(
					item => ((item.id === action.photoId)
						? {
							...item,
							comments:
							[
								...item.comments,
								{
									...action.comment,
									hiddenButtons: true,
								},
							],
							commentsCount: item.comments.length + 1,
						}
						: item)
				),
			}

		case TOGGLE_COMMENT_BUTTONS:
			return {
				...state,
				photos: state.photos.map(
					item => ((item.id === action.photoId)
						? {
							...item,
							comments: item.comments.map(
								comment => ((comment.id === action.commentId)
									? {
										...comment,
										hiddenButtons: !comment.hiddenButtons,
									}
									: {
										...comment,
										hiddenButtons: true,
									}
								)
							)
							,
						}
						: item)
				),
			}
		case COMMENT_DELETED:
			return {
				...state,
				photos: state.photos.map(
					item => ((item.id === action.photoId)
						? {
							...item,
							commentsCount: item.comments.length - 1,
							comments: item.comments.filter(
								comment => (comment.id !== action.commentId)
							)
							,
						}
						: item)
				),
			}
		case SET_ACTIVE_SEGMENT:
			return {
				...state,
				activeSegment: action.activeSegment,
			}
		case SET_SEARCH_TERM:
			return {
				...state,
				searchTerm: action.searchTerm,
			}
		default:
			return state
	}
}


export function resetState() {
	return async (dispatch, getState) => {
		dispatch({
			type: RESET_STATE,
		})

		const uuid = await getUUID(getState)
		dispatch({
			type: SET_UUID,
			uuid,
		})

		const isTandcAccepted = await getTancAccepted(getState)
		dispatch({
			type: SET_IS_TANDC_ACCEPTED,
			isTandcAccepted,
		})

		const location = await getLocation()
		dispatch({
			type: SET_LOCATION,
			location,
		})
	}
}

async function _requestGeoPhotos(getState, lat, long, batch) {
	const { pageNumber, } = getState().photosList
	let { uuid, } = getState().photosList
	if (uuid === null) {
		uuid = 'initializing'
	}

	const response = await fetch(`${CONST.HOST}/photos/feedByDate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid,
			location: {
				type: 'Point',
				coordinates: [
					lat,
					long,
				],
			},
			daysAgo: pageNumber,
			batch,
		}),
	})
	const responseJson = await response.json()
	// Toast.show({
	// 	text: `uuid: ${uuid}`,
	// 	buttonText: "OK",
	// 	duration: 15000,
	// })
	return responseJson
}


async function _requestWatchedPhotos(getState, batch) {
	const { pageNumber, } = getState().photosList
	let { uuid, } = getState().photosList
	if (uuid === null) {
		uuid = 'initializing'
	}

	const response = await fetch(`${CONST.HOST}/photos/feedForWatcher`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid,
			pageNumber,
			batch,
		}),
	})
	const responseJson = await response.json()
	// Toast.show({
	// 	text: `uuid: ${uuid}`,
	// 	buttonText: "OK",
	// 	duration: 15000,
	// })
	return responseJson
}


async function _requestSearchedPhotos(getState, batch) {
	const { pageNumber, } = getState().photosList
	let { uuid, } = getState().photosList
	if (uuid === null) {
		uuid = 'initializing'
	}

	const response = await fetch(`${CONST.HOST}/photos/feedForTextSearch`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid,
			term: 'nudity',
			pageNumber,
			batch,
		}),
	})
	const responseJson = await response.json()
	// Toast.show({
	// 	text: `uuid: ${uuid}`,
	// 	buttonText: "OK",
	// 	duration: 15000,
	// })
	return responseJson
}

export function getPhotos(batch) {
	return async (dispatch, getState) => {
		if (!getState().photosList.location) {
			return Promise.resolve()
		}
		const { latitude, longitude, } = getState().photosList.location.coords
		const { activeSegment, searchTerm, } = getState().photosList
		dispatch({
			type: GET_PHOTOS_STARTED,
		})
		try {
			let responseJson
			if (searchTerm !== null) {
				responseJson = await _requestSearchedPhotos(getState, batch)
			} else if (activeSegment === 0) {
				responseJson = await _requestGeoPhotos(getState, latitude, longitude, batch)
			} else if (activeSegment === 1) {
				responseJson = await _requestWatchedPhotos(getState, batch)
			}
			if (responseJson.batch === batch) {
				if (responseJson.photos && responseJson.photos.length > 0) {
					dispatch({
						type: GET_PHOTOS_SUCCESS,
						photos: responseJson.photos,
					})
				} else {
					dispatch({
						type: GET_PHOTOS_FAIL,
						errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
					})
				}
			}
		} catch (err) {
			dispatch({
				type: GET_PHOTOS_FAIL,
				errorMessage: err.toString(),
			})
			Toast.show({
				text: err.toString(),
			})
		}
		dispatch({
			type: GET_PHOTOS_FINISHED,
		})
	}
}

export function acceptTandC() {
	return async dispatch => {
		try {
			await RNSecureKeyStore.set(IS_TANDC_ACCEPTED_KEY, "true", { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
			dispatch({
				type: SET_IS_TANDC_ACCEPTED,
				isTandcAccepted: true,
			})
		} catch (err) {
			dispatch({
				type: SET_IS_TANDC_ACCEPTED,
				isTandcAccepted: false,
			})
			Toast.show({
				text: err.toString(),
				buttonText: "OK",
				duration: 15000,
			})
		}
	}
}

export function setLocationPermission(locationPermission) {
	return {
		type: SET_LOCATION_PERMISSION,
		locationPermission,
	}
}

export function setOrientation(orientation) {
	return {
		type: SET_ORIENTATION,
		orientation,
	}
}

export function setActiveSegment(activeSegment) {
	return async (dispatch, getState) => {
		dispatch({
			type: SET_ACTIVE_SEGMENT,
			activeSegment,
		})
	}
}

export function setSearchTerm(searchTerm) {
	return async (dispatch, getState) => {
		dispatch({
			type: SET_SEARCH_TERM,
			searchTerm,
		})
	}
}

async function getUUID(getState) {
	let { uuid, } = getState().photosList
	if (uuid === null) {
	// try to retreive from secure store
		try {
			uuid = await RNSecureKeyStore.get(UUID_KEY)
		} catch (err) {
			// Toast.show({
			// 	text: err.toString(),
			// 	buttonText: "OK23",
			// 	duration: 15000,
			// })
		}
		// no uuid in the store, generate a new one and store
		// alert(uuid)
		if (uuid === '' || uuid === null) {
			uuid = v4()
			try {
				await RNSecureKeyStore.set(UUID_KEY, uuid, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
			} catch (err) {
				// Toast.show({
				// 	text: err.toString(),
				// 	buttonText: "OK",
				// 	duration: 15000,
				// })
			}
		}
	}
	return uuid
}

async function getTancAccepted(getState) {
	let { isTandcAccepted, } = getState().photosList
	if (isTandcAccepted == null || isTandcAccepted === false) {
		try {
			isTandcAccepted = JSON.parse(await RNSecureKeyStore.get(IS_TANDC_ACCEPTED_KEY))
		} catch (err) {
			isTandcAccepted = false
		}
	}
	return isTandcAccepted
}

async function getLocation() {
	let position = null
	try {
		position = await _getCurrentPosition({
			enableHighAccuracy: false,
			timeout: 200000,
			maximumAge: 200000,
		})
	} catch (err) {
		position = null
		Toast.show({
			text: err.toString(),
			buttonText: "OK",
			duration: 15000,
		})
	}
	return position
}

function _getCurrentPosition(options = {}) {
	return new Promise((resolve, reject) => {
		Geolocation.getCurrentPosition(resolve, reject, options)
		// navigator.geolocation.getCurrentPosition(resolve, reject, options)
	})
}
// https://blog.bam.tech/developper-news/4-ways-to-dispatch-actions-with-redux
// https://hackernoon.com/react-native-basics-geolocation-adf3c0d10112

// https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3
// https://medium.freecodecamp.org/avoiding-the-async-await-hell-c77a0fb71c4c

// https://medium.freecodecamp.org/scaling-your-redux-app-with-ducks-6115955638be

// https://blog.usejournal.com/understanding-react-native-component-lifecycle-api-d78e06870c6d
// https://medium.com/@talkol/redux-thunks-dispatching-other-thunks-discussion-and-best-practices-dd6c2b695ecf
