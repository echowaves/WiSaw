// import { Platform } from 'react-native'

import * as FileSystem from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import * as VideoThumbnails from 'expo-video-thumbnails'

import * as ImageManipulator from 'expo-image-manipulator'

import moment from 'moment'

import { CacheManager } from 'expo-cached-image'
import { Storage } from 'expo-storage'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

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

export async function getTancAccepted() {
  try {
    return (await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY)) === 'true'
  } catch (err) {
    console.error('T&C', { err })

    return false
  }
}

// this function return the time of the very first photo stored in the backend,
// so that we can tell when to stop requesting new photos while paging through the results
export async function getZeroMoment() {
  try {
    const { zeroMoment } = (
      await CONST.gqlClient.query({
        query: gql`
          query zeroMoment {
            zeroMoment
          }
        `,
      })
    ).data
    return zeroMoment
  } catch (qwenlcsd) {
    console.error({ qwenlcsd })
  }
  return 0
}

async function requestGeoPhotos({
  pageNumber,
  batch,
  latitude,
  longitude,
  zeroMoment,
}) {
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
    console.error({ err4 }) // eslint-disable-line
    return {
      photos: [],
      batch,
      noMoreData: true,
    }
  }
}

async function requestWatchedPhotos({ uuid, pageNumber, batch }) {
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
    console.error({ err5 }) // eslint-disable-line
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
    console.error({ err6 }) // eslint-disable-line
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
  const noMoreData = false

  if (
    !location ||
    netAvailable === false ||
    (activeSegment === 2 && searchTerm.length < 3)
  ) {
    // console.log('returning1', {
    //   location,
    //   netAvailable,
    //   activeSegment,
    //   searchTerm,
    // })
    return {
      photos: [],
      batch,
      noMoreData: true,
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
  } catch (err7) {
    console.error({ err7 })
    Toast.show({
      text1: 'Error',
      text2: `${err7}`,
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
    return true
  } catch (err8) {
    console.error({ err8 })
    return false
  }
}

export const removeFromQueue = async (imageToRemove) => {
  try {
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
      value: pendingImagesAfter,
    })
  } catch (sdjfhjhbdf) {
    console.error({ sdjfhjhbdf })
  }
}

export const clearQueue = async () => {
  try {
    // Get current queue items to clean up their files
    const currentQueue = await getQueue()

    // Delete all local files from the queue
    for (const item of currentQueue) {
      try {
        if (item.localImgUrl) {
          await FileSystem.deleteAsync(item.localImgUrl, { idempotent: true })
        }
        if (item.localThumbUrl) {
          await FileSystem.deleteAsync(item.localThumbUrl, { idempotent: true })
        }
        if (item.localVideoUrl) {
          await FileSystem.deleteAsync(item.localVideoUrl, { idempotent: true })
        }
      } catch (fileDeleteError) {
        // Continue cleaning up other files even if one fails
        console.error('Error deleting file:', fileDeleteError)
      }
    }

    // Clear the queue in storage
    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: [],
    })
  } catch (error) {
    console.error('Error clearing queue:', error)
  }
}

// returns an array that has everything needed for rendering
export const getQueue = async () => {
  try {
    let imagesInQueue = JSON.parse(
      await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
    )

    if (!imagesInQueue) {
      imagesInQueue = []
      await Storage.setItem({
        key: CONST.PENDING_UPLOADS_KEY,
        value: [],
      })
    }

    return imagesInQueue
  } catch (cbushdugw) {
    console.error({ cbushdugw })
  }
  return []
}

// export function setActiveSegment(activeSegment) {
//   return {
//     type: ACTION_TYPES.SET_ACTIVE_SEGMENT,
//     activeSegment,
//   }
// }

// export function setSearchTerm(searchTerm) {
//   return {
//     type: ACTION_TYPES.SET_SEARCH_TERM,
//     searchTerm,
//   }
// }

// export function setNetAvailable(netAvailable) {
//   return {
//     type: ACTION_TYPES.SET_NET_AVAILABLE,
//     netAvailable,
//   }
// }

const genLocalThumbs = async (image) => {
  try {
    if (image.type === 'image') {
      const manipResult = await ImageManipulator.manipulateAsync(
        image.localImgUrl,
        [{ resize: { height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }, // Changed to JPEG with 0.8 compression for smaller file sizes
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
      { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }, // Changed to JPEG with 0.8 compression for smaller file sizes
    )

    return {
      ...image,
      localVideoUrl: image.localImgUrl,
      localThumbUrl: manipResult.uri, // add localThumbUrl to the qued objects
      localImgUrl: uri,
      // localImageName: manipResult.uri.substr(manipResult.uri.lastIndexOf('/') + 1),
    }
  } catch (cuhduhgquwe) {
    // eslint-disable-next-line no-console
    console.error({ cuhduhgquwe })
  }
  return {
    image: null,
    localVideoUrl: '',
    localThumbUrl: '', // add localThumbUrl to the qued objects
    localImgUrl: '',
    // localImageName: manipResult.uri.substr(manipResult.uri.lastIndexOf('/') + 1),
  }
}

export const processQueuedFile = async (queuedItem) => {
  try {
    // Ensure pending uploads folder exists
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        CONST.PENDING_UPLOADS_FOLDER,
      )
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CONST.PENDING_UPLOADS_FOLDER, {
          intermediates: true,
        })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to ensure pending uploads folder:', e)
    }

    // Generate local file path in pending uploads folder
    const localImgUrl = `${CONST.PENDING_UPLOADS_FOLDER}${queuedItem.localImageName}`

    // For images, compress the main image before storing to reduce file size
    if (queuedItem.type === 'image') {
      // Compress the main image to reduce upload size while maintaining good quality
      const compressedResult = await ImageManipulator.manipulateAsync(
        queuedItem.originalCameraUrl,
        [], // No resize, just compress
        { compress: 0.9, format: ImageManipulator.SaveFormat.WEBP },
      )

      // Move the compressed file to cache directory
      await FileSystem.moveAsync({
        from: compressedResult.uri,
        to: localImgUrl,
      })
    } else {
      // For videos, just move the file as-is
      await FileSystem.moveAsync({
        from: queuedItem.originalCameraUrl,
        to: localImgUrl,
      })
    }

    // Create processed image object
    const processedImage = {
      ...queuedItem,
      localImgUrl,
    }

    // Generate thumbnails
    const thumbEnhancedImage = await genLocalThumbs(processedImage)

    // Add thumbnail to cache
    await CacheManager.addToCache({
      file: thumbEnhancedImage.localThumbUrl,
      key: thumbEnhancedImage.localCacheKey,
    })

    return thumbEnhancedImage
  } catch (error) {
    console.error('Error processing queued file:', error)
    throw error
  }
}

export const addToQueue = async (image) => {
  try {
    // localImgUrl, localImageName, type, location, localThumbUrl, localVideoUrl

    let pendingImages = JSON.parse(
      await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
    )
    if (!pendingImages) {
      pendingImages = []
    }

    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: [...pendingImages, image],
    })
  } catch (cbwdjkfnkjsd) {
    console.error({ cbwdjkfnkjsd })
  }
}

// Helper function to update a specific item in the queue
export const updateQueueItem = async (originalItem, updatedItem) => {
  try {
    let pendingImages = JSON.parse(
      await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
    )
    if (!pendingImages) {
      return
    }

    const updatedQueue = pendingImages.map((item) => {
      if (JSON.stringify(item) === JSON.stringify(originalItem)) {
        return updatedItem
      }
      return item
    })

    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: updatedQueue,
    })
  } catch (error) {
    console.error('Error updating queue item:', error)
  }
}

export const processCompleteUpload = async ({ item, uuid, topOffset }) => {
  try {
    // Step 1: Process the file if it hasn't been processed yet
    let processedItem = item
    if (!item.localImgUrl) {
      // Validate original camera file exists before processing
      try {
        const info = await FileSystem.getInfoAsync(item.originalCameraUrl)
        if (!info.exists) {
          Toast.show({
            text1: 'Upload skipped',
            text2: 'Original file is missing on device.',
            type: 'error',
            topOffset,
          })
          // Remove invalid item from queue
          await removeFromQueue(item)
          return null
        }
      } catch (e) {
        // Cannot stat file; best effort remove and continue
        await removeFromQueue(item)
        return null
      }

      processedItem = await processQueuedFile(item)
    }

    // Step 2: Generate photo record on backend if not already done
    let photo = processedItem.photo
    if (!photo) {
      try {
        photo = await generatePhoto({
          uuid,
          lat: processedItem.location.coords.latitude,
          lon: processedItem.location.coords.longitude,
          video: processedItem?.type === 'video',
        })

        // Add processed files to cache with the photo ID
        CacheManager.addToCache({
          file: processedItem.localThumbUrl,
          key: `${photo.id}-thumb`,
        })
        CacheManager.addToCache({
          file: processedItem.localImgUrl,
          key: `${photo.id}`,
        })

        processedItem = { ...processedItem, photo }

        // Update the queue with the photo info to prevent re-generation
        await updateQueueItem(item, processedItem)
      } catch (photoGenError) {
        console.error('Photo generation failed:', photoGenError)

        // If photo generation fails, it's likely a network or server issue
        // Don't remove from queue, just return null to retry later
        const errorMsg = `${photoGenError}`.toLowerCase()
        if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
          Toast.show({
            text1: 'Upload delayed',
            text2: 'Connection issues. Will retry automatically.',
            type: 'info',
            topOffset,
          })
        }
        return null
      }
    }

    // Step 3: Upload the actual files
    const { responseData } = await uploadItem({
      item: processedItem,
    })

    // Step 4: Check if upload was successful
    if (responseData?.status === 200) {
      return photo // Return the photo object for UI update
    } else {
      Toast.show({
        text1: 'Upload is going slooooow...',
        text2: 'Still trying to upload.',
        visibilityTime: 500,
        topOffset,
      })
      return null // Upload failed, will retry later
    }
  } catch (error) {
    console.error('Complete upload process error:', error)
    // If file missing or unrecoverable, remove from queue to avoid infinite loop
    const errStr = `${error}`.toLowerCase()
    if (errStr.includes('not found') || errStr.includes('missing')) {
      try {
        await removeFromQueue(item)
      } catch (e2) {
        // ignore
      }
      Toast.show({
        text1: 'Upload removed',
        text2: 'Local file was not found on device.',
        type: 'error',
        topOffset,
      })
      return null
    }
    // Non-fatal: signal caller to retry later
    return null
  }
}

export const queueFileForUpload = async ({ cameraImgUrl, type, location }) => {
  try {
    const localImageName = cameraImgUrl.substr(
      cameraImgUrl.lastIndexOf('/') + 1,
    )
    const localCacheKey = localImageName.split('.')[0]

    // Just store reference to original camera file - no manipulation yet
    const image = {
      originalCameraUrl: cameraImgUrl, // Reference to original camera file
      localImageName,
      type,
      location,
      localCacheKey,
    }

    await addToQueue(image)
  } catch (cqwyefyttyf) {
    console.error({ cqwyefyttyf })
  }
}

export const generatePhoto = async ({ uuid, lat, lon, video }) => {
  try {
    // Add timeout wrapper for Android compatibility
    const timeoutMs = 30000 // 30 seconds timeout for photo generation

    const photo = (
      await withTimeout(
        CONST.gqlClient.mutate({
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
        }),
        timeoutMs,
        'Generate photo mutation',
      )
    ).data.createPhoto

    return photo
  } catch (xscwdjhb) {
    // eslint-disable-next-line no-console
    console.error('generatePhoto error:', xscwdjhb)

    // Check if it's a timeout error and provide better error message
    const errorMessage = `${xscwdjhb}`.toLowerCase()
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      throw new Error(
        'Photo creation timed out. Please check your connection and try again.',
      )
    }

    throw xscwdjhb
  }
  // return null
}

// Utility: Wrap a promise with a timeout to prevent hanging uploads
const withTimeout = (promise, ms, label = 'operation') =>
  new Promise((resolve, reject) => {
    let done = false
    const t = setTimeout(() => {
      if (!done) reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)
    promise
      .then((res) => {
        done = true
        clearTimeout(t)
        resolve(res)
      })
      .catch((err) => {
        done = true
        clearTimeout(t)
        reject(err)
      })
  })

// Utility: verify local file exists before uploading/processing
const ensureFileExists = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri)
    return !!info?.exists
  } catch (e) {
    return false
  }
}

const uploadFile = async ({
  assetKey,
  contentType,
  assetUri,
  topOffset = 100,
  retries = 3,
  timeoutMs = 180_000,
}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Validate local file exists
      const exists = await ensureFileExists(assetUri)
      if (!exists) {
        throw new Error(`Local file not found: ${assetUri}`)
      }

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

      const responseData = await withTimeout(
        FileSystem.uploadAsync(uploadUrl, assetUri, {
          httpMethod: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND, // Enable background uploads
        }),
        timeoutMs,
        `Upload ${assetKey}`,
      )

      // Treat non-200 as retryable failure
      if (!responseData || responseData.status !== 200) {
        throw new Error(
          `Upload failed with status ${responseData?.status || 'unknown'}`,
        )
      }
      return { responseData }
    } catch (cnijedfjknwkejn) {
      // eslint-disable-next-line no-console
      console.error(`Upload attempt ${attempt}/${retries} failed:`, {
        cnijedfjknwkejn,
      })

      if (attempt === retries) {
        // Only show error toast on final attempt
        Toast.show({
          text1: 'Upload failed after retries',
          text2: `${cnijedfjknwkejn}`,
          type: 'error',
          topOffset,
        })
        return null
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
  return null
}

export const initPendingUploads = async () => {
  try {
    const pendingImages = JSON.parse(
      await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }),
    )

    // Android-specific debugging for upload queue
    if (pendingImages && pendingImages.length > 0) {
      console.log(`Found ${pendingImages.length} pending uploads in queue`)

      // Check if any items are stuck (missing localImgUrl but have photo)
      const stuckItems = pendingImages.filter(
        (item) => !item.localImgUrl && item.photo,
      )
      if (stuckItems.length > 0) {
        console.warn(
          `Found ${stuckItems.length} potentially stuck upload items`,
        )
      }

      // Check for items with missing files
      for (let i = 0; i < pendingImages.length; i++) {
        const item = pendingImages[i]
        if (item.originalCameraUrl) {
          try {
            const info = await FileSystem.getInfoAsync(item.originalCameraUrl)
            if (!info.exists) {
              console.warn(
                `Pending upload has missing original file: ${item.localImageName}`,
              )
            }
          } catch (e) {
            console.warn(`Cannot check file status for: ${item.localImageName}`)
          }
        }
      }
    }
  } catch (cbwdjkfnkdlksdfkjsd) {
    console.error({ cbwdjkfnkdlksdfkjsd })
    await Storage.setItem({
      key: CONST.PENDING_UPLOADS_KEY,
      value: [],
    })
  }
}

export const uploadItem = async ({ item }) => {
  try {
    // if video -- upload video file in addition to the image
    if (item.type === 'video') {
      // eslint-disable-next-line
      const videoResponse = await uploadFile({
        assetKey: `${item.photo.id}.mov`,
        contentType: 'video/mov',
        assetUri: item.localVideoUrl,
      })

      if (!videoResponse || videoResponse?.responseData?.status !== 200) {
        return {
          responseData:
            'something bad happened during video upload, unable to upload.',
          status: videoResponse?.responseData?.status,
        }
      }
    }

    const response = await uploadFile({
      assetKey: `${item.photo.id}.upload`,
      contentType: 'image/jpeg',
      assetUri: item.localImgUrl,
    })
    return { responseData: response?.responseData }
  } catch (err3) {
    // eslint-disable-next-line no-console
    console.error({ err3 })
    return {
      responseData: `something bad happened, unable to upload ${JSON.stringify(
        err3,
      )}`,
    }
  }
}
// export default reducer
