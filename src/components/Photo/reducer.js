import Toast from 'react-native-toast-message'

// import { CacheManager } from 'expo-cached-image'
import { gql } from "@apollo/client"

import * as PHOTOS_LIST_ACTION_TYPES from '../../screens/PhotosList/action_types'

import * as CONST from '../../consts'

import * as ACTION_TYPES from './action_types'

export const initialState = {
  photo: {},
  bans: [],
  inputText: '',
  error: '',
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
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
    default:
      return state
  }
}

export function watchPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret
    try {
      const watchersCount = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation watchPhoto($photoId: ID!, $uuid: String!) {
              watchPhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: photo.id,
            uuid,
          },
        })).data.watchPhoto
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
        photoId: photo.id,
        watchersCount,
      })
      return watchersCount
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
        photoId: photo.id,
        watchersCount: photo.watchersCount,
      })
      Toast.show({
        text1: 'Unable to Star photo',
        text2: 'Network Issue?',
        type: "error",
        topOffset,
      })
    }
  }
}

export function unwatchPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret
    try {
      const watchersCount = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation unwatchPhoto($photoId: ID!, $uuid: String!) {
              unwatchPhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: photo.id,
            uuid,
          },
        })).data.unwatchPhoto
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UNWATCHED,
        photoId: photo.id,
        watchersCount,
      })
      return watchersCount
    } catch (err) {
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_WATCHED,
        photoId: photo.id,
        watchersCount: photo.watchersCount,
      })
      Toast.show({
        text1: "Unable to un-Star photo",
        text2: "Maybe Network Issue?",
        type: "error",
        topOffset,
      })
    }
  }
}

export function banPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret

    dispatch({
      type: ACTION_TYPES.BAN_PHOTO,
      photoId: photo.id,
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
            photoId: photo.id,
          },
        })

      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_BANNED,
        photoId: photo.id,
      })
      Toast.show({
        text1: `Abusive Photo reported`,
        type: "success",
        topOffset,
      })
    } catch (err) {
      // console.error({ err })
      dispatch({
        type: ACTION_TYPES.UNBAN_PHOTO,
        photoId: photo.id,
      })
    }
  }
}

export function deletePhoto({ photo }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret

    try {
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation deletePhoto($photoId: ID!, $uuid: String!) {
              deletePhoto(photoId: $photoId, uuid: $uuid)
            }`,
          variables: {
            photoId: photo.id,
            uuid,
          },
        })
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.PHOTO_DELETED,
        photoId: photo.id,
      })
      Toast.show({
        text1: `${photo.video ? 'Video' : 'Photo'} deleted`,
        type: "success",
        topOffset,
      })
    } catch (err) {
      Toast.show({
        text1: "Unable to delete",
        text2: "Network Issue?",
        type: "error",
        topOffset,
      })
    }
  }
}

export function sharePhoto({ photo, photoDetails }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList

    try {
      // eslint-disable-next-line no-undef
      if (!__DEV__) {
        const branchHelper = await import('../../branch_helper')
        await branchHelper.sharePhoto({ photo, photoDetails })
      } else {
        alert("The feature is not supported on this device yet, try again later")
      }
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: "Unable to share photo",
        text2: "Wait a bit and try again",
        type: "error",
        topOffset,
      })
    }
  }
}

export function submitComment({ inputText, uuid, photo }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList

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
            photoId: photo.id,
            uuid,
            description: inputText,
          },
        })).data.createComment

      // lets update the state in the photos collection so it renders the right number of likes in the list
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.COMMENT_ADDED,
        photoId: photo.id,
        commentId: comment.id,
        lastComment: comment.comment,
        commentsCount: photo.commentsCount,
      })
      dispatch(watchPhoto({ photo }))

      Toast.show({
        text1: "Comment added",
        type: "success",
        topOffset,
      })
    } catch (err) {
      // console.log({ err })// eslint-disable-line
      Toast.show({
        text1: "Unable to add comment",
        text2: `${err}`,
        type: 'error',
        topOffset,
      })
    }
  }
}

export const getPhotoDetails = async ({ photoId, uuid }) => {
  try {
    const response = (await CONST.gqlClient
      .query({
        query: gql`
        query getPhotoDetails($photoId: ID!, $uuid: String!) {
          getPhotoDetails(photoId: $photoId, uuid: $uuid,) {
            comments {
                  id
                  comment
                  updatedAt
                  uuid
                }
                recognitions{
                  metaData
                }
                isPhotoWatched
              }
        }`,
        variables: {
          photoId,
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
    return {
      comments,
      recognitions,
      isPhotoWatched,
    }
  } catch (err) {
      console.log({ err })// eslint-disable-line
  }
}

export function toggleCommentButtons({ photoDetails, commentId }) {
  const comments = photoDetails.comments.map(
    comment => ((comment.id === commentId)
      ? {
        ...comment,
        hiddenButtons: !comment.hiddenButtons,
      }
      : {
        ...comment,
        hiddenButtons: true,
      }
    )
  )

  return {
    ...photoDetails,
    comments,
  }
}

export function deleteComment({ photo, photoDetails, comment }) {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret

    try {
      const lastComment = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation deleteComment($commentId: ID!, $uuid: String!) {
              deleteComment(commentId: $commentId, uuid: $uuid)
            }`,
          variables: {
            commentId: comment.id,
            uuid,
          },
        })).data.deleteComment

      // lets update the state in the photos collection so it renders the right number of likes in the list
      dispatch({
        type: PHOTOS_LIST_ACTION_TYPES.COMMENT_DELETED,
        photoId: photo.id,
        commentId: comment.id,
        lastComment,
        commentsCount: photo.commentsCount,
      })
      Toast.show({
        text1: "Comment deleted",
        type: "success",
        topOffset,
      })
      return {
        ...photoDetails,

      }
    } catch (err) {
      Toast.show({
        text1: "Unable to delete comment",
        text2: "Network Issue?",
        type: "error",
        topOffset,
      })
    }
  }
}
