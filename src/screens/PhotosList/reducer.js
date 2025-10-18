// import { Platform } from 'react-native'

import * as SecureStore from 'expo-secure-store'

import moment from 'moment'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

export {
  addToQueue,
  clearQueue,
  ensureFileExists,
  generatePhoto,
  getQueue,
  initPendingUploads,
  processCompleteUpload,
  processQueuedFile,
  queueFileForUpload,
  removeFromQueue,
  updateQueueItem,
  uploadItem
} from './upload/photoUploadService'

// import * as ACTION_TYPES from './action_types'

// import { getUUID } from '../Secret/reducer'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

export const initialState = {
  // isTandcAccepted: true, //
  // zeroMoment: null, //
  // photos: [], //
  // netAvailable: false,
  // searchTerm: '',
  // location: null,
  // pendingPhotos: [],
  // errorMessage: '',
  // pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  // orientation: 'portrait',
  // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  // isLastPage: true,
  // uploadPendingPhotosloadingPhoto: false,
  // toastOffset: 100,
  // currentIndex: 0,
}

export async function getTancAccepted () {
  try {
    return (await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY)) === 'true'
  } catch (err) {
    console.error('T&C', { err })

    return false
  }
}

// this function return the time of the very first photo stored in the backend,
// so that we can tell when to stop requesting new photos while paging through the results
export async function getZeroMoment () {
  try {
    const { zeroMoment } = (
      await CONST.gqlClient.query({
        query: gql`
          query zeroMoment {
            zeroMoment
          }
        `
      })
    ).data
    return zeroMoment
  } catch (qwenlcsd) {
    console.error({ qwenlcsd })
  }
  return 0
}

async function requestGeoPhotos ({ pageNumber, batch, latitude, longitude, zeroMoment }) {
  const whenToStop = moment(zeroMoment || 0)
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
              lastComment
              createdAt
              width
              height
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
        whenToStop
      }
    })
    // console.log(2, typeof response.data.feedByDate.batch)
    return {
      photos: response.data.feedByDate.photos,
      batch: response.data.feedByDate.batch,
      noMoreData: response.data.feedByDate.noMoreData
    }
  } catch (err4) {
    // eslint-disable-next-line no-console
    console.error({ err4 }) // eslint-disable-line
    return {
      photos: [],
      batch,
      noMoreData: true
    }
  }
}

async function requestWatchedPhotos ({ uuid, pageNumber, batch }) {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!) {
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
              width
              height
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        uuid,
        pageNumber,
        batch
      }
    })

    return {
      photos: response.data.feedForWatcher.photos,
      batch: response.data.feedForWatcher.batch,
      noMoreData: response.data.feedForWatcher.noMoreData
    }
  } catch (err5) {
    // eslint-disable-next-line no-console
    console.error({ err5 }) // eslint-disable-line
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

async function requestSearchedPhotos ({ pageNumber, searchTerm, batch }) {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query feedForTextSearch($searchTerm: String!, $pageNumber: Int!, $batch: String!) {
          feedForTextSearch(searchTerm: $searchTerm, pageNumber: $pageNumber, batch: $batch) {
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
              width
              height
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        searchTerm,
        batch,
        pageNumber
      }
    })

    return {
      photos: response.data.feedForTextSearch.photos,
      batch: response.data.feedForTextSearch.batch,
      noMoreData: response.data.feedForTextSearch.noMoreData
    }
  } catch (err6) {
    // eslint-disable-next-line no-console
    console.error({ err6 }) // eslint-disable-line
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

export async function getPhotos ({
  uuid,
  zeroMoment,
  location,
  netAvailable,
  searchTerm,
  topOffset = 100,
  activeSegment,
  batch,
  pageNumber
}) {
  const noMoreData = false

  if (!location || netAvailable === false || (activeSegment === 2 && searchTerm.length < 3)) {
    // console.log('returning1', {
    //   location,
    //   netAvailable,
    //   activeSegment,
    //   searchTerm,
    // })
    return {
      photos: [],
      batch,
      noMoreData: true
    }
  }
  const { latitude, longitude } = location.coords

  try {
    let responseJson
    // console.log({ activeSegment, pageNumber })
    if (activeSegment === 0) {
      responseJson = await requestGeoPhotos({
        pageNumber,
        batch,
        latitude,
        longitude,
        zeroMoment
      })
    } else if (activeSegment === 1) {
      responseJson = await requestWatchedPhotos({ uuid, pageNumber, batch })
    } else if (activeSegment === 2) {
      responseJson = await requestSearchedPhotos({
        pageNumber,
        searchTerm,
        batch
      })
    }
    return responseJson
  } catch (err7) {
    console.error({ err7 })
    Toast.show({
      text1: 'Error',
      text2: `${err7}`,
      type: 'error',
      topOffset
    })
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

export function acceptTandC () {
  try {
    SecureStore.setItemAsync(IS_TANDC_ACCEPTED_KEY, 'true')
    return true
  } catch (err8) {
    console.error({ err8 })
    return false
  }
}
