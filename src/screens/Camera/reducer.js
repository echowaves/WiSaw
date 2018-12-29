export const SET_PREVIEW_URI = 'wisaw/camera/SET_PREVIEW_URI'

export const initialState = {
	previewUri: null,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_PREVIEW_URI:
			return {
				...state,
				previewUri: action.previewUri,
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
