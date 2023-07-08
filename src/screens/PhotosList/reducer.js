// import { Platform } from 'react-native'

import * as SecureStore from 'expo-secure-store'
import * as FileSystem from 'expo-file-system'
import * as VideoThumbnails from 'expo-video-thumbnails'

import * as ImageManipulator from 'expo-image-manipulator'

import moment from 'moment'

import { CacheManager } from 'expo-cached-image'
import { Storage } from 'expo-storage'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

import * as ACTION_TYPES from './action_types'
import { INIT_UUID } from '../Secret/action_types'

import { getUUID } from '../Secret/reducer'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
  // isTandcAccepted: true, //
  // zeroMoment: null, //
  // photos: [], //
  // netAvailable: false,
  // searchTerm: '',
  // location: null,
  pendingPhotos: [],
  loading: false,
  errorMessage: '',
  // pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  orientation: 'portrait',
  activeSegment: 0,

  // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  isLastPage: true,

  uploadingPhoto: false,
  toastOffset: 100,
  currentIndex: 0,
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
        photos: [...state.photos, ...action.photos].sort(
          (a, b) => a.row_number - b.row_number,
        ),
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
        isLastPage: action.noMoreData,

        //  (state.activeSegment === 0 && state.pageNumber > 1095) // 1095 days === 3 years
        // || (state.activeSegment === 1 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        // || (state.activeSegment === 2 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
      }
    case ACTION_TYPES.SET_LOCATION:
      return {
        ...state,
        location: action.location,
        // photos: [],
        // loading: true,
        // loadMore: true,
        // errorMessage: '',
        // pageNumber: -1,
        // isLastPage: false,
        // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
      }
    case ACTION_TYPES.RESET_STATE:
      return {
        ...state,
        photos: [],
        loading: true,
        loadMore: true,
        errorMessage: '',
        pageNumber: -1,
        isLastPage: false,
        batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
      }
    case ACTION_TYPES.SET_IS_TANDC_ACCEPTED:
      return {
        ...state,
        isTandcAccepted: action.isTandcAccepted,
      }
    case ACTION_TYPES.SET_TOP_OFFSET:
      return {
        ...state,
        topOffset: action.topOffset,
      }
    case ACTION_TYPES.INIT_STATE:
      return {
        ...state,
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
        photos: state.photos.filter((item) => item.id !== action.photoId),
      }

    case ACTION_TYPES.PHOTO_UPLOADED_PREPEND:
      return {
        ...state,
        photos: [action.photo, ...state.photos],
        currentIndex: state.currentIndex + 1,
      }

    case ACTION_TYPES.PHOTO_WATCHED:
      return {
        ...state,
        photos: state.photos.map((item) =>
          item.id === action.photoId
            ? { ...item, watchersCount: action.watchersCount }
            : item,
        ),
      }
    case ACTION_TYPES.PHOTO_UNWATCHED:
      return {
        ...state,
        photos: state.photos.map((item) =>
          item.id === action.photoId
            ? { ...item, watchersCount: action.watchersCount }
            : item,
        ),
      }

    case ACTION_TYPES.ZERO_MOMEMT:
      return {
        ...state,
        zeroMoment: action.zeroMoment,
      }
    case ACTION_TYPES.COMMENT_DELETED:
      return {
        ...state,
        photos: state.photos.map((item) =>
          item.id === action.photoId
            ? {
                ...item,
                commentsCount: action.commentsCount - 1,
                lastComment: action.lastComment,
              }
            : item,
        ),
      }

    case ACTION_TYPES.COMMENT_ADDED:
      return {
        ...state,
        photos: state.photos.map((item) =>
          item.id === action.photoId
            ? {
                ...item,
                commentsCount: action.commentsCount + 1,
                lastComment: action.lastComment,
              }
            : item,
        ),
      }
    case ACTION_TYPES.SET_ACTIVE_SEGMENT:
      return {
        ...state,
        photos: [],
        // searchTerm: '',
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
    case ACTION_TYPES.CURRENT_INDEX:
      return {
        ...state,
        currentIndex: action.currentIndex,
      }
    default:
      return state
  }
}

async function getTancAccepted() {
  try {
    return (await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY)) === 'true'
  } catch (err) {
    return false
  }
}

export async function initState(setUuid, setIsTandcAccepted) {
  const uuid = await getUUID()
  // console.log({ uuid })
  const isTandcAccepted = await getTancAccepted()
  setUuid(uuid)
  setIsTandcAccepted(isTandcAccepted)
  return { uuid, isTandcAccepted }
}

// this function return the time of the very first photo stored in the backend,
// so that we can tell when to stop requesting new photos while paging through the results
export async function getZeroMoment(setZeroMoment) {
  const { zeroMoment } = (
    await CONST.gqlClient.query({
      query: gql`
        query zeroMoment {
          zeroMoment
        }
      `,
    })
  ).data
  setZeroMoment(zeroMoment)
  return zeroMoment
}

async function requestGeoPhotos({
  pageNumber,
  batch,
  latitude,
  longitude,
  zeroMoment,
}) {
  const whenToStop = moment(zeroMoment)
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedByDate(
          $daysAgo: Int!
          $lat: Float!
          $lon: Float!
          $batch: String!
          $whenToStop: AWSDateTime!
        ) {
          feedByDate(
            daysAgo: $daysAgo
            lat: $lat
            lon: $lon
            batch: $batch
            whenToStop: $whenToStop
          ) {
            photos {
              row_number
              id
              uuid
              imgUrl
              thumbUrl
              videoUrl
              video
              commentsCount
              watchersCount
              createdAt
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        batch,
        daysAgo: pageNumber,
        lat: latitude,
        lon: longitude,
        whenToStop,
      },
    })
    // console.log(2, typeof response.data.feedByDate.batch)
    return {
      photos: response.data.feedByDate.photos,
      batch: response.data.feedByDate.batch,
      noMoreData: response.data.feedByDate.noMoreData,
    }
  } catch (err4) {
    // eslint-disable-next-line no-console
    console.log({ err4 }) // eslint-disable-line
    return {
      photos: [],
      batch,
      noMoreData: true,
    }
  }
}

async function requestWatchedPhotos({ uuid, pageNumber, batch }) {
  // const { uuid } = getState().secret

  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWatcher(
          $uuid: String!
          $pageNumber: Int!
          $batch: String!
        ) {
          feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch) {
            photos {
              row_number
              id
              uuid
              imgUrl
              thumbUrl
              videoUrl
              video
              commentsCount
              watchersCount
              lastComment
              createdAt
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        uuid,
        pageNumber,
        batch,
      },
    })

    return {
      photos: response.data.feedForWatcher.photos,
      batch: response.data.feedForWatcher.batch,
      noMoreData: response.data.feedForWatcher.noMoreData,
    }
  } catch (err5) {
    // eslint-disable-next-line no-console
    console.log({ err5 }) // eslint-disable-line
  }
  return {
    photos: [],
    batch,
    noMoreData: true,
  }
}

async function requestSearchedPhotos({ pageNumber, searchTerm, batch }) {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForTextSearch(
          $searchTerm: String!
          $pageNumber: Int!
          $batch: String!
        ) {
          feedForTextSearch(
            searchTerm: $searchTerm
            pageNumber: $pageNumber
            batch: $batch
          ) {
            photos {
              row_number
              id
              uuid
              imgUrl
              thumbUrl
              videoUrl
              video
              commentsCount
              watchersCount
              lastComment
              createdAt
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        searchTerm,
        batch,
        pageNumber,
      },
    })

    return {
      photos: response.data.feedForTextSearch.photos,
      batch: response.data.feedForTextSearch.batch,
      noMoreData: response.data.feedForTextSearch.noMoreData,
    }
  } catch (err6) {
    // eslint-disable-next-line no-console
    console.log({ err6 }) // eslint-disable-line
  }
  return {
    photos: [],
    batch,
    noMoreData: true,
  }
}

export async function getPhotos({
  uuid,
  zeroMoment,
  location,
  netAvailable,
  searchTerm,
  topOffset,
  activeSegment,
  batch,
  pageNumber,
}) {
  // const { uuid } = getState().secret

  // dispatch(friendsReducer.reloadFriendsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
  // dispatch(friendsReducer.reloadUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on

  // const {
  //   batch, loading, isLastPage, pageNumber, searchTerm,
  // } = getState().photosList
  // console.log(`getPhotos() batch:${batch} pageNumber:${pageNumber} loading:${loading} isLastPage:${isLastPage} searchTerm:${searchTerm}`)
  // await new Promise(r => setTimeout(r, 200)) // this is really weird, but seems to help with the order of the images

  const noMoreData = false

  if (
    !location ||
    netAvailable === false ||
    (activeSegment === 2 && searchTerm.length < 3)
  ) {
    console.log('returning1')
    return {
      photos: [],
      batch,
      noMoreData: true,
    }
  }
  const { latitude, longitude } = location.coords

  try {
    let responseJson
    console.log({ activeSegment })
    if (activeSegment === 0) {
      responseJson = await requestGeoPhotos({
        pageNumber,
        batch,
        latitude,
        longitude,
        zeroMoment,
      })
    } else if (activeSegment === 1) {
      responseJson = await requestWatchedPhotos({ uuid, pageNumber, batch })
    } else if (activeSegment === 2) {
      responseJson = await requestSearchedPhotos({
        pageNumber,
        searchTerm,
        batch,
      })
    }
    return responseJson
  } catch (err) {
    Toast.show({
      text1: 'Error',
      text2: `${err}`,
      type: 'error',
      topOffset,
    })
  }
  return {
    photos: [],
    batch,
    noMoreData: true,
  }
}

export function acceptTandC() {
  try {
    SecureStore.setItemAsync(IS_TANDC_ACCEPTED_KEY, 'true')
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

export function settopOffset(topOffset) {
  return {
    type: ACTION_TYPES.SET_TOP_OFFSET,
    topOffset,
  }
}
const removeFromQueue = async (imageToRemove) => {
  let pendingImagesBefore = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
  )

  if (!pendingImagesBefore) {
    pendingImagesBefore = []
  }

  const pendingImagesAfter = pendingImagesBefore.filter(
    (imageInTheQueue) =>
      JSON.stringify(imageInTheQueue) !== JSON.stringify(imageToRemove),
  )

  await Storage.setItem({
    key: CONST.PENDING_UPLOADS_KEY,
    value: JSON.stringify(pendingImagesAfter),
  })
}

// returns an array that has everything needed for rendering
const getQueue = async () => {
  // here will have to make sure we do not have any discrepancies between files in storage and files in the queue
  await CONST.makeSureDirectoryExists({
    directory: CONST.PENDING_UPLOADS_FOLDER,
  })

  const filesInStorage = await FileSystem.readDirectoryAsync(
    CONST.PENDING_UPLOADS_FOLDER,
  )
  let imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
  )

  if (!imagesInQueue) {
    imagesInQueue = []
    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: JSON.stringify([]),
    })
  }
  // remove images from the queue if corresponding file does not exist
  imagesInQueue.forEach((image) => {
    if (!filesInStorage.some((f) => f === image.localImageName)) {
      removeFromQueue(image)
    }
  })

  // get images in queue again after filtering
  imagesInQueue = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
  )
  if (!imagesInQueue) {
    imagesInQueue = []
  }

  // remove image from storage if corresponding recorsd does not exist in the queue
  filesInStorage.forEach((file) => {
    if (!imagesInQueue.some((i) => i.localImageName === file)) {
      FileSystem.deleteAsync(`${CONST.PENDING_UPLOADS_FOLDER}${file}`, {
        idempotent: true,
      })
    }
  })

  return imagesInQueue
}

const updatePendingPhotos = async (dispatch) => {
  const pendingPhotos = await getQueue()
  dispatch({
    type: ACTION_TYPES.UPDATE_PENDING_PHOTOS,
    pendingPhotos,
  })
}

export function cancelPendingUpload(item) {
  return async (dispatch) => {
    await removeFromQueue(item)

    updatePendingPhotos(dispatch)
  }
}

export function setLocation(location) {
  return {
    type: ACTION_TYPES.SET_LOCATION,
    location,
  }
}

export function resetState() {
  return {
    type: ACTION_TYPES.RESET_STATE,
  }
}

export function setOrientation(orientation) {
  return {
    type: ACTION_TYPES.SET_ORIENTATION,
    orientation,
  }
}

export function setActiveSegment(activeSegment) {
  return {
    type: ACTION_TYPES.SET_ACTIVE_SEGMENT,
    activeSegment,
  }
}

export function setSearchTerm(searchTerm) {
  return {
    type: ACTION_TYPES.SET_SEARCH_TERM,
    searchTerm,
  }
}

export function setNetAvailable(netAvailable) {
  return {
    type: ACTION_TYPES.SET_NET_AVAILABLE,
    netAvailable,
  }
}

const genLocalThumbs = async (image) => {
  if (image.type === 'image') {
    const manipResult = await ImageManipulator.manipulateAsync(
      image.localImgUrl,
      [{ resize: { height: 300 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG },
    )
    return {
      ...image,
      localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
    }
  }

  // if video
  const { uri } = await VideoThumbnails.getThumbnailAsync(image.localImgUrl)

  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { height: 300 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG },
  )

  return {
    ...image,
    localVideoUrl: image.localImgUrl,
    localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
    localImgUrl: uri,
    // localImageName: manipResult.uri.substr(manipResult.uri.lastIndexOf('/') + 1),
  }
}

const addToQueue = async (image) => {
  // localImgUrl, localImageName, type, location, localThumbUrl, localVideoUrl

  let pendingImages = JSON.parse(
    await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
  )
  if (!pendingImages) {
    pendingImages = []
  }

  await Storage.setItem({
    key: CONST.PENDING_UPLOADS_KEY,
    value: JSON.stringify([...pendingImages, image]),
  })
}

export const queueFileForUpload =
  ({ cameraImgUrl, type, location }) =>
  async (dispatch, getState) => {
    const localImageName = cameraImgUrl.substr(
      cameraImgUrl.lastIndexOf('/') + 1,
    )
    const localCacheKey = localImageName.split('.')[0]

    const localImgUrl = `${CONST.PENDING_UPLOADS_FOLDER}${localImageName}`
    // copy file to cacheDir
    await FileSystem.moveAsync({
      from: cameraImgUrl,
      to: localImgUrl,
    })

    const image = {
      localImgUrl,
      localImageName,
      type,
      location,
      localCacheKey,
    }
    const thumbEnhansedImage = await genLocalThumbs(image)
    await CacheManager.addToCache({
      file: thumbEnhansedImage.localThumbUrl,
      key: thumbEnhansedImage.localCacheKey,
    })

    await addToQueue(thumbEnhansedImage)

    updatePendingPhotos(dispatch)
  }

const generatePhoto = async ({ uuid, lat, lon, video }) => {
  const photo = (
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createPhoto(
          $lat: Float!
          $lon: Float!
          $uuid: String!
          $video: Boolean
        ) {
          createPhoto(lat: $lat, lon: $lon, uuid: $uuid, video: $video) {
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
        }
      `,
      variables: {
        uuid,
        lat,
        lon,
        video,
      },
    })
  ).data.createPhoto

  return photo
}

const uploadFile = async ({ assetKey, contentType, assetUri }) => {
  // console.log({ assetKey })
  const uploadUrl = (
    await CONST.gqlClient.query({
      query: gql`
        query generateUploadUrl($assetKey: String!, $contentType: String!) {
          generateUploadUrl(assetKey: $assetKey, contentType: $contentType)
        }
      `,
      variables: {
        assetKey,
        contentType,
      },
    })
  ).data.generateUploadUrl

  const responseData = await FileSystem.uploadAsync(uploadUrl, assetUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
  })
  return { responseData }
}

const uploadItem = async ({ item }) => {
  try {
    // if video -- upload video file in addition to the image
    if (item.type === 'video') {
      // eslint-disable-next-line
      const videoResponse = await uploadFile({
        assetKey: `${item.photo.id}.mov`,
        contentType: 'video/mov',
        assetUri: item.localVideoUrl,
      })

      if (videoResponse?.responseData?.status !== 200) {
        return {
          responseData:
            'something bad happened during video upload, unable to upload.',
          status: videoResponse.responseData.status,
        }
      }
    }

    const response = await uploadFile({
      assetKey: `${item.photo.id}.upload`,
      contentType: 'image/jpeg',
      assetUri: item.localImgUrl,
    })
    return { responseData: response.responseData }
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.log({ err3 })
    return {
      responseData: `something bad happened, unable to upload ${JSON.stringify(
        err3,
      )}`,
    }
  }
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const { topOffset } = getState().photosList
    const { uuid } = getState().secret
    updatePendingPhotos(dispatch)

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
      const generatePhotoQueue = (await getQueue()).filter(
        (image) => !image.photo,
      )

      // first pass iteration to generate photos ID and the photo record on the backend
      for (i = 0; i < generatePhotoQueue.length; i += 1) {
        const item = generatePhotoQueue[i]
        try {
          // eslint-disable-next-line no-await-in-loop
          const photo = await generatePhoto({
            uuid,
            lat: item.location.coords.latitude,
            lon: item.location.coords.longitude,
            video: item?.type === 'video',
          })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({
            file: item.localThumbUrl,
            key: `${photo.id}-thumb`,
          })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({
            file: item.localImgUrl,
            key: `${photo.id}`,
          })
          // eslint-disable-next-line no-await-in-loop
          await removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await addToQueue({
            ...item,
            photo,
          })
        } catch (err1) {
          // eslint-disable-next-line no-console
          console.log({ err1 })
          if (`${err1}`.includes('banned')) {
            // eslint-disable-next-line no-await-in-loop
            await removeFromQueue(item)
            Toast.show({
              text1: "Sorry, you've been banned",
              text2: 'Try again later',
              type: 'error',
              topOffset,
            })
          }
        }
      }

      // uploadQueue will only contain item with photo generated on the backend
      const uploadQueue = (await getQueue()).filter((image) => image.photo)
      // second pass -- upload files
      for (i = 0; i < uploadQueue.length; i += 1) {
        const item = uploadQueue[i]

        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await uploadItem({
          item,
        })

        if (responseData.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await updatePendingPhotos(dispatch)

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
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if ((await getQueue()).length > 0) {
      dispatch(uploadPendingPhotos())
    }
    return Promise.resolve()
  }
}

export function setCurrentIndex(currentIndex) {
  return {
    type: ACTION_TYPES.CURRENT_INDEX,
    currentIndex,
  }
}

export default reducer
