import {
	Toast,
} from 'native-base'


export const GET_PHOTOS = 'wisaw/photos/LOAD'
export const GET_PHOTOS_SUCCESS = 'wisaw/photos/LOAD_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photos/LOAD_FAIL'

export const initialState = {
	photos: [],
	loading: false,
	errorMessage: '',
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case GET_PHOTOS:
			return {
				...state,
				loading: true,
				errorMessage: '',
			}
		case GET_PHOTOS_SUCCESS:
			return {
				...state,
				loading: false,
				photos: action.payload,
				errorMessage: '',
			}
		case GET_PHOTOS_FAIL:
			return {
				...state,
				loading: false,
				photos: [],
				errorMessage: action.errorMessage,
			}
		default:
			return state
	}
}

export function listPhotos() {
	return async dispatch => {
		dispatch({
			type: GET_PHOTOS,
		})
		try {
			const response = await fetch('https://api.wisaw.com/photos/feed', {
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
				}),
			})
			// await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
			const responseJson = await response.json()
			if (responseJson.photos) {
				dispatch({
					type: GET_PHOTOS_SUCCESS,
					payload: responseJson.photos,
				})
			} else {
				dispatch({
					type: GET_PHOTOS_FAIL,
					errorMessage: 'Failed to load photos',
				})
				Toast.show({
					text: 'Failed to load photos',
				})
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
	}
}
