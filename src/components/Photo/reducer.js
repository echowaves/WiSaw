import { Alert, } from 'react-native'

import branch from 'react-native-branch'

import {
	PHOTO_LIKED,
	PHOTO_BANNED,
	PHOTO_DELETED,
} from '../../screens/PhotosList/reducer'

import * as CONST from '../../consts'

export const LIKE_PHOTO = 'wisaw/photo/LIKE_PHOTO'
export const UNLIKE_PHOTO = 'wisaw/photo/UNLIKE_PHOTO' // in case of network error
export const DELETE_PHOTO = 'wisaw/photo/DELETE_PHOTO'
export const BAN_PHOTO = 'wisaw/photo/BAN_PHOTO'
export const UNBAN_PHOTO = 'wisaw/photo/UNBAN_PHOTO'
export const SET_INPUT_TEXT = 'wisaw/photo/SET_INPUT_TEXT'
export const SUBMIT_COMMENT_STARTED = 'wisaw/photo/SUBMIT_COMMENT_STARTED'
export const SUBMIT_COMMENT_FAILED = 'wisaw/photo/SUBMIT_COMMENT_FAILED'
export const SUBMIT_COMMENT_FINISHED = 'wisaw/photo/SUBMIT_COMMENT_FINISHED'

export const initialState = {
	photo: {},
	likes: [],
	bans: [],
	inputText: '',
	commentsSubmitting: false,
	error: '',
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
		case BAN_PHOTO:
			return {
				...state,
				bans: state.bans.concat(action.photoId),
			}
		case UNBAN_PHOTO:
			return {
				...state,
				bans: state.bans.filter(item => item !== action.photoId),
			}
		case SET_INPUT_TEXT:
			return {
				...state,
				inputText: action.inputText,
			}
		case SUBMIT_COMMENT_STARTED:
			return {
				...state,
				commentsSubmitting: true,
				error: '',
			}
		case SUBMIT_COMMENT_FAILED:
			return {
				...state,
				commentsSubmitting: false,
				error: action.error,
			}
		case SUBMIT_COMMENT_FINISHED:
			return {
				...state,
				commentsSubmitting: false,
				inputText: '',
				error: '',
			}
		// case DELETE_PHOTO:
		// 	return state
		default:
			return state
	}
}

export function likePhoto({ photoId, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList

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
				body: JSON.stringify({
					uuid,
				}),
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
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList

		dispatch({
			type: BAN_PHOTO,
			photoId: item.id,
		})

		try {
			const response = await fetch(`${CONST.HOST}/abusereport`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
					photoId: item.id,
				}),
			})
			// const responseJson = await response.json()
			if (response.status === 201) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: PHOTO_BANNED,
					photoId: item.id,
				})
				Alert.alert(
					'Abusive Photo reported.',
					'Thank you.',
					[
						{ text: 'OK', onPress: () => null, },
					],
				)
			} else {
				dispatch({
					type: UNBAN_PHOTO,
					photoId: item.id,
				})
			}
		} catch (err) {
			dispatch({
				type: UNBAN_PHOTO,
				photoId: item.id,
			})
		}
	}
}

export function deletePhoto({ item, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList
		// const { uuid, } = getState().photosList
		dispatch({
			type: DELETE_PHOTO,
			photoId: item.id,
		})

		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
				}),
			})
			// const responseJson = await response.json()
			if (response.status === 200) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: PHOTO_DELETED,
					photoId: item.id,
				})
			} else {
				Alert.alert(
					'Unable to delete photo.',
					'Try again later.',
					[
						{ text: 'OK', onPress: () => null, },
					],
				)
			}
		} catch (err) {
			Alert.alert(
				'Unable to delete photo.',
				'Potential Network Issue. Try again later.',
				[
					{ text: 'OK', onPress: () => null, },
				],
			)
		}
	}
}

export function sharePhoto({ item, }) {
	return async (dispatch, getState) => {
		try {
			// only canonicalIdentifier is required
			const branchUniversalObject = await branch.createBranchUniversalObject(
				`photo/${item.id}`,
				{
					canonicalUrl: item.getThumbUrl,
					title: 'What I saw today:',
					contentDescription: `Cool Photo ${item.id} ${item.likes > 0 ? ` liked ${item.likes} times.` : ''}`,
					contentImageUrl: item.getImgUrl,
					publiclyIndex: true,
					locallyIndex: true,
				}
			)

			const shareOptions = { messageHeader: 'Check out what I saw today:', messageBody: 'Check out what I saw today:', }
			const linkProperties = { feature: 'sharing', channel: 'direct', campaign: 'photo sharing', }
			const controlParams = { $photo_id: item.id, $item: item, }
			// const { channel, completed, error, } =
			await branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams)
		} catch (err) {
			Alert.alert(
				'Unable to share photo.',
				'Try again later.',
				[
					{ text: 'OK', onPress: () => null, },
				],
			)
		}
	}
}

export function setInputText({ inputText, }) {
	if (inputText.length < 140) {
		return {
			type: SET_INPUT_TEXT,
			inputText,
		}
	}
	return {
		type: SET_INPUT_TEXT,
		inputText: inputText.substring(0, 140),
	}
}

export function submitComment({ inputText, item, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList
		dispatch({
			type: SUBMIT_COMMENT_STARTED,
		})
		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
					comment: inputText,
				}),
			})
			// const responseJson = await response.json()
			if (response.status === 201) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: SUBMIT_COMMENT_FINISHED,
				})
			} else {
				dispatch({
					type: SUBMIT_COMMENT_FAILED,
					error: 'failed submitting comment',
				})
				Alert.alert(
					'Unable to submit comment.',
					'Try again later.',
					[
						{ text: 'OK', onPress: () => null, },
					],
				)
			}
		} catch (err) {
			dispatch({
				type: SUBMIT_COMMENT_FAILED,
				error: JSON.stringify(err),
			})
			Alert.alert(
				'Unable to submit comment.',
				'Potential Network Issue. Try again later.',
				[
					{ text: 'OK', onPress: () => null, },
				],
			)
		}
	}
}
