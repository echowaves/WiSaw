// import Branch from '../../util/my-branch'
import * as SMS from 'expo-sms'

import axios from 'axios'

import Toast from 'react-native-toast-message'

import { getContentUri } from 'expo-cached-image'

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
    // case ACTION_TYPES.GET_COMMENTS_STARTED:
    //   return {
    //     ...state,
    //   }
    // case ACTION_TYPES.GET_COMMENTS_FINISHED:
    //   return {
    //     ...state,
    //   }
    // case ACTION_TYPES.GET_RECOGNITIONS_STARTED:
    //   return {
    //     ...state,
    //   }
    // case ACTION_TYPES.GET_RECOGNITIONS_FINISHED:
    //   return {
    //     ...state,
    //   }
      // case DELETE_PHOTO:
      // 	return state
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
      const response = await axios({
        method: 'PUT',
        url: `${CONST.HOST}/photos/${photoId}/like`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
        },
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

export function watchPhoto({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
    try {
      const response = await axios({
        method: 'POST',
        url: `${CONST.HOST}/photos/${item.id}/watchers`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
        },
      })

      // const responseJson = await response.json()
      if (response.status === 201) {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
          item,
        })
      } else {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
          item,
        })
      }
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
        item,
      })
      Toast.show({
        text1: 'Unable to watch photo.',
        text2: 'Potential Network Issue.',
        type: "error",
      })
    }
  }
}

export function unwatchPhoto({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

    try {
      const response = await axios({
        method: 'DELETE',
        url: `${CONST.HOST}/photos/${item.id}/watchers`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
        },
      })

      // const responseJson = await response.json()
      if (response.status === 200) {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
          item,
        })
      } else {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
          item,
        })
      }
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
        item,
      })
      Toast.show({
        text1: "Unable to unwatch photo.",
        text2: "Potential Network Issue.",
        type: "error",
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
      const response = await axios({
        method: 'POST',
        url: `${CONST.HOST}/abusereport`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
          photoId: item.id,
        },
      })
      // const responseJson = await response.json()
      if (response.status === 201) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_BANNED,
          photoId: item.id,
        })
        Toast.show({
          text1: "Abusive Photo reported.",
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
      const response = await axios({
        method: 'DELETE',
        url: `${CONST.HOST}/photos/${item.id}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
        },
      })
      // const responseJson = await response.json()
      if (response.status === 200) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_DELETED,
          photoId: item.id,
        })
        Toast.show({
          text1: "Photo deleted.",
          text2: "No one will be able to see it any more.",
          type: "success",
        })
      } else {
        Toast.show({
          text1: "Unable to delete photo.",
          text2: "Try again later.",
          type: "error",
        })
      }
    } catch (err) {
      Toast.show({
        text1: "Unable to delete photo.",
        text2: "Potential Network Issue.",
        type: "error",
      })
    }
  }
}

export function sharePhoto({ item }) {
  return async (dispatch, getState) => {
    try {
      // only canonicalIdentifier is required
      // const branchUniversalObject = await Branch.createBranchUniversalObject(
      //   `photo/${item.id}`,
      //   {
      //     title: 'What I saw today:',
      //     contentDescription: `Cool Photo ${item.id} ${item.likes > 0 ? ` liked ${item.likes} times.` : ''}`,
      //     contentImageUrl: item.getImgUrl,
      //     publiclyIndex: true,
      //     locallyIndex: true,
      //   }
      // )

      let messageBody = 'Check out what I saw today:'
      // const messageHeader = 'Check out what I saw today:'
      // const emailSubject = 'WiSaw: Check out what I saw today'

      if (item.comments) {
        // get only the 3 comments
        messageBody = `${messageBody}\n\n${
          item.comments.slice(0, 3).map(
            comment => (
              comment.comment
            )
          ).join('\n\n')}\n\n${item.likes > 0 ? `Thumbs Up: ${item.likes}\n\n` : ''}`
      }
      messageBody = `${messageBody}\nhttps://www.wisaw.com/photos/${item.id}`
      // const linkProperties = { feature: 'sharing', channel: 'direct', campaign: 'photo sharing' }
      // const controlParams = { $photo_id: item.id, $item: item }
      //
      // const shareOptions = { messageHeader, emailSubject, messageBody }
      //
      // const { channel, completed, error, } =
      // await branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams)

      if (!(await SMS.isAvailableAsync())) {
        throw (new Error("SMS is not available."))
      }
      const uri = await getContentUri({ key: `${item.id}i` })

      await SMS.sendSMSAsync(
        [],
        messageBody,
        {
          attachments: {
            uri,
            mimeType: 'image/jpeg',
            filename: `${item.id}i.jpg`,
          },
        }
      )
    } catch (err) {
      Toast.show({
        text1: "Unable to share photo.",
        text2: "Sharing may not be supported on your device yet. Try again later.",
        type: "error",
      })
    }
  }
}

// export function setInputText({ inputText }) {
//   if (inputText.length < 140) {
//     return {
//       type: ACTION_TYPES.SET_INPUT_TEXT,
//       inputText,
//     }
//   }
//   return {
//     type: ACTION_TYPES.SET_INPUT_TEXT,
//     inputText: inputText.substring(0, 140),
//   }
// }

export function submitComment({ inputText, uuid, item }) {
  return async dispatch => {
    dispatch({
      type: ACTION_TYPES.SUBMIT_COMMENT_STARTED,
    })
    try {
      const response = await axios({
        method: 'POST',
        url: `${CONST.HOST}/photos/${item.id}/comments`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uuid,
          comment: inputText,
        },
      })
      if (response.status === 201) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        dispatch({
          type: ACTION_TYPES.SUBMIT_COMMENT_FINISHED,
        })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.COMMENT_POSTED,
          photoId: item.id,
          comment: response.data.comment,
        })
        Toast.show({
          text1: "Comment submitted.",
          type: "success",
        })
        dispatch(watchPhoto({ item }))
      } else {
        dispatch({
          type: ACTION_TYPES.SUBMIT_COMMENT_FAILED,
          error: 'failed submitting comment',
        })
        Toast.show({
          text1: "Unable to submit comment.",
          text2: "Try again later.",
          type: "error",
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.SUBMIT_COMMENT_FAILED,
        error: JSON.stringify(err),
      })
      Toast.show({
        text1: "Unable to submit comment.",
        type: "error",
      })
    }
  }
}

export function getComments({ item }) {
  return async (dispatch, getState) => {
    // dispatch({
    //   type: ACTION_TYPES.GET_COMMENTS_STARTED,
    // })
    try {
      const response = await axios({
        method: 'GET',
        url: `${CONST.HOST}/photos/${item.id}/comments`,
        headers: {
          'Content-Type': 'application/json',
        },
        // data: {
        //   uuid,
        // },
      })

      if (response.status === 200) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        // dispatch({
        //   type: ACTION_TYPES.GET_COMMENTS_FINISHED,
        // })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
          item,
          comments: response.data.comments.map(
            comment => ({
              ...comment,
              hiddenButtons: true,
            })
          ).reverse(),
        })
      } else {
        // dispatch({
        //   type: ACTION_TYPES.GET_COMMENTS_FINISHED,
        // })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
          item,
          comments: [],
        })
        Toast.show({
          text1: "Unable to load comments.",
          text2: "Try again later.",
          type: "error",
        })
      }
    } catch (err) {
      // dispatch({
      //   type: ACTION_TYPES.GET_COMMENTS_FINISHED,
      // })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_COMMENTS_LOADED,
        item,
        comments: [],
      })
      Toast.show({
        text1: "Unable to load comments.",
        text2: "Potential Network Issue.",
        type: "error",
      })
    }
  }
}

export function getRecognitions({ item }) {
  return async (dispatch, getState) => {
    // dispatch({
    //   type: ACTION_TYPES.GET_RECOGNITIONS_STARTED,
    // })
    try {
      const response = await axios({
        method: 'GET',
        url: `${CONST.HOST}/photos/${item.id}/recognitions`,
        headers: {
          'Content-Type': 'application/json',
        },
        // data: {
        //   uuid,
        // },
      })

      if (response.status === 200) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        // dispatch({
        //   type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
        // })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
          item,
          recognitions: response.data.recognition,
        })
      } else {
        // dispatch({
        //   type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
        // })
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
          item,
          recognitions: null,
        })
      }
    } catch (err) {
      // dispatch({
      //   type: ACTION_TYPES.GET_RECOGNITIONS_FINISHED,
      // })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED,
        item,
        recognitions: null,
      })
      Toast.show({
        text1: "Unable to load recognitions.",
        text2: "Potential Network Issue.",
        type: "error",
      })
    }
  }
}

export function checkIsPhotoWatched({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
    try {
      const response = await axios({
        method: 'GET',
        url: `${CONST.HOST}/photos/${item.id}/watchers/${uuid}`,
        headers: {
          'Content-Type': 'application/json',
        },
        // data: {
        //   uuid,
        // },
      })
      // const responseJson = await response.json()
      if (response.status === 200) {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
          item,
        })
      }
    } catch (err) {
      if (err.response.status === 404) {
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
          item,
        })
      } else {
        Toast.show({
          text1: "Unable to check if photo is watched.",
          text2: "Potential Network Issue.",
          type: "error",
        })
      }
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
      const response = await axios({
        method: 'DELETE',
        url: `${CONST.HOST}/comments/${comment.id}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          deactivatedBy: uuid,
        },
      })

      // const responseJson = await response.json()
      if (response.status === 200) {
        // lets update the state in the photos collection so it renders the right number of likes in the list
        dispatch({
          type: PHOTOS_LIST_ACTION_TYPES.COMMENT_DELETED,
          photoId: photo.id,
          commentId: comment.id,
        })
        Toast.show({
          text1: "Comment deleted.",
          type: "success",
        })
      } else {
        Toast.show({
          text1: "Unable to delete comment.",
          text2: "Try again later.",
          type: "error",
        })
      }
    } catch (err) {
      Toast.show({
        text1: "Unable to delete comment.",
        text2: "Potential Network Issue.",
        type: "error",
      })
    }
  }
}
