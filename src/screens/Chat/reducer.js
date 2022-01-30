// import { Platform } from 'react-native'

import * as SecureStore from 'expo-secure-store'
import * as FileSystem from 'expo-file-system'
import * as VideoThumbnails from 'expo-video-thumbnails'

import * as ImageManipulator from 'expo-image-manipulator'

import moment from 'moment'

import { CacheManager } from 'expo-cached-image'
import { Storage } from 'expo-storage'

import Toast from 'react-native-toast-message'

import { gql } from "@apollo/client"

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

//  date '+%Y%m%d%H%M%S'

export const initialState = {
  // photos: [],
  // pendingPhotos: [],
  // loading: false,
  // errorMessage: '',
  // pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  // orientation: 'portrait',
  // activeSegment: 0,
  // searchTerm: '',
  // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  // isLastPage: true,
  // netAvailable: false,
  uploadingPhoto: false,
  // zeroMoment: null,
  toastOffset: 100,
  // currentIndex: 0,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.CHAT_START_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: true,
      }
    case ACTION_TYPES.CHAT_FINISH_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: false,
      }
    default:
      return state
  }
}

const _genLocalThumb = async localImgUrl => {
  const manipResult = await ImageManipulator.manipulateAsync(
    localImgUrl,
    [{ resize: { height: 300 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
  )
  return manipResult.uri
}

const _addToQueue = async image => {
  // localImgUrl, photoHash, localThumbUrl

  let pendingImages = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY })
  )
  if (!pendingImages) {
    pendingImages = []
  }

  await Storage.setItem({
    key: CONST.PENDING_CHAT_UPLOADS_KEY,
    value: JSON.stringify([...pendingImages, image]),
  })
}

// returns an array that has everything needed for rendering
const _getQueue = async () => {
  // here will have to make sure we do not have any discrepancies between files in storage and files in the queue
  await CONST._makeSureDirectoryExists({ directory: CONST.PENDING_UPLOADS_FOLDER_CHAT })

  const filesInStorage = await FileSystem.readDirectoryAsync(CONST.PENDING_UPLOADS_FOLDER_CHAT)
  let imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY })
  )

  if (!imagesInQueue) {
    imagesInQueue = []
    await Storage.setItem({
      key: CONST.PENDING_CHAT_UPLOADS_KEY,
      value: JSON.stringify([]),
    })
  }
  // remove images from the queue if corresponding file does not exist
  imagesInQueue.forEach(image => {
    if (!filesInStorage.some(f => f === image.photoHash)) {
      _removeFromQueue(image)
    }
  })

  // get images in queue again after filtering
  imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY })
  )
  if (!imagesInQueue) {
    imagesInQueue = []
  }

  // remove image from storage if corresponding recorsd does not exist in the queue
  filesInStorage.forEach(file => {
    if (!imagesInQueue.some(i => i.photoHash === file)) {
      FileSystem.deleteAsync(
        `${CONST.PENDING_UPLOADS_FOLDER_CHAT}${file}`,
        { idempotent: true }
      )
    }
  })

  return imagesInQueue
}

const _removeFromQueue = async imageToRemove => {
  let pendingImagesBefore = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_CHAT_UPLOADS_KEY })
  )

  if (!pendingImagesBefore) {
    pendingImagesBefore = []
  }

  const pendingImagesAfter = pendingImagesBefore.filter(imageInTheQueue => JSON.stringify(imageInTheQueue) !== JSON.stringify(imageToRemove))

  await Storage.setItem({
    key: CONST.PENDING_CHAT_UPLOADS_KEY,
    value: JSON.stringify(pendingImagesAfter),
  })
}

export const queueFileForUpload = ({ assetUrl, photoHash }) => async (dispatch, getState) => {
  const localImgUrl = `${CONST.PENDING_UPLOADS_FOLDER_CHAT}${photoHash}`

  // console.log({ assetUrl, photoHash, localImgUrl })
  // console.log({ localImgUrl })
  // copy file to cacheDir

  await CONST._makeSureDirectoryExists({ directory: CONST.PENDING_UPLOADS_FOLDER_CHAT })

  await FileSystem.copyAsync({
    from: assetUrl,
    to: localImgUrl,
  })

  const localThumbUrl = await _genLocalThumb(localImgUrl)

  CacheManager.addToCache({ file: localThumbUrl, key: `${photoHash}-thumb` })
  CacheManager.addToCache({ file: localImgUrl, key: `${photoHash}` })

  const image = {
    localImgUrl, photoHash,
  }

  await _addToQueue(image)
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const { topOffset } = getState().chat
    const { uuid } = getState().secret

    if (getState().photosList.netAvailable === false) {
      return Promise.resolve()
    }

    if (getState().chat.uploadingPhoto) {
      // already uploading photos, just exit here
      return Promise.resolve()
    }

    try {
      dispatch({
        type: ACTION_TYPES.CHAT_START_PHOTO_UPLOADING,
      })

      let i
      // here let's iterate over the items and upload one file at a time

      const generatePhotoQueue = await _getQueue()
      // console.log({ generatePhotoQueue })
      // first pass iteration to generate photos ID and the photo record on the backend
      for (i = 0; i < generatePhotoQueue.length; i += 1) {
        const item = generatePhotoQueue[i]

        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await _uploadItem({ uuid, item })

        if (responseData.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await _removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          // show the photo in the photo list immidiately

          // eslint-disable-next-line no-await-in-loop
          dispatch({
            type: ACTION_TYPES.CHAT_UPDATE_PHOTO_UPLOADED,
            photo: item.photo,
          })
        } else {
          // alert(JSON.stringify({ responseData }))
          Toast.show({
            text1: 'Upload is going slooooow...',
            text2: 'Still trying to upload.',
            visibilityTime: 500,
            topOffset,
          })
        }
      }
    } catch (err2) {
      // eslint-disable-next-line no-console
      // console.log({ err2 })
      dispatch({
        type: ACTION_TYPES.CHAT_FINISH_PHOTO_UPLOADING,
      })
      Toast.show({
        text1: 'Upload is slow...',
        text2: 'Still trying to upload.',
        visibilityTime: 500,
        topOffset,
      })
      // console.log({ error }) // eslint-disable-line no-console
      // dispatch(uploadPendingPhotos())
    }
    dispatch({
      type: ACTION_TYPES.CHAT_FINISH_PHOTO_UPLOADING,
    })

    // sleep for 1 second before re-trying
    await new Promise(resolve => setTimeout(resolve, 1000))

    if ((await _getQueue()).length > 0) {
      dispatch(uploadPendingPhotos())
    }
  }
}

const _uploadItem = async ({ uuid, item }) => {
  const contentType = "image/jpeg"
  try {
    // console.log("uploading", { item })
    const uploadUrl = (await CONST.gqlClient
      .query({
        query: gql`
        query generateUploadUrlForMessage($uuid: String!, $photoHash: String!, $contentType: String!) {
          generateUploadUrlForMessage(uuid: $uuid, photoHash: $photoHash, contentType: $contentType){
            newAsset
            uploadUrl
          }
        }`,
        variables: {
          uuid,
          photoHash: item.photoHash,
          contentType,
        },
      })).data.generateUploadUrlForMessage

    // console.log({ uploadUrl })
    if (uploadUrl?.newAsset === true) {
      const responseData = await FileSystem.uploadAsync(
        uploadUrl.uploadUrl,
        item.localImgUrl,
        {
          httpMethod: 'PUT',
          headers: {
            "Content-Type": contentType,
          },
        }
      )
      console.log({ responseData })

      return { responseData }
    }
    todo
    // TODO: this is not new asset
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.log({ err3 })
    return { responseData: `something bad happened, unable to upload ${JSON.stringify(err3)}` }
  }
}

export default reducer
