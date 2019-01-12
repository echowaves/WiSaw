import {
	Toast,
} from 'native-base'

import * as CONST from '../../consts.js'

export const SET_FEEDBACK_TEXT = 'wisaw/feedback/SET_FEEDBACK_TEXT'
export const SUBMIT_FEEDBACK_STARTED = 'wisaw/feedback/SUBMIT_FEEDBACK_STARTED'
export const SUBMIT_FEEDBACK_FAIL = 'wisaw/feedback/SUBMIT_FEEDBACK_FAIL'
export const SUBMIT_FEEDBACK_FINISHED = 'wisaw/feedback/SUBMIT_FEEDBACK_FINISHED'

export const initialState = {
	feedbackText: '',
	loading: false,
	errorMessage: '',
	finished: false,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_FEEDBACK_TEXT:
			return {
				...state,
				feedbackText: action.feedbackText,
			}
		case SUBMIT_FEEDBACK_STARTED:
			return {
				...state,
				loading: true,
				errorMessage: '',
				finished: false,
			}
		case SUBMIT_FEEDBACK_FAIL:
			return {
				...state,
				errorMessage: action.errorMessage,
				loading: false,
				finished: true,
			}
		case SUBMIT_FEEDBACK_FINISHED:
			return {
				...state,
				loading: false,
				finished: true,
			}
		default:
			return state
	}
}

export function setFeedbackText({ feedbackText, }) {
	return {
		type: SET_FEEDBACK_TEXT,
		feedbackText,
	}
}

export function submitFeedback({ feedbackText, }) {
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
					description: feedbackText,
				}),
			})
			// const responseJson = await response.json()
			if (response.status === 201) {
				dispatch({
					type: SUBMIT_FEEDBACK_FINISHED,
				})
			} else {
				dispatch({
					type: SUBMIT_FEEDBACK_FAIL,
					errorMessage: 'Something went wrong. Try again later.',
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
