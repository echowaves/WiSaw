export const SET_CURRENT_PHOTO_INDEX = 'wisaw/thumbs/SET_CURRENT_PHOTO_INDEX'

export const initialState = {
	currentPhotoIndex: 0,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_CURRENT_PHOTO_INDEX:
			return {
				...state,
				currentPhotoIndex: action.currentPhotoIndex,
			}
		default:
			return state
	}
}

export function setCurrentPhotoIndex(currentPhotoIndex) {
	return {
		type: SET_CURRENT_PHOTO_INDEX,
		currentPhotoIndex,
	}
}
