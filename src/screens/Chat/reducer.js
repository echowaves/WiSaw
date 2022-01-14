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
import { INIT_UUID } from '../Secret/action_types'

import * as friendsReducer from '../FriendsList/reducer'

import { getUUID } from '../Secret/reducer'
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
  // uploadingPhoto: false,
  // zeroMoment: null,
  // toastOffset: 100,
  // currentIndex: 0,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {    
    case ACTION_TYPES.START_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: true,
      }
    case ACTION_TYPES.FINISH_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: false,
      }
    default:
      return state
  }
}

const _updatePendingPhotos = async dispatch => {
  const pendingPhotos = await _getQueue()
  dispatch({
    type: ACTION_TYPES.UPDATE_PENDING_PHOTOS,
    pendingPhotos,
  })
}

const _makeSureDirectoryExists = async ({ directory }) => {
  const tmpDir = await FileSystem.getInfoAsync(directory)
  // create cacheDir if does not exist
  if (!tmpDir.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  }
}

const _genLocalThumbs = async image => {
  if (image.type === 'image') {
    const manipResult = await ImageManipulator.manipulateAsync(
      image.localImgUrl,
      [{ resize: { height: 300 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    )
    return {
      ...image,
      localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
    }
  }

  // if video
  const { uri } = await VideoThumbnails.getThumbnailAsync(
    image.localImgUrl
  )

  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { height: 300 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
  )

  return {
    ...image,
    localVideoUrl: image.localImgUrl,
    localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
    localImgUrl: uri,
    // localImageName: manipResult.uri.substr(manipResult.uri.lastIndexOf('/') + 1),
  }
}

const _addToQueue = async image => {
  // localImgUrl, localImageName, type, location, localThumbUrl, localVideoUrl

  let pendingImages = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY })
  )
  if (!pendingImages) {
    pendingImages = []
  }

  await Storage.setItem({
    key: CONST.PENDING_UPLOADS_KEY,
    value: JSON.stringify([...pendingImages, image]),
  })
}

// returns an array that has everything needed for rendering
const _getQueue = async () => {
  // here will have to make sure we do not have any discrepancies between files in storage and files in the queue
  await _makeSureDirectoryExists({ directory: CONST.PENDING_UPLOADS_FOLDER })

  const filesInStorage = await FileSystem.readDirectoryAsync(CONST.PENDING_UPLOADS_FOLDER)
  let imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY })
  )

  if (!imagesInQueue) {
    imagesInQueue = []
    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: JSON.stringify([]),
    })
  }
  // remove images from the queue if corresponding file does not exist
  imagesInQueue.forEach(image => {
    if (!filesInStorage.some(f => f === image.localImageName)) {
      _removeFromQueue(image)
    }
  })

  // get images in queue again after filtering
  imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY })
  )
  if (!imagesInQueue) {
    imagesInQueue = []
  }

  // remove image from storage if corresponding recorsd does not exist in the queue
  filesInStorage.forEach(file => {
    if (!imagesInQueue.some(i => i.localImageName === file)) {
      FileSystem.deleteAsync(
        `${CONST.PENDING_UPLOADS_FOLDER}${file}`,
        { idempotent: true }
      )
    }
  })

  return imagesInQueue
}

const _removeFromQueue = async imageToRemove => {
  let pendingImagesBefore = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY })
  )

  if (!pendingImagesBefore) {
    pendingImagesBefore = []
  }

  const pendingImagesAfter = pendingImagesBefore.filter(imageInTheQueue => JSON.stringify(imageInTheQueue) !== JSON.stringify(imageToRemove))

  await Storage.setItem({
    key: CONST.PENDING_UPLOADS_KEY,
    value: JSON.stringify(pendingImagesAfter),
  })
}

export const queueFileForUpload = ({ cameraImgUrl, type, location }) => async (dispatch, getState) => {
  const localImageName = cameraImgUrl.substr(cameraImgUrl.lastIndexOf('/') + 1)
  const localCacheKey = localImageName.split('.')[0]

  const localImgUrl = `${CONST.PENDING_UPLOADS_FOLDER}${localImageName}`
  // copy file to cacheDir
  await FileSystem.moveAsync({
    from: cameraImgUrl,
    to: localImgUrl,
  })

  const image = {
    localImgUrl, localImageName, type, location, localCacheKey,
  }
  const thumbEnhansedImage = await _genLocalThumbs(image)
  await CacheManager.addToCache({ file: thumbEnhansedImage.localThumbUrl, key: thumbEnhansedImage.localCacheKey })

  await _addToQueue(thumbEnhansedImage)

  _updatePendingPhotos(dispatch)
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret
    _updatePendingPhotos(dispatch)

    if (getState().photosList.netAvailable === false) {
      return Promise.resolve()
    }

    if (getState().photosList.uploadingPhoto) {
      // already uploading photos, just exit here
      return Promise.resolve()
    }

    try {
      dispatch({
        type: ACTION_TYPES.START_PHOTO_UPLOADING,
      })

      let i
      // here let's iterate over the items and upload one file at a time

      // generatePhotoQueue will only contain item with undefined photo
      const generatePhotoQueue = (await _getQueue())
        .filter(image => !image.photo)

      // first pass iteration to generate photos ID and the photo record on the backend
      for (i = 0; i < generatePhotoQueue.length; i += 1) {
        const item = generatePhotoQueue[i]
        try {
        // eslint-disable-next-line no-await-in-loop
          const photo = await _generatePhoto({
            uuid,
            lat: item.location.coords.latitude,
            lon: item.location.coords.longitude,
            video: item?.type === "video",
          })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({ file: item.localThumbUrl, key: `${photo.id}-thumb` })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({ file: item.localImgUrl, key: `${photo.id}` })
          // eslint-disable-next-line no-await-in-loop
          await _removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await _addToQueue({
            ...item,
            photo,
          })
        } catch (err1) {
          // eslint-disable-next-line no-console
          console.log({ err1 })
          if (`${err1}`.includes('banned')) {
            // eslint-disable-next-line no-await-in-loop
            await _removeFromQueue(item)
            Toast.show({
              text1: "Sorry, you've been banned",
              text2: "Try again later",
              type: "error",
              topOffset,
            })
          }
        }
      }

      // uploadQueue will only contain item with photo generated on the backend
      const uploadQueue = (await _getQueue())
        .filter(image => image.photo)
      // second pass -- upload files
      for (i = 0; i < uploadQueue.length; i += 1) {
        const item = uploadQueue[i]

        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await _uploadItem({
          item,
        })

        if (responseData.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await _removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await _updatePendingPhotos(dispatch)

          // show the photo in the photo list immidiately

          // eslint-disable-next-line no-await-in-loop
          dispatch({
            type: ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
            photo: item.photo,
          })
          Toast.show({
            text1: `${item.photo.video ? 'Video' : 'Photo'} uploaded`,
            topOffset,
            visibilityTime: 500,
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
        type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
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
      type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
    })

    // sleep for 1 second before re-trying
    await new Promise(resolve => setTimeout(resolve, 1000))

    if ((await _getQueue()).length > 0) {
      dispatch(uploadPendingPhotos())
    }
  }
}

const _uploadItem = async ({ item }) => {
  try {
    // if video -- upload video file in addition to the image
    if (item.type === "video") {
      // eslint-disable-next-line
      const videoResponse = await _uploadFile({
        assetKey: `${item.photo.id}.mov`,
        contentType: "video/mov",
        assetUri: item.localVideoUrl,
      })

      if (videoResponse?.responseData?.status !== 200) {
        return { responseData: "something bad happened during video upload, unable to upload.", status: videoResponse.responseData.status }
      }
    }

    const response = await _uploadFile({
      assetKey: `${item.photo.id}.upload`,
      contentType: "image/jpeg",
      assetUri: item.localImgUrl,
    })
    return { responseData: response.responseData }
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.log({ err3 })
    return { responseData: `something bad happened, unable to upload ${JSON.stringify(err3)}` }
  }
}

const _generatePhoto = async ({
  uuid,
  lat,
  lon,
  video,
}) => {
  const photo = (await CONST.gqlClient
    .mutate({
      mutation: gql`
        mutation createPhoto($lat: Float!, $lon: Float!, $uuid: String!, $video: Boolean ) {
          createPhoto(lat: $lat, lon: $lon, uuid: $uuid, video: $video ) {
            active
            commentsCount
            watchersCount
            createdAt
            id
            imgUrl
            imgUrl
            thumbUrl
            location
            updatedAt
            uuid
            video
        }
      }`,
      variables: {
        uuid,
        lat,
        lon,
        video,
      },
    })).data.createPhoto

  return photo
}

const _uploadFile = async ({ assetKey, contentType, assetUri }) => {
  // console.log({ assetKey })
  const uploadUrl = (await CONST.gqlClient
    .query({
      query: gql`
      query generateUploadUrl($assetKey: String!, $contentType: String!) {
        generateUploadUrl(assetKey: $assetKey, contentType: $contentType)
      }`,
      variables: {
        assetKey,
        contentType,
      },
    })).data.generateUploadUrl

  const responseData = await FileSystem.uploadAsync(
    uploadUrl,
    assetUri,
    {
      httpMethod: 'PUT',
      headers: {
        "Content-Type": contentType,
      },
    }
  )
  return { responseData }
}

export function setCurrentIndex(currentIndex) {
  return {
    type: ACTION_TYPES.CURRENT_INDEX,
    currentIndex,
  }
}

export default reducer
