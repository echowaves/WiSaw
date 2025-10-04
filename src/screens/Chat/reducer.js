// import { Platform } from 'react-native'

import * as FileSystem from 'expo-file-system'
import { File as FSFile } from 'expo-file-system'

import * as ImageManipulator from 'expo-image-manipulator'

import { CacheManager } from 'expo-cached-image'
import { Storage } from 'expo-storage'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

//  date '+%Y%m%d%H%M%S'

// export const initialState = {
//   // photos: [],
//   // pendingPhotos: [],
//   // loading: false,
//   // errorMessage: '',
//   // pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
//   // orientation: 'portrait',
//   // activeSegment: 0,
//   // searchTerm: '',
//   // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
//   // isLastPage: true,
//   // netAvailable: false,
//   uploadingPhoto: false,
//   // zeroMoment: null,
//   toastOffset: 100,
//   // currentIndex: 0,
// }

// const reducer = (state = initialState, action) => {
//   switch (action.type) {
//     case ACTION_TYPES.CHAT_START_PHOTO_UPLOADING:
//       return {
//         ...state,
//         uploadingPhoto: true,
//       }
//     case ACTION_TYPES.CHAT_FINISH_PHOTO_UPLOADING:
//       return {
//         ...state,
//         uploadingPhoto: false,
//       }
//     default:
//       return state
//   }
// }

const genLocalThumb = async (localImgUrl) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    localImgUrl,
    [{ resize: { height: 300 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
  )
  return manipResult.uri
}

const addToQueue = async (image) => {
  // localImgUrl, chatPhotoHash, localThumbUrl

  let pendingImages = JSON.parse(await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY }))
  if (!pendingImages) {
    pendingImages = []
  }

  await Storage.setItem({
    key: CONST.PENDING_CHAT_UPLOADS_KEY,
    value: [...pendingImages, image]
  })
}

const removeFromQueue = async (imageToRemove) => {
  let pendingImagesBefore = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY })
  )

  if (!pendingImagesBefore) {
    pendingImagesBefore = []
  }

  const pendingImagesAfter = pendingImagesBefore.filter(
    (imageInTheQueue) => JSON.stringify(imageInTheQueue) !== JSON.stringify(imageToRemove)
  )

  await Storage.setItem({
    key: CONST.PENDING_CHAT_UPLOADS_KEY,
    value: pendingImagesAfter
  })
}

export const clearChatQueue = async () => {
  try {
    // Get current queue items to clean up their files
    const currentQueue = await getQueue()

    // Delete all local files from the queue
    for (const item of currentQueue) {
      try {
        if (item.localImgUrl) {
          try {
            new FSFile(item.localImgUrl).delete()
          } catch {}
        }
        // Chat uploads might also have thumbnail files based on cache management
        if (item.chatPhotoHash) {
          // Clean up cached files if they exist
          const thumbCacheKey = `${item.chatPhotoHash}-thumb`
          CacheManager.getCachedImageURI(thumbCacheKey)
            .then((cachedUri) => {
              if (cachedUri) {
                try {
                  new FSFile(cachedUri).delete()
                } catch {}
              }
            })
            .catch(() => {})
        }
      } catch (fileDeleteError) {
        // Continue cleaning up other files even if one fails
        console.error('Error deleting chat file:', fileDeleteError)
      }
    }

    // Clear the queue in storage
    await Storage.setItem({
      key: CONST.PENDING_CHAT_UPLOADS_KEY,
      value: []
    })
  } catch (error) {
    console.error('Error clearing chat queue:', error)
  }
}

// returns an array that has everything needed for rendering
const getQueue = async () => {
  // here will have to make sure we do not have any discrepancies between files in storage and files in the queue
  try {
    if (!CONST.PENDING_UPLOADS_FOLDER_CHAT.exists) {
      CONST.PENDING_UPLOADS_FOLDER_CHAT.create({ intermediates: true })
    }
  } catch (e) {
    // ignore directory creation errors
  }

  const filesInStorage = (() => {
    try {
      const dir = CONST.PENDING_UPLOADS_FOLDER_CHAT
      if (!dir.exists) return []
      return dir.list().map((entry) => entry.name)
    } catch {
      return []
    }
  })()
  let imagesInQueue = JSON.parse(await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY }))

  if (!imagesInQueue) {
    imagesInQueue = []
    await Storage.setItem({
      key: CONST.PENDING_CHAT_UPLOADS_KEY,
      value: []
    })
  }
  // remove images from the queue if corresponding file does not exist
  imagesInQueue.forEach((image) => {
    if (!filesInStorage.some((f) => f === image.chatPhotoHash)) {
      removeFromQueue(image)
    }
  })

  // get images in queue again after filtering
  imagesInQueue = JSON.parse(await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY }))
  if (!imagesInQueue) {
    imagesInQueue = []
  }

  // remove image from storage if corresponding recorsd does not exist in the queue
  filesInStorage.forEach((file) => {
    if (!imagesInQueue.some((i) => i.chatPhotoHash === file)) {
      try {
        new FSFile(CONST.PENDING_UPLOADS_FOLDER_CHAT, file).delete()
      } catch {}
    }
  })

  return imagesInQueue
}

export const queueFileForUpload =
  ({ assetUrl, chatPhotoHash, messageUuid }) =>
  async (dispatch, getState) => {
    const localImgUrl = new FSFile(CONST.PENDING_UPLOADS_FOLDER_CHAT, chatPhotoHash).uri

    // console.log({ assetUrl, chatPhotoHash, localImgUrl })
    // console.log({ localImgUrl })
    // copy file to cacheDir

    try {
      if (!CONST.PENDING_UPLOADS_FOLDER_CHAT.exists) {
        CONST.PENDING_UPLOADS_FOLDER_CHAT.create({ intermediates: true })
      }
    } catch (e) {
      // ignore directory creation errors
    }

    await FileSystem.copyAsync({
      from: assetUrl,
      to: localImgUrl
    })

    const localThumbUrl = await genLocalThumb(localImgUrl)

    CacheManager.addToCache({
      file: localThumbUrl,
      key: `${chatPhotoHash}-thumb`
    })
    CacheManager.addToCache({ file: localImgUrl, key: `${chatPhotoHash}` })

    const image = {
      localImgUrl,
      chatPhotoHash,
      messageUuid
    }

    await addToQueue(image)
  }

const uploadItem = async ({ uuid, item }) => {
  const contentType = 'image/jpeg'
  try {
    // console.log("uploading", { item })
    const uploadUrl = (
      await CONST.gqlClient.query({
        query: gql`
          query generateUploadUrlForMessage(
            $uuid: String!
            $photoHash: String!
            $contentType: String!
          ) {
            generateUploadUrlForMessage(
              uuid: $uuid
              photoHash: $photoHash
              contentType: $contentType
            ) {
              newAsset
              uploadUrl
            }
          }
        `,
        variables: {
          uuid,
          photoHash: item.chatPhotoHash,
          contentType
        },
        fetchPolicy: 'network-only'
      })
    ).data.generateUploadUrlForMessage

    let responseData
    if (uploadUrl?.newAsset === true) {
      responseData = await FileSystem.uploadAsync(uploadUrl.uploadUrl, item.localImgUrl, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': contentType
        }
      })
      // await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      responseData = {
        status: 100
      }
    }
    return { responseData }
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.log({ err3 })
    return {
      responseData: `something bad happened, unable to upload ${JSON.stringify(err3)}`
    }
  }
}

export const sendMessage = async ({
  chatUuid,
  uuid,
  messageUuid,
  text,
  pending,
  chatPhotoHash
}) => {
  const returnedMessage = (
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation sendMessage(
          $chatUuidArg: String!
          $uuidArg: String!
          $messageUuidArg: String!
          $textArg: String!
          $pendingArg: Boolean!
          $chatPhotoHashArg: String!
        ) {
          sendMessage(
            chatUuidArg: $chatUuidArg
            uuidArg: $uuidArg
            messageUuidArg: $messageUuidArg
            textArg: $textArg
            pendingArg: $pendingArg
            chatPhotoHashArg: $chatPhotoHashArg
          ) {
            chatUuid
            createdAt
            messageUuid
            text
            pending
            chatPhotoHash
            updatedAt
            uuid
          }
        }
      `,
      variables: {
        chatUuidArg: chatUuid,
        uuidArg: uuid,
        messageUuidArg: messageUuid,
        textArg: text,
        pendingArg: pending,
        chatPhotoHashArg: chatPhotoHash
      }
    })
  ).data.sendMessage

  return returnedMessage
}

export async function uploadPendingPhotos({ chatUuid, uuid, topOffset }) {
  try {
    let i
    // here let's iterate over the items and upload one file at a time

    const generatePhotoQueue = await getQueue()
    // console.log({ generatePhotoQueue })
    // first pass iteration to generate photos ID and the photo record on the backend
    for (i = 0; i < generatePhotoQueue.length; i += 1) {
      const item = generatePhotoQueue[i]
      // eslint-disable-next-line no-await-in-loop
      const { responseData } = await uploadItem({ uuid, item })
      // sleep for 1 second before re-trying

      // console.log({ responseData })
      if (responseData.status === 200) {
        // console.log("sleeping:: started")
        // // const now = new Date().getTime()
        // // while (new Date().getTime() < now + 10000) { /* Do nothing */ }
        // console.log("sleeping:: done")
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 4000))

        // eslint-disable-next-line no-await-in-loop
        // sendMessage({
        //   chatUuid, uuid, messageUuid: item.messageUuid, text: '', pending: false, chatPhotoHash: '',
        // })
        // // eslint-disable-next-line no-await-in-loop
        // await new Promise(resolve => setTimeout(resolve, 1000))
      }
      if (responseData.status === 200 || responseData.status === 100) {
        // show the photo in the photo list immidiately

        // console.log({ item })

        // eslint-disable-next-line no-await-in-loop
        const returnedMessage = await sendMessage({
          chatUuid,
          uuid,
          messageUuid: item.messageUuid,
          text: '',
          pending: false,
          chatPhotoHash: item.chatPhotoHash
        })
        // eslint-disable-next-line no-await-in-loop
        await removeFromQueue(item)
      } else {
        // alert(JSON.stringify({ responseData }))
        Toast.show({
          text1: 'Upload is going slooooow...',
          text2: 'Still trying to upload.',
          visibilityTime: 500,
          topOffset
        })
      }
    } // for
  } catch (err2) {
    // eslint-disable-next-line no-console
    console.log({ err2 })
    Toast.show({
      text1: 'Upload is slow...',
      text2: 'Still trying to upload.',
      visibilityTime: 500,
      topOffset
    })
    // console.log({ error }) // eslint-disable-line no-console
    // dispatch(uploadPendingPhotos())
  }

  // sleep for 1 second before re-trying
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if ((await getQueue()).length > 0) {
    uploadPendingPhotos({ chatUuid, uuid, topOffset })
  }
}
