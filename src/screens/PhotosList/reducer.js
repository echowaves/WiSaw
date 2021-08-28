// import { Platform } from 'react-native'

import { v4 as uuidv4 } from 'uuid'

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

const UUID_KEY = 'wisaw_device_uuid'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
  isTandcAccepted: true,
  uuid: null,
  location: null,
  photos: [],
  pendingPhotos: [],
  loading: false,
  errorMessage: '',
  pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  orientation: 'portrait',
  activeSegment: 0,
  searchTerm: '',
  batch: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  isLastPage: false,
  netAvailable: false,
  uploadingPhoto: false,
  zeroMoment: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_PHOTOS_STARTED:
      return {
        ...state,
        loading: true,
        pageNumber: state.pageNumber + 1,
        errorMessage: '',
      }
    case ACTION_TYPES.GET_PHOTOS_SUCCESS:
      return {
        ...state,
        photos:
        [...state.photos, ...action.photos],
        // .sort((a, b) => b.id - a.id),
        // this really stinks, need to figure out why there are duplicates in the first place
        // .filter((obj, pos, arr) => arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos), // fancy way to remove duplicate photos
        // .sort((a, b) => b.id - a.id), // the sort should always happen on the server
        // pageNumber: state.pageNumber + 1,
        errorMessage: '',
      }
    case ACTION_TYPES.GET_PHOTOS_FAIL:
      return {
        ...state,
        // pageNumber: state.pageNumber + 1,
        errorMessage: action.errorMessage,
      }
    case ACTION_TYPES.GET_PHOTOS_FINISHED:
      return {
        ...state,
        loading: false,
        isLastPage: action.noMoreData

        //  (state.activeSegment === 0 && state.pageNumber > 1095) // 1095 days === 3 years
        // || (state.activeSegment === 1 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        // || (state.activeSegment === 2 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        ,
      }
    case ACTION_TYPES.RESET_STATE:
      return {
        ...state,
        location: action.location,
        photos: [],
        loading: true,
        loadMore: true,
        errorMessage: '',
        pageNumber: -1,
        isLastPage: false,
        batch: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      }
    case ACTION_TYPES.SET_IS_TANDC_ACCEPTED:
      return {
        ...state,
        isTandcAccepted: action.isTandcAccepted,
      }
    case ACTION_TYPES.INIT_STATE:
      return {
        ...state,
        uuid: action.uuid,
        isTandcAccepted: action.isTandcAccepted,
      }
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case ACTION_TYPES.SET_ORIENTATION:
      return {
        ...state,
        orientation: action.orientation,
      }
    case ACTION_TYPES.PHOTO_BANNED:
      return {
        ...state,
        // photos: state.photos.filter(item => (item.id !== action.photoId)),
      }
    case ACTION_TYPES.PHOTO_DELETED:
      return {
        ...state,
        photos: state.photos.filter(item => (item.id !== action.photoId)),
      }
    case ACTION_TYPES.PHOTO_DETAILS_LOADED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.item.id) ? {
          ...item,
          comments: action.comments,
          recognitions: action.recognitions,
          watched: action.isPhotoWatched,
        } : item)),
      }

    case ACTION_TYPES.PHOTO_UPLOADED_PREPEND:
      return {
        ...state,
        photos:
        [action.photo,
          ...state.photos,
        ],
      }

    case ACTION_TYPES.PHOTO_WATCHED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.photoId) ? { ...item, watchersCount: action.watchersCount, watched: true } : item)),
      }
    case ACTION_TYPES.PHOTO_UNWATCHED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.photoId) ? { ...item, watchersCount: action.watchersCount, watched: false } : item)),
      }

    case ACTION_TYPES.ZERO_MOMEMT:
      return {
        ...state,
        zeroMoment: action.zeroMoment,
      }

    case ACTION_TYPES.TOGGLE_COMMENT_BUTTONS:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              comments: item.comments.map(
                comment => ((comment.id === action.commentId)
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
              ,
            }
            : item)
        ),
      }
    case ACTION_TYPES.COMMENT_DELETED:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              commentsCount: item.comments.length - 1,
              comments: item.comments.filter(
                comment => (comment.id !== action.commentId)
              ),
              lastComment: action.lastComment,
            }
            : item)
        ),
      }

    case ACTION_TYPES.COMMENT_ADDED:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              commentsCount: item.comments.length + 1,
              lastComment: action.lastComment,
            }
            : item)
        ),
      }
    case ACTION_TYPES.SET_ACTIVE_SEGMENT:
      return {
        ...state,
        photos: [],
        searchTerm: '',
        activeSegment: action.activeSegment,
      }
    case ACTION_TYPES.SET_SEARCH_TERM:
      return {
        ...state,
        // photos: [],
        searchTerm: action.searchTerm,
      }
    case ACTION_TYPES.SET_NET_AVAILABLE:
      return {
        ...state,
        netAvailable: action.netAvailable,
      }

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
    case ACTION_TYPES.UPDATE_PENDING_PHOTOS:
      return {
        ...state,
        pendingPhotos: action.pendingPhotos,
      }

    default:
      return state
  }
}

export function initState() {
  return async (dispatch, getState) => {
    const [
      uuid,
      isTandcAccepted,
    ] = await Promise.all([
      _getUUID(getState),
      _getTancAccepted(),
    ])

    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
    dispatch({
      type: ACTION_TYPES.INIT_STATE,
      uuid,
      isTandcAccepted,
    })
    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
  }
}

// this function return the time of the very first photo stored in the backend,
// so that we can tell when to stop requesting new photos while paging through the results
export function zeroMoment() {
  return async (dispatch, getState) => {
    const { zeroMoment } = (await CONST.gqlClient
      .query({
        query: gql`
        query zeroMoment {
          zeroMoment
        }`,
      })).data
    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
    dispatch({
      type: ACTION_TYPES.ZERO_MOMEMT,
      zeroMoment,
    })
  }
}

async function _requestGeoPhotos(getState) {
  const {
    pageNumber, batch, zeroMoment, location: { coords: { latitude, longitude } },
  } = getState().photosList
  const whenToStop = moment(zeroMoment)
  try {
    const response = (await CONST.gqlClient
      .query({
        query: gql`
      query feedByDate($daysAgo: Int!, $lat: Float!, $lon: Float!, $batch: Long!, $whenToStop: AWSDateTime!) {
        feedByDate(daysAgo: $daysAgo, lat: $lat, lon: $lon, batch: $batch, whenToStop: $whenToStop){
          photos {
                  id
                  imgUrl
                  thumbUrl
                  commentsCount
                  watchersCount
                  createdAt
                }
          batch,
          noMoreData
        }
      }`,
        variables: {
          batch,
          daysAgo: pageNumber,
          lat: latitude,
          lon: longitude,
          whenToStop,
        },
      }))
    return {
      photos: response.data.feedByDate.photos,
      batch: response.data.feedByDate.batch,
      noMoreData: response.data.feedByDate.noMoreData,
    }
  } catch (err) {
    console.log({ err })// eslint-disable-line
    return {
      photos: [],
      batch,
      noMoreData: true,
    }
  }
}

async function _requestWatchedPhotos(getState) {
  const { pageNumber, uuid, batch } = getState().photosList
  try {
    const response = (await CONST.gqlClient
      .query({
        query: gql`
      query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: Long!) {
        feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch){
          photos {
                  id
                  imgUrl
                  thumbUrl
                  commentsCount
                  watchersCount
                  lastComment
                  createdAt
                }
          batch,
          noMoreData
        }
      }`,
        variables: {
          uuid,
          pageNumber,
          batch,
        },
      }))

    return {
      photos: response.data.feedForWatcher.photos,
      batch: response.data.feedForWatcher.batch,
      noMoreData: response.data.feedForWatcher.noMoreData,
    }
  } catch (err) {
    console.log({ err })// eslint-disable-line
  }
}

async function _requestSearchedPhotos(getState) {
  const { pageNumber, searchTerm, batch } = getState().photosList
  try {
    const response = (await CONST.gqlClient
      .query({
        query: gql`
      query feedForTextSearch($searchTerm: String!, $pageNumber: Int!, $batch: Long!) {
        feedForTextSearch(searchTerm: $searchTerm, pageNumber: $pageNumber, batch: $batch){
          photos {
                  id
                  imgUrl
                  thumbUrl
                  commentsCount
                  watchersCount
                  lastComment
                  createdAt
                }
          batch,
          noMoreData
        }
      }`,
        variables: {
          searchTerm,
          batch,
          pageNumber,
        },
      }))

    return {
      photos: response.data.feedForTextSearch.photos,
      batch: response.data.feedForTextSearch.batch,
      noMoreData: response.data.feedForTextSearch.noMoreData,
    }
  } catch (err) {
    console.log({ err })// eslint-disable-line
  }
}

export function getPhotos() {
  return async (dispatch, getState) => {
    // const {
    //   batch, loading, isLastPage, pageNumber, searchTerm,
    // } = getState().photosList
    // console.log(`getPhotos() batch:${batch} pageNumber:${pageNumber} loading:${loading} isLastPage:${isLastPage} searchTerm:${searchTerm}`)
    await new Promise(r => setTimeout(r, 200)) // this is really weird, but seems to help with the order of the images
    const {
      location, netAvailable, searchTerm,
    } = getState().photosList

    let noMoreData = false

    if (!location
    || netAvailable === false
    || (getState().photosList.activeSegment === 2
        && searchTerm.length < 3)
    ) {
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_FAIL,
        errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
      })
    } else {
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_STARTED,
      })
      try {
        let responseJson
        if (getState().photosList.activeSegment === 0) {
          responseJson = await _requestGeoPhotos(getState)
        } else if (getState().photosList.activeSegment === 1) {
          responseJson = await _requestWatchedPhotos(getState)
        } else if (getState().photosList.activeSegment === 2) {
          responseJson = await _requestSearchedPhotos(getState)
        }
        // console.log({ responseJson })
        noMoreData = responseJson?.noMoreData
        if (responseJson?.batch === getState()?.photosList?.batch) {
          if (responseJson?.photos?.length > 0) {
            dispatch({
              type: ACTION_TYPES.GET_PHOTOS_SUCCESS,
              photos: responseJson.photos,
            })
          } else {
            dispatch({
              type: ACTION_TYPES.GET_PHOTOS_FAIL,
              errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
            })
          }
        } // else { console.log('wrong batch') }
      } catch (err) {
        dispatch({
          type: ACTION_TYPES.GET_PHOTOS_FAIL,
          errorMessage: `${err}`,
        })
        Toast.show({
          text1: 'Error',
          text2: `${err}`,
          type: "error",
          topOffset: 70,
        })
      }
    }
    dispatch({
      type: ACTION_TYPES.GET_PHOTOS_FINISHED,
      noMoreData,
    })
  }
}

export function acceptTandC() {
  try {
    SecureStore.setItemAsync(IS_TANDC_ACCEPTED_KEY, "true")
    return {
      type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
      isTandcAccepted: true,
    }
  } catch (err) {
    return {
      type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
      isTandcAccepted: false,
    }
  }
}

export function cancelPendingUpload(item) {
  return async dispatch => {
    await _removeFromQueue(item)

    _updatePendingPhotos(dispatch)
  }
}

export function resetState(location) {
  return {
    type: ACTION_TYPES.RESET_STATE,
    location,
  }
}

export function setOrientation(orientation) {
  return {
    type: ACTION_TYPES.SET_ORIENTATION,
    orientation,
  }
}

export function setActiveSegment(activeSegment) {
  return ({
    type: ACTION_TYPES.SET_ACTIVE_SEGMENT,
    activeSegment,
  })
}

export function setSearchTerm(searchTerm) {
  return {
    type: ACTION_TYPES.SET_SEARCH_TERM,
    searchTerm,
  }
}

export function setNetAvailable(netAvailable) {
  return ({
    type: ACTION_TYPES.SET_NET_AVAILABLE,
    netAvailable,
  })
}

async function _getUUID(getState) {
  let { uuid } = getState().photosList
  if (uuid === null) {
    // try to retreive from secure store
    try {
      uuid = await SecureStore.getItemAsync(UUID_KEY)
    } catch (err) {
      // Toast.show({
      //   text: err.toString(),
      //   buttonText: "OK23",
      //   duration: 15000,
      // topOffset: 70,
      // })
    }
    // no uuid in the store, generate a new one and store

    if (uuid === '' || uuid === null) {
      uuid = uuidv4()
      try {
        await SecureStore.setItemAsync(UUID_KEY, uuid)
      } catch (err) {
        // Toast.show({
        //   text: err.toString(),
        //   buttonText: "OK",
        //   duration: 15000,
        // topOffset: 70,
        // })
      }
    }
  }
  return uuid
}

async function _getTancAccepted() {
  try {
    return await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY) === "true"
  } catch (err) {
    return false
  }
}

const _updatePendingPhotos = async dispatch => {
  const pendingFiles = await _getQueue()
  dispatch({
    type: ACTION_TYPES.UPDATE_PENDING_PHOTOS,
    pendingPhotos: pendingFiles,
  })
  return pendingFiles
}

const _makeSureDirectoryExists = async ({ directory }) => {
  const tmpDir = await FileSystem.getInfoAsync(directory)
  // create cacheDir if does not exist
  if (!tmpDir.exists) {
    await FileSystem.makeDirectoryAsync(directory)
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

  let manipResult
  let resultObj

  if (image.type === 'image') {
    manipResult = await ImageManipulator.manipulateAsync(
      image.localImgUrl,
      [{ resize: { height: 300 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    )

    resultObj = {
      ...image,
      localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
    }
  } else { // if video
    const { uri } = await VideoThumbnails.getThumbnailAsync(
      image.localImgUrl
    )

    manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { height: 300 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    )

    resultObj = {
      ...image,
      localVideoUrl: image.localImgUrl,
      localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
      localImgUrl: uri,
    }
  }

  // this is needed to render pending thumb
  await CacheManager.addToCache({ file: resultObj.localThumbUrl, key: resultObj.localImageName })

  await Storage.setItem({
    key: CONST.PENDING_UPLOADS_KEY,
    value: JSON.stringify([...pendingImages, resultObj]),
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

  const localImgUrl = `${CONST.PENDING_UPLOADS_FOLDER}${localImageName}`
  // copy file to cacheDir
  await FileSystem.moveAsync({
    from: cameraImgUrl,
    to: localImgUrl,
  })

  await _addToQueue({
    localImgUrl, localImageName, type, location,
  })

  _updatePendingPhotos(dispatch)
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList

    const pendingFiles = await _updatePendingPhotos(dispatch)

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

      let i = 0
      // here let's iterate over the items to upload and upload one file at a time
      for (; i < pendingFiles.length; i += 1) {
        const item = pendingFiles[i]
        // eslint-disable-next-line no-await-in-loop
        const { responseData, photo } = await _uploadFile({
          item,
          uuid,
        })
        console.log({ responseData })
        if (responseData === "banned") {
          alert("Sorry, you've been banned.")
          // eslint-disable-next-line no-await-in-loop
          await _removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await _updatePendingPhotos(dispatch)

          return Promise.resolve()
        }
        if (responseData.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({ file: item.localThumbUrl, key: `${photo.id}-thumb` })
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({ file: item.localImgUrl, key: `${photo.id}` })

          // eslint-disable-next-line no-await-in-loop
          await _removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await _updatePendingPhotos(dispatch)

          // show the photo in the photo list immidiately

          dispatch({
            type: ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
            photo,
          })
        } else {
          // alert("Error uploading file, try again.")
          Toast.show({
            text1: 'Unable to upload file, refresh to try again.',
            text2: 'Network issue...?',
            topOffset: 70,
          })
        }
      }
    } catch (error) {
      console.log({ error })
      dispatch({
        type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
      })
      Toast.show({
        text1: 'Failed to upload file, refresh to try again.',
        text2: 'Network issue?...',
        topOffset: 70,
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

const _uploadFile = async ({ item, uuid }) => {
  const assetUri = item.type === "video" ? item.localVideoUrl : item.localImgUrl
  try {
    // console.log({ item })
    const newPhoto = (await CONST.gqlClient
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
        }
      }`,
        variables: {
          lat: item.location.coords.latitude,
          lon: item.location.coords.longitude,
          uuid,
          video: item?.type === "video",
        },
      })).data.createPhoto

    const uploadUrl = (await CONST.gqlClient
      .query({
        query: gql`
        query generateUploadUrl($assetKey: String!, $contentType: String!) {
          generateUploadUrl(assetKey: $assetKey, contentType: $contentType)
        }`,
        variables: {
          assetKey: `${newPhoto.id}.upload`,
          contentType: "image/jpeg",
        },
      })).data.generateUploadUrl

    const responseData = await FileSystem.uploadAsync(
      uploadUrl,
      assetUri,
      {
        httpMethod: 'PUT',
        headers: {
          "Content-Type": "image/jpeg",
        },
      }
    )
    return { responseData, photo: newPhoto }
  } catch (err) {
    console.log({ err })
    if (err === 'banned') {
      return { responseData: "banned", err }
    }
    return { responseData: "something bad happened, unable to upload", err }
  }
}

export default reducer
