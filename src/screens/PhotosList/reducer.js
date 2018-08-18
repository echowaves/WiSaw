export const GET_PHOTOS = 'wisaw/photos/LOAD'
export const GET_PHOTOS_SUCCESS = 'wisaw/photos/LOAD_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photos/LOAD_FAIL'
export const SWITCH_PHOTOS_PRESENTATION_MODE = 'wisaw/photos/SWITCH_PHOTOS_PRESENTATION_MODE'

const initialState = {
	photos: [],
	loading: false,
	error: null,
	thumbnailMode: true,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case GET_PHOTOS:
			return {
				...state,
				loading: true,
				error: null,
			}
		case GET_PHOTOS_SUCCESS:
			return {
				...state,
				loading: false,
				photos: action.payload,
				error: null,
			}
		case GET_PHOTOS_FAIL:
			return {
				...state,
				loading: false,
				photos: [],
				error: 'Error while fetching photos',
			}
		case SWITCH_PHOTOS_PRESENTATION_MODE:
			return {
				...state,
				thumbnailMode: !state.thumbnailMode,
			}
		default:
			return state
	}
}

export function listPhotos() {
	return async dispatch => {
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
			dispatch({
				type: GET_PHOTOS_SUCCESS,
				payload: responseJson.photos,
			})
		} catch (err) {
			dispatch({
				type: GET_PHOTOS_FAIL,
			})
		}
	}
}
