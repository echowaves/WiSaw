import {
	Toast,
} from 'native-base'

import { store, } from '../../../App'

export const GET_PHOTOS_STARTED = 'wisaw/photosList/GET_PHOTOS'
export const GET_PHOTOS_SUCCESS = 'wisaw/photosList/GET_PHOTOS_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photosList/GET_PHOTOS_FAIL'
export const GET_PHOTOS_FINISHED = 'wisaw/photosList/GET_PHOTOS_FINISHED'
export const RESET_STATE = 'wisaw/photosList/RESET_STATE'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
	photos: [],
	loading: false,
	errorMessage: '',
	daysAgo: 0,
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
				photos: state.photos.concat(action.photos),
				daysAgo: state.daysAgo + 1,
				errorMessage: '',
			}
		case GET_PHOTOS_FAIL:
			return {
				...state,
				daysAgo: state.daysAgo + 1,
				errorMessage: action.errorMessage,
			}
		case GET_PHOTOS_FINISHED:
			return {
				...state,
				loading: false,
			}
		case RESET_STATE:
			return initialState
		default:
			return state
	}
}

export function resetState() {
	return {
		type: RESET_STATE,
	}
}

async function _requestPhotos() {
	const { daysAgo, } = store.getState().photosList
	const response = await fetch('https://api.wisaw.com/photos/feedByDate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uuid: '123123123',
			location: {
				type: 'Point',
				coordinates: [
					38.80,
					-77.98,
				],
			},
			daysAgo,
			timeZoneShiftHours: new Date().getTimezoneOffset() / 60,
		}),
	})
	const responseJson = await response.json()
	return responseJson
}


export function getPhotos() {
	return async dispatch => {
		dispatch({
			type: GET_PHOTOS_STARTED,
		})
		try {
			let responseJson
			do {
				/* eslint-disable no-await-in-loop */
				responseJson = await _requestPhotos()
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
			} while (
				(responseJson.photos.length === 0 && store.getState().photosList.daysAgo < 3000)
				|| (responseJson.photos.length > 0 && store.getState().photosList.daysAgo < 10)
			)
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
