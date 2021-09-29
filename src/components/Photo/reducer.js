// import Branch from '../../util/my-branch'
// import * as SMS from 'expo-sms'

import Toast from 'react-native-toast-message'

// import { CacheManager } from 'expo-cached-image'

import { gql } from "@apollo/client"

// import Branch, { BranchEvent } from 'expo-branch'

import * as PHOTOS_LIST_ACTION_TYPES from '../../screens/PhotosList/action_types'

import * as CONST from '../../consts'

import * as ACTION_TYPES from './action_types'

export const initialState = {
  photo: {},
  bans: [],
  inputText: '',
  commentsSubmitting: false,
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

export function watchPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { uuid, headerHeight } = getState().photosList
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
        text1: 'Unable to watch photo.',
        text2: 'Network Issue?',
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}

export function unwatchPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { uuid, headerHeight } = getState().photosList
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
        text1: "Unable to unwatch photo.",
        text2: "Maybe Network Issue?",
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}

export function banPhoto({ photo }) {
  return async (dispatch, getState) => {
    const { uuid, headerHeight } = getState().photosList

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
        topOffset: headerHeight + 15,
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
    const { uuid, headerHeight } = getState().photosList

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
        text1: "Photo deleted from the Cloud.",
        text2: "No one will be able to see it any more.",
        type: "success",
        topOffset: headerHeight + 15,
      })
    } catch (err) {
      Toast.show({
        text1: "Unable to delete photo.",
        text2: "Network Issue?",
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}

export function sharePhoto({ photo, photoDetails, branchUniversalObject }) {
  return async (dispatch, getState) => {
    const { headerHeight } = getState().photosList

    try {
      let messageBody = `Check out what I saw today${photo?.video ? " (video)" : ''}:`
      // const messageHeader = 'Check out what I saw today:'
      const emailSubject = 'WiSaw: Check out what I saw today'

      if (photoDetails.comments) {
        // get only the 3 comments
        messageBody = `${messageBody}\n\n${
          photoDetails.comments.slice(0, 3).map(
            comment => (
              comment.comment
            )
          ).join('\n\n')}\n\n`
      }

      const shareOptions = {
        messageHeader: "What I Saw today...",
        messageBody,
        emailSubject,
        // attachments: {
        //   uri: branchUniversalObject.canonicalUrl,
        //   mimeType: 'image/jpeg',
        //   // filename: `${item.id}ii.jpg`,
        // },
      }
      await branchUniversalObject.showShareSheet(shareOptions)

      //
      // if (!(await SMS.isAvailableAsync())) {
      //   throw (new Error("SMS is not available."))
      // }
      // const uri = await CacheManager.getCachedUri({ key: `${item.id}` })
      //
      // await SMS.sendSMSAsync(
      //   [],
      //   messageBody,
      //   {
      //     attachments: {
      //       uri,
      //       mimeType: 'image/jpeg',
      //       filename: `${item.id}i.jpg`,
      //     },
      //   }
      // )
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: "Unable to share photo.",
        text2: "Wait for a bit and try again...",
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}

export function submitComment({ inputText, uuid, photo }) {
  return async (dispatch, getState) => {
    const { headerHeight } = getState().photosList

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

      Toast.show({
        text1: "Comment submitted.",
        type: "success",
        topOffset: headerHeight + 15,
      })
      dispatch(watchPhoto({ photo }))
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
        topOffset: headerHeight + 15,
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
    const { uuid, headerHeight } = getState().photosList

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
        text1: "Comment deleted.",
        type: "success",
        topOffset: headerHeight + 15,
      })
      return {
        ...photoDetails,

      }
    } catch (err) {
      Toast.show({
        text1: "Unable to delete comment.",
        text2: "Network Issue?",
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}
