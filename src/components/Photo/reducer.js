import branch from 'react-native-branch'

import {
	Toast,
} from 'native-base'

import {
	PHOTO_LIKED,
	PHOTO_BANNED,
	PHOTO_DELETED,
	PHOTO_COMMENTS_LOADED,
	COMMENT_POSTED,
	TOGGLE_COMMENT_BUTTONS,
	COMMENT_DELETED,
} from '../../screens/PhotosList/reducer'

import * as CONST from '../../consts'

export const LIKE_PHOTO = 'wisaw/photo/LIKE_PHOTO'
export const UNLIKE_PHOTO = 'wisaw/photo/UNLIKE_PHOTO' // in case of network error
export const BAN_PHOTO = 'wisaw/photo/BAN_PHOTO'
export const UNBAN_PHOTO = 'wisaw/photo/UNBAN_PHOTO'
export const SET_INPUT_TEXT = 'wisaw/photo/SET_INPUT_TEXT'
export const SUBMIT_COMMENT_STARTED = 'wisaw/photo/SUBMIT_COMMENT_STARTED'
export const SUBMIT_COMMENT_FAILED = 'wisaw/photo/SUBMIT_COMMENT_FAILED'
export const SUBMIT_COMMENT_FINISHED = 'wisaw/photo/SUBMIT_COMMENT_FINISHED'
export const GET_COMMENTS_STARTED = 'wisaw/photo/GET_COMMENTS_STARTED'
export const GET_COMMENTS_FINISHED = 'wisaw/photo/GET_COMMENTS_FINISHED'
export const DELETE_COMMENT = 'wisaw/photo/DELETE_COMMENT'
export const PHOTO_WATCHED = 'wisaw/photo/PHOTO_WATCHED'
export const PHOTO_UNWATCHED = 'wisaw/photo/PHOTO_UNWATCHED'


export const initialState = {
	photo: {},
	likes: [],
	bans: [],
	inputText: '',
	commentsSubmitting: false,
	error: '',
	watched: false,
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
		case GET_COMMENTS_STARTED:
			return {
				...state,
			}
		case GET_COMMENTS_FINISHED:
			return {
				...state,
			}
		// case DELETE_PHOTO:
		// 	return state
		case PHOTO_WATCHED:
			return {
				...state,
				watched: true,
			}
		case PHOTO_UNWATCHED:
			return {
				...state,
				watched: false,
			}
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

export function watchPhoto({ item, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList

		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}/watchers`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
				}),
			})
			// const responseJson = await response.json()
			if (response.status !== 201) {
				alert('watched')
			}
		} catch (err) {
			Toast.show({
				text: "Unable to watch photo. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
		}
	}
}


export function unwatchPhoto({ item, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList

		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}/watchers`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid,
				}),
			})
			// const responseJson = await response.json()
			if (response.status !== 200) {
				alert('unwatched')
			}
		} catch (err) {
			Toast.show({
				text: "Unable to unwatch photo. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
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
				Toast.show({
					text: "Abusive Photo reported.",
					buttonText: "OK",
					type: "success",
				})
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
				Toast.show({
					text: "Unable to delete photo. Try again later.",
					buttonText: "OK",
					type: "warning",
				})
			}
		} catch (err) {
			Toast.show({
				text: "Unable to delete photo. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
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
					title: 'What I saw today:',
					contentDescription: `Cool Photo ${item.id} ${item.likes > 0 ? ` liked ${item.likes} times.` : ''}`,
					contentImageUrl: item.getImgUrl,
					publiclyIndex: true,
					locallyIndex: true,
				}
			)
			let messageBody = 'Check out what I saw today:'
			const messageHeader = 'Check out what I saw today:'
			const emailSubject = 'WiSaw: Check out what I saw today'

			if (item.comments) {
				// get only the 3 comments
				messageBody = `${messageBody}\n\n${
					item.comments.slice(0, 3).map(
						comment => (
							comment.comment
						)
					).join('\n\n')}\n\n${item.likes > 0 ? `Thumbs Up: ${item.likes}\n\n` : ''}`
			}
			const linkProperties = { feature: 'sharing', channel: 'direct', campaign: 'photo sharing', }
			const controlParams = { $photo_id: item.id, $item: item, }

			const shareOptions = { messageHeader, emailSubject, messageBody, }

			// const { channel, completed, error, } =
			await branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams)
		} catch (err) {
			Toast.show({
				text: "Unable to share photo.",
				buttonText: "OK",
				type: "warning",
			})
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
			const responseJson = await response.json()
			if (response.status === 201) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: SUBMIT_COMMENT_FINISHED,
				})
				dispatch({
					type: COMMENT_POSTED,
					photoId: item.id,
					comment: responseJson.comment,
				})
				Toast.show({
					text: "Comment submitted.",
					buttonText: "OK",
					type: "success",
				})
			} else {
				dispatch({
					type: SUBMIT_COMMENT_FAILED,
					error: 'failed submitting comment',
				})
				Toast.show({
					text: "Unable to submit comment. Try again later.",
					buttonText: "OK",
					type: "warning",
				})
			}
		} catch (err) {
			dispatch({
				type: SUBMIT_COMMENT_FAILED,
				error: JSON.stringify(err),
			})
			Toast.show({
				text: "Unable to submit comment. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
		}
	}
}

export function getComments({ item, }) {
	return async (dispatch, getState) => {
		dispatch({
			type: GET_COMMENTS_STARTED,
		})
		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}/comments`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const responseJson = await response.json()

			if (response.status === 200) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: GET_COMMENTS_FINISHED,
				})
				dispatch({
					type: PHOTO_COMMENTS_LOADED,
					item,
					comments: responseJson.comments.map(
						comment => ({
							...comment,
							hiddenButtons: true,
						})
					).reverse(),
				})
			} else {
				dispatch({
					type: GET_COMMENTS_FINISHED,
				})
				dispatch({
					type: PHOTO_COMMENTS_LOADED,
					item,
					comments: [],
				})
				Toast.show({
					text: "Unable to load comments. Try again later.",
					buttonText: "OK",
					type: "warning",
				})
			}
		} catch (err) {
			dispatch({
				type: GET_COMMENTS_FINISHED,
			})
			dispatch({
				type: PHOTO_COMMENTS_LOADED,
				item,
				comments: [],
			})
			Toast.show({
				text: "Unable to load comments. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
		}
	}
}


export function checkIsPhotoWatched({ item, navigation, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList
		try {
			const response = await fetch(`${CONST.HOST}/photos/${item.id}/watchers/${uuid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			// const responseJson = await response.json()
			if (response.status === 200) {
				dispatch({
					type: PHOTO_WATCHED,
				})
				navigation.setParams({ watched: true, })
				return
			}
		} catch (err) {
			Toast.show({
				text: "Unable to check if photo is watched. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
		}
		dispatch({
			type: PHOTO_UNWATCHED,
		})
		navigation.setParams({ watched: false, })
	}
}


export function toggleCommentButtons({ photoId, commentId, }) {
	return {
		type: TOGGLE_COMMENT_BUTTONS,
		photoId,
		commentId,
	}
}

export function deleteComment({ photo, comment, }) {
	return async (dispatch, getState) => {
		const { uuid, } = getState().photosList

		try {
			const response = await fetch(`${CONST.HOST}/comments/${comment.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					deactivatedBy: uuid,
				}),
			})
			// const responseJson = await response.json()
			if (response.status === 200) {
				// lets update the state in the photos collection so it renders the right number of likes in the list
				dispatch({
					type: COMMENT_DELETED,
					photoId: photo.id,
					commentId: comment.id,
				})
			} else {
				Toast.show({
					text: "Unable to delete comment. Try again later.",
					buttonText: "OK",
					type: "warning",
				})
			}
		} catch (err) {
			Toast.show({
				text: "Unable to delete comment. Potential Network Issue.",
				buttonText: "OK",
				type: "warning",
			})
		}
	}
}
