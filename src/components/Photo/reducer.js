// import Branch from '../../util/my-branch'
import * as SMS from 'expo-sms'

import Toast from 'react-native-toast-message'

import { CacheManager } from 'expo-cached-image'

import { gql } from "@apollo/client"

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
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation likePhoto($photoId: ID!, $uuid: String!) {
              likePhoto(photoId: $photoId, uuid: $uuid)
                     {
                        id
                      }
            }`,
          variables: {
            photoId,
            uuid,
          },
        })

      // lets update the state in the photos collection so it renders the right number of likes in the list
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_LIKED,
        photoId,
      })
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
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation watchPhoto($photoId: ID!, $uuid: String!) {
              watchPhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: item.id,
            uuid,
          },
        })

      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
        item,
      })
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
        item,
      })
      Toast.show({
        text1: 'Unable to watch photo.',
        text2: 'Network Issue?',
        type: "error",
        topOffset: 70,
      })
    }
  }
}

export function unwatchPhoto({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
    try {
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation unwatchPhoto($photoId: ID!, $uuid: String!) {
              unwatchPhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: item.id,
            uuid,
          },
        })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
        item,
      })
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
        item,
      })
      Toast.show({
        text1: "Unable to unwatch photo.",
        text2: "Maybe Network Issue?",
        type: "error",
        topOffset: 70,
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
      // const abuseReport =
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation createAbuseReport($uuid: String!, $photoId: ID!) {
              createAbuseReport(uuid: $uuid, photoId: $photoId)
                     {
                        createdAt
                        id
                        updatedAt
                        uuid
                      }
            }`,
          variables: {
            uuid,
            photoId: item.id,
          },
        })

      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_BANNED,
        photoId: item.id,
      })
      Toast.show({
        text1: `Abusive Photo reported`,
        type: "success",
        topOffset: 70,
      })
    } catch (err) {
      // console.error({ err })
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
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation deletePhoto($photoId: ID!, $uuid: String!) {
              deletePhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: item.id,
            uuid,
          },
        })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_DELETED,
        photoId: item.id,
      })
      Toast.show({
        text1: "Photo deleted from the Cloud.",
        text2: "No one will be able to see it any more.",
        type: "success",
        topOffset: 70,
      })
    } catch (err) {
      Toast.show({
        text1: "Unable to delete photo.",
        text2: "Network Issue?",
        type: "error",
        topOffset: 70,
      })
    }
  }
}

export function sharePhoto({ item }) {
  return async (dispatch, getState) => {
    try {
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
      const uri = await CacheManager.getCachedUri({ key: `${item.id}` })

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
        text2: "Wait for a bit and try again...",
        type: "error",
        topOffset: 70,
      })
    }
  }
}

export function submitComment({ inputText, uuid, item }) {
  return async dispatch => {
    dispatch({
      type: ACTION_TYPES.SUBMIT_COMMENT_STARTED,
    })
    try {
      const comment = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation createComment($photoId: ID!, $uuid: String!, $description: String!) {
              createComment(photoId: $photoId, uuid: $uuid, description: $description) {
                id
                active
                comment
                createdAt
              }
            }`,
          variables: {
            photoId: item.id,
            uuid,
            description: inputText,
          },
        })).data.createComment

      // lets update the state in the photos collection so it renders the right number of likes in the list
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.COMMENT_ADDED,
        photoId: item.id,
        commentId: comment.id,
      })

      Toast.show({
        text1: "Comment submitted.",
        type: "success",
        topOffset: 70,
      })
      dispatch(watchPhoto({ item }))
    } catch (err) {
      console.log({ err })// eslint-disable-line
      dispatch({
        type: ACTION_TYPES.SUBMIT_COMMENT_FAILED,
        error: JSON.stringify(err),
      })
      Toast.show({
        text1: "Unable to submit comment.",
        text2: "Network Issue?",
        type: "error",
        topOffset: 70,
      })
    }
  }
}

export function getPhotoDetails({ item }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

    try {
      const response = (await CONST.gqlClient
        .query({
          query: gql`
        query getPhotoDetails($photoId: ID!, $uuid: String!) {
          getPhotoDetails(photoId: $photoId, uuid: $uuid,) {
            comments {
                  id
                  comment
                }
                recognitions{
                  metaData
                }
                isPhotoWatched
              }
        }`,
          variables: {
            photoId: item.id,
            uuid,
          },
          fetchPolicy: "network-only",
        }))

      const {
        recognitions,
        isPhotoWatched,
      } = response.data.getPhotoDetails
      const comments = response.data.getPhotoDetails.comments.map(comment => ({
        ...comment,
        hiddenButtons: true,

      }))

      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_DETAILS_LOADED,
        item,
        comments,
        recognitions,
        isPhotoWatched,
      })
    } catch (err) {
      console.log({ err })// eslint-disable-line
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
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation deleteComment($commentId: ID!, $uuid: String!) {
              deleteComment(commentId: $commentId, uuid: $uuid)
            }`,
          variables: {
            commentId: comment.id,
            uuid,
          },
        })

      // lets update the state in the photos collection so it renders the right number of likes in the list
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.COMMENT_DELETED,
        photoId: photo.id,
        commentId: comment.id,
      })
      Toast.show({
        text1: "Comment deleted.",
        type: "success",
        topOffset: 70,
      })
    } catch (err) {
      Toast.show({
        text1: "Unable to delete comment.",
        text2: "Network Issue?",
        type: "error",
        topOffset: 70,
      })
    }
  }
}
