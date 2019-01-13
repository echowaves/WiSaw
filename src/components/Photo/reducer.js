import { PHOTO_LIKED, } from '../../screens/PhotosList/reducer'

import * as CONST from '../../consts'

export const LIKE_PHOTO = 'wisaw/photo/LIKE_PHOTO'
export const UNLIKE_PHOTO = 'wisaw/photo/UNLIKE_PHOTO' // in case of network error
export const DELETE_PHOTO = 'wisaw/photo/DELETE_PHOTO'
export const BAN_PHOTO = 'wisaw/photo/BAN_PHOTO'

export const initialState = {
	likes: [],
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case LIKE_PHOTO:
			return {
				...state,
				likes: state.likes.concat(action.photoId),
			}
		case UNLIKE_PHOTO:
			return {
				...state,
				likes: state.likes.filter(item => item !== action.photoId),
			}
		default:
			return state
	}
}

export function likePhoto({ photoId, }) {
	return async (dispatch, getState) => {
		dispatch({
			type: LIKE_PHOTO,
			photoId,
		})

		try {
			const response = await fetch(`${CONST.HOST}/photos/${photoId}/like`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			// const responseJson = await response.json()
			if (response.status === 200) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: PHOTO_LIKED,
					photoId,
				})
			} else {
				dispatch({
					type: UNLIKE_PHOTO,
					photoId,
				})
			}
		} catch (err) {
			dispatch({
				type: UNLIKE_PHOTO,
				photoId,
			})
		}
	}
}

export function banPhoto({ item, }) {
	alert(`ban ${item.id}`)
	return {
		type: 'RESET_FEEDBACK_FORM',
	}
}

export function deletePhoto({ item, }) {
	alert(`delete ${item.id}`)
	return {
		type: 'RESET_FEEDBACK_FORM',
	}
}
