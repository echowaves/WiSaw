import {
	Toast,
} from 'native-base'

import * as CONST from '../../consts.js'

export const SUBMIT_FEEDBACK_STARTED = 'wisaw/feedback/SUBMIT_FEEDBACK_STARTED'
export const SUBMIT_FEEDBACK_FAIL = 'wisaw/feedback/SUBMIT_FEEDBACK_FAIL'
export const SUBMIT_FEEDBACK_FINISHED = 'wisaw/feedback/SUBMIT_FEEDBACK_FINISHED'

export const initialState = {
	isTandcAccepted: false,
	loading: false,
	errorMessage: '',
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SUBMIT_FEEDBACK_STARTED:
			return {
				...state,
				loading: true,
				errorMessage: '',
			}
		case SUBMIT_FEEDBACK_FAIL:
			return {
				...state,
				errorMessage: action.errorMessage,
				loading: false,
			}
		case SUBMIT_FEEDBACK_FINISHED:
			return {
				...state,
				loading: false,
			}
		default:
			return state
	}
}

export async function submitFeedback(feedback) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList
		dispatch({
			type: SUBMIT_FEEDBACK_STARTED,
		})
		try {
			const response = await fetch(`${CONST.HOST}/contactform`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
					description: feedback,
				}),
			})
			const responseJson = await response.json()

			if (responseJson.photos && responseJson.photos.length > 0) {
				dispatch({
					type: SUBMIT_FEEDBACK_FINISHED,
				})
			} else {
				dispatch({
					type: SUBMIT_FEEDBACK_FAIL,
					errorMessage: 'Something went wrong, possibly network issue. Try again later.',
				})
			}
		} catch (err) {
			dispatch({
				type: SUBMIT_FEEDBACK_FAIL,
				errorMessage: err.toString(),
			})
			Toast.show({
				text: err.toString(),
			})
		}
		dispatch({
			type: SUBMIT_FEEDBACK_FINISHED,
		})
	}
}
