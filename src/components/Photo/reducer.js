import Toast from 'react-native-toast-message'

// import { CacheManager } from 'expo-cached-image'
import { gql } from '@apollo/client'

// import * as PHOTOS_LIST_ACTION_TYPES from '../../screens/PhotosList/action_types.js'

import * as CONST from '../../consts'

export const initialState = {
  photo: {},
  uuids: [],
  inputText: '',
  error: ''
}

// export default function reducer(state = initialState, action) {
//   switch (action.type) {
//     case ACTION_TYPES.BAN_PHOTO:
//       return {
//         ...state,
//         bans: state.bans.concat(action.photoId),
//       }
//     case ACTION_TYPES.UNBAN_PHOTO:
//       return {
//         ...state,
//         bans: state.bans.filter((item) => item !== action.photoId),
//       }
//     case ACTION_TYPES.SET_INPUT_TEXT:
//       return {
//         ...state,
//         inputText: action.inputText,
//       }
//     default:
//       return state
//   }
// }

export async function watchPhoto({ photo, uuid, topOffset }) {
  try {
    const watchersCount = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation watchPhoto($photoId: String!, $uuid: String!) {
            watchPhoto(photoId: $photoId, uuid: $uuid)
          }
        `,
        variables: {
          photoId: photo.id,
          uuid
        }
      })
    ).data.watchPhoto
    return watchersCount
  } catch (err1) {
    // eslint-disable-next-line no-console
    console.error({ err1 })
    Toast.show({
      text1: 'Unable to Star photo',
      text2: 'Network Issue?',
      type: 'error',
      topOffset
    })
  }
  return null
}

export async function unwatchPhoto({ photo, uuid, topOffset }) {
  try {
    const watchersCount = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation unwatchPhoto($photoId: String!, $uuid: String!) {
            unwatchPhoto(photoId: $photoId, uuid: $uuid)
          }
        `,
        variables: {
          photoId: photo.id,
          uuid
        }
      })
    ).data.unwatchPhoto
    return watchersCount
  } catch (err2) {
    // eslint-disable-next-line no-console
    console.error({ err2 })
    Toast.show({
      text1: 'Unable to un-Star photo',
      text2: 'Maybe Network Issue?',
      type: 'error',
      topOffset
    })
  }
  return null
}

export async function banPhoto({ photo, uuid, topOffset }) {
  try {
    // const abuseReport =
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createAbuseReport($uuid: String!, $photoId: String!) {
          createAbuseReport(uuid: $uuid, photoId: $photoId) {
            createdAt
            id
            updatedAt
            uuid
          }
        }
      `,
      variables: {
        uuid,
        photoId: photo.id
      }
    })

    Toast.show({
      text1: `Abusive Photo reported`,
      type: 'success',
      topOffset
    })
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.error({ err3 })
  }
  return null
}

export async function deletePhoto({ photo, uuid, topOffset }) {
  try {
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation deletePhoto($photoId: String!, $uuid: String!) {
          deletePhoto(photoId: $photoId, uuid: $uuid)
        }
      `,
      variables: {
        photoId: photo.id,
        uuid
      }
    })
    Toast.show({
      text1: `${photo.video ? 'Video' : 'Photo'} deleted`,
      type: 'success',
      topOffset
    })
    return true
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.error({ err3 })
    Toast.show({
      text1: 'Unable to delete',
      text2: 'Network Issue?',
      type: 'error',
      topOffset
    })
  }
  return false
}

export async function sharePhoto({ photo, photoDetails, topOffset }) {
  try {
    const sharingHelper = await import('../../utils/simpleSharingHelper')
    await sharingHelper.sharePhoto(photo, photoDetails, topOffset)
  } catch (err4) {
    // eslint-disable-next-line no-console
    console.error({ err4 })
    Toast.show({
      text1: 'Unable to share photo',
      text2: 'Wait a bit and try again',
      type: 'error',
      topOffset
    })
  }
  return null
}

export async function submitComment({ inputText, photo, uuid, topOffset }) {
  try {
    const comment = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation createComment($photoId: String!, $uuid: String!, $description: String!) {
            createComment(photoId: $photoId, uuid: $uuid, description: $description) {
              id
              active
              comment
              createdAt
            }
          }
        `,
        variables: {
          photoId: photo.id,
          uuid,
          description: inputText
        }
      })
    ).data.createComment

    // lets update the state in the photos collection so it renders the right number of likes in the list
    watchPhoto({ photo, uuid, topOffset })

    Toast.show({
      text1: 'Comment added',
      type: 'success',
      topOffset,
      visibilityTime: 500
    })
  } catch (err5) {
    console.error({ err5 }) // eslint-disable-line
    Toast.show({
      text1: 'Unable to add comment',
      text2: `${err5}`,
      type: 'error',
      topOffset
    })
  }

  return null
}

export const getPhotoDetails = async ({ photoId, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query getPhotoDetails($photoId: String!, $uuid: String!) {
          getPhotoDetails(photoId: $photoId, uuid: $uuid) {
            comments {
              id
              comment
              updatedAt
              uuid
            }
            recognitions {
              metaData
            }
            isPhotoWatched
          }
        }
      `,
      variables: {
        photoId,
        uuid
      },
      fetchPolicy: 'network-only'
    })

    const { recognitions, isPhotoWatched } = response.data.getPhotoDetails

    const comments = response.data.getPhotoDetails.comments.map((comment) => ({
      ...comment,
      hiddenButtons: true
    }))
    return {
      comments,
      recognitions,
      isPhotoWatched
    }
  } catch (err6) {
    console.error({ err6 }) // eslint-disable-line
  }
  return null
}

export function toggleCommentButtons({ photoDetails, commentId }) {
  const comments = photoDetails.comments.map((comment) =>
    comment.id === commentId
      ? {
          ...comment,
          hiddenButtons: !comment.hiddenButtons
        }
      : {
          ...comment,
          hiddenButtons: true
        }
  )

  return {
    ...photoDetails,
    comments
  }
}

export async function deleteComment({ photo, photoDetails, comment, uuid, topOffset }) {
  try {
    const lastComment = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation deleteComment($commentId: ID!, $uuid: String!) {
            deleteComment(commentId: $commentId, uuid: $uuid)
          }
        `,
        variables: {
          commentId: comment.id,
          uuid
        }
      })
    ).data.deleteComment

    // lets update the state in the photos collection so it renders the right number of likes in the list
    Toast.show({
      text1: 'Comment deleted',
      type: 'success',
      topOffset
    })
    return {
      ...photoDetails
    }
  } catch (err7) {
    // eslint-disable-next-line no-console
    console.error({ err7 })
    Toast.show({
      text1: 'Unable to delete comment',
      text2: 'Network Issue?',
      type: 'error',
      topOffset
    })
  }
  return null
}
