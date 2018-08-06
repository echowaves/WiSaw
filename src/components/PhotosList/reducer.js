export const GET_PHOTOS = 'wisaw/photos/LOAD'
export const GET_PHOTOS_SUCCESS = 'wisaw/photos/LOAD_SUCCESS'
export const GET_PHOTOS_FAIL = 'wisaw/photos/LOAD_FAIL'

export default function reducer(state = { photos: [], }, action) {
	switch (action.type) {
		case GET_PHOTOS:
			return { ...state, loading: true, }
		case GET_PHOTOS_SUCCESS:
			return { ...state, loading: false, photos: action.payload.data, }
		case GET_PHOTOS_FAIL:
			return {
				...state,
				loading: false,
				error: 'Error while fetching photos',
			}
		default:
			return state
	}
}

export function listPhotos() {
	return {
		type: GET_PHOTOS,
		payload: {
			request: {
				url: `/photos/feed`,
			},
		},
	}
}
