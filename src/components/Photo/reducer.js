import branch from 'react-native-branch'

import {
  Toast,
} from 'native-base'

import * as PHOTOS_LIST_ACTION_TYPES from '../../screens/PhotosList/action_types'

import * as CONST from '../../consts'

import * as ACTION_TYPES from './action_types'

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
    case ACTION_TYPES.LIKE_PHOTO:
      return {
        ...state,
        likes: state.likes.concat(action.photoId),
      }
    case ACTION_TYPES.UNLIKE_PHOTO:
      return {
        ...state,
        likes: state.likes.filter(item => item !== action.photoId),
      }
    case ACTION_TYPES.BAN_PHOTO:
      return {
        ...state,
        bans: state.bans.concat(action.photoId),
      }
    case ACTION_TYPES.UNBAN_PHOTO:
      return {
        ...state,
        bans: state.bans.filter(item => item !== action.photoId),
      }
    case ACTION_TYPES.SET_INPUT_TEXT:
      return {
        ...state,
        inputText: action.inputText,
      }
    case ACTION_TYPES.SUBMIT_COMMENT_STARTED:
      return {
        ...state,
        commentsSubmitting: true,
        error: '',
      }
    case ACTION_TYPES.SUBMIT_COMMENT_FAILED:
      return {
        ...state,
        commentsSubmitting: false,
        error: action.error,
      }
    case ACTION_TYPES.SUBMIT_COMMENT_FINISHED:
      return {
        ...state,
        commentsSubmitting: false,
        inputText: '',
        error: '',
      }
    case ACTION_TYPES.GET_COMMENTS_STARTED:
      return {
        ...state,
      }
    case ACTION_TYPES.GET_COMMENTS_FINISHED:
      return {
        ...state,
      }
    case ACTION_TYPES.GET_RECOGNITIONS_STARTED:
      return {
        ...state,
      }
    case ACTION_TYPES.GET_RECOGNITIONS_FINISHED:
      return {
        ...state,
      }
      // case DELETE_PHOTO:
      // 	return state
    case ACTION_TYPES.PHOTO_WATCHED:
      return {
        ...state,
        watched: true,
      }
    case ACTION_TYPES.PHOTO_UNWATCHED:
      return {
        ...state,
        watched: false,
      }
    default:
      return state
  }
}

export function likePhoto({ photoId }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

    dispatch({
      type: ACTION_TYPES.LIKE_PHOTO,
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
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_LIKED,
          photoId,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.UNLIKE_PHOTO,
          photoId,
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.UNLIKE_PHOTO,
        photoId,
      })
    }
  }
}

export function watchPhoto({ item, navigation }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

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
      if (response.status === 201) {
        dispatch({
          type: ACTION_TYPES.PHOTO_WATCHED,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.PHOTO_UNWATCHED,
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.PHOTO_UNWATCHED,
      })
      Toast.show({
        text: "Unable to watch photo. Potential Network Issue.",
        buttonText: "OK",
        type: "warning",
      })
    }
  }
}

export function unwatchPhoto({ item, navigation }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

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
      if (response.status === 200) {
        dispatch({
          type: ACTION_TYPES.PHOTO_UNWATCHED,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.PHOTO_WATCHED,
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.PHOTO_WATCHED,
      })
      Toast.show({
        text: "Unable to unwatch photo. Potential Network Issue.",
        buttonText: "OK",
        type: "warning",
      })
    }
  }
}

export function banPhoto({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

    dispatch({
      type: ACTION_TYPES.BAN_PHOTO,
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
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_BANNED,
          photoId: item.id,
        })
        Toast.show({
          text: "Abusive Photo reported.",
          buttonText: "OK",
          type: "success",
        })
      } else {
        dispatch({
          type: ACTION_TYPES.UNBAN_PHOTO,
          photoId: item.id,
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.UNBAN_PHOTO,
        photoId: item.id,
      })
    }
  }
}

export function deletePhoto({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

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
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_DELETED,
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

export function sharePhoto({ item }) {
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
      const linkProperties = { feature: 'sharing', channel: 'direct', campaign: 'photo sharing' }
      const controlParams = { $photo_id: item.id, $item: item }

      const shareOptions = { messageHeader, emailSubject, messageBody }

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

export function setInputText({ inputText }) {
  if (inputText.length < 140) {
    return {
      type: ACTION_TYPES.SET_INPUT_TEXT,
      inputText,
    }
  }
  return {
    type: ACTION_TYPES.SET_INPUT_TEXT,
    inputText: inputText.substring(0, 140),
  }
}

export function submitComment({ inputText, item, navigation }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
    dispatch({
      type: ACTION_TYPES.SUBMIT_COMMENT_STARTED,
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
          type: ACTION_TYPES.SUBMIT_COMMENT_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.COMMENT_POSTED,
          photoId: item.id,
          comment: responseJson.comment,
        })
        Toast.show({
          text: "Comment submitted.",
          buttonText: "OK",
          type: "success",
        })
        watchPhoto({ item, navigation })
      } else {
        dispatch({
          type: ACTION_TYPES.SUBMIT_COMMENT_FAILED,
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
        type: ACTION_TYPES.SUBMIT_COMMENT_FAILED,
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

export function getComments({ item }) {
  return async (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.GET_COMMENTS_STARTED,
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
          type: ACTION_TYPES.GET_COMMENTS_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
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
          type: ACTION_TYPES.GET_COMMENTS_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
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
        type: ACTION_TYPES.GET_COMMENTS_FINISHED,
      })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
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

export function getRecognitions({ item }) {
  return async (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.GET_RECOGNITIONS_STARTED,
    })
    try {
      const response = await fetch(`${CONST.HOST}/photos/${item.id}/recognitions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const responseJson = await response.json()

      if (response.status === 200) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        dispatch({
          type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
          item,
          recognitions: responseJson.recognition,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
          item,
          recognitions: null,
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
      })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
        item,
        recognitions: null,
      })
      Toast.show({
        text: "Unable to load recognitions. Potential Network Issue.",
        buttonText: "OK",
        type: "warning",
      })
    }
  }
}

export function checkIsPhotoWatched({ item, navigation }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
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
          type: ACTION_TYPES.PHOTO_WATCHED,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.PHOTO_UNWATCHED,
        })
      }
    } catch (err) {
      Toast.show({
        text: "Unable to check if photo is watched. Potential Network Issue.",
        buttonText: "OK",
        type: "warning",
      })
    }
  }
}

export function toggleCommentButtons({ photoId, commentId }) {
  return {
    type: PHOTOS_LIST_ACTION_TYPES.TOGGLE_COMMENT_BUTTONS,
    photoId,
    commentId,
  }
}

export function deleteComment({ photo, comment }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

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
          type: PHOTOS_LIST_ACTION_TYPES.COMMENT_DELETED,
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
