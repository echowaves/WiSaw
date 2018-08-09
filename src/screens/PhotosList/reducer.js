export const GET_PHOTOS = 'wisaw/photos/LOAD'
export const GET_PHOTOS_SUCCESS = 'wisaw/photos/LOAD_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photos/LOAD_FAIL'

const initialState = { photos: [], }

export default function reducer(state = initialState, action) {
	console.log({ action,	})
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
				photos: [], // action.payload,
				error: null,
			}
		case GET_PHOTOS_FAIL:
			return {
				...state,
				loading: false,
				photos: [],
				error: 'Error while fetching photos',
			}
		default:
			return state
	}
}

export function listPhotos() {
	console.log('list photos called')
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
			console.log(response)
			dispatch({
				type: GET_PHOTOS_SUCCESS,
				payload: response.body.photos,
			})
		} catch (err) {
			dispatch({
				type: GET_PHOTOS_FAIL,
			})
		}
	}
}
